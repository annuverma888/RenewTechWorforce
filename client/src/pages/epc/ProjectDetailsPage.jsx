import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Users,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sliders,
  DollarSign,
  ShieldCheck,
  Send,
  Star,
  X,
  Edit,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { projectAPI, matchingAPI, applicationAPI, workforceAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import MatchScoreBadge from '../../components/matching/MatchScoreBadge';
import MatchExplanationModal from '../../components/matching/MatchExplanationModal';
import HireTechnicianModal from '../../components/workforce/HireTechnicianModal';
import PerformanceReviewModal from '../../components/workforce/PerformanceReviewModal';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('matches'); // matches, applications, workforce

  // Tab data
  const [aiMatches, setAiMatches] = useState([]);
  const [applications, setApplications] = useState([]);
  const [workforce, setWorkforce] = useState([]);

  // Hiring & Review Modal State
  const [hireModalData, setHireModalData] = useState(null);
  const [reviewModalAssignment, setReviewModalAssignment] = useState(null);

  // Match modal
  const [selectedMatchData, setSelectedMatchData] = useState(null);
  const [matchModalCandidate, setMatchModalCandidate] = useState('');

  // Milestone Progress state
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [editProgressModal, setEditProgressModal] = useState(false);
  const [tempProgress, setTempProgress] = useState(0);

  // Edit Project Modal
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projRes, matchesRes, appsRes, wfRes] = await Promise.all([
        projectAPI.getById(id),
        matchingAPI.matchForProject(id).catch(() => ({ data: { data: [] } })),
        applicationAPI.getAll({ projectId: id }).catch(() => ({ data: { data: [] } })),
        workforceAPI.getByProject(id).catch(() => ({ data: { data: [] } })),
      ]);

      if (projRes.data?.success) {
        const p = projRes.data.data?.project || projRes.data.data;
        if (p) {
          setProject(p);
          setTempProgress(p.progressPercentage || 0);
          setEditFormData({
            projectName: p.projectName || '',
            description: p.description || '',
            budget: p.budget || '',
            numberWorkers: p.numberWorkers || 1,
            projectStatus: p.projectStatus || 'Open',
          });
        }
      }

      if (matchesRes.data?.data) {
        setAiMatches(matchesRes.data.data);
      }
      if (appsRes.data?.data) {
        setApplications(appsRes.data.data);
      }
      if (wfRes.data?.data) {
        setWorkforce(wfRes.data.data);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
      showToast('Could not load project details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  // Handle Deploy / Hire technician from AI Matches
  const handleHireFromMatches = async (techId, role) => {
    try {
      const res = await workforceAPI.assign({
        projectId: id,
        technicianId: techId,
        roleAssigned: role || 'Solar PV Wireman',
        dailyRateAgreed: 1800,
      });

      if (res.data.success) {
        showToast('Technician assigned to project workforce successfully!');
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deploying technician.', 'error');
    }
  };

  // Handle Application Status Update
  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await applicationAPI.updateStatus(appId, {
        status: newStatus,
        notes: `Updated status to ${newStatus} from project management panel.`,
      });
      if (res.data.success) {
        showToast(`Application marked as "${newStatus}"!`);
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating application.', 'error');
    }
  };

  // Handle Workforce Attendance Update
  const handleUpdateWorkforceAttendance = async (assignmentId, attendance) => {
    try {
      const res = await workforceAPI.updateAssignment(assignmentId, { attendance });
      if (res.data.success) {
        showToast(`Attendance marked as ${attendance}.`);
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating attendance.', 'error');
    }
  };

  // Handle Workforce Work Status Update
  const handleUpdateWorkforceWorkStatus = async (assignmentId, workStatus) => {
    try {
      const res = await workforceAPI.updateAssignment(assignmentId, { workStatus });
      if (res.data.success) {
        showToast(`Work status updated to ${workStatus}.`);
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating work status.', 'error');
    }
  };

  // Handle Shift Log (+1 Day Worked)
  const handleIncrementDaysWorked = async (assignmentId, currentDays) => {
    try {
      const newDays = (currentDays || 0) + 1;
      const res = await workforceAPI.updateAssignment(assignmentId, { totalDaysWorked: newDays });
      if (res.data.success) {
        showToast(`Logged shift: total ${newDays} days worked.`);
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error logging shift.', 'error');
    }
  };

  // Save Progress
  const handleSaveProgress = async () => {
    try {
      setUpdatingProgress(true);
      const res = await workforceAPI.updateProgress(id, {
        progressPercentage: Number(tempProgress),
        projectStatus: Number(tempProgress) === 100 ? 'Completed' : 'In Progress',
      });
      if (res.data.success) {
        showToast(`Milestone progress updated to ${tempProgress}%!`);
        setEditProgressModal(false);
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating progress.', 'error');
    } finally {
      setUpdatingProgress(false);
    }
  };

  // Save Project Edits
  const handleSaveProjectEdits = async (e) => {
    e.preventDefault();
    try {
      const res = await projectAPI.update(id, editFormData);
      if (res.data.success) {
        showToast('Project specifications updated successfully!');
        setEditProjectModal(false);
        fetchProjectData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating project.', 'error');
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hiredCount = project.hiredWorkersCount || workforce.length || 0;
  const totalNeeded = project.numberWorkers || 1;
  const fulfillPct = Math.min(100, Math.round((hiredCount / totalNeeded) * 100));

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

          {/* Navigation & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Link
              to="/epc/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Back to EPC Dashboard</span>
            </Link>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setEditProjectModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                <Edit size={14} />
                <span>Edit Project</span>
              </button>
              <Link
                to="/epc/technicians"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Users size={14} />
                <span>Search More Technicians</span>
              </Link>
            </div>
          </div>

          {/* Project Overview Hero Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-extrabold border ${
                      project.projectType === 'Solar'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-sky-50 text-sky-800 border-sky-300'
                    }`}
                  >
                    {project.projectType === 'Solar' ? '☀️ Solar PV' : '💨 Wind Energy'}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-semibold">
                    {project.workType || 'Full-time Contract'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                      project.projectStatus === 'Open'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : project.projectStatus === 'In Progress'
                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                        : 'bg-purple-50 text-purple-800 border-purple-300'
                    }`}
                  >
                    {project.projectStatus}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {project.projectName}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-slate-400" />
                    <strong>Site:</strong> {project.location?.siteName || project.projectName} (
                    {project.location?.city}, {project.location?.state})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(project.startDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    -{' '}
                    {new Date(project.endDate).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} className="text-slate-400" />
                    {project.durationDays || 30} Days
                  </span>
                </div>
              </div>

              {/* Budget Badge */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-right shrink-0">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Allocated Budget
                </span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  ₹{project.budget?.toLocaleString('en-IN') || '2,50,000'}
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
              {project.description}
            </p>

            {/* Quick Metrics Bar: Workforce Fulfillment & Milestone Progress */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Workforce Fulfillment */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Users size={15} className="text-emerald-700" />
                    <span>Crew Fulfillment</span>
                  </span>
                  <span className="font-extrabold text-emerald-800">
                    {hiredCount} / {totalNeeded} Workers ({fulfillPct}%)
                  </span>
                </div>
                <div className="w-full bg-emerald-100 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${fulfillPct}%` }}
                  />
                </div>
              </div>

              {/* Execution Milestone Progress */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Sliders size={15} className="text-blue-700" />
                    <span>Milestone Execution</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-900">
                      {project.progressPercentage || 0}% Complete
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditProgressModal(true)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 underline font-bold"
                    >
                      Update
                    </button>
                  </div>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${project.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Skills & Certifications Required Tags */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-400 self-center mr-1">Required:</span>
              {project.requiredSkills?.map((s, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-medium"
                >
                  {s}
                </span>
              ))}
              {project.requiredCertifications?.map((c, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold"
                >
                  ✓ {c}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive Tabs Header */}
          <div className="flex items-center border-b border-slate-200 bg-white px-3 sm:px-6 rounded-2xl shadow-xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('matches')}
              className={`py-3.5 sm:py-4 px-3 sm:px-4 text-xs font-extrabold border-b-2 flex items-center gap-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'matches'
                  ? 'border-purple-600 text-purple-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles size={16} className={activeTab === 'matches' ? 'text-purple-600' : ''} />
              <span>AI Matched Talent</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800">
                {aiMatches.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('applications')}
              className={`py-3.5 sm:py-4 px-3 sm:px-4 text-xs font-extrabold border-b-2 flex items-center gap-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'applications'
                  ? 'border-emerald-600 text-emerald-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={16} className={activeTab === 'applications' ? 'text-emerald-600' : ''} />
              <span>Applications Received</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                {applications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('workforce')}
              className={`py-3.5 sm:py-4 px-3 sm:px-4 text-xs font-extrabold border-b-2 flex items-center gap-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                activeTab === 'workforce'
                  ? 'border-blue-600 text-blue-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users size={16} className={activeTab === 'workforce' ? 'text-blue-600' : ''} />
              <span>Active Workforce Roster</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800">
                {workforce.length}
              </span>
            </button>
          </div>

          {/* TAB 1: AI Matched Candidates */}
          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    AI Pre-Ranked Candidates for this Project
                  </h3>
                  <p className="text-xs text-slate-500">
                    Precision matching based on skill overlap (40%), location (15%), experience (20%), certified credentials (15%), and assessment score (10%).
                  </p>
                </div>
              </div>

              {aiMatches.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                  No matching candidates calculated yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiMatches.map((item) => {
                    const tech = item.technician;
                    const profileData = item.profile;
                    const isHired = item.applicationStatus === 'Hired';

                    return (
                      <div
                        key={tech.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  tech.profilePhoto ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${tech.name}&backgroundColor=059669`
                                }
                                alt={tech.name}
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-500/20"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{tech.name}</h4>
                                <p className="text-xs text-slate-600 font-medium">
                                  {profileData?.profession}
                                </p>
                                <p className="text-[11px] text-slate-400">
                                  {profileData?.city}, {profileData?.state} • {profileData?.yearsOfExperience}y exp
                                </p>
                              </div>
                            </div>

                            <MatchScoreBadge
                              score={item.matchScore}
                              size="md"
                              onClick={() => {
                                setSelectedMatchData({
                                  matchScore: item.matchScore,
                                  breakdown: item.breakdown,
                                });
                                setMatchModalCandidate(tech.name);
                              }}
                            />
                          </div>

                          {/* Skill Tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {profileData?.renewableSkills?.slice(0, 3).map((sk, i) => (
                              <span
                                key={i}
                                className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                              >
                                {sk.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Footer Action */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            ₹{profileData?.expectedDailyRate || 1800}/day
                          </span>

                          {isHired ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              Hired
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setHireModalData({
                                  technician: {
                                    _id: tech.id || tech._id,
                                    name: tech.name,
                                    profilePhoto: tech.profilePhoto,
                                    profession: profileData?.profession,
                                    expectedDailyRate: profileData?.expectedDailyRate,
                                    renewableSkills: profileData?.renewableSkills,
                                    matchScore: item.matchScore,
                                    phone: tech.phone,
                                  },
                                  project: project,
                                  applicationId: null,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                            >
                              <UserCheck size={14} />
                              <span>Deploy to Roster</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Applications Received */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Applications Received ({applications.length})
                </h3>
              </div>

              {applications.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                  No applications received yet for this project.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            app.technician?.profilePhoto ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${app.technician?.name}&backgroundColor=059669`
                          }
                          alt={app.technician?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {app.technician?.name}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-slate-700 italic mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            "{app.coverNote}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <MatchScoreBadge
                          score={app.matchScore || 80}
                          size="md"
                          onClick={() => {
                            setSelectedMatchData({
                              matchScore: app.matchScore,
                              breakdown: app.matchBreakdown,
                            });
                            setMatchModalCandidate(app.technician?.name);
                          }}
                        />

                        {/* Status change actions */}
                        {app.status === 'Applied' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateAppStatus(app._id, 'Shortlisted')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                            >
                              Shortlist
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateAppStatus(app._id, 'Interviewing')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                            >
                              Interview
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setHireModalData({
                                  technician: {
                                    _id: app.technician?._id || app.technician?.id || app.technician,
                                    name: app.technician?.name,
                                    profilePhoto: app.technician?.profilePhoto,
                                    profession: app.technicianProfile?.profession || app.technician?.profession,
                                    expectedDailyRate: app.technicianProfile?.expectedDailyRate || app.technician?.expectedDailyRate,
                                    phone: app.technician?.phone,
                                    matchScore: app.matchScore,
                                  },
                                  project: project,
                                  applicationId: app._id,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                            >
                              Hire
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateAppStatus(app._id, 'Rejected')}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {app.status === 'Shortlisted' && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                              ⭐ Shortlisted
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateAppStatus(app._id, 'Interviewing')}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors"
                            >
                              Interview
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setHireModalData({
                                  technician: {
                                    _id: app.technician?._id || app.technician?.id || app.technician,
                                    name: app.technician?.name,
                                    profilePhoto: app.technician?.profilePhoto,
                                    profession: app.technicianProfile?.profession || app.technician?.profession,
                                    expectedDailyRate: app.technicianProfile?.expectedDailyRate || app.technician?.expectedDailyRate,
                                    phone: app.technician?.phone,
                                    matchScore: app.matchScore,
                                  },
                                  project: project,
                                  applicationId: app._id,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                            >
                              Hire
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateAppStatus(app._id, 'Rejected')}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {(app.status === 'Interview' || app.status === 'Interviewing') && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                              🗓️ Interviewing
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setHireModalData({
                                  technician: {
                                    _id: app.technician?._id || app.technician?.id || app.technician,
                                    name: app.technician?.name,
                                    profilePhoto: app.technician?.profilePhoto,
                                    profession: app.technicianProfile?.profession || app.technician?.profession,
                                    expectedDailyRate: app.technicianProfile?.expectedDailyRate || app.technician?.expectedDailyRate,
                                    phone: app.technician?.phone,
                                    matchScore: app.matchScore,
                                  },
                                  project: project,
                                  applicationId: app._id,
                                })
                              }
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                            >
                              Hire
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateAppStatus(app._id, 'Rejected')}
                              className="px-2 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {(app.status === 'Hired' || app.status === 'Assigned' || app.status === 'Selected') && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-lg shadow-2xs">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Hired & Assigned
                          </span>
                        )}

                        {app.status === 'Rejected' && (
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Active Workforce Roster */}
          {activeTab === 'workforce' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Deployed Workforce Roster ({workforce.length} Technicians)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Technicians actively deployed on-site for this project
                  </p>
                </div>
              </div>

              {workforce.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                  No technicians deployed yet. Use the "AI Matched Talent" tab or "Applications" to
                  assign verified workers to this project.
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                  {workforce.map((member) => (
                    <div
                      key={member._id}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            member.technician?.profilePhoto ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${member.technician?.name}&backgroundColor=059669`
                          }
                          alt={member.technician?.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                              {member.technician?.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {member.roleAssigned || 'Solar Installer'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Rate: ₹{member.dailyRateAgreed || 1800}/day • {member.totalDaysWorked || 0} shifts logged • Gross: ₹{((member.totalDaysWorked || 0) * (member.dailyRateAgreed || 1800)).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Attendance Selector */}
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Att:
                          </label>
                          <select
                            value={member.attendance || 'Present'}
                            onChange={(e) => handleUpdateWorkforceAttendance(member._id, e.target.value)}
                            className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition-all cursor-pointer ${
                              member.attendance === 'Present'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : member.attendance === 'Absent'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="On Leave">On Leave</option>
                          </select>
                        </div>

                        {/* Work Status Selector */}
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">
                            Status:
                          </label>
                          <select
                            value={member.workStatus || 'On Schedule'}
                            onChange={(e) => handleUpdateWorkforceWorkStatus(member._id, e.target.value)}
                            className="text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 bg-white text-slate-800 cursor-pointer"
                          >
                            <option value="On Schedule">On Schedule</option>
                            <option value="Pending Clearance">Pending Clearance</option>
                            <option value="Action Required">Action Required</option>
                          </select>
                        </div>

                        {/* Shift Logger Button */}
                        <button
                          type="button"
                          onClick={() => handleIncrementDaysWorked(member._id, member.totalDaysWorked)}
                          title="Log +1 Day Shift"
                          className="px-2.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <span>+1 Shift</span>
                        </button>

                        {/* Review Performance Button */}
                        <button
                          type="button"
                          onClick={() => setReviewModalAssignment({ ...member, project })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                        >
                          <Star size={13} className="fill-amber-400 text-amber-400" />
                          <span>Review</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODAL: Update Progress Milestone */}
          {editProgressModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Update Project Milestone</h3>
                  <button
                    type="button"
                    onClick={() => setEditProgressModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Execution Progress: <span className="text-emerald-600">{tempProgress}%</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[0, 25, 50, 75, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setTempProgress(val)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            Number(tempProgress) === val
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditProgressModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProgress}
                    disabled={updatingProgress}
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                  >
                    {updatingProgress ? 'Updating...' : 'Save Milestone'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: Edit Project Specs */}
          {editProjectModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Edit Project Specifications</h3>
                  <button
                    type="button"
                    onClick={() => setEditProjectModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveProjectEdits} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.projectName}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, projectName: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project Status
                    </label>
                    <select
                      value={editFormData.projectStatus}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, projectStatus: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Budget (INR ₹)
                      </label>
                      <input
                        type="number"
                        value={editFormData.budget}
                        onChange={(e) =>
                          setEditFormData((prev) => ({ ...prev, budget: Number(e.target.value) }))
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Total Workers Needed
                      </label>
                      <input
                        type="number"
                        value={editFormData.numberWorkers}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            numberWorkers: Number(e.target.value),
                          }))
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData((prev) => ({ ...prev, description: e.target.value }))
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditProjectModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Match Explanation Modal */}
          <MatchExplanationModal
            isOpen={!!selectedMatchData}
            onClose={() => setSelectedMatchData(null)}
            matchData={selectedMatchData}
            candidateName={matchModalCandidate}
            projectName={project.projectName}
          />

          {/* Hire / Deploy Technician Modal */}
          <HireTechnicianModal
            isOpen={!!hireModalData}
            onClose={() => setHireModalData(null)}
            technician={hireModalData?.technician}
            project={hireModalData?.project || project}
            applicationId={hireModalData?.applicationId}
            onSuccess={() => {
              showToast('Technician successfully deployed to project workforce!');
              setHireModalData(null);
              fetchProjectData();
            }}
          />

          {/* Performance Review Modal */}
          <PerformanceReviewModal
            isOpen={!!reviewModalAssignment}
            onClose={() => setReviewModalAssignment(null)}
            assignment={reviewModalAssignment}
            onSuccess={() => {
              showToast('Performance rating recorded to Digital Skill Passport!');
              setReviewModalAssignment(null);
              fetchProjectData();
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
