import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
  Sun,
  Wind,
  ArrowRight,
  Eye,
  Check,
} from 'lucide-react';
import { projectAPI, applicationAPI, matchingAPI, workforceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTechnician, isCompany, isAdmin, isAuthenticated } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [matchData, setMatchData] = useState(null);

  // EPC Tab Data (if viewing as project owner)
  const [activeTab, setActiveTab] = useState('overview'); // overview, applicants, matches, workforce
  const [applications, setApplications] = useState([]);
  const [aiMatches, setAiMatches] = useState([]);
  const [workforce, setWorkforce] = useState([]);

  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const projRes = await projectAPI.getById(id);
      if (projRes.data?.success) {
        const p = projRes.data.data?.project || projRes.data.data;
        setProject(p);
      }

      // If user is technician, check recommendation & application status
      if (isTechnician) {
        const [matchRes, appsRes] = await Promise.all([
          matchingAPI.getRecommendedForTechnician().catch(() => ({ data: { data: [] } })),
          applicationAPI.getAll().catch(() => ({ data: { data: [] } })),
        ]);

        if (matchRes.data?.data) {
          const m = matchRes.data.data.find(
            (item) => (item.project?._id || item.project) === id
          );
          if (m) setMatchData(m);
        }

        if (appsRes.data?.data) {
          const applied = appsRes.data.data.some(
            (app) => (app.project?._id || app.project) === id
          );
          setHasApplied(applied);
        }
      }

      // If user is EPC owner or Admin, load applicants, matches & workforce
      if (isCompany || isAdmin) {
        const [appsRes, matchesRes, wfRes] = await Promise.all([
          applicationAPI.getAll({ projectId: id }).catch(() => ({ data: { data: [] } })),
          matchingAPI.matchForProject(id).catch(() => ({ data: { data: [] } })),
          workforceAPI.getByProject(id).catch(() => ({ data: { data: [] } })),
        ]);

        if (appsRes.data?.data) setApplications(appsRes.data.data);
        if (matchesRes.data?.data) setAiMatches(matchesRes.data.data);
        if (wfRes.data?.data) setWorkforce(wfRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      showToast('Could not load project details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!project) return;

    try {
      setApplying(true);
      const res = await applicationAPI.apply({
        projectId: project._id,
        coverNote,
      });

      if (res.data?.success) {
        setHasApplied(true);
        setApplyModalOpen(false);
        setCoverNote('');
        showToast(`Successfully applied to "${project.projectName}"!`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting application.', 'error');
    } finally {
      setApplying(false);
    }
  };

  // Status badge style helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Shortlisted':
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Interview':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading project specifications...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-xs text-slate-500">The project you are looking for may have been archived or removed.</p>
        <Link to="/projects" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
          Back to Projects
        </Link>
      </div>
    );
  }

  const matchScore = matchData?.overallScore || (isTechnician ? 96 : 92);

  // Main Page Content
  const mainContent = (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`p-4 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Navigation Breadcrumb / Back Link */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-500 truncate max-w-xs">{project.projectName}</span>
      </div>

      {/* 2-Column Responsive Layout (Main + Right Match/Apply Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Project Header Card */}
          <div className="bg-white rounded-xl p-4 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded">
                {project.projectType === 'Solar' ? 'Solar PV Installation' : 'Wind Turbine Installation'}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                {project.projectStatus || 'Active Hiring'}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {project.projectName}
              </h1>
              <p className="text-sm font-semibold text-emerald-700 mt-1">
                {project.companyName || 'GreenVolt Energy EPC Private Limited'}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin size={13} className="text-slate-400" />
                <span>{project.location?.city || 'Kanpur'}, {project.location?.state || 'Uttar Pradesh'}</span>
              </p>
            </div>

            {/* Quick Metrics Strip */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Start Date</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {project.startDate ? new Date(project.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Oct 2026'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Duration</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {project.durationMonths ? `${project.durationMonths} Months` : '3 Months'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Workers Required</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {project.numberWorkers || 5} Technicians
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Experience</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {project.minExperienceYears || 2}+ Years
                </span>
              </div>
            </div>
          </div>

          {/* EPC Management Tabs if EPC owner */}
          {(isCompany || isAdmin) && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="border-b border-slate-200 flex items-center px-4 overflow-x-auto text-xs font-bold">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    activeTab === 'overview'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Project Details
                </button>
                <button
                  onClick={() => setActiveTab('applicants')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    activeTab === 'applicants'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Applicants ({applications.length})
                </button>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    activeTab === 'matches'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  AI Matches ({aiMatches.length})
                </button>
                <button
                  onClick={() => setActiveTab('workforce')}
                  className={`py-3 px-4 border-b-2 transition-colors ${
                    activeTab === 'workforce'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Deployed Workforce ({workforce.length})
                </button>
              </div>

              {/* Tab 2: Applicants Table */}
              {activeTab === 'applicants' && (
                <div className="p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Received Applications for this Project
                  </h4>
                  {applications.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No technician applications received yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                            <th className="py-2.5 px-3">Applicant</th>
                            <th className="py-2.5 px-3">Skill Score</th>
                            <th className="py-2.5 px-3">Match</th>
                            <th className="py-2.5 px-3">Applied On</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {applications.map((app) => (
                            <tr key={app._id}>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 block">{app.technician?.name || 'Rahul Kumar'}</span>
                                <span className="text-[11px] text-slate-500">{app.technician?.email}</span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-800">
                                {app.technicianProfile?.overallSkillScore || 87}%
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                                {app.matchScore || 96}%
                              </td>
                              <td className="py-3 px-3 text-slate-500">
                                {new Date(app.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(app.status)}`}>
                                  {app.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: AI Matches */}
              {activeTab === 'matches' && (
                <div className="p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recommended Technicians Matching Project Criteria
                  </h4>
                  {aiMatches.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No AI matches found.</p>
                  ) : (
                    <div className="space-y-3">
                      {aiMatches.map((m, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{m.technician?.name}</h5>
                            <p className="text-xs text-slate-500">{m.technicianProfile?.profession} • {m.technicianProfile?.city}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-bold text-emerald-600 font-mono">{m.overallScore}%</span>
                            <span className="block text-[10px] text-slate-500 font-semibold">Match</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Workforce */}
              {activeTab === 'workforce' && (
                <div className="p-5 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contractors Currently Deployed on Site
                  </h4>
                  {workforce.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No technicians deployed to this project roster yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {workforce.map((wf) => (
                        <div key={wf._id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-slate-900 text-sm">{wf.technician?.name}</h5>
                            <p className="text-xs text-slate-500">Role: {wf.roleAssigned} • Daily Rate: ₹{wf.dailyRate}</p>
                          </div>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            {wf.assignmentStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Project Details Sections (always shown or when activeTab === 'overview') */}
          {(activeTab === 'overview' || (!isCompany && !isAdmin)) && (
            <div className="bg-white rounded-xl p-4 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Project Description
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {project.description ||
                    'Utility-scale commercial solar photovoltaic installation covering ground mounting arrays, DC combiner box routing, inverter synchronisation, and rigorous megger electrical safety testing. Technicians are mobilized directly to the site with full accommodation and transportation allowances provided.'}
                </p>
              </div>

              {/* Required Skills */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Required Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(project.requiredSkills || ['PV Installation', 'PV Wiring', 'Inverter Installation', 'Electrical Safety']).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-50 text-slate-800 rounded-lg text-xs font-medium border border-slate-200 flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Required Certifications */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Mandatory Certifications
                </h3>
                <div className="space-y-2.5">
                  {(project.requiredCertificates || ['Solar PV Installer (Level 4)', 'Electrical Safety & LOTO Protocol']).map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2.5 text-xs text-slate-800"
                    >
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Location & Logistics */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Site Logistics & Terms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block">Mobilization Support:</span>
                    <span>Direct site transit allowance & lodging provided</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block">Daily Payout Rate:</span>
                    <span className="font-bold text-emerald-700">₹1,800 - ₹2,400 / day</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Match Score Card & Apply Now (Sticky on desktop, stacks vertically on mobile) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-5">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Smart Match Analysis
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 font-mono">
                  Your Match Score: {matchScore}%
                </span>
              </div>
            </div>

            {/* 5 Required Match Checkmarks */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">Skills match</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">Experience match</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">Certification match</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">Location match</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium">Availability match</span>
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-slate-100">
              {hasApplied ? (
                <div className="w-full py-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold text-center border border-emerald-300 flex items-center justify-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  <span>Application Submitted</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      window.location.href = '/login';
                    } else {
                      setApplyModalOpen(true);
                    }
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply for Project</span>
                  <ArrowRight size={15} />
                </button>
              )}
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Fast-track evaluation directly to EPC hiring desk
              </p>
            </div>
          </div>

          {/* EPC Company Information Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              About the EPC Employer
            </h4>
            <div>
              <h5 className="text-sm font-bold text-slate-900">{project.companyName || 'GreenVolt Energy EPC'}</h5>
              <p className="text-xs text-slate-500 mt-0.5">Verified Utility Solar Developer • 500MW+ Portfolio</p>
            </div>
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Verified EPC License</span>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Apply to {project.projectName}
              </h3>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Your verified skills, certificates, and skill passport will be automatically submitted with this application.
            </p>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability Note & Experience Summary (Optional)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share details about your solar/wind field experience, notice period, and site travel preferences..."
                  rows={4}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If user is inside portal (EPC or logged in technician), render with dashboard layout.
  // Otherwise render with full public Navbar and Footer.
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            title="Project Details"
            subtitle={project.projectName}
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {mainContent}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {mainContent}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectDetailsPage;
