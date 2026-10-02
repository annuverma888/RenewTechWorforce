import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  BookmarkCheck,
  UserCheck,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Filter,
  Clock,
  MapPin,
  Star,
  Zap,
  Sparkles,
  ShieldCheck,
  Calendar,
  RotateCcw,
  Phone,
  Mail,
  QrCode,
  Briefcase,
  X,
  ExternalLink,
  Copy,
  Check,
  SlidersHorizontal,
  Layers,
  MessageSquare,
  Send,
  History,
  Info,
} from 'lucide-react';
import { applicationAPI, projectAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import MatchScoreBadge from '../../components/matching/MatchScoreBadge';
import MatchExplanationModal from '../../components/matching/MatchExplanationModal';
import HireTechnicianModal from '../../components/workforce/HireTechnicianModal';

const ApplicationsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || 'All';
  const initialStatus = searchParams.get('status') || 'All';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Search
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals & Drawers
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailModalTab, setDetailModalTab] = useState('overview'); // 'overview' | 'match' | 'timeline'
  const [interviewModalApp, setInterviewModalApp] = useState(null);
  const [interviewNote, setInterviewNote] = useState('');
  const [rejectModalApp, setRejectModalApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [hireModalApp, setHireModalApp] = useState(null);
  const [matchModalData, setMatchModalData] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync URL query params
  useEffect(() => {
    const params = {};
    if (selectedProjectId !== 'All') params.projectId = selectedProjectId;
    if (selectedStatus !== 'All') params.status = selectedStatus;
    setSearchParams(params);
  }, [selectedProjectId, selectedStatus, setSearchParams]);

  // Fetch applications and projects
  const fetchData = async () => {
    try {
      setLoading(true);
      const [appsRes, projRes] = await Promise.all([
        applicationAPI.getAll().catch((err) => {
          console.error('Error fetching applications:', err);
          return { data: { success: false, data: [] } };
        }),
        projectAPI.getAll().catch((err) => {
          console.error('Error fetching projects:', err);
          return { data: { success: false, data: [] } };
        }),
      ]);

      if (appsRes.data?.data && Array.isArray(appsRes.data.data)) {
        setApplications(appsRes.data.data);
      } else {
        setApplications([]);
      }

      if (projRes.data?.data && Array.isArray(projRes.data.data)) {
        setProjects(projRes.data.data);
      } else if (Array.isArray(projRes.data)) {
        setProjects(projRes.data);
      }
    } catch (err) {
      console.error('Error fetching application pipeline data:', err);
      showToast('Could not load application queue. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Copy helper
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Status update handler
  const handleUpdateStatus = async (appId, newStatus, customNote = '') => {
    try {
      setUpdatingId(appId);
      const res = await applicationAPI.updateStatus(appId, {
        status: newStatus,
        note: customNote || `Application moved to ${newStatus} by EPC employer.`,
      });

      if (res.data?.success) {
        showToast(`Application status updated to "${newStatus}"!`);
        // If drawer is currently showing this application, update its status locally
        if (selectedApplication?._id === appId) {
          setSelectedApplication((prev) => ({
            ...prev,
            status: newStatus,
            statusHistory: [
              ...(prev.statusHistory || []),
              {
                status: newStatus,
                updatedAt: new Date().toISOString(),
                note: customNote || `Application moved to ${newStatus}`,
              },
            ],
          }));
        }
        await fetchData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.response?.data?.message || 'Error updating application status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // Schedule Interview submission
  const handleSubmitInterview = async (e) => {
    e.preventDefault();
    if (!interviewModalApp) return;
    await handleUpdateStatus(
      interviewModalApp._id,
      'Interview',
      interviewNote.trim() || 'Technical screening & credential verification interview scheduled.'
    );
    setInterviewModalApp(null);
    setInterviewNote('');
  };

  // Rejection submission
  const handleSubmitReject = async (e) => {
    e.preventDefault();
    if (!rejectModalApp) return;
    await handleUpdateStatus(
      rejectModalApp._id,
      'Rejected',
      rejectReason.trim() || 'Application not selected for the current installation phase.'
    );
    setRejectModalApp(null);
    setRejectReason('');
  };

  // Dynamic Pipeline Statistics (Calculated strictly from real applications)
  const stats = useMemo(() => {
    const total = applications.length;
    const applied = applications.filter((a) => a.status === 'Applied').length;
    const review = applications.filter((a) => a.status === 'Under Review').length;
    const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
    const interview = applications.filter((a) => a.status === 'Interview' || a.status === 'Interviewing').length;
    const hired = applications.filter((a) => ['Selected', 'Hired', 'Assigned', 'Completed'].includes(a.status)).length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;

    return { total, applied, review, shortlisted, interview, hired, rejected };
  }, [applications]);

  // Filtering & Search Pipeline
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Project Filter
      if (selectedProjectId !== 'All') {
        const pId = app.project?._id || app.project;
        if (pId !== selectedProjectId) return false;
      }

      // 2. Status Filter
      if (selectedStatus !== 'All') {
        if (selectedStatus === 'Hired') {
          if (!['Selected', 'Hired', 'Assigned', 'Completed'].includes(app.status)) return false;
        } else if (selectedStatus === 'Interview') {
          if (app.status !== 'Interview' && app.status !== 'Interviewing') return false;
        } else if (app.status !== selectedStatus) {
          return false;
        }
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const techName = app.technician?.name?.toLowerCase() || '';
        const techEmail = app.technician?.email?.toLowerCase() || '';
        const prof = app.technicianProfile?.profession?.toLowerCase() || '';
        const city = app.technicianProfile?.city?.toLowerCase() || '';
        const state = app.technicianProfile?.state?.toLowerCase() || '';
        const projName = app.project?.projectName?.toLowerCase() || '';
        const skills = (app.technicianProfile?.renewableSkills || []).map((s) => s.name?.toLowerCase() || '');
        const certs = (app.verifiedCertificates || []).map((c) => c.certificateName?.toLowerCase() || '');
        const note = app.coverNote?.toLowerCase() || '';

        const matches =
          techName.includes(q) ||
          techEmail.includes(q) ||
          prof.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          projName.includes(q) ||
          skills.some((s) => s.includes(q)) ||
          certs.some((c) => c.includes(q)) ||
          note.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [applications, selectedProjectId, selectedStatus, searchQuery]);

  // Active filters count
  const activeFiltersCount = [
    selectedProjectId !== 'All',
    selectedStatus !== 'All',
    searchQuery.trim().length > 0,
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSelectedProjectId('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  // Selected project details (if filtered to single project)
  const activeFilteredProject = useMemo(() => {
    if (selectedProjectId === 'All') return null;
    return projects.find((p) => p._id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
      case 'Hired':
      case 'Assigned':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold';
      case 'Shortlisted':
        return 'bg-blue-50 text-blue-800 border-blue-300 font-extrabold';
      case 'Interview':
      case 'Interviewing':
        return 'bg-amber-50 text-amber-800 border-amber-300 font-extrabold';
      case 'Under Review':
        return 'bg-purple-50 text-purple-800 border-purple-300 font-extrabold';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-bold';
      case 'Applied':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Candidate Applications"
          subtitle="Manage technician applications, review credentials, and advance hiring pipelines"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border animate-in slide-in-from-top-4 duration-300 ${
                toastMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Breadcrumb Navigation & Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link to="/epc/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
                Dashboard
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900 font-bold">Applications Pipeline</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/epc/technicians"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors"
              >
                <Search size={14} className="text-slate-500" />
                <span>Search More Technicians</span>
              </Link>
              <Link
                to="/epc/projects"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Briefcase size={14} />
                <span>Projects Portfolio</span>
              </Link>
            </div>
          </div>

          {/* Context Banner (when filtered to specific project) */}
          {activeFilteredProject && (
            <div className="bg-emerald-950 text-white p-4 rounded-2xl border border-emerald-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold font-mono uppercase tracking-wider border border-emerald-500/30">
                    Project Filtered
                  </span>
                  <h3 className="text-sm font-extrabold text-white truncate max-w-md">
                    {activeFilteredProject.projectName}
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  {activeFilteredProject.projectType || 'Renewable'} • {activeFilteredProject.location?.city || 'Site'} •{' '}
                  {activeFilteredProject.hiredWorkersCount || 0} / {activeFilteredProject.numberWorkers || 1} Positions Filled
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/epc/projects/${activeFilteredProject._id}`}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  <Eye size={13} />
                  <span>View Project Details</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedProjectId('All')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Show All Projects
                </button>
              </div>
            </div>
          )}

          {/* Metric Stats Cards Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div
              onClick={() => setSelectedStatus('All')}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedStatus === 'All'
                  ? 'border-slate-800 ring-2 ring-slate-800/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Pool</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats.total}</p>
              <span className="text-[10px] text-slate-500 block truncate">All applications</span>
            </div>

            <div
              onClick={() => setSelectedStatus('Applied')}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedStatus === 'Applied'
                  ? 'border-slate-800 ring-2 ring-slate-800/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">New Applied</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{stats.applied}</p>
              <span className="text-[10px] text-slate-500 block truncate">Pending initial review</span>
            </div>

            <div
              onClick={() => setSelectedStatus('Shortlisted')}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedStatus === 'Shortlisted'
                  ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-blue-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">Shortlisted</span>
              <p className="text-2xl font-black text-blue-700 mt-1">{stats.shortlisted}</p>
              <span className="text-[10px] text-slate-500 block truncate">Qualified profiles</span>
            </div>

            <div
              onClick={() => setSelectedStatus('Interview')}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedStatus === 'Interview'
                  ? 'border-amber-600 ring-2 ring-amber-600/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-amber-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Interviewing</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{stats.interview}</p>
              <span className="text-[10px] text-slate-500 block truncate">In technical checks</span>
            </div>

            <div
              onClick={() => setSelectedStatus('Hired')}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedStatus === 'Hired'
                  ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-emerald-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Hired / Active</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{stats.hired}</p>
              <span className="text-[10px] text-slate-500 block truncate">Assigned to crew</span>
            </div>

            <div
              onClick={() => setSelectedStatus('Rejected')}
              className={`bg-white rounded-2xl p-3.5 border transition-all cursor-pointer ${
                selectedStatus === 'Rejected'
                  ? 'border-rose-600 ring-2 ring-rose-600/20 shadow-xs'
                  : 'border-slate-200/90 hover:border-rose-300'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">Archived</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{stats.rejected}</p>
              <span className="text-[10px] text-slate-500 block truncate">Rejected submissions</span>
            </div>
          </div>

          {/* Operational Pipeline & Filter Controls */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4">
            {/* Top row: Search input + View Toggle */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by candidate name, profession, project, skill, or city..."
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 focus:bg-white text-slate-800 placeholder-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Project Dropdown Filter */}
              <div className="w-full sm:w-64">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600 text-slate-700 font-semibold cursor-pointer truncate"
                >
                  <option value="All">📁 All Projects ({projects.length})</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    viewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Table Operations View"
                >
                  <Layers size={14} />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                    viewMode === 'cards'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Cards Pipeline View"
                >
                  <FileText size={14} />
                  <span className="hidden sm:inline">Cards</span>
                </button>
              </div>
            </div>

            {/* Status Tabs Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'All', label: 'All Applications', count: stats.total },
                  { id: 'Applied', label: 'New / Applied', count: stats.applied },
                  { id: 'Shortlisted', label: 'Shortlisted', count: stats.shortlisted },
                  { id: 'Interview', label: 'Interviewing', count: stats.interview },
                  { id: 'Hired', label: 'Selected / Hired', count: stats.hired },
                  { id: 'Rejected', label: 'Rejected', count: stats.rejected },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedStatus(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedStatus === tab.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        selectedStatus === tab.id
                          ? 'bg-white/20 text-white font-mono'
                          : 'bg-slate-200 text-slate-700 font-mono'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors ml-auto"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters ({activeFiltersCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <span>
              Showing <strong className="text-slate-900">{filteredApplications.length}</strong>{' '}
              {filteredApplications.length === 1 ? 'application' : 'applications'}{' '}
              {activeFiltersCount > 0 && `(filtered from ${applications.length} total)`}
            </span>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded-md w-36" />
                      <div className="h-3 bg-slate-100 rounded-md w-24" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-md w-44 hidden md:block" />
                  <div className="h-6 bg-slate-200 rounded-full w-20" />
                  <div className="h-8 bg-slate-200 rounded-xl w-28" />
                </div>
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {applications.length === 0 ? 'No applications yet' : 'No matching applications found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {applications.length === 0
                  ? 'Applications will appear here when certified technicians submit proposals for your renewable projects.'
                  : 'No candidate applications matched your current search and project filter combination. Try resetting your filters.'}
              </p>
              <div className="pt-2 flex justify-center gap-2">
                {applications.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    Clear All Filters
                  </button>
                ) : (
                  <Link
                    to="/epc/technicians"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Discover & Invite Technicians
                  </Link>
                )}
              </div>
            </div>
          ) : viewMode === 'table' ? (
            /* Table Operations View */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Project Applied</th>
                      <th className="py-3 px-4">Match Score</th>
                      <th className="py-3 px-4">Credentials & Skills</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Pipeline Status</th>
                      <th className="py-3 px-4 text-right">Workflow Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredApplications.map((app) => {
                      const tech = app.technician || {};
                      const prof = app.technicianProfile || {};
                      const proj = app.project || {};
                      const status = app.status || 'Applied';
                      const isUpdating = updatingId === app._id;
                      const verifiedCerts = app.verifiedCertificates || [];

                      return (
                        <tr key={app._id} className="hover:bg-slate-50/80 transition-colors group">
                          {/* Candidate Identity */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  tech.profilePhoto ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${tech.name || 'Tech'}&backgroundColor=059669`
                                }
                                alt={tech.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedApplication(app)}
                                  className="font-extrabold text-slate-900 hover:text-emerald-700 text-left transition-colors truncate max-w-[160px] block cursor-pointer"
                                >
                                  {tech.name || 'Technician'}
                                </button>
                                <span className="text-[11px] text-slate-500 block truncate max-w-[170px]">
                                  {prof.profession || 'Renewable Tech'} • {prof.city ? `${prof.city}, ${prof.state}` : 'India'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Target Project */}
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/epc/projects/${proj._id}`}
                              className="font-bold text-slate-800 hover:text-emerald-700 block truncate max-w-[180px] transition-colors"
                            >
                              {proj.projectName || 'Project'}
                            </Link>
                            <span className="text-[10px] text-slate-400 block">
                              {proj.projectType || 'Renewable'} • {proj.location?.city || 'Site'}
                            </span>
                          </td>

                          {/* Match Score */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <MatchScoreBadge
                                score={app.matchScore || 0}
                                size="sm"
                                onClick={() => {
                                  setMatchModalData({
                                    matchScore: app.matchScore,
                                    breakdown: app.matchBreakdown,
                                  });
                                }}
                              />
                            </div>
                          </td>

                          {/* Credentials & Skills */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              {verifiedCerts.length > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <ShieldCheck size={11} className="text-emerald-600" />
                                  <span>{verifiedCerts.length} Verified Cert{verifiedCerts.length > 1 ? 's' : ''}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Self-attested</span>
                              )}
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                <span>Exp: {prof.yearsOfExperience || 0} yrs</span>
                                <span>•</span>
                                <span>Index: {prof.overallSkillScore || 0}%</span>
                              </div>
                            </div>
                          </td>

                          {/* Applied Date */}
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {new Date(app.appliedAt || app.createdAt || Date.now()).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Pipeline Status */}
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] border ${getStatusBadge(status)}`}>
                              {status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              {/* Detail Drawer Trigger */}
                              <button
                                type="button"
                                onClick={() => setSelectedApplication(app)}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
                                title="Review Full Application"
                              >
                                <Eye size={12} />
                                <span>Review</span>
                              </button>

                              {/* Shortlist Quick Action */}
                              {status === 'Applied' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] border border-blue-200 transition-colors"
                                >
                                  Shortlist
                                </button>
                              )}

                              {/* Interview Quick Action */}
                              {['Applied', 'Under Review', 'Shortlisted'].includes(status) && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => setInterviewModalApp(app)}
                                  className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[11px] border border-amber-200 transition-colors"
                                >
                                  Interview
                                </button>
                              )}

                              {/* Select / Hire Action */}
                              {!['Selected', 'Hired', 'Assigned'].includes(status) && status !== 'Rejected' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => setHireModalApp(app)}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-2xs transition-colors"
                                >
                                  Hire
                                </button>
                              )}

                              {/* Rejection */}
                              {status !== 'Rejected' && !['Selected', 'Hired', 'Assigned'].includes(status) && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => setRejectModalApp(app)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  title="Reject Candidate"
                                >
                                  <XCircle size={15} />
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
          ) : (
            /* Cards Pipeline View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApplications.map((app) => {
                const tech = app.technician || {};
                const prof = app.technicianProfile || {};
                const proj = app.project || {};
                const status = app.status || 'Applied';
                const isUpdating = updatingId === app._id;
                const verifiedCerts = app.verifiedCertificates || [];

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <img
                            src={
                              tech.profilePhoto ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${tech.name || 'Tech'}&backgroundColor=059669`
                            }
                            alt={tech.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedApplication(app)}
                              className="text-base font-extrabold text-slate-900 hover:text-emerald-700 transition-colors text-left truncate block cursor-pointer"
                            >
                              {tech.name || 'Technician'}
                            </button>
                            <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                              {prof.profession || 'Renewable Specialist'}
                            </p>
                          </div>
                        </div>

                        {/* Match Score Badge */}
                        <MatchScoreBadge
                          score={app.matchScore || 0}
                          size="sm"
                          onClick={() => {
                            setMatchModalData({
                              matchScore: app.matchScore,
                              breakdown: app.matchBreakdown,
                            });
                          }}
                        />
                      </div>

                      {/* Status & Project Identity */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Project</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] border ${getStatusBadge(status)}`}>
                            {status}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 truncate">{proj.projectName || 'Project'}</p>
                        <p className="text-[11px] text-slate-500">
                          {proj.projectType} • Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>

                      {/* Location & Experience Bar */}
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-1">
                        <div className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{prof.city ? `${prof.city}, ${prof.state}` : 'India'}</span>
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <Zap size={12} className="text-amber-500 shrink-0" />
                          <span>{prof.yearsOfExperience || 0} Yrs Exp</span>
                        </div>
                      </div>

                      {/* Cover Note snippet if provided */}
                      {app.coverNote && (
                        <div className="bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60 text-xs">
                          <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wider block mb-0.5">
                            Candidate Note:
                          </span>
                          <p className="text-slate-600 line-clamp-2 italic text-[11px]">
                            "{app.coverNote}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedApplication(app)}
                        className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex-1 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>

                      {status === 'Applied' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                          className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors"
                        >
                          Shortlist
                        </button>
                      )}

                      {!['Selected', 'Hired', 'Assigned'].includes(status) && status !== 'Rejected' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => setHireModalApp(app)}
                          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-2xs transition-colors"
                        >
                          Hire
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* APPLICATION DETAILS SLIDE-OVER DRAWER */}
          {selectedApplication && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                {/* Drawer Top Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <img
                      src={
                        selectedApplication.technician?.profilePhoto ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${selectedApplication.technician?.name || 'Tech'}&backgroundColor=059669`
                      }
                      alt={selectedApplication.technician?.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-white truncate">
                          {selectedApplication.technician?.name || 'Candidate'}
                        </h2>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs border ${getStatusBadge(selectedApplication.status)}`}>
                          {selectedApplication.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 font-semibold">
                        {selectedApplication.technicianProfile?.profession || 'Renewable Energy Technician'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Applied for: <strong className="text-white">{selectedApplication.project?.projectName}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedApplication(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tab Navigation Strip */}
                <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 gap-6 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDetailModalTab('overview')}
                    className={`py-3 border-b-2 transition-colors cursor-pointer ${
                      detailModalTab === 'overview'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Candidate Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailModalTab('match')}
                    className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      detailModalTab === 'match'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sparkles size={13} className="text-emerald-600" />
                    <span>AI Match Analysis ({selectedApplication.matchScore}%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailModalTab('timeline')}
                    className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                      detailModalTab === 'timeline'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <History size={13} />
                    <span>Timeline History</span>
                  </button>
                </div>

                {/* Drawer Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {detailModalTab === 'overview' && (
                    <div className="space-y-6">
                      {/* Direct Navigation Links */}
                      <div className="grid grid-cols-2 gap-3">
                        <Link
                          to={`/technicians/${selectedApplication.technician?._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Eye size={14} className="text-slate-500" />
                            <span>View Full Profile</span>
                          </span>
                          <ExternalLink size={13} className="text-slate-400" />
                        </Link>

                        <Link
                          to={`/verify/skill-passport/${selectedApplication.technician?._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <QrCode size={14} className="text-emerald-600" />
                            <span>Verified Skill Passport</span>
                          </span>
                          <ExternalLink size={13} className="text-emerald-600" />
                        </Link>
                      </div>

                      {/* Direct Contact Information */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          Direct Contact Info
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] text-slate-400 block font-semibold">Phone</span>
                              <a
                                href={`tel:${selectedApplication.technician?.phone}`}
                                className="font-mono font-bold text-slate-900 hover:text-emerald-600"
                              >
                                {selectedApplication.technician?.phone || 'Not provided'}
                              </a>
                            </div>
                            {selectedApplication.technician?.phone && (
                              <button
                                type="button"
                                onClick={() => handleCopy(selectedApplication.technician?.phone, 'drawerPhone')}
                                className="p-1 text-slate-400 hover:text-slate-600"
                              >
                                {copiedField === 'drawerPhone' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <div className="space-y-0.5 min-w-0 pr-1">
                              <span className="text-[10px] text-slate-400 block font-semibold">Email</span>
                              <a
                                href={`mailto:${selectedApplication.technician?.email}`}
                                className="font-medium text-slate-900 hover:text-emerald-600 truncate block"
                              >
                                {selectedApplication.technician?.email || 'Not provided'}
                              </a>
                            </div>
                            {selectedApplication.technician?.email && (
                              <button
                                type="button"
                                onClick={() => handleCopy(selectedApplication.technician?.email, 'drawerEmail')}
                                className="p-1 text-slate-400 hover:text-slate-600 shrink-0"
                              >
                                {copiedField === 'drawerEmail' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Candidate Cover Note */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Submitted Application Note
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed italic">
                          {selectedApplication.coverNote ? `"${selectedApplication.coverNote}"` : 'No cover note provided.'}
                        </p>
                      </div>

                      {/* Verified Skills */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          Renewable Skills & Certifications
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {(selectedApplication.technicianProfile?.renewableSkills || []).map((sk, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                                sk.isVerified
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {sk.isVerified && <CheckCircle2 size={11} className="text-emerald-600" />}
                              <span>{sk.name || sk}</span>
                              <span className="text-[10px] text-slate-400">({sk.proficiency || 'Intermediate'})</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Verified Certificates List */}
                      {(selectedApplication.verifiedCertificates || []).length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Verified Accreditation Records
                          </h4>
                          <div className="space-y-2">
                            {selectedApplication.verifiedCertificates.map((cert) => (
                              <div
                                key={cert._id}
                                className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <p className="font-bold text-slate-900">{cert.certificateName}</p>
                                  <p className="text-[11px] text-slate-500">{cert.issuingOrganization || 'Accredited Body'}</p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  <ShieldCheck size={11} className="text-emerald-600" />
                                  <span>Verified</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {detailModalTab === 'match' && (
                    <div className="space-y-5">
                      {/* Match Overview Card */}
                      <div className="p-5 rounded-2xl bg-emerald-950 text-white space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                            AI Fit Assessment
                          </span>
                          <span className="text-2xl font-black text-emerald-400 font-mono">
                            {selectedApplication.matchScore || 0}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Algorithmic evaluation for <strong>{selectedApplication.project?.projectName}</strong> based on required skills, certifications, proximity, and experience.
                        </p>
                      </div>

                      {/* Factor Scores */}
                      {selectedApplication.matchBreakdown && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                          <h4 className="font-bold text-slate-800">Match Component Breakdown</h4>
                          <div className="grid grid-cols-2 gap-2 text-slate-600">
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">Skills Score</span>
                              <strong className="text-slate-900 font-mono text-sm">{selectedApplication.matchBreakdown.skillScore || 0}%</strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">Certifications</span>
                              <strong className="text-slate-900 font-mono text-sm">{selectedApplication.matchBreakdown.certScore || 0}%</strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">Experience</span>
                              <strong className="text-slate-900 font-mono text-sm">{selectedApplication.matchBreakdown.expScore || 0}%</strong>
                            </div>
                            <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                              <span className="text-[10px] text-slate-400 block font-semibold">Location Fit</span>
                              <strong className="text-slate-900 font-mono text-sm">{selectedApplication.matchBreakdown.locScore || 0}%</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Matching Reasons */}
                      {selectedApplication.matchBreakdown?.reasons && selectedApplication.matchBreakdown.reasons.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Key Selection Drivers
                          </h4>
                          <ul className="space-y-2">
                            {selectedApplication.matchBreakdown.reasons.map((reason, idx) => (
                              <li key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-start gap-2 text-slate-700">
                                <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {detailModalTab === 'timeline' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Application Progression Log
                      </h4>
                      {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 ? (
                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                          {selectedApplication.statusHistory.map((item, idx) => (
                            <div key={idx} className="relative">
                              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 border-white bg-emerald-600 shadow-2xs" />
                              <div className="text-xs space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900">{item.status}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                                {item.note && <p className="text-slate-600 text-[11px]">{item.note}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No history log recorded for this candidate.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Drawer Footer Actions Bar */}
                <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* Shortlist Action */}
                    {selectedApplication.status === 'Applied' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedApplication._id, 'Shortlisted')}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors"
                      >
                        Shortlist Candidate
                      </button>
                    )}

                    {/* Interview Action */}
                    {['Applied', 'Under Review', 'Shortlisted'].includes(selectedApplication.status) && (
                      <button
                        type="button"
                        onClick={() => setInterviewModalApp(selectedApplication)}
                        className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs transition-colors"
                      >
                        Schedule Interview
                      </button>
                    )}

                    {/* Hire Action */}
                    {!['Selected', 'Hired', 'Assigned'].includes(selectedApplication.status) &&
                      selectedApplication.status !== 'Rejected' && (
                        <button
                          type="button"
                          onClick={() => setHireModalApp(selectedApplication)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors"
                        >
                          Select & Hire
                        </button>
                      )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {/* Reject Action */}
                    {selectedApplication.status !== 'Rejected' &&
                      !['Selected', 'Hired', 'Assigned'].includes(selectedApplication.status) && (
                        <button
                          type="button"
                          onClick={() => setRejectModalApp(selectedApplication)}
                          className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      )}

                    <button
                      type="button"
                      onClick={() => setSelectedApplication(null)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE INTERVIEW MODAL */}
          {interviewModalApp && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-amber-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Schedule Interview</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInterviewModalApp(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Advance <strong>{interviewModalApp.technician?.name}</strong> to the interview stage for project{' '}
                  <strong>{interviewModalApp.project?.projectName}</strong>.
                </p>

                <form onSubmit={handleSubmitInterview} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Interview Instructions & Meeting Details
                    </label>
                    <textarea
                      rows={3}
                      value={interviewNote}
                      onChange={(e) => setInterviewNote(e.target.value)}
                      placeholder="e.g. Virtual technical interview on Friday at 11:00 AM. Please prepare your SCGJ/NSDC certificates."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-slate-800"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInterviewModalApp(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-2xs"
                    >
                      Confirm Interview Stage
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* REJECT CONFIRMATION MODAL */}
          {rejectModalApp && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <XCircle size={18} className="text-rose-600" />
                    <h3 className="text-base font-extrabold text-slate-900">Reject Application</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRejectModalApp(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="text-xs text-slate-600">
                  Are you sure you want to reject the application from <strong>{rejectModalApp.technician?.name}</strong>{' '}
                  for <strong>{rejectModalApp.project?.projectName}</strong>? This candidate will be archived.
                </p>

                <form onSubmit={handleSubmitReject} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Rejection Reason (Internal Record & Candidate Feedback)
                    </label>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Project roster capacity reached; or location constraint outside site radius."
                      className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-emerald-600 text-slate-800"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setRejectModalApp(null)}
                      className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-2xs"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* AI MATCH BREAKDOWN EXPLANATION MODAL */}
          {matchModalData && (
            <MatchExplanationModal
              isOpen={Boolean(matchModalData)}
              onClose={() => setMatchModalData(null)}
              matchData={matchModalData}
              candidateName="Candidate"
              projectName="Project"
            />
          )}

          {/* HIRE TECHNICIAN MODAL (Integrates directly into workforce assignment) */}
          {hireModalApp && (
            <HireTechnicianModal
              isOpen={Boolean(hireModalApp)}
              onClose={() => setHireModalApp(null)}
              technician={{
                ...hireModalApp.technician,
                _id: hireModalApp.technician?._id,
                user: hireModalApp.technician,
                technicianProfile: hireModalApp.technicianProfile,
              }}
              project={hireModalApp.project}
              applicationId={hireModalApp._id}
              onSuccess={() => {
                showToast(`Candidate ${hireModalApp.technician?.name} hired and assigned to workforce roster!`);
                setHireModalApp(null);
                if (selectedApplication?._id === hireModalApp._id) {
                  setSelectedApplication((prev) => ({
                    ...prev,
                    status: 'Hired',
                  }));
                }
                fetchData();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default ApplicationsPage;
