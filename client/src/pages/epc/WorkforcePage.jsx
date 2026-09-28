import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  ChevronLeft,
  X,
  Send,
  MessageSquare,
  ShieldCheck,
  Plus,
  Minus,
  IndianRupee,
  Sparkles,
  ExternalLink,
  Award,
  TrendingUp,
} from 'lucide-react';
import { workforceAPI, projectAPI, technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import PerformanceReviewModal from '../../components/workforce/PerformanceReviewModal';
import DigitalSkillPassportCard from '../../components/passport/DigitalSkillPassportCard';

const WorkforcePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roster, setRoster] = useState([]);
  const [projects, setProjects] = useState([]);

  // Filters
  const [selectedProjectId, setSelectedProjectId] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // All, Active, Completed
  const [attendanceFilter, setAttendanceFilter] = useState('All'); // All, Present, Absent, On Leave
  const [searchQuery, setSearchQuery] = useState('');

  // Performance Review Modal
  const [reviewAssignment, setReviewAssignment] = useState(null);

  // Passport Preview Modal
  const [passportModalData, setPassportModalData] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchRoster = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProjectId !== 'All') params.projectId = selectedProjectId;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [rosterRes, projRes] = await Promise.all([
        workforceAPI.getAll(params).catch(() => ({ data: { success: false, data: [] } })),
        projectAPI.getAll().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (rosterRes.data?.data) {
        setRoster(rosterRes.data.data);
      }
      if (projRes.data?.data) {
        setProjects(projRes.data.data);
      }
    } catch (err) {
      console.error('Error loading workforce roster:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedProjectId, selectedStatus]);

  // Update attendance, work status, or total days worked
  const handleUpdateAssignment = async (id, updates, successMessage = null) => {
    try {
      const res = await workforceAPI.updateAssignment(id, updates);
      if (res.data.success) {
        if (successMessage) {
          showToast(successMessage);
        }
        // Update local state instantly for fast UX
        setRoster((prev) =>
          prev.map((item) => (item._id === id ? { ...item, ...updates } : item))
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating assignment.', 'error');
    }
  };

  // Open Skill Passport Modal
  const handleOpenPassport = async (techUserId) => {
    try {
      setPassportModalData('loading');
      const res = await technicianAPI.getDigitalPassport(techUserId);
      if (res.data.success) {
        setPassportModalData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading passport:', err);
      showToast('Could not load Digital Skill Passport.', 'error');
      setPassportModalData(null);
    }
  };

  // Filtered Roster
  const filteredRoster = roster.filter((item) => {
    const techName = item.technician?.name?.toLowerCase() || '';
    const projName = item.project?.projectName?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    const matchesSearch = techName.includes(q) || projName.includes(q);

    if (!matchesSearch) return false;

    if (attendanceFilter !== 'All' && item.attendance !== attendanceFilter) {
      return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalCrew = roster.length;
  const activeCrew = roster.filter((r) => r.assignmentStatus === 'Active').length;
  const presentToday = roster.filter(
    (r) => r.assignmentStatus === 'Active' && r.attendance === 'Present'
  ).length;
  const totalWagesAccrued = roster.reduce(
    (sum, r) => sum + (r.totalDaysWorked || 0) * (r.dailyRateAgreed || 1800),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border animate-in slide-in-from-top-4 duration-300 ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
          )}

          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-1.5">
                <Users size={13} className="text-emerald-600" />
                <span>On-Site Crew Operations</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <Users size={28} className="text-emerald-600" />
                <span>Workforce Crew Roster</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Track daily field attendance, monitor milestone task schedules, record days worked,
                and log verified performance ratings to technician skill passports.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
              <Link
                to="/epc/applications"
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Briefcase size={15} className="text-slate-500" />
                <span>Applications Inbox</span>
              </Link>
              <Link
                to="/epc/technicians"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Deploy Technicians</span>
              </Link>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Crew Members
              </span>
              <span className="text-2xl font-black text-slate-900">{totalCrew}</span>
              <span className="text-xs text-slate-500 block mt-1">Across all EPC projects</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
                Active On Site
              </span>
              <span className="text-2xl font-black text-emerald-700">{activeCrew}</span>
              <span className="text-xs text-emerald-600 block mt-1">Contract active</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Present Today
              </span>
              <span className="text-2xl font-black text-blue-700">{presentToday}</span>
              <span className="text-xs text-blue-600 block mt-1">
                {activeCrew > 0 ? Math.round((presentToday / activeCrew) * 100) : 0}% Daily Turnout
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                Total Accrued Payout
              </span>
              <span className="text-2xl font-black text-amber-700">
                ₹{totalWagesAccrued.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-amber-600 block mt-1">Based on logged days</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by technician name or project title..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 font-medium"
                />
              </div>

              {/* Project Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500">Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium max-w-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="All">All Projects ({projects.length})</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attendance Filter */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500">Attendance:</span>
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="All">All Attendance</option>
                  <option value="Present">Present Only</option>
                  <option value="Absent">Absent Only</option>
                  <option value="On Leave">On Leave Only</option>
                </select>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
              {[
                { id: 'All', label: 'All Crew' },
                { id: 'Active', label: 'Active Deployment' },
                { id: 'Completed', label: 'Completed Assignments' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedStatus === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Roster Cards */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-3xl" />
              ))}
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-xs space-y-3">
              <Users size={36} className="mx-auto text-slate-300" />
              <p className="font-bold text-sm text-slate-700">No crew members found</p>
              <p className="text-slate-400 max-w-sm mx-auto">
                Deploy technicians from your applications inbox or talent search to build your active
                on-site crew.
              </p>
              <Link
                to="/epc/applications"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
              >
                <Briefcase size={14} />
                <span>Go to Applications Inbox</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoster.map((item) => {
                const tech = item.technician;
                const techProfile = item.technicianProfile;
                const project = item.project;
                const isActive = item.assignmentStatus === 'Active';
                const daysWorked = item.totalDaysWorked || 0;
                const totalAccruedWage = daysWorked * (item.dailyRateAgreed || 1800);

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Technician & Project Profile */}
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <img
                          src={
                            tech?.profilePhoto ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${tech?.name}&backgroundColor=059669`
                          }
                          alt={tech?.name}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0 shadow-xs"
                        />

                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {tech?.name}
                            </h3>

                            {/* Role Tag */}
                            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                              {item.roleAssigned || 'Solar Installer'}
                            </span>

                            {/* Status: Assigned / Active / Completed */}
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                item.assignmentStatus === 'Completed'
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : item.assignmentStatus === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {item.assignmentStatus || 'Assigned'}
                            </span>

                            {/* Performance Rating */}
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              <span>{item.performanceRating || '4.9'} Performance</span>
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 font-medium flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-slate-700">Project:</span>
                            <Link
                              to={`/epc/projects/${project?._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
                            >
                              <span>{project?.projectName || 'Rewa Solar Project'}</span>
                              <ExternalLink size={11} />
                            </Link>
                            <span className="text-slate-400">
                              • Location: {project?.location?.city || 'Kanpur'}, {project?.location?.state || 'UP'}
                            </span>
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs pt-0.5">
                            <span className="font-bold text-slate-800">
                              ₹{item.dailyRateAgreed || 1800}/day
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-600">
                              Start Date: {new Date(item.startDate || item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Project Completion Tracking */}
                          <div className="pt-2 max-w-md">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-600">Project Completion Tracking</span>
                              <span className="font-bold text-emerald-700 font-mono">
                                {item.assignmentStatus === 'Completed' ? '100%' : '75%'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                                style={{ width: item.assignmentStatus === 'Completed' ? '100%' : '75%' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Accrued Earnings Box & Passport */}
                      <div className="flex flex-wrap items-center gap-3 self-start sm:self-end lg:self-center shrink-0">
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2.5 text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Compensation
                          </span>
                          <span className="text-base sm:text-lg font-black text-emerald-700">
                            ₹{totalAccruedWage.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {daysWorked} Shifts Logged
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenPassport(tech?._id || techProfile?.user)}
                          className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                          title="View Digital Skill Passport"
                        >
                          <ShieldCheck size={18} className="text-emerald-600" />
                        </button>
                      </div>
                    </div>

                    {/* Operational Controls Strip: Attendance, Schedule, Days Log, Review */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/50 p-3 rounded-2xl">
                      {/* Attendance Selector */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">Attendance:</span>
                        <div className="flex rounded-xl bg-white border border-slate-300 p-0.5 shadow-2xs">
                          {['Present', 'Absent', 'On Leave'].map((att) => (
                            <button
                              type="button"
                              key={att}
                              onClick={() =>
                                handleUpdateAssignment(
                                  item._id,
                                  { attendance: att },
                                  `Attendance for ${tech?.name} set to ${att}`
                                )
                              }
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                item.attendance === att
                                  ? att === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : att === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-amber-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {att}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Work Schedule Status */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">Work Status:</span>
                        <select
                          value={item.workStatus || 'On Schedule'}
                          onChange={(e) =>
                            handleUpdateAssignment(
                              item._id,
                              { workStatus: e.target.value },
                              `Work status updated to ${e.target.value}`
                            )
                          }
                          className="px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="On Schedule">On Schedule</option>
                          <option value="Pending Clearance">Pending Clearance</option>
                          <option value="Action Required">Action Required</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      {/* Days Worked Quick Incrementer */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">Log Shifts:</span>
                        <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2 py-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAssignment(item._id, {
                                totalDaysWorked: Math.max(0, daysWorked - 1),
                              })
                            }
                            disabled={daysWorked <= 0}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                            title="Decrement shift"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="font-black text-slate-900 px-1 w-6 text-center">
                            {daysWorked}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAssignment(
                                item._id,
                                { totalDaysWorked: daysWorked + 1 },
                                `+1 shift logged for ${tech?.name} (${daysWorked + 1} total)`
                              )
                            }
                            className="p-1 rounded-md hover:bg-emerald-50 text-emerald-700"
                            title="Log full day worked"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Actions: Review & Complete Assignment */}
                      <div className="flex items-center gap-2 ml-auto">
                        {isActive && (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateAssignment(
                                item._id,
                                { assignmentStatus: 'Completed' },
                                `${tech?.name} marked as completed on project!`
                              )
                            }
                            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            Complete Role
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setReviewAssignment(item)}
                          className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300/80 transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <Star size={13} className="text-amber-500 fill-amber-500" />
                          <span>Record Review</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Performance Review Modal */}
          {reviewAssignment && (
            <PerformanceReviewModal
              isOpen={!!reviewAssignment}
              onClose={() => setReviewAssignment(null)}
              assignment={reviewAssignment}
              onSuccess={({ technicianName, rating }) => {
                showToast(
                  `⭐ Verified review (${rating} Stars) successfully recorded to ${technicianName}'s Digital Skill Passport!`
                );
                fetchRoster();
              }}
            />
          )}

          {/* Digital Skill Passport Modal */}
          {passportModalData && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden relative">
                <button
                  type="button"
                  onClick={() => setPassportModalData(null)}
                  className="absolute top-5 right-5 z-20 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="p-6 max-h-[85vh] overflow-y-auto">
                  {passportModalData === 'loading' ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold">
                        Loading authenticated Digital Skill Passport...
                      </p>
                    </div>
                  ) : (
                    <DigitalSkillPassportCard passport={passportModalData} />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WorkforcePage;
