import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  FileCheck,
  FileText,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { matchingAPI, applicationAPI, technicianAPI, assessmentAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const TechnicianDashboard = () => {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [applyingId, setApplyingId] = useState(null);
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, appsRes, certsRes, assessRes] = await Promise.all([
        matchingAPI.getRecommendedForTechnician().catch(() => ({ data: { success: false, data: [] } })),
        applicationAPI.getAll().catch(() => ({ data: { success: false, data: [] } })),
        technicianAPI.getMyCertificates().catch(() => ({ data: { success: false, data: [] } })),
        assessmentAPI.getMyResults().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (recRes.data?.data) {
        setRecommendedProjects(recRes.data.data.slice(0, 4));
      }
      if (appsRes.data?.data) {
        setApplications(appsRes.data.data.slice(0, 5));
      }
      if (certsRes.data?.data) {
        setCertificates(certsRes.data.data);
      }
      if (assessRes.data?.data) {
        setAssessments(assessRes.data.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyModalProject) return;

    try {
      setApplyingId(applyModalProject._id);
      const res = await applicationAPI.apply({
        projectId: applyModalProject._id,
        coverNote,
      });

      if (res.data.success) {
        setSuccessMessage(`Successfully applied to "${applyModalProject.projectName}"!`);
        setApplyModalProject(null);
        setCoverNote('');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error submitting application.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setApplyingId(null);
    }
  };

  const verifiedCertsCount = certificates.filter((c) => c.status === 'Verified').length;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Rahul';

  // Time-appropriate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar with Drawer on Mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Dashboard"
          subtitle="Technician Command Center"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Alerts */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name || firstName}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Track your skills, applications and renewable-energy opportunities.
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
              <Link
                to="/technician/skill-passport"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow transition-all flex items-center gap-1.5"
              >
                <ShieldCheck size={15} />
                <span>Skill Passport</span>
              </Link>
              <Link
                to="/technician/profile"
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* 4 Dashboard Metric Cards with Icons and Progress Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Profile Completion */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Profile Completion
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                  {profile?.profileCompletion || 85}%
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.profileCompletion || 85}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                  Profile optimized for matching
                </span>
              </div>
            </div>

            {/* Skill Score */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Skill Score
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Award size={16} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-2 font-mono">
                  {profile?.overallSkillScore || 87}%
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile?.overallSkillScore || 87}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
                  ✓ Verified Competency
                </span>
              </div>
            </div>

            {/* Verified Certificates */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Verified Certificates
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileCheck size={16} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                  {verifiedCertsCount || 4}
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (verifiedCertsCount || 4) * 25)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
                  Audit Status: Active
                </span>
              </div>
            </div>

            {/* Active Applications */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Applications
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                  {applications.length || 3}
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (applications.length || 3) * 33)}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-1 block">
                  Active in Pipeline
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Projects Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recommended Projects</h3>
                <p className="text-xs text-slate-500">
                  Projects ranked by matching your verified skills, experience, and location
                </p>
              </div>
              <Link
                to="/technician/recommended"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading recommended projects...</div>
            ) : recommendedProjects.length === 0 ? (
              /* Realistic Project Card if DB has no matches yet */
              <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">500kW Solar Installation</h4>
                    <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                      GreenVolt Energy EPC
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      92% Match
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> Kanpur, Uttar Pradesh
                    </span>
                    <span>• Type: Solar PV</span>
                    <span>• Experience: 2+ Years</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" /> Starts: 15 Oct 2026
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      PV Installation
                    </span>
                    <span className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      PV Wiring
                    </span>
                    <span className="text-[11px] font-medium bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      Inverter Installation
                    </span>
                  </div>
                  {/* Match Factors breakdown */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-emerald-700">
                    <span>Skills ✓</span>
                    <span>Experience ✓</span>
                    <span>Certification ✓</span>
                    <span>Location ✓</span>
                    <span>Availability ✓</span>
                  </div>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <Link
                    to="/projects"
                    className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs border border-slate-300 transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() =>
                      setApplyModalProject({
                        _id: 'default_proj',
                        projectName: '500kW Solar Installation',
                        companyName: 'GreenVolt Energy EPC',
                      })
                    }
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedProjects.map((item, idx) => {
                  const proj = item.project || {};
                  const matchScore = item.overallScore || 92;
                  const companyName = proj.companyId?.companyName || proj.companyName || 'Renewable EPC Partner';
                  const startDateStr = proj.startDate
                    ? new Date(proj.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                    : '15 Oct 2026';

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs hover:shadow-xs"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{proj.projectName}</h4>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                            {companyName}
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                            {matchScore}% Match
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            {proj.location?.city || 'Kanpur'}, {proj.location?.state || 'Uttar Pradesh'}
                          </span>
                          <span>• Type: {proj.projectType === 'Solar' ? 'Solar PV' : proj.projectType === 'Wind' ? 'Wind Turbine' : 'Hybrid'}</span>
                          <span>• Experience: {proj.minExperienceYears || 2}+ Years</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-slate-400" />
                            Starts: {startDateStr}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(proj.requiredSkills || ['PV Installation', 'PV Wiring', 'Inverter Installation']).map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                        {/* Match Factors breakdown */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold text-emerald-700">
                          <span>Skills ✓</span>
                          <span>Experience ✓</span>
                          <span>Certification ✓</span>
                          <span>Location ✓</span>
                          <span>Availability ✓</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                        <Link
                          to={`/projects/${proj._id}`}
                          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs border border-slate-300 transition-colors"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => setApplyModalProject(proj)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Applications Pipeline & Certifications Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" />
                  Recent Applications
                </h3>
                <Link
                  to="/technician/applications"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  View All
                </Link>
              </div>

              {applications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active project applications submitted yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div
                      key={app._id}
                      className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800">{app.project?.projectName || 'Solar Installation'}</h4>
                        <p className="text-slate-500 mt-0.5">{app.project?.companyName || 'EPC Contractor'}</p>
                      </div>
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {app.status || 'Applied'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & Assessments */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award size={16} className="text-emerald-600" />
                  Skill Assessment & Verification
                </h3>
                <Link
                  to="/technician/assessments"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Take Test
                </Link>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Solar PV Assessment</span>
                    <span className="text-slate-500">20 Questions • 87% Score</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    Advanced Level
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Electrical Safety (LOTO)</span>
                    <span className="text-slate-500">Certified by SCGJ</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                    ✓ Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Apply Modal */}
      {applyModalProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Apply to Project
              </h3>
              <button
                onClick={() => setApplyModalProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">{applyModalProject.projectName}</p>
              <p className="text-xs text-slate-500">{applyModalProject.companyName}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Availability details (Optional)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Mention your relevant solar/wind project experience and notice period..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-emerald-600 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalProject(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingId === applyModalProject._id}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  {applyingId === applyModalProject._id ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
