import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  MapPin,
  Calendar,
  Clock,
  Users,
  Eye,
  FileText,
  AlertCircle,
  RefreshCw,
  Sun,
  Wind,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, applicationAPI, workforceAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'In Progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Open':
    case 'Hiring':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const ProjectsPage = () => {
  const { user, profile } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [workforce, setWorkforce] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projRes, appsRes, wfRes] = await Promise.all([
        projectAPI.getAll(user?._id ? { companyId: user._id } : {}).catch((err) => {
          console.warn('[EPC Projects fetch error]:', err);
          return { data: { success: false, data: [] } };
        }),
        applicationAPI.getAll().catch((err) => {
          console.warn('[EPC Applications fetch error]:', err);
          return { data: { success: false, data: [] } };
        }),
        workforceAPI.getAll().catch((err) => {
          console.warn('[EPC Workforce fetch error]:', err);
          return { data: { success: false, data: [] } };
        }),
      ]);

      if (projRes.data?.data) {
        setProjects(projRes.data.data);
      }
      if (appsRes.data?.data) {
        setApplications(appsRes.data.data);
      }
      if (wfRes.data?.data) {
        setWorkforce(wfRes.data.data);
      }
    } catch (err) {
      console.error('Error loading projects data:', err);
      setError('Unable to load project listings. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, [user?._id]);

  // Derived application count per project helper
  const getProjectAppsCount = (projectId) => {
    return applications.filter((a) => {
      const aProjId = a.project?._id || a.project;
      return aProjId?.toString() === projectId?.toString();
    }).length;
  };

  // Filter & Search Logic
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.projectStatus === statusFilter);
    }

    // Technology Type Filter
    if (typeFilter !== 'All') {
      result = result.filter(
        (p) => (p.projectType || '').toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Keyword Search
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const name = (p.projectName || '').toLowerCase();
        const type = (p.projectType || '').toLowerCase();
        const city = (p.location?.city || '').toLowerCase();
        const state = (p.location?.state || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const skills = (p.requiredSkills || []).map((s) => s.toLowerCase());

        return (
          name.includes(term) ||
          type.includes(term) ||
          city.includes(term) ||
          state.includes(term) ||
          desc.includes(term) ||
          skills.some((s) => s.includes(term))
        );
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate);
      }
      if (sortBy === 'workers') {
        return (b.numberWorkers || 0) - (a.numberWorkers || 0);
      }
      if (sortBy === 'applications') {
        return getProjectAppsCount(b._id) - getProjectAppsCount(a._id);
      }
      return 0;
    });

    return result;
  }, [projects, statusFilter, typeFilter, searchQuery, sortBy, applications]);

  // Overall Statistics
  const openCount = projects.filter((p) => p.projectStatus === 'Open').length;
  const inProgressCount = projects.filter((p) => p.projectStatus === 'In Progress').length;
  const completedCount = projects.filter((p) => p.projectStatus === 'Completed').length;
  const totalPositionsRequired = projects.reduce((acc, p) => acc + (p.numberWorkers || 0), 0);
  const totalPositionsFilled = projects.reduce(
    (acc, p) => acc + (p.hiredWorkersCount || 0),
    workforce.length
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Project Management"
          subtitle="Manage renewable installations, staffing requirements, and technician applicants"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* TOP ACTION BAR */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Project Portfolio
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                  {projects.length} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitor site execution, track staffing fulfilment, and evaluate applicant rosters.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/epc/post-project"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>Post New Project</span>
              </Link>
            </div>
          </div>

          {/* METRIC SUMMARY STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Open & Hiring
              </span>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                {openCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Accepting candidates</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                In Progress
              </span>
              <div className="text-2xl font-bold text-blue-600 font-mono mt-1">
                {inProgressCount}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Active site execution</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Workforce Filled
              </span>
              <div className="text-2xl font-bold text-slate-900 font-mono mt-1">
                {totalPositionsFilled} / {totalPositionsRequired}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Technicians assigned</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Applicants
              </span>
              <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
                {applications.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Across all projects</span>
            </div>
          </div>

          {/* SEARCH, FILTER & CONTROL BAR */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search projects by title, location, skill or tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-600 focus:bg-white transition-colors"
                />
              </div>

              {/* View Toggle & Sort Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
                    <ArrowUpDown size={12} />
                    <span>Sort:</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-semibold text-slate-700 focus:outline-hidden pr-2 cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="workers">Most Workers Needed</option>
                    <option value="applications">Most Applications</option>
                  </select>
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Grid Cards View"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Table List View"
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Status:
                </span>
                {[
                  { label: 'All', count: projects.length },
                  { label: 'Open', count: openCount },
                  { label: 'In Progress', count: inProgressCount },
                  { label: 'Completed', count: completedCount },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setStatusFilter(tab.label)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      statusFilter === tab.label
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        statusFilter === tab.label
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Sector:
                </span>
                {['All', 'Solar', 'Wind'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      typeFilter === type
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {type === 'Solar' ? '☀️ Solar' : type === 'Wind' ? '💨 Wind' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchProjectsData}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* LOADING STATE */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs animate-pulse space-y-4"
                >
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded w-full" />
                  <div className="h-8 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            /* EMPTY STATE */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-4">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                <Briefcase size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No projects found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'All' || typeFilter !== 'All'
                    ? 'No projects match your active search keywords or filter criteria.'
                    : 'Commission your first clean energy installation to mobilize technician crews.'}
                </p>
              </div>

              {searchQuery || statusFilter !== 'All' || typeFilter !== 'All' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setTypeFilter('All');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              ) : (
                <Link
                  to="/epc/post-project"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle size={15} />
                  <span>Post First Project</span>
                </Link>
              )}
            </div>
          ) : viewMode === 'cards' ? (
            /* CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((proj) => {
                const projAppsCount = getProjectAppsCount(proj._id);
                const status = proj.projectStatus || 'Open';
                const needed = proj.numberWorkers || 1;
                const hired = proj.hiredWorkersCount || 0;
                const fillPercent = Math.min(100, Math.round((hired / needed) * 100));

                return (
                  <div
                    key={proj._id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all p-5 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Category & Status badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            proj.projectType === 'Solar'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-sky-50 text-sky-800 border-sky-200'
                          }`}
                        >
                          {proj.projectType === 'Solar' ? <Sun size={12} /> : <Wind size={12} />}
                          <span>{proj.projectType}</span>
                          <span>•</span>
                          <span>{proj.capacity || 'Utility Scale'}</span>
                        </span>

                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(
                            status
                          )}`}
                        >
                          {status}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <Link
                          to={`/epc/projects/${proj._id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-base leading-snug line-clamp-1 transition-colors block"
                        >
                          {proj.projectName}
                        </Link>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {proj.description || 'Renewable energy installation and workforce commissioning.'}
                        </p>
                      </div>

                      {/* Location & Dates */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            {proj.location?.city || 'India'}, {proj.location?.state || 'Pan-India'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span className="font-mono text-slate-700">
                            {formatDate(proj.startDate)} → {formatDate(proj.endDate)}
                          </span>
                        </div>
                      </div>

                      {/* Staffing Progress */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Workforce Staffing</span>
                          <span className="font-mono font-bold text-slate-900">
                            {hired} / {needed} ({fillPercent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              fillPercent >= 100
                                ? 'bg-emerald-500'
                                : fillPercent >= 50
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Skills Tags */}
                      {proj.requiredSkills && proj.requiredSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.requiredSkills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200"
                            >
                              {sk}
                            </span>
                          ))}
                          {proj.requiredSkills.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                              +{proj.requiredSkills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/epc/applications?projectId=${proj._id}`}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors inline-flex items-center gap-1.5"
                      >
                        <FileText size={13} />
                        <span>Applicants ({projAppsCount})</span>
                      </Link>

                      <Link
                        to={`/epc/projects/${proj._id}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Manage</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* COMPACT TABLE VIEW */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Project & Technology</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Timeline</th>
                      <th className="py-3.5 px-4">Staffing Filled</th>
                      <th className="py-3.5 px-4">Applicants</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((proj) => {
                      const projAppsCount = getProjectAppsCount(proj._id);
                      const status = proj.projectStatus || 'Open';
                      const needed = proj.numberWorkers || 1;
                      const hired = proj.hiredWorkersCount || 0;
                      const fillPercent = Math.min(100, Math.round((hired / needed) * 100));

                      return (
                        <tr
                          key={proj._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/epc/projects/${proj._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 block transition-colors"
                            >
                              {proj.projectName}
                            </Link>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">
                              {proj.projectType} • {proj.capacity || 'Utility Scale'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {proj.location?.city || 'India'}, {proj.location?.state || 'Pan-India'}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {formatDate(proj.startDate)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">
                              {hired} / {needed}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-1 font-mono">
                              ({fillPercent}%)
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/epc/applications?projectId=${proj._id}`}
                              className="font-mono font-bold text-slate-800 hover:text-emerald-700 inline-flex items-center gap-1"
                            >
                              <span>{projAppsCount}</span>
                              <span className="text-[11px] font-sans font-medium text-slate-500">
                                candidates
                              </span>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <Link
                              to={`/epc/projects/${proj._id}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </Link>
                            <Link
                              to={`/epc/applications?projectId=${proj._id}`}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200 transition-colors"
                            >
                              <span>Applicants ({projAppsCount})</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProjectsPage;
