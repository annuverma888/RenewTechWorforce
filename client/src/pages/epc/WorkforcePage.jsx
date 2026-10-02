import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  X,
  ShieldCheck,
  Plus,
  Minus,
  IndianRupee,
  ExternalLink,
  Award,
  Phone,
  Mail,
  Copy,
  Check,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Layers,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import { workforceAPI, projectAPI, technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import PerformanceReviewModal from '../../components/workforce/PerformanceReviewModal';
import DigitalSkillPassportCard from '../../components/passport/DigitalSkillPassportCard';

const WorkforcePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get('projectId');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roster, setRoster] = useState([]);
  const [projects, setProjects] = useState([]);

  // Filters & Controls
  const [selectedProjectId, setSelectedProjectId] = useState(urlProjectId || 'All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // All, Active, Assigned, Completed, Released
  const [attendanceFilter, setAttendanceFilter] = useState('All'); // All, Present, Absent, On Leave
  const [workStatusFilter, setWorkStatusFilter] = useState('All'); // All, On Schedule, Pending Clearance, Action Required, Completed
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals & Drawers
  const [detailAssignment, setDetailAssignment] = useState(null);
  const [reviewAssignment, setReviewAssignment] = useState(null);
  const [passportModalData, setPassportModalData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Sync state if URL projectId param changes
  useEffect(() => {
    if (urlProjectId && urlProjectId !== selectedProjectId) {
      setSelectedProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  // Fetch roster and projects
  const fetchWorkforceData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedProjectId !== 'All') params.projectId = selectedProjectId;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [rosterRes, projRes] = await Promise.all([
        workforceAPI.getAll(params).catch(() => ({ data: { success: false, data: [] } })),
        projectAPI.getAll().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (rosterRes.data?.data && Array.isArray(rosterRes.data.data)) {
        setRoster(rosterRes.data.data);
      } else {
        setRoster([]);
      }

      if (projRes.data?.data && Array.isArray(projRes.data.data)) {
        setProjects(projRes.data.data);
      } else if (Array.isArray(projRes.data)) {
        setProjects(projRes.data);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error('Error loading workforce roster:', err);
      setError('Unable to load workforce roster. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkforceData();
  }, [selectedProjectId, selectedStatus]);

  // Update assignment attendance, workStatus, totalDaysWorked, notes, assignmentStatus
  const handleUpdateAssignment = async (id, updates, successMessage = null) => {
    try {
      const res = await workforceAPI.updateAssignment(id, updates);
      if (res.data?.success) {
        if (successMessage) {
          showToast(successMessage);
        }
        // Update local roster immediately
        setRoster((prev) =>
          prev.map((item) => (item._id === id ? { ...item, ...updates } : item))
        );
        // If drawer is currently open on this assignment, update drawer state as well
        if (detailAssignment?._id === id) {
          setDetailAssignment((prev) => ({ ...prev, ...updates }));
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating workforce assignment.', 'error');
    }
  };

  // Open Skill Passport Modal
  const handleOpenPassport = async (techUserId) => {
    if (!techUserId) {
      showToast('Technician ID not found for Skill Passport.', 'error');
      return;
    }
    try {
      setPassportModalData('loading');
      const res = await technicianAPI.getDigitalPassport(techUserId);
      if (res.data?.success) {
        setPassportModalData(res.data.data);
      } else {
        showToast('Digital Skill Passport not available.', 'error');
        setPassportModalData(null);
      }
    } catch (err) {
      console.error('Error loading passport:', err);
      showToast('Could not load Digital Skill Passport.', 'error');
      setPassportModalData(null);
    }
  };

  // Copy helper
  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Dynamically extract assigned roles from loaded roster
  const uniqueRoles = useMemo(() => {
    const roles = new Set();
    roster.forEach((item) => {
      if (item.roleAssigned) roles.add(item.roleAssigned);
    });
    return Array.from(roles);
  }, [roster]);

  // Client-side search and filtering across real fields
  const filteredRoster = useMemo(() => {
    return roster.filter((item) => {
      const tech = item.technician || {};
      const techProfile = item.technicianProfile || {};
      const project = item.project || {};

      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const techName = (tech.name || '').toLowerCase();
        const profession = (techProfile.profession || '').toLowerCase();
        const role = (item.roleAssigned || '').toLowerCase();
        const projName = (project.projectName || '').toLowerCase();
        const projCity = (project.location?.city || '').toLowerCase();
        const projState = (project.location?.state || '').toLowerCase();
        const techCity = (techProfile.city || '').toLowerCase();
        const techState = (techProfile.state || '').toLowerCase();
        const assignStatus = (item.assignmentStatus || '').toLowerCase();
        const workStat = (item.workStatus || '').toLowerCase();
        const att = (item.attendance || '').toLowerCase();

        const skillsStr = Array.isArray(techProfile.renewableSkills)
          ? techProfile.renewableSkills.join(' ').toLowerCase()
          : '';

        const matches =
          techName.includes(q) ||
          profession.includes(q) ||
          role.includes(q) ||
          projName.includes(q) ||
          projCity.includes(q) ||
          projState.includes(q) ||
          techCity.includes(q) ||
          techState.includes(q) ||
          assignStatus.includes(q) ||
          workStat.includes(q) ||
          att.includes(q) ||
          skillsStr.includes(q);

        if (!matches) return false;
      }

      if (attendanceFilter !== 'All' && item.attendance !== attendanceFilter) {
        return false;
      }

      if (workStatusFilter !== 'All' && item.workStatus !== workStatusFilter) {
        return false;
      }

      if (roleFilter !== 'All' && item.roleAssigned !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [roster, searchQuery, attendanceFilter, workStatusFilter, roleFilter]);

  // Real Workforce Summary Metrics calculated strictly from loaded data
  const totalCrew = roster.length;
  const activeCrew = roster.filter((r) => r.assignmentStatus === 'Active').length;
  const presentToday = roster.filter(
    (r) => r.assignmentStatus === 'Active' && r.attendance === 'Present'
  ).length;
  const completedRoles = roster.filter((r) => r.assignmentStatus === 'Completed').length;
  const totalShiftsLogged = roster.reduce((sum, r) => sum + (r.totalDaysWorked || 0), 0);
  const totalAccruedPayout = roster.reduce(
    (sum, r) => sum + (r.totalDaysWorked || 0) * (r.dailyRateAgreed || 0),
    0
  );

  // Unique projects with assigned workforce
  const projectsWithWorkforceCount = useMemo(() => {
    const projIds = new Set();
    roster.forEach((r) => {
      if (r.project?._id || r.project) {
        projIds.add(String(r.project._id || r.project));
      }
    });
    return projIds.size;
  }, [roster]);

  // Project Capacity Mapping
  const projectCapacityList = useMemo(() => {
    return projects.map((p) => {
      const assignedCount =
        p.hiredWorkersCount !== undefined
          ? p.hiredWorkersCount
          : roster.filter((r) => String(r.project?._id || r.project) === String(p._id)).length;
      const requiredCount = p.numberWorkers || 0;
      const remainingPositions = Math.max(0, requiredCount - assignedCount);
      const capacityPercent =
        requiredCount > 0 ? Math.min(100, Math.round((assignedCount / requiredCount) * 100)) : 100;

      return {
        ...p,
        assignedCount,
        requiredCount,
        remainingPositions,
        capacityPercent,
      };
    });
  }, [projects, roster]);

  const activeProjectObj = projects.find((p) => String(p._id) === String(selectedProjectId));

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedProjectId !== 'All' ||
    selectedStatus !== 'All' ||
    attendanceFilter !== 'All' ||
    workStatusFilter !== 'All' ||
    roleFilter !== 'All';

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedProjectId('All');
    setSelectedStatus('All');
    setAttendanceFilter('All');
    setWorkStatusFilter('All');
    setRoleFilter('All');
    if (searchParams.has('projectId')) {
      searchParams.delete('projectId');
      setSearchParams(searchParams);
    }
  };

  const handleSelectProjectFilter = (projId) => {
    setSelectedProjectId(projId);
    if (projId === 'All') {
      if (searchParams.has('projectId')) {
        searchParams.delete('projectId');
        setSearchParams(searchParams);
      }
    } else {
      setSearchParams({ projectId: projId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title="Workforce Operations"
          subtitle="Manage deployed technicians across your renewable-energy projects"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-semibold border backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
                toast.type === 'error'
                  ? 'bg-rose-50/95 text-rose-800 border-rose-200 shadow-rose-900/10'
                  : 'bg-emerald-50/95 text-emerald-900 border-emerald-300 shadow-emerald-900/10'
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

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold mb-2">
                <Users size={13} className="text-emerald-600" />
                <span>On-Site Crew Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Workforce Deployment
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Monitor deployed technicians, manage on-site attendance, track logged shifts,
                verify wages, and evaluate field performance across active renewable energy projects.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <Link
                to="/epc/applications"
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Briefcase size={15} className="text-slate-500" />
                <span>Candidate Pipeline</span>
              </Link>
              <Link
                to="/epc/technicians"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus size={15} />
                <span>Find Technicians</span>
              </Link>
            </div>
          </div>

          {/* Active Project Context Banner (if filtered by project) */}
          {activeProjectObj && (
            <div className="bg-emerald-950 text-emerald-50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm border border-emerald-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 flex items-center justify-center shrink-0 border border-emerald-700">
                  <Briefcase size={20} className="text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                      Active Project Filter
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200">
                      {activeProjectObj.projectType || 'Solar'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    {activeProjectObj.projectName}
                  </h3>
                  <p className="text-xs text-emerald-300/90 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} />
                    <span>
                      {activeProjectObj.location?.city || 'Location'}, {activeProjectObj.location?.state || 'India'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Link
                  to={`/epc/projects/${activeProjectObj._id}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-bold transition-all flex items-center gap-1 border border-emerald-700"
                >
                  <span>Project Details</span>
                  <ExternalLink size={12} />
                </Link>
                <button
                  type="button"
                  onClick={() => handleSelectProjectFilter('All')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1"
                >
                  <X size={13} />
                  <span>Show All Projects</span>
                </button>
              </div>
            </div>
          )}

          {/* Real Workforce Summary Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Assigned
                </span>
                <Users size={16} className="text-slate-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCrew}</div>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Across {projectsWithWorkforceCount} project{projectsWithWorkforceCount === 1 ? '' : 's'} with workforce
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Active Workers
                </span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">{activeCrew}</div>
              <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                Currently deployed on site
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Present Today
                </span>
                <Clock size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-700">{presentToday}</div>
              <div className="text-[11px] text-blue-600 mt-1 font-medium">
                {activeCrew > 0 ? Math.round((presentToday / activeCrew) * 100) : 0}% Daily Turnout
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-amber-600 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Accrued Payout
                </span>
                <IndianRupee size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-700">
                ₹{totalAccruedPayout.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-amber-600 mt-1 font-medium">
                {totalShiftsLogged} total shifts logged
              </div>
            </div>
          </div>

          {/* Project Workforce Capacity Overview (if projects exist) */}
          {projectCapacityList.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers size={18} className="text-emerald-600" />
                    <span>Project Workforce Capacity</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track assigned vs required workers and monitor unfilled staffing positions.
                  </p>
                </div>
                {selectedProjectId !== 'All' && (
                  <button
                    type="button"
                    onClick={() => handleSelectProjectFilter('All')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>View all projects</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {projectCapacityList.map((p) => {
                  const isSelected = String(selectedProjectId) === String(p._id);
                  const isFull = p.requiredCount > 0 && p.assignedCount >= p.requiredCount;

                  return (
                    <div
                      key={p._id}
                      onClick={() => handleSelectProjectFilter(isSelected ? 'All' : p._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                              {p.projectType || 'Solar'}
                            </span>
                            {isFull ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                Staffed
                              </span>
                            ) : p.remainingPositions > 0 ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                {p.remainingPositions} needed
                              </span>
                            ) : null}
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">
                            {p.projectName}
                          </h4>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">
                              {p.location?.city || 'Location'}, {p.location?.state || 'India'}
                            </span>
                          </span>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="text-xs font-black text-slate-900">
                            {p.assignedCount}{' '}
                            <span className="text-slate-400 font-semibold">
                              / {p.requiredCount || p.assignedCount}
                            </span>
                          </span>
                          <span className="block text-[10px] text-slate-500 font-medium">
                            Assigned
                          </span>
                        </div>
                      </div>

                      {/* Capacity Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-500 font-medium">Staffing Progress</span>
                          <span className="font-mono font-bold text-slate-700">
                            {p.capacityPercent}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull ? 'bg-emerald-600' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${p.capacityPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500">
                          {p.remainingPositions > 0
                            ? `${p.remainingPositions} unfilled positions`
                            : 'Fully assigned'}
                        </span>
                        <span
                          className={`font-bold text-xs flex items-center gap-0.5 ${
                            isSelected ? 'text-emerald-700' : 'text-slate-600'
                          }`}
                        >
                          {isSelected ? 'Active Filter' : 'Filter Crew'}
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter, Search, and View Controls */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search input across real fields */}
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search technician name, assigned role, project, city, skills..."
                  aria-label="Search workforce"
                  className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/60 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Clear search query"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Project Filter Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => handleSelectProjectFilter(e.target.value)}
                  aria-label="Filter by project"
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

              {/* Attendance Filter Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Attendance:</span>
                <select
                  value={attendanceFilter}
                  onChange={(e) => setAttendanceFilter(e.target.value)}
                  aria-label="Filter by attendance"
                  className="text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="All">All Attendance</option>
                  <option value="Present">Present Only</option>
                  <option value="Absent">Absent Only</option>
                  <option value="On Leave">On Leave Only</option>
                </select>
              </div>

              {/* View Switcher Toggle (Desktop) */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Table View
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Card Grid
                </button>
              </div>
            </div>

            {/* Faceted Filters Row: Status Pills & Role Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'All', label: 'All Status' },
                  { id: 'Active', label: 'Active Deployment' },
                  { id: 'Assigned', label: 'Assigned' },
                  { id: 'Completed', label: 'Completed Roles' },
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

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Work Status Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-slate-500">Work Status:</span>
                  <select
                    value={workStatusFilter}
                    onChange={(e) => setWorkStatusFilter(e.target.value)}
                    aria-label="Filter by work status"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="All">All Schedule</option>
                    <option value="On Schedule">On Schedule</option>
                    <option value="Pending Clearance">Pending Clearance</option>
                    <option value="Action Required">Action Required</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Role Filter (if extracted) */}
                {uniqueRoles.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-500">Role:</span>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      aria-label="Filter by role"
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden max-w-[150px] truncate"
                    >
                      <option value="All">All Roles</option>
                      {uniqueRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Reset Filters Button */}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X size={13} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Workforce List Header Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredRoster.length}</strong> of{' '}
              <strong className="text-slate-900">{totalCrew}</strong> technician assignments
            </span>
            <button
              type="button"
              onClick={fetchWorkforceData}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              title="Refresh roster"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading State Skeleton */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white border border-slate-200 rounded-3xl p-5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-200 rounded-2xl shrink-0" />
                    <div className="space-y-2">
                      <div className="w-36 h-4 bg-slate-200 rounded-md" />
                      <div className="w-48 h-3 bg-slate-200 rounded-md" />
                      <div className="w-24 h-3 bg-slate-200 rounded-md" />
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="w-24 h-8 bg-slate-200 rounded-xl" />
                    <div className="w-24 h-8 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white rounded-3xl border border-rose-200 p-12 text-center text-slate-600 space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Unable to load workforce</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  There was a connection issue loading the workforce deployment roster.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchWorkforceData}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : filteredRoster.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Users size={28} />
              </div>
              {hasActiveFilters ? (
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-800">
                    No matching workforce records
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No technicians match your active filters or search term. Try resetting your
                    filters.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <X size={14} />
                      <span>Clear All Filters</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-slate-800">
                    No workforce assigned yet
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Technicians assigned to your renewable-energy projects will appear here. Find
                    candidates in talent discovery or hire from your applications pipeline.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
                    <Link
                      to="/epc/technicians"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <UserCheck size={14} />
                      <span>Find Technicians</span>
                    </Link>
                    <Link
                      to="/epc/applications"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all"
                    >
                      <Briefcase size={14} />
                      <span>Applications Inbox</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : viewMode === 'table' ? (
            /* Desktop Structured Operations Table */
            <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4">Technician</th>
                      <th className="py-3.5 px-4">Project</th>
                      <th className="py-3.5 px-4">Role & Daily Rate</th>
                      <th className="py-3.5 px-4">Deployment Dates</th>
                      <th className="py-3.5 px-4">Field Attendance</th>
                      <th className="py-3.5 px-4">Work Status</th>
                      <th className="py-3.5 px-4 text-center">Shifts & Payout</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredRoster.map((item) => {
                      const tech = item.technician || {};
                      const techProfile = item.technicianProfile || {};
                      const project = item.project || {};
                      const isActive = item.assignmentStatus === 'Active';
                      const daysWorked = item.totalDaysWorked || 0;
                      const dailyRate = item.dailyRateAgreed || 1800;
                      const totalAccrued = daysWorked * dailyRate;

                      const isCurrentlyDeployed =
                        item.startDate &&
                        item.endDate &&
                        new Date() >= new Date(item.startDate) &&
                        new Date() <= new Date(item.endDate);

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Technician Column */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  tech.profilePhoto ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${tech.name || 'Technician'}&backgroundColor=059669`
                                }
                                alt={tech.name}
                                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                              />
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setDetailAssignment(item)}
                                  className="font-extrabold text-slate-900 hover:text-emerald-700 hover:underline text-left block"
                                >
                                  {tech.name || 'Technician'}
                                </button>
                                <span className="text-[11px] text-slate-500 block">
                                  {techProfile.profession || 'Renewable Tech'}
                                </span>
                                {techProfile.yearsOfExperience !== undefined && (
                                  <span className="text-[10px] text-slate-400">
                                    {techProfile.yearsOfExperience} yrs exp
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Project Column */}
                          <td className="py-4 px-4">
                            <div>
                              <Link
                                to={`/epc/projects/${project._id}`}
                                className="font-extrabold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
                              >
                                <span className="line-clamp-1">{project.projectName || 'Project'}</span>
                                <ExternalLink size={11} className="shrink-0 text-slate-400" />
                              </Link>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 font-medium text-[10px]">
                                  {project.projectType || 'Solar'}
                                </span>
                                <span>
                                  {project.location?.city || 'Site'}, {project.location?.state || 'India'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Role & Rate Column */}
                          <td className="py-4 px-4">
                            <div>
                              <span className="inline-block text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md mb-1">
                                {item.roleAssigned || 'Solar Installer'}
                              </span>
                              <div className="flex items-baseline gap-1">
                                <span className="font-black text-slate-900">
                                  ₹{dailyRate.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-slate-400">/day</span>
                              </div>
                              {techProfile.expectedDailyRate &&
                                techProfile.expectedDailyRate !== dailyRate && (
                                  <span className="text-[10px] text-slate-400 block">
                                    Expected: ₹{techProfile.expectedDailyRate}/d
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Deployment Dates */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className="text-slate-800 font-medium block whitespace-nowrap">
                                {item.startDate
                                  ? new Date(item.startDate).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                    })
                                  : 'TBD'}{' '}
                                →{' '}
                                {item.endDate
                                  ? new Date(item.endDate).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : 'TBD'}
                              </span>
                              <div className="flex items-center gap-1">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    item.assignmentStatus === 'Completed'
                                      ? 'bg-slate-100 text-slate-700 border-slate-300'
                                      : item.assignmentStatus === 'Active'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : 'bg-blue-50 text-blue-700 border-blue-200'
                                  }`}
                                >
                                  {item.assignmentStatus || 'Assigned'}
                                </span>
                                {isCurrentlyDeployed && isActive && (
                                  <span className="text-[10px] text-emerald-600 font-semibold">
                                    • On Site
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Attendance Selector */}
                          <td className="py-4 px-4">
                            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                              {['Present', 'Absent', 'On Leave'].map((att) => (
                                <button
                                  type="button"
                                  key={att}
                                  onClick={() =>
                                    handleUpdateAssignment(
                                      item._id,
                                      { attendance: att },
                                      `Attendance for ${tech.name} updated to ${att}`
                                    )
                                  }
                                  className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                    item.attendance === att
                                      ? att === 'Present'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : att === 'Absent'
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-amber-600 text-white shadow-xs'
                                      : 'text-slate-600 hover:bg-white/60'
                                  }`}
                                >
                                  {att}
                                </button>
                              ))}
                            </div>
                          </td>

                          {/* Work Status Dropdown */}
                          <td className="py-4 px-4">
                            <select
                              value={item.workStatus || 'On Schedule'}
                              onChange={(e) =>
                                handleUpdateAssignment(
                                  item._id,
                                  { workStatus: e.target.value },
                                  `Work status set to ${e.target.value}`
                                )
                              }
                              className="px-2 py-1 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="On Schedule">On Schedule</option>
                              <option value="Pending Clearance">Pending Clearance</option>
                              <option value="Action Required">Action Required</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>

                          {/* Shifts & Accrued Payout */}
                          <td className="py-4 px-4 text-center">
                            <div className="space-y-1">
                              <div className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-1.5 py-0.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAssignment(item._id, {
                                      totalDaysWorked: Math.max(0, daysWorked - 1),
                                    })
                                  }
                                  disabled={daysWorked <= 0}
                                  className="p-1 rounded hover:bg-white text-slate-500 disabled:opacity-30"
                                  title="Decrement shift"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="font-black text-slate-900 px-1 w-6 text-center text-xs">
                                  {daysWorked}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAssignment(
                                      item._id,
                                      { totalDaysWorked: daysWorked + 1 },
                                      `+1 shift logged for ${tech.name}`
                                    )
                                  }
                                  className="p-1 rounded hover:bg-emerald-50 text-emerald-700"
                                  title="Log day worked"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              <span className="block font-black text-emerald-700 text-xs">
                                ₹{totalAccrued.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Open Details Drawer */}
                              <button
                                type="button"
                                onClick={() => setDetailAssignment(item)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                                title="Inspect workforce assignment details"
                              >
                                <Eye size={14} />
                              </button>

                              {/* Passport Preview */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPassport(tech._id || techProfile?.user)
                                }
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
                                title="View Digital Skill Passport"
                              >
                                <ShieldCheck size={14} className="text-emerald-600" />
                              </button>

                              {/* Record Review */}
                              <button
                                type="button"
                                onClick={() => setReviewAssignment(item)}
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 transition-all shadow-2xs"
                                title="Record verified performance review"
                              >
                                <Star size={14} className="fill-amber-400 text-amber-400" />
                              </button>

                              {/* Complete Role Button (if active) */}
                              {isActive && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateAssignment(
                                      item._id,
                                      { assignmentStatus: 'Completed' },
                                      `${tech.name} marked as completed on project!`
                                    )
                                  }
                                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                                  title="Mark role as completed"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* Mobile / Card Grid View (Always active on mobile or when card mode selected) */}
          <div
            className={`space-y-4 ${
              viewMode === 'table' ? 'block lg:hidden' : 'block'
            }`}
          >
            {filteredRoster.map((item) => {
              const tech = item.technician || {};
              const techProfile = item.technicianProfile || {};
              const project = item.project || {};
              const isActive = item.assignmentStatus === 'Active';
              const daysWorked = item.totalDaysWorked || 0;
              const dailyRate = item.dailyRateAgreed || 1800;
              const totalAccrued = daysWorked * dailyRate;

              const isCurrentlyDeployed =
                item.startDate &&
                item.endDate &&
                new Date() >= new Date(item.startDate) &&
                new Date() <= new Date(item.endDate);

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  {/* Top: Avatar, Names, Badges, Compensation */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={
                          tech.profilePhoto ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${tech.name || 'Technician'}&backgroundColor=059669`
                        }
                        alt={tech.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 shrink-0 shadow-xs"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h3
                            onClick={() => setDetailAssignment(item)}
                            className="text-base font-extrabold text-slate-900 hover:text-emerald-700 cursor-pointer"
                          >
                            {tech.name || 'Technician'}
                          </h3>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
                            {item.roleAssigned || 'Solar Installer'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              item.assignmentStatus === 'Completed'
                                ? 'bg-slate-100 text-slate-700 border-slate-300'
                                : item.assignmentStatus === 'Active'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {item.assignmentStatus || 'Assigned'}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 font-medium">
                          {techProfile.profession || 'Renewable Energy Technician'}
                          {techProfile.city && (
                            <span className="text-slate-400">
                              {' '}
                              • {techProfile.city}, {techProfile.state || 'India'}
                            </span>
                          )}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
                          <Link
                            to={`/epc/projects/${project._id}`}
                            className="font-bold text-slate-900 hover:text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <span>{project.projectName || 'Project'}</span>
                            <ExternalLink size={11} className="text-slate-400" />
                          </Link>
                          <span className="text-slate-300">•</span>
                          <span className="text-slate-600 font-semibold">
                            ₹{dailyRate}/day
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Accrued Compensation Box */}
                    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-3 py-2 text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Payout
                      </span>
                      <span className="text-base font-black text-emerald-700 block">
                        ₹{totalAccrued.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {daysWorked} days logged
                      </span>
                    </div>
                  </div>

                  {/* Deployment Dates & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-slate-400" />
                      <span className="text-slate-600 font-medium">
                        Deployment:
                      </span>
                      <span className="font-bold text-slate-800">
                        {item.startDate
                          ? new Date(item.startDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                            })
                          : 'TBD'}{' '}
                        →{' '}
                        {item.endDate
                          ? new Date(item.endDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </span>
                    </div>

                    {isCurrentlyDeployed && isActive && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        Active on Site
                      </span>
                    )}
                  </div>

                  {/* Interactive Operational Controls Strip */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* Attendance Pill */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-500">Attendance:</span>
                      <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                        {['Present', 'Absent', 'On Leave'].map((att) => (
                          <button
                            type="button"
                            key={att}
                            onClick={() =>
                              handleUpdateAssignment(
                                item._id,
                                { attendance: att },
                                `Attendance for ${tech.name} set to ${att}`
                              )
                            }
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all ${
                              item.attendance === att
                                ? att === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : att === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {att}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Work Status */}
                    <div className="flex items-center gap-1.5">
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
                        className="px-2 py-1 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="On Schedule">On Schedule</option>
                        <option value="Pending Clearance">Pending Clearance</option>
                        <option value="Action Required">Action Required</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    {/* Shifts Worked Logger */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-500">Shifts:</span>
                      <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-xl px-1.5 py-0.5 shadow-2xs">
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
                          <Minus size={12} />
                        </button>
                        <span className="font-black text-slate-900 px-1 w-6 text-center text-xs">
                          {daysWorked}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateAssignment(
                              item._id,
                              { totalDaysWorked: daysWorked + 1 },
                              `+1 shift logged for ${tech.name}`
                            )
                          }
                          className="p-1 rounded-md hover:bg-emerald-50 text-emerald-700"
                          title="Log day worked"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailAssignment(item)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Eye size={13} />
                      <span>View Details</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenPassport(tech._id || techProfile?.user)
                        }
                        className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Passport</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setReviewAssignment(item)}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Star size={13} className="text-amber-500 fill-amber-500" />
                        <span>Review</span>
                      </button>

                      {isActive && (
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateAssignment(
                              item._id,
                              { assignmentStatus: 'Completed' },
                              `${tech.name} marked as completed!`
                            )
                          }
                          className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assignment Details Drawer / Modal */}
          {detailAssignment && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden relative">
                {/* Header Strip */}
                <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={
                        detailAssignment.technician?.profilePhoto ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${detailAssignment.technician?.name || 'Technician'}&backgroundColor=059669`
                      }
                      alt={detailAssignment.technician?.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-900 text-emerald-300 border border-emerald-700">
                          {detailAssignment.roleAssigned || 'Solar Installer'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {detailAssignment.assignmentStatus || 'Assigned'}
                        </span>
                      </div>
                      <h3 className="text-xl font-black">
                        {detailAssignment.technician?.name || 'Technician'}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {detailAssignment.technicianProfile?.profession || 'Renewable Energy Specialist'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDetailAssignment(null)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Close details"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  {/* Contact Information (if available) */}
                  {(detailAssignment.technician?.phone || detailAssignment.technician?.email) && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Technician Contact
                      </span>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-800">
                        {detailAssignment.technician?.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-emerald-600" />
                            <a
                              href={`tel:${detailAssignment.technician.phone}`}
                              className="hover:underline text-slate-900"
                            >
                              {detailAssignment.technician.phone}
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(detailAssignment.technician.phone, 'phone')
                              }
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy phone"
                            >
                              {copiedField === 'phone' ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        )}

                        {detailAssignment.technician?.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={13} className="text-blue-600" />
                            <a
                              href={`mailto:${detailAssignment.technician.email}`}
                              className="hover:underline text-slate-900"
                            >
                              {detailAssignment.technician.email}
                            </a>
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(detailAssignment.technician.email, 'email')
                              }
                              className="text-slate-400 hover:text-slate-600"
                              title="Copy email"
                            >
                              {copiedField === 'email' ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Project & Deployment Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Project Details
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {detailAssignment.project?.projectName || 'Project'}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin size={12} />
                        <span>
                          {detailAssignment.project?.location?.city || 'Location'},{' '}
                          {detailAssignment.project?.location?.state || 'India'}
                        </span>
                      </p>
                      <div className="pt-1.5">
                        <Link
                          to={`/epc/projects/${detailAssignment.project?._id}`}
                          className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                        >
                          <span>Open Project Details</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Deployment Dates
                      </span>
                      <div className="text-xs font-bold text-slate-900">
                        {detailAssignment.startDate
                          ? new Date(detailAssignment.startDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'TBD'}{' '}
                        →{' '}
                        {detailAssignment.endDate
                          ? new Date(detailAssignment.endDate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </div>
                      <span className="text-[11px] text-slate-500 block">
                        Status: <strong className="text-slate-800">{detailAssignment.workStatus || 'On Schedule'}</strong>
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Attendance: <strong className="text-slate-800">{detailAssignment.attendance || 'Present'}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Compensation & Rate Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Agreed Rate
                      </span>
                      <span className="text-base font-black text-slate-900 block mt-0.5">
                        ₹{detailAssignment.dailyRateAgreed || 1800}
                      </span>
                      <span className="text-[10px] text-slate-500">per day</span>
                    </div>

                    {detailAssignment.technicianProfile?.expectedDailyRate && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Expected Rate
                        </span>
                        <span className="text-base font-black text-slate-700 block mt-0.5">
                          ₹{detailAssignment.technicianProfile.expectedDailyRate}
                        </span>
                        <span className="text-[10px] text-slate-500">profile rate</span>
                      </div>
                    )}

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Shifts Worked
                      </span>
                      <span className="text-base font-black text-slate-900 block mt-0.5">
                        {detailAssignment.totalDaysWorked || 0}
                      </span>
                      <span className="text-[10px] text-slate-500">days logged</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                      <span className="text-[10px] font-bold text-emerald-600 uppercase block">
                        Total Payout
                      </span>
                      <span className="text-base font-black text-emerald-800 block mt-0.5">
                        ₹
                        {(
                          (detailAssignment.totalDaysWorked || 0) *
                          (detailAssignment.dailyRateAgreed || 1800)
                        ).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600">accrued</span>
                    </div>
                  </div>

                  {/* Skills (if available) */}
                  {Array.isArray(detailAssignment.technicianProfile?.renewableSkills) &&
                    detailAssignment.technicianProfile.renewableSkills.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Verified Renewable Skills
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {detailAssignment.technicianProfile.renewableSkills.map((sk) => (
                            <span
                              key={sk}
                              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Deployment Notes */}
                  {detailAssignment.notes && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-1 text-xs">
                      <span className="font-bold text-slate-700 block">Deployment Notes:</span>
                      <p className="text-slate-600 whitespace-pre-wrap">
                        {detailAssignment.notes}
                      </p>
                    </div>
                  )}

                  {/* Links Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {detailAssignment.technician?._id && (
                        <Link
                          to={`/technicians/${detailAssignment.technician._id}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>Technician Profile</span>
                          <ExternalLink size={12} />
                        </Link>
                      )}

                      {detailAssignment.technician?._id && (
                        <Link
                          to={`/verify/skill-passport/${detailAssignment.technician._id}`}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-emerald-700 text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <ShieldCheck size={14} className="text-emerald-600" />
                          <span>Verify Passport</span>
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReviewAssignment(detailAssignment);
                        setDetailAssignment(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span>Record Review</span>
                    </button>
                  </div>
                </div>
              </div>
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
                  `Verified review (${rating} Stars) successfully recorded to ${technicianName}'s Digital Skill Passport!`
                );
                fetchWorkforceData();
              }}
            />
          )}

          {/* Digital Skill Passport Preview Modal */}
          {passportModalData && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden relative">
                <button
                  type="button"
                  onClick={() => setPassportModalData(null)}
                  className="absolute top-5 right-5 z-20 p-2 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-colors"
                  aria-label="Close passport preview"
                >
                  <X size={20} />
                </button>

                <div className="p-6 max-h-[85vh] overflow-y-auto">
                  {passportModalData === 'loading' ? (
                    <div className="p-12 text-center text-slate-500 space-y-3">
                      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-slate-700">
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
