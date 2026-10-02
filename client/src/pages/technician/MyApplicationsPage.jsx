import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Eye,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sun,
  Wind,
  Zap,
  RefreshCw,
  X,
  XCircle,
  BadgePercent,
  Layers,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';
import { applicationAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

// Status badge styling and metadata mapping
const getStatusMeta = (status) => {
  switch (status) {
    case 'Hired':
    case 'Selected':
    case 'Assigned':
    case 'Completed':
      return {
        label: status === 'Completed' ? 'Completed' : 'Accepted / Hired',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold',
        dotClass: 'bg-emerald-500',
        icon: CheckCircle2,
        stepIndex: 3,
        description: 'You have been selected and contracted for this project.',
      };
    case 'Shortlisted':
      return {
        label: 'Shortlisted',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 font-bold',
        dotClass: 'bg-blue-500',
        icon: Sparkles,
        stepIndex: 2,
        description: 'Your profile has been shortlisted by the EPC contractor.',
      };
    case 'Interview':
    case 'Interviewing':
    case 'Under Review':
      return {
        label: status === 'Interview' || status === 'Interviewing' ? 'Interview Stage' : 'Under Review',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-300 font-bold',
        dotClass: 'bg-amber-500',
        icon: Clock,
        stepIndex: 1,
        description: 'The EPC team is reviewing your profile and credentials.',
      };
    case 'Rejected':
      return {
        label: 'Not Selected',
        badgeClass: 'bg-rose-50 text-rose-700 border-rose-300 font-bold',
        dotClass: 'bg-rose-500',
        icon: XCircle,
        stepIndex: -1,
        description: 'This position was filled or your application was not chosen.',
      };
    case 'Applied':
    default:
      return {
        label: 'Applied',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
        dotClass: 'bg-slate-400',
        icon: FileText,
        stepIndex: 0,
        description: 'Your application has been received and queued for review.',
      };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (val) => {
  if (!val && val !== 0) return 'Not Disclosed';
  return `₹${Number(val).toLocaleString('en-IN')}`;
};

const getTechIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('wind')) return <Wind className="w-4 h-4 text-sky-500" />;
  if (t.includes('bess') || t.includes('battery')) return <Zap className="w-4 h-4 text-purple-500" />;
  if (t.includes('hybrid')) return <Layers className="w-4 h-4 text-teal-500" />;
  return <Sun className="w-4 h-4 text-amber-500" />;
};

const MyApplicationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationAPI.getAll();
      if (res.data?.success) {
        setApplications(res.data.data || []);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Unable to retrieve applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Summary Metrics calculated strictly from real data
  const metrics = useMemo(() => {
    const total = applications.length;
    const underReview = applications.filter((a) =>
      ['Applied', 'Under Review', 'Interview', 'Interviewing'].includes(a.status)
    ).length;
    const shortlisted = applications.filter((a) => a.status === 'Shortlisted').length;
    const hired = applications.filter((a) =>
      ['Selected', 'Hired', 'Assigned', 'Completed'].includes(a.status)
    ).length;
    const rejected = applications.filter((a) => a.status === 'Rejected').length;

    return { total, underReview, shortlisted, hired, rejected };
  }, [applications]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: applications.length,
      Applied: applications.filter((a) => a.status === 'Applied').length,
      Review: applications.filter((a) =>
        ['Under Review', 'Interview', 'Interviewing'].includes(a.status)
      ).length,
      Shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
      Hired: applications.filter((a) =>
        ['Selected', 'Hired', 'Assigned', 'Completed'].includes(a.status)
      ).length,
      Rejected: applications.filter((a) => a.status === 'Rejected').length,
    };
  }, [applications]);

  // Filtered applications based on active tab and search
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // 1. Status Filter
      if (selectedStatusTab === 'Applied' && app.status !== 'Applied') return false;
      if (
        selectedStatusTab === 'Review' &&
        !['Under Review', 'Interview', 'Interviewing'].includes(app.status)
      ) {
        return false;
      }
      if (selectedStatusTab === 'Shortlisted' && app.status !== 'Shortlisted') return false;
      if (
        selectedStatusTab === 'Hired' &&
        !['Selected', 'Hired', 'Assigned', 'Completed'].includes(app.status)
      ) {
        return false;
      }
      if (selectedStatusTab === 'Rejected' && app.status !== 'Rejected') return false;

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const proj = app.project || {};
        const title = (proj.projectName || '').toLowerCase();
        const company = (proj.companyName || '').toLowerCase();
        const city = (proj.location?.city || '').toLowerCase();
        const state = (proj.location?.state || '').toLowerCase();
        const tech = (proj.projectType || '').toLowerCase();
        const note = (app.coverNote || '').toLowerCase();
        const statusStr = (app.status || '').toLowerCase();

        const matches =
          title.includes(q) ||
          company.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          tech.includes(q) ||
          note.includes(q) ||
          statusStr.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [applications, selectedStatusTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="My Applications"
          subtitle="Track your renewable-energy project applications in one place."
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Top Bar: Title & Primary CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                My Applications
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Track your renewable-energy project applications in one place.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={fetchApplications}
                disabled={loading}
                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Refresh applications"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <Link
                to="/technician/recommended"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Recommended Projects</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Real Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Total Applications</span>
                <FileText size={16} className="text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900 mt-2 font-mono">{metrics.total}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Submitted across projects</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Under Review</span>
                <Clock size={16} className="text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-700 mt-2 font-mono">
                {metrics.underReview}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">In screening or interview</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Shortlisted</span>
                <Sparkles size={16} className="text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-2 font-mono">
                {metrics.shortlisted}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Contractor shortlisted</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Accepted / Hired</span>
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-700 mt-2 font-mono">{metrics.hired}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Confirmed project roles</p>
            </div>
          </div>

          {/* Search Bar & Status Filter Tabs */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by project name, EPC contractor, location, technology, or cover note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Tabs with real live counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
              {[
                { id: 'ALL', label: 'All', count: tabCounts.ALL },
                { id: 'Applied', label: 'Applied', count: tabCounts.Applied },
                { id: 'Review', label: 'Under Review', count: tabCounts.Review },
                { id: 'Shortlisted', label: 'Shortlisted', count: tabCounts.Shortlisted },
                { id: 'Hired', label: 'Accepted / Hired', count: tabCounts.Hired },
                { id: 'Rejected', label: 'Not Selected', count: tabCounts.Rejected },
              ].map((tab) => {
                const isActive = selectedStatusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedStatusTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-slate-800 text-slate-200'
                          : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Application Feed */}
          {loading ? (
            /* Loading State with Skeleton Cards */
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                      <div className="h-3.5 bg-slate-100 rounded w-1/4" />
                    </div>
                    <div className="h-6 bg-slate-200 rounded w-24 self-start" />
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full w-full" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="h-4 bg-slate-100 rounded" />
                    <div className="h-4 bg-slate-100 rounded" />
                    <div className="h-4 bg-slate-100 rounded" />
                    <div className="h-4 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            /* Error State */
            <div className="bg-white rounded-xl border border-rose-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Unable to Load Applications</h3>
                <p className="text-xs text-slate-500 mt-1">{error}</p>
              </div>
              <button
                onClick={fetchApplications}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          ) : applications.length === 0 ? (
            /* Global Zero Applications State */
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <FileText size={26} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">No Applications Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  You haven't applied to any renewable-energy projects yet.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/technician/recommended"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <span>Explore Recommended Projects</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  to="/projects"
                  className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  Browse All Projects
                </Link>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            /* Filter Empty State */
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                <Search size={22} />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">No Applications Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try another status filter or clear your search query to see your submitted applications.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setSelectedStatusTab('ALL');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Reset Filters
                </button>
                <Link
                  to="/technician/recommended"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  View Recommended Projects
                </Link>
              </div>
            </div>
          ) : (
            /* Application Cards List */
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const proj = app.project || {};
                const statusMeta = getStatusMeta(app.status);
                const StatusIcon = statusMeta.icon;
                const matchScore = typeof app.matchScore === 'number' ? app.matchScore : null;
                const appliedDate = formatDate(app.appliedAt || app.createdAt);

                // Progress pipeline definition
                const pipelineStages = ['Applied', 'Under Review', 'Shortlisted', 'Accepted / Hired'];
                const isRejected = app.status === 'Rejected';

                return (
                  <div
                    key={app._id}
                    className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs p-4 sm:p-5 flex flex-col gap-4"
                  >
                    {/* Header Row: Title, Company, Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="p-1 rounded-md bg-slate-100 border border-slate-200">
                            {getTechIcon(proj.projectType)}
                          </span>
                          <Link
                            to={`/projects/${proj._id}`}
                            className="text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors truncate"
                          >
                            {proj.projectName || 'Renewable Energy Project'}
                          </Link>
                          {proj.projectType && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {proj.projectType}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                          {proj.companyName && (
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <Building2 size={13} className="text-slate-400" />
                              {proj.companyName}
                            </span>
                          )}
                          {proj.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={13} className="text-slate-400" />
                              {proj.location.city || ''}
                              {proj.location.city && proj.location.state ? ', ' : ''}
                              {proj.location.state || ''}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar size={13} className="text-slate-400" />
                            Applied on {appliedDate}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge & Match score */}
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {matchScore !== null && matchScore > 0 && (
                          <div
                            className={`px-2 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 ${
                              matchScore >= 80
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : matchScore >= 60
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                            title="Matching Engine Score"
                          >
                            <BadgePercent size={13} />
                            <span>{matchScore}% Match</span>
                          </div>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border ${statusMeta.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dotClass}`} />
                          <StatusIcon size={13} />
                          <span>{statusMeta.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Progress Visualization */}
                    <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
                      {isRejected ? (
                        <div className="flex items-center gap-2 text-xs text-rose-700">
                          <XCircle size={15} className="shrink-0" />
                          <span>
                            <strong>Application Closed:</strong> Not selected for this assignment.
                            Your credentials remain active for other matching opportunities.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                            <span className="text-slate-700 font-semibold">
                              Stage {statusMeta.stepIndex + 1} of 4: {statusMeta.label}
                            </span>
                            <span className="text-slate-400 hidden sm:inline">
                              {statusMeta.description}
                            </span>
                          </div>

                          {/* Linear Stage Tracker */}
                          <div className="grid grid-cols-4 gap-1.5">
                            {pipelineStages.map((stage, idx) => {
                              const isCompleted = idx <= statusMeta.stepIndex;
                              const isCurrent = idx === statusMeta.stepIndex;

                              return (
                                <div key={stage} className="space-y-1">
                                  <div
                                    className={`h-1.5 rounded-full transition-all ${
                                      isCompleted
                                        ? isCurrent
                                          ? 'bg-emerald-600'
                                          : 'bg-emerald-500/80'
                                        : 'bg-slate-200'
                                    }`}
                                    title={stage}
                                  />
                                  <span
                                    className={`text-[10px] block truncate ${
                                      isCurrent
                                        ? 'text-emerald-700 font-bold'
                                        : isCompleted
                                        ? 'text-slate-600 font-medium'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {stage}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Compact Project Details Bar & Card Footer Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                      {/* Project Specs */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500">
                        {proj.budget && (
                          <span>
                            Budget:{' '}
                            <strong className="text-slate-800 font-mono">
                              {formatCurrency(proj.budget)}
                            </strong>
                          </span>
                        )}
                        {proj.durationDays && (
                          <span>
                            Duration:{' '}
                            <strong className="text-slate-800">{proj.durationDays} Days</strong>
                          </span>
                        )}
                        {proj.startDate && (
                          <span>
                            Starts:{' '}
                            <strong className="text-slate-800">{formatDate(proj.startDate)}</strong>
                          </span>
                        )}
                        {proj.projectStatus && (
                          <span>
                            Status:{' '}
                            <strong className="text-slate-800">{proj.projectStatus}</strong>
                          </span>
                        )}
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                        <Link
                          to={`/projects/${proj._id}`}
                          className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <span>Project Page</span>
                          <ArrowUpRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Application Details Modal */}
      {selectedApp && (
        <ApplicationDetailsModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
};

// Modal for deep inspection of application, cover note, match breakdown, and EPC notes
const ApplicationDetailsModal = ({ application, onClose }) => {
  const proj = application.project || {};
  const statusMeta = getStatusMeta(application.status);
  const StatusIcon = statusMeta.icon;
  const matchScore = typeof application.matchScore === 'number' ? application.matchScore : null;
  const reasons = application.matchBreakdown?.reasons || [];
  const statusHistory = application.statusHistory || [];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-white border border-slate-200 shadow-2xs">
                {getTechIcon(proj.projectType)}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {proj.projectName || 'Project Application'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>{proj.companyName || 'EPC Contractor'}</span>
              <span>•</span>
              <span className="font-mono">ID: {application._id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status & Review Snapshot */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Application Status
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border ${statusMeta.badgeClass}`}
                  >
                    <StatusIcon size={14} />
                    <span>{statusMeta.label}</span>
                  </span>
                  {matchScore !== null && matchScore > 0 && (
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-mono font-bold">
                      {matchScore}% Match
                    </span>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right text-slate-500">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Date Submitted
                </span>
                <span className="font-mono text-slate-700 mt-1 block font-semibold">
                  {formatDate(application.appliedAt || application.createdAt)}
                </span>
              </div>
            </div>

            <p className="text-slate-600 text-xs pt-1 border-t border-slate-200/60">
              {statusMeta.description}
            </p>
          </div>

          {/* Submitted Cover Note Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-emerald-600" />
                <span>Your Submitted Cover Note</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">Provided to Contractor</span>
            </div>

            {application.coverNote ? (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {application.coverNote}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-slate-400 italic text-xs">
                Standard technical application note submitted with verified Skill Passport.
              </div>
            )}
          </div>

          {/* Match Rationale / Reasons if present */}
          {reasons.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                <span>Match Score Breakdown</span>
              </h4>
              <div className="bg-blue-50/50 rounded-xl p-3.5 border border-blue-100 space-y-1.5">
                {reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-700 text-xs">
                    <span className="text-blue-600 font-bold shrink-0 mt-0.5">•</span>
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History / Activity Log */}
          {statusHistory.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-slate-500" />
                <span>Application History</span>
              </h4>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                {statusHistory.map((hist, i) => (
                  <div key={i} className="p-3 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">{hist.status}</span>
                      {hist.note && <p className="text-slate-500 text-[11px]">{hist.note}</p>}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {formatDate(hist.updatedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Overview Snapshot */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={14} className="text-slate-500" />
              <span>Project Snapshot</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Technology</span>
                <span className="font-semibold text-slate-800">{proj.projectType || 'Solar'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Location</span>
                <span className="font-semibold text-slate-800 truncate block">
                  {proj.location?.city || ''}
                  {proj.location?.city && proj.location?.state ? ', ' : ''}
                  {proj.location?.state || 'India'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Budget</span>
                <span className="font-semibold font-mono text-slate-800">
                  {formatCurrency(proj.budget)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                <span className="font-semibold text-slate-800">
                  {proj.durationDays ? `${proj.durationDays} Days` : 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Target Start</span>
                <span className="font-semibold text-slate-800">
                  {formatDate(proj.startDate)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Project Status</span>
                <span className="font-semibold text-slate-800">
                  {proj.projectStatus || 'Open'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          <Link
            to={`/projects/${proj._id}`}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>View Full Project Listing</span>
            <ExternalLink size={13} />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationsPage;
