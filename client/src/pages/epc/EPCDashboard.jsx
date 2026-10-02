import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Search,
  Compass,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Star,
  ArrowRight,
  Eye,
  Building,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  X,
  Filter,
  ChevronRight,
  Zap,
  Sun,
  Wind,
  Check,
  ExternalLink,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, applicationAPI, technicianAPI, workforceAPI } from '../../services/api';
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

const getApplicationStatusBadge = (status) => {
  switch (status) {
    case 'Selected':
    case 'Hired':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Shortlisted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Interview':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Under Review':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const EPCDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [workforce, setWorkforce] = useState([]);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [projectSearch, setProjectSearch] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projRes, appsRes, wfRes, techsRes] = await Promise.all([
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
        technicianAPI.getAll({ availability: 'Available' }).catch((err) => {
          console.warn('[EPC Available Technicians fetch error]:', err);
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
      if (techsRes.data?.data) {
        setAvailableTechnicians(techsRes.data.data);
      }
    } catch (err) {
      console.error('Error loading EPC dashboard data:', err);
      setError('Unable to load dashboard data. Please verify your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?._id]);

  // Derived real metrics
  const activeProjects = projects.filter(
    (p) => p.projectStatus === 'Open' || p.projectStatus === 'In Progress'
  );
  const completedProjects = projects.filter((p) => p.projectStatus === 'Completed');
  const openProjects = projects.filter((p) => p.projectStatus === 'Open');
  const inProgressProjects = projects.filter((p) => p.projectStatus === 'In Progress');

  const totalWorkersNeeded = projects.reduce((acc, curr) => acc + (curr.numberWorkers || 0), 0);
  const totalWorkersHired = projects.reduce(
    (acc, curr) => acc + (curr.hiredWorkersCount || 0),
    workforce.length
  );
  const openPositions = Math.max(0, totalWorkersNeeded - totalWorkersHired);
  const activeWorkforce = workforce.filter((w) => w.workStatus === 'Active');

  const pendingApplications = applications.filter(
    (a) => a.status === 'Applied' || a.status === 'Under Review'
  );
  const shortlistedApplications = applications.filter(
    (a) => a.status === 'Shortlisted' || a.status === 'Interview'
  );
  const selectedApplications = applications.filter(
    (a) => a.status === 'Selected' || a.status === 'Hired'
  );

  const verifiedAvailableTechs = availableTechnicians.filter(
    (t) =>
      (t.verifiedCertificatesCount && t.verifiedCertificatesCount > 0) ||
      (t.renewableSkills && t.renewableSkills.some((s) => s.isVerified))
  );

  // Technology breakdown
  const solarProjects = projects.filter(
    (p) => (p.projectType || '').toLowerCase() === 'solar'
  );
  const windProjects = projects.filter(
    (p) => (p.projectType || '').toLowerCase() === 'wind'
  );

  // Dynamic Priority Actions
  const priorityActions = [];
  if (pendingApplications.length > 0) {
    priorityActions.push({
      id: 'review-apps',
      type: 'warning',
      icon: FileText,
      title: `${pendingApplications.length} Application${pendingApplications.length > 1 ? 's' : ''} Awaiting Review`,
      description:
        'Certified candidates are waiting for initial screening across your renewable projects.',
      to: '/epc/applications?status=Applied',
      ctaText: 'Review Applications',
      badge: 'Action Required',
    });
  }
  if (shortlistedApplications.length > 0) {
    priorityActions.push({
      id: 'finalize-shortlist',
      type: 'info',
      icon: UserCheck,
      title: `${shortlistedApplications.length} Candidate${shortlistedApplications.length > 1 ? 's' : ''} Shortlisted`,
      description:
        'Qualified technicians in interview stage ready for deployment selection.',
      to: '/epc/applications?status=Shortlisted',
      ctaText: 'View Shortlist',
      badge: 'Pipeline Ready',
    });
  }
  if (openPositions > 0 && activeProjects.length > 0) {
    priorityActions.push({
      id: 'staff-positions',
      type: 'primary',
      icon: Users,
      title: `${openPositions} Open Position${openPositions > 1 ? 's' : ''} Across Active Projects`,
      description:
        'Installation workforce requirements remain unfulfilled. Search verified technicians.',
      to: '/epc/technicians',
      ctaText: 'Find Technicians',
      badge: 'Workforce Gap',
    });
  }
  if (projects.length === 0 && !loading) {
    priorityActions.push({
      id: 'post-first-project',
      type: 'primary',
      icon: PlusCircle,
      title: 'Commission Your First Renewable Project',
      description:
        'Post a solar or wind project to trigger automated technician skill matching.',
      to: '/epc/post-project',
      ctaText: 'Post Project',
      badge: 'Get Started',
    });
  }

  // Filtered projects for the management table
  const filteredProjects = projects.filter((p) => {
    const matchesTab =
      activeTab === 'All'
        ? true
        : activeTab === 'Open'
        ? p.projectStatus === 'Open'
        : activeTab === 'In Progress'
        ? p.projectStatus === 'In Progress'
        : activeTab === 'Completed'
        ? p.projectStatus === 'Completed'
        : true;

    const term = projectSearch.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (p.projectName && p.projectName.toLowerCase().includes(term)) ||
      (p.projectType && p.projectType.toLowerCase().includes(term)) ||
      (p.location?.city && p.location.city.toLowerCase().includes(term)) ||
      (p.location?.state && p.location.state.toLowerCase().includes(term));

    return matchesTab && matchesSearch;
  });

  const companyName = profile?.companyName || user?.name || 'EPC Enterprise Partner';
  const companyDomain = profile?.primaryDomain || 'Renewable Energy EPC Contractor';
  const companyLocation = [profile?.city, profile?.state].filter(Boolean).join(', ');
  const companyStatus = profile?.verifiedStatus || 'Verified';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="EPC Dashboard"
          subtitle="Renewable Project Operations & Workforce Command Center"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Error Banner with Retry */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadDashboardData}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {/* SECTION 1: COMPANY WELCOME & CONTROL BAR */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                  {companyName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={13} />
                  <span>{companyStatus} EPC</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{companyDomain}</span>
                {companyLocation && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MapPin size={13} className="text-slate-400" />
                      {companyLocation}
                    </span>
                  </>
                )}
                {profile?.registrationNumber && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      GSTIN: {profile.registrationNumber}
                    </span>
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
              <Link
                to="/epc/post-project"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>Post Project</span>
              </Link>
              <Link
                to="/epc/technicians"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Compass size={16} className="text-slate-500" />
                <span>Find Technicians</span>
              </Link>
              <Link
                to="/epc/applications"
                className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <FileText size={16} className="text-slate-500" />
                <span>Applications ({applications.length})</span>
              </Link>
            </div>
          </div>

          {/* SECTION 2: 5 KEY OPERATIONAL METRICS */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs animate-pulse space-y-3"
                >
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-7 bg-slate-200 rounded w-16" />
                  <div className="h-2.5 bg-slate-100 rounded w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Active Projects */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Active Projects
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Briefcase size={16} />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {activeProjects.length}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {projects.length} Total Commissioned • {completedProjects.length} Completed
                </div>
              </div>

              {/* Open Applications */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Open Applications
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-mono tracking-tight">
                    {pendingApplications.length}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {applications.length} Total Received • Needs Review
                </div>
              </div>

              {/* Shortlisted Candidates */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Shortlisted Talent
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <UserCheck size={16} />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-mono tracking-tight">
                    {shortlistedApplications.length}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Interview Stage • Deployment Ready
                </div>
              </div>

              {/* Active Workforce */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Active Workforce
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tracking-tight">
                    {totalWorkersHired}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {totalWorkersNeeded} Needed • {openPositions} Open Positions
                </div>
              </div>

              {/* Available Verified Technicians */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Verified Talent Pool
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <div className="my-2">
                  <div className="text-2xl sm:text-3xl font-extrabold text-purple-600 font-mono tracking-tight">
                    {verifiedAvailableTechs.length}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {availableTechnicians.length} Available in Marketplace
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: PRIORITY ACTIONS / NEEDS YOUR ATTENTION */}
          {priorityActions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  <span>Operational Priority Actions</span>
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {priorityActions.length} Pending Task{priorityActions.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {priorityActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                          {action.badge}
                        </span>
                        <action.icon size={16} className="text-slate-400" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {action.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {action.description}
                      </p>
                    </div>

                    <Link
                      to={action.to}
                      className="mt-1 w-full px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>{action.ctaText}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: ACTIVE PROJECTS OPERATIONAL ROSTER */}
          <div
            id="projects"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
          >
            <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Commissioned Projects
                </h2>
                <p className="text-xs text-slate-500">
                  Track ongoing renewable installations, staffing fulfilment, and applicant rosters
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/epc/post-project"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <PlusCircle size={14} />
                  <span>Post New Project</span>
                </Link>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="p-3 sm:px-5 sm:py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { label: 'All', count: projects.length },
                  { label: 'Open', count: openProjects.length },
                  { label: 'In Progress', count: inProgressProjects.length },
                  { label: 'Completed', count: completedProjects.length },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(tab.label)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab.label
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                        activeTab === tab.label
                          ? 'bg-slate-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Filter projects by title, type, city..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-emerald-600 transition-colors"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading commissioned projects...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Briefcase size={22} />
                </div>
                <h3 className="text-sm font-bold text-slate-700">No projects found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {projectSearch || activeTab !== 'All'
                    ? 'No projects match your current search or tab filters.'
                    : 'Publish your first clean energy installation to mobilize technician crews.'}
                </p>
                <Link
                  to="/epc/post-project"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle size={14} />
                  <span>Post Project</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-4">Project & Technology</th>
                      <th className="py-3.5 px-4">Location</th>
                      <th className="py-3.5 px-4">Schedule</th>
                      <th className="py-3.5 px-4">Workforce Staffing</th>
                      <th className="py-3.5 px-4">Applicants</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProjects.map((proj) => {
                      const projApps = applications.filter((a) => {
                        const aProjId = a.project?._id || a.project;
                        return aProjId?.toString() === proj._id?.toString();
                      });

                      const status = proj.projectStatus || 'Open';
                      const needed = proj.numberWorkers || 1;
                      const hired = proj.hiredWorkersCount || 0;
                      const fillPercent = Math.min(100, Math.round((hired / needed) * 100));

                      return (
                        <tr
                          key={proj._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Title & Type */}
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/epc/projects/${proj._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 block transition-colors"
                            >
                              {proj.projectName}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-semibold text-emerald-700">
                                {proj.projectType}
                              </span>
                              <span>•</span>
                              <span>{proj.capacity || 'Utility Scale'}</span>
                              {proj.minimumExperience ? (
                                <>
                                  <span>•</span>
                                  <span>{proj.minimumExperience}+ Yrs Exp</span>
                                </>
                              ) : null}
                            </div>
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="font-medium block text-slate-800">
                              {proj.location?.city || 'India'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {proj.location?.state || 'Pan-India'}
                            </span>
                          </td>

                          {/* Schedule */}
                          <td className="py-3.5 px-4 text-slate-600">
                            <span className="font-mono text-slate-700 block">
                              {formatDate(proj.startDate)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {proj.durationDays ? `${proj.durationDays} Days Duration` : 'Standard Milestone'}
                            </span>
                          </td>

                          {/* Staffing Progress */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-semibold text-slate-800">
                                {hired} / {needed} Filled
                              </span>
                              <span className="font-mono text-slate-500">{fillPercent}%</span>
                            </div>
                            <div className="w-28 bg-slate-100 rounded-full h-1.5 overflow-hidden">
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
                          </td>

                          {/* Applicants */}
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/epc/applications?projectId=${proj._id}`}
                              className="font-mono font-bold text-slate-800 hover:text-emerald-700 inline-flex items-center gap-1"
                            >
                              <span>{projApps.length}</span>
                              <span className="text-[11px] font-sans font-medium text-slate-500">
                                candidates
                              </span>
                            </Link>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <Link
                              to={`/epc/projects/${proj._id}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                              title="View Project Specifications"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </Link>
                            <Link
                              to={`/epc/applications?projectId=${proj._id}`}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200 transition-colors"
                              title="Review Candidates for this Project"
                            >
                              <span>Applicants ({projApps.length})</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SECTION 5: TWO-COLUMN SECTION: RECENT APPLICATIONS & WORKFORCE SNAPSHOT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications Queue */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
                  <p className="text-xs text-slate-500">
                    Latest certified candidates seeking site deployment
                  </p>
                </div>
                <Link
                  to="/epc/applications"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  <span>View All ({applications.length})</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading applications...</div>
              ) : applications.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <FileText size={18} />
                  </div>
                  <p className="text-xs text-slate-500">No applications received yet.</p>
                  <Link
                    to="/epc/post-project"
                    className="text-xs font-bold text-emerald-700 hover:underline inline-block"
                  >
                    Post a project to attract technicians →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map((app) => {
                    const tech = app.technician || {};
                    const prof = app.technicianProfile || {};
                    const proj = app.project || {};
                    const status = app.status || 'Applied';

                    return (
                      <div
                        key={app._id}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/20 shrink-0">
                            {tech.name ? tech.name.charAt(0).toUpperCase() : 'T'}
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/technicians/${tech._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 truncate block transition-colors"
                            >
                              {tech.name || 'Certified Technician'}
                            </Link>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {prof.profession || 'Renewable Technician'} • {proj.projectName || 'Project'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {app.matchScore && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {app.matchScore}% Match
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getApplicationStatusBadge(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                          <Link
                            to={`/epc/applications?projectId=${proj._id || ''}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Review Application"
                          >
                            <Eye size={14} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/epc/applications"
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold text-center block transition-colors border border-slate-200"
                >
                  Manage Complete Hiring Pipeline
                </Link>
              </div>
            </div>

            {/* Active Workforce Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Active Site Workforce</h2>
                  <p className="text-xs text-slate-500">
                    Field crews mobilized across ongoing renewable installations
                  </p>
                </div>
                <Link
                  to="/epc/workforce"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  <span>Workforce Roster ({workforce.length})</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading workforce roster...</div>
              ) : workforce.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Users size={18} />
                  </div>
                  <p className="text-xs text-slate-500">No technicians deployed to roster yet.</p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Select applicants or assign technicians to projects to track site attendance and daily logs.
                  </p>
                  <Link
                    to="/epc/technicians"
                    className="text-xs font-bold text-emerald-700 hover:underline inline-block pt-1"
                  >
                    Search available technicians →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {workforce.slice(0, 5).map((assign) => {
                    const tech = assign.technician || {};
                    const proj = assign.project || {};
                    const status = assign.workStatus || assign.assignmentStatus || 'Active';
                    const attendance = assign.attendance || assign.dailyAttendance || 'Present';
                    const role = assign.roleAssigned || assign.assignedRole || 'Field Tech';

                    return (
                      <div
                        key={assign._id}
                        className="py-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center ring-2 ring-emerald-500/20 shrink-0">
                            {tech.name ? tech.name.charAt(0).toUpperCase() : 'W'}
                          </div>
                          <div className="min-w-0">
                            {tech._id ? (
                              <Link
                                to={`/technicians/${tech._id}`}
                                className="font-bold text-slate-900 hover:text-emerald-700 truncate block transition-colors"
                              >
                                {tech.name || 'Assigned Crew Member'}
                              </Link>
                            ) : (
                              <span className="font-bold text-slate-900 truncate block">
                                {tech.name || 'Assigned Crew Member'}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 block truncate">
                              {role} • {proj.projectName || 'Active Site'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              attendance === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {attendance}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              status === 'Active'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  to="/epc/workforce"
                  className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold text-center block transition-colors border border-slate-200"
                >
                  Open Operational Workforce Roster
                </Link>
              </div>
            </div>
          </div>

          {/* SECTION 6: TECHNOLOGY BREAKDOWN & QUICK ACTION HUB */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Renewable Portfolio Technology Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900">Portfolio Technology Mix</h2>
                <p className="text-xs text-slate-500">Distribution across clean energy sectors</p>
              </div>

              <div className="space-y-3.5">
                {/* Solar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-500" />
                      Solar PV Projects
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {solarProjects.length}{' '}
                      <span className="text-[11px] font-normal text-slate-400">
                        ({projects.length ? Math.round((solarProjects.length / projects.length) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all"
                      style={{
                        width: `${projects.length ? (solarProjects.length / projects.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Wind */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Wind size={14} className="text-sky-500" />
                      Wind Energy Projects
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      {windProjects.length}{' '}
                      <span className="text-[11px] font-normal text-slate-400">
                        ({projects.length ? Math.round((windProjects.length / projects.length) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{
                        width: `${projects.length ? (windProjects.length / projects.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span>Total Mobilized Positions</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {totalWorkersHired} / {totalWorkersNeeded} Filled
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Hub */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4 lg:col-span-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Operations Navigation
                </span>
                <h2 className="text-base font-bold text-white mt-0.5">Quick Actions Hub</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Direct shortcuts to common workforce mobilization workflows
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
                <Link
                  to="/epc/post-project"
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col justify-between transition-colors border border-slate-700/60"
                >
                  <PlusCircle size={18} className="text-emerald-400 mb-2" />
                  <div>
                    <span className="font-bold text-white block">Post Project</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">New Site Listing</span>
                  </div>
                </Link>

                <Link
                  to="/epc/technicians"
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col justify-between transition-colors border border-slate-700/60"
                >
                  <Compass size={18} className="text-teal-400 mb-2" />
                  <div>
                    <span className="font-bold text-white block">Find Talent</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Search Directory</span>
                  </div>
                </Link>

                <Link
                  to="/epc/applications"
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col justify-between transition-colors border border-slate-700/60"
                >
                  <FileText size={18} className="text-amber-400 mb-2" />
                  <div>
                    <span className="font-bold text-white block">Applications</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Hiring Pipeline</span>
                  </div>
                </Link>

                <Link
                  to="/epc/workforce"
                  className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl flex flex-col justify-between transition-colors border border-slate-700/60"
                >
                  <Users size={18} className="text-sky-400 mb-2" />
                  <div>
                    <span className="font-bold text-white block">Workforce</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Active Roster</span>
                  </div>
                </Link>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Enterprise Credentials Verification: Active</span>
                <span className="font-mono text-emerald-400">ISO/SCGJ Compliant</span>
              </div>
            </div>
          </div>

          {/* SECTION 7: CORPORATE DETAILS & SETTINGS ANCHOR (id="settings") */}
          <div
            id="settings"
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building size={18} className="text-slate-500" />
                  <span>Corporate Organization Profile</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Verified company credentials and project mobilization authorization
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                <Check size={13} className="stroke-[3]" />
                <span>Verified Entity</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Legal Entity Name
                </span>
                <span className="text-sm font-bold text-slate-900 block truncate">
                  {companyName}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Corporate Registration / GSTIN
                </span>
                <span className="text-sm font-bold text-slate-900 font-mono block">
                  {profile?.registrationNumber || 'GSTIN-REGISTERED'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Primary Domain
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {companyDomain}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Corporate Headquarters
                </span>
                <span className="text-sm font-bold text-slate-900 block">
                  {companyLocation || 'New Delhi, India'}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EPCDashboard;
