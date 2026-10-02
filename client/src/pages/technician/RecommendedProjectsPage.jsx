import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  X,
  Check,
  Building,
  Clock,
  IndianRupee,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
} from 'lucide-react';
import { matchingAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import MatchScoreBadge from '../../components/matching/MatchScoreBadge';
import MatchExplanationModal from '../../components/matching/MatchExplanationModal';

const RecommendedProjectsPage = () => {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modals & UI states
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [technologyFilter, setTechnologyFilter] = useState('All');
  const [scoreFilter, setScoreFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Not Applied' | 'Applied'

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await matchingAPI.getRecommendedForTechnician();
      if (res.data?.success) {
        setProjects(res.data.data || []);
      } else {
        setFetchError('Could not load recommended projects. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching recommended projects:', err);
      setFetchError('Unable to load recommended projects. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyModalProject) return;

    try {
      setApplying(true);
      setErrorMessage('');
      const res = await applicationAPI.apply({
        projectId: applyModalProject._id,
        coverNote,
      });

      if (res.data?.success) {
        setSuccessMessage(`Application sent to ${applyModalProject.companyName || 'EPC Partner'}!`);
        setApplyModalProject(null);
        setCoverNote('');
        fetchRecommendations();
        setTimeout(() => setSuccessMessage(''), 4500);
      } else {
        setErrorMessage(res.data?.message || 'Error submitting application.');
        setTimeout(() => setErrorMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error applying to project:', err);
      setErrorMessage(err.response?.data?.message || 'Error submitting application.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setApplying(false);
    }
  };

  // Real data metrics
  const totalRecommendations = projects.length;
  const strongMatchesCount = projects.filter((item) => (item.matchScore || 0) >= 80).length;
  const appliedCount = projects.filter((item) => item.hasApplied).length;

  // Filter projects based on search and filters
  const filteredProjects = projects.filter((item) => {
    const proj = item.project || {};
    const score = item.matchScore || 0;

    // Technology Filter
    if (technologyFilter !== 'All' && proj.projectType !== technologyFilter) {
      return false;
    }

    // Match Score Filter
    if (scoreFilter === '80+' && score < 80) return false;
    if (scoreFilter === '60-79' && (score < 60 || score >= 80)) return false;
    if (scoreFilter === 'below-60' && score >= 60) return false;

    // Application Status Filter
    if (statusFilter === 'Applied' && !item.hasApplied) return false;
    if (statusFilter === 'Not Applied' && item.hasApplied) return false;

    // Search query matching title, company, city, state, required skills
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = (proj.projectName || '').toLowerCase().includes(q);
      const companyMatch =
        (proj.companyName || proj.company?.name || '').toLowerCase().includes(q);
      const cityMatch = (proj.location?.city || '').toLowerCase().includes(q);
      const stateMatch = (proj.location?.state || '').toLowerCase().includes(q);
      const techMatch = (proj.projectType || '').toLowerCase().includes(q);
      const skillMatch = Array.isArray(proj.requiredSkills)
        ? proj.requiredSkills.some((s) => (s || '').toLowerCase().includes(q))
        : false;

      return nameMatch || companyMatch || cityMatch || stateMatch || techMatch || skillMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Recommended Projects"
          subtitle="Find renewable-energy projects that match your skills, experience and availability."
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Notifications */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-rose-700 hover:text-rose-900 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ================= SECTION 2: PAGE HEADER & SUMMARY METRICS ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Recommended Projects
              </h1>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Find renewable-energy projects that match your skills, experience and availability.
                Our multi-factor matching engine continuously benchmarks your verified credentials against
                active EPC requirements.
              </p>
            </div>

            <Link
              to="/technician/applications"
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Briefcase size={14} className="text-slate-500" />
              <span>My Applications ({appliedCount})</span>
            </Link>
          </div>

          {/* Summary Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Recommendations */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recommended Projects
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Layers size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">
                {totalRecommendations}
              </div>
              <p className="text-[11px] text-slate-500">Matching active deployments</p>
            </div>

            {/* Strong Matches */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Strong Matches (80%+)
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {strongMatchesCount}
              </div>
              <p className="text-[11px] text-slate-500">Immediate deployment fit</p>
            </div>

            {/* Projects Applied To */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Projects Applied To
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">{appliedCount}</div>
              <p className="text-[11px] text-slate-500">Applications submitted</p>
            </div>
          </div>

          {/* ================= SECTION 3 & 4: SEARCH & FILTERS BAR ================= */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search projects, EPCs, skills, or cities..."
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white text-slate-900"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Technology Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto text-xs">
                <span className="text-slate-500 font-medium mr-1 hidden sm:inline">Technology:</span>
                {['All', 'Solar', 'Wind', 'BESS', 'Hybrid'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setTechnologyFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      technologyFilter === type
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'All' ? 'All Tech' : type}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-filters row: Match score & application status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                  Match Tier:
                </span>
                <select
                  value={scoreFilter}
                  onChange={(e) => setScoreFilter(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-emerald-600"
                >
                  <option value="All">All Match Scores</option>
                  <option value="80+">80%+ (Strong Match)</option>
                  <option value="60-79">60–79% (Moderate Match)</option>
                  <option value="below-60">Below 60%</option>
                </select>

                <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider ml-2">
                  Status:
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700 focus:outline-emerald-600"
                >
                  <option value="All">All Projects</option>
                  <option value="Not Applied">Not Applied</option>
                  <option value="Applied">Already Applied</option>
                </select>
              </div>

              {(searchTerm ||
                technologyFilter !== 'All' ||
                scoreFilter !== 'All' ||
                statusFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setTechnologyFilter('All');
                    setScoreFilter('All');
                    setStatusFilter('All');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* ================= SECTION 6 - 8: PROJECT CARDS LIST ================= */}
          {loading ? (
            /* SECTION 13: LOADING SKELETON STATE */
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-2/3">
                      <div className="h-5 bg-slate-200 rounded w-1/3" />
                      <div className="h-6 bg-slate-200 rounded w-2/3" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                    </div>
                    <div className="h-8 bg-slate-200 rounded w-24" />
                  </div>
                  <div className="h-12 bg-slate-50 rounded-lg" />
                  <div className="h-10 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            /* SECTION 14: ERROR STATE */
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Unable to Load Projects</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{fetchError}</p>
              <button
                onClick={fetchRecommendations}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            /* SECTION 12: EMPTY STATE */
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-14 text-center space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <Sparkles size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  No Matching Projects Yet
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Your current profile does not have matching opportunities right now. Adding more
                  verified skills or certificates expands your eligibility.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  to="/technician/profile"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>Update Skills</span>
                </Link>

                <Link
                  to="/technician/profile"
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>Complete Profile</span>
                </Link>

                <Link
                  to="/projects"
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors"
                >
                  <span>Browse All Projects</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Project Cards List */
            <div className="space-y-4">
              {filteredProjects.map((rec) => {
                const proj = rec.project || {};
                const breakdown = rec.breakdown || {};
                const matchedSkills = breakdown.matchedSkills || [];
                const missingSkills = breakdown.missingSkills || [];
                const reasons = breakdown.reasons || [];
                const companyName = proj.companyName || proj.company?.name || 'EPC Partner';

                const startDateFormatted = proj.startDate
                  ? new Date(proj.startDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                const endDateFormatted = proj.endDate
                  ? new Date(proj.endDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                return (
                  <div
                    key={proj._id}
                    className="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all bg-white shadow-xs space-y-4"
                  >
                    {/* Top Row: Meta Badges + Match Score + Budget */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Technology Badge */}
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                            {proj.projectType || 'Solar'} Project
                          </span>

                          {/* SECTION 5: REAL MATCH SCORE BADGE */}
                          <MatchScoreBadge
                            score={rec.matchScore}
                            onClick={() =>
                              setSelectedMatch({
                                ...rec,
                                projectName: proj.projectName,
                              })
                            }
                          />

                          {/* EPC Company */}
                          <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                            <Building size={13} className="text-slate-400 shrink-0" />
                            <span>{companyName}</span>
                          </div>
                        </div>

                        {/* Project Title */}
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {proj.projectName}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {proj.description}
                        </p>
                      </div>

                      {/* Budget / Compensation */}
                      <div className="text-left sm:text-right shrink-0 p-3 sm:p-0 bg-slate-50 sm:bg-transparent rounded-lg border sm:border-0 border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Contract Budget / Rate
                        </span>
                        <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
                          {proj.budget ? `₹${proj.budget.toLocaleString()}` : 'Negotiable'}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {proj.workType || 'Contract Deployment'}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid: Location, Capacity, Duration, Schedule, Required Experience */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Location</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">
                            {proj.location?.city ? `${proj.location.city}, ${proj.location.state}` : 'On-Site'}
                          </span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Duration / Schedule</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>
                            {proj.durationDays ? `${proj.durationDays} Days` : 'Project Duration'}
                          </span>
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Required Experience</span>
                        <span className="font-bold text-slate-800 block mt-0.5">
                          {proj.minimumExperience ? `${proj.minimumExperience}+ Years` : 'Open Experience'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Required Certifications</span>
                        <span className="font-bold text-emerald-800 block mt-0.5 truncate">
                          {proj.requiredCertifications && proj.requiredCertifications.length > 0
                            ? proj.requiredCertifications.join(', ')
                            : 'Standard Credential'}
                        </span>
                      </div>
                    </div>

                    {/* SECTION 7: WHY YOU MATCH */}
                    {reasons.length > 0 && (
                      <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                          Why you're a match
                        </span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800">
                          {reasons.slice(0, 4).map((r, i) => (
                            <span key={i} className="flex items-center gap-1 font-medium">
                              <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                              <span>{r.replace(/^[✓•]\s*/, '')}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matched Skills vs Missing Skills Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      {/* Matched Skills */}
                      <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Matched Skills ({matchedSkills.length})
                        </span>
                        {matchedSkills.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {matchedSkills.map((sk, skIdx) => (
                              <span
                                key={skIdx}
                                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-medium"
                              >
                                <Check size={10} className="text-emerald-600 stroke-[3]" />
                                <span>{sk.name || sk.matchedRequirement}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 block">
                            General technical fit
                          </span>
                        )}
                      </div>

                      {/* SECTION 8: SKILL GAP / MISSING SKILLS */}
                      <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200/80 space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                          Skills to Improve
                        </span>
                        {missingSkills.length > 0 ? (
                          <div className="space-y-1">
                            <div className="flex flex-wrap gap-1.5">
                              {missingSkills.map((sk, skIdx) => (
                                <span
                                  key={skIdx}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-medium"
                                >
                                  <span>○</span>
                                  <span>{sk}</span>
                                </span>
                              ))}
                            </div>
                            <span className="text-[10px] text-slate-400 block">
                              Adding these skills may improve your suitability for similar opportunities.
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-medium block">
                            ✓ Your current profile covers the listed requirements.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* SECTION 9, 10, 11: CARD FOOTER ACTIONS */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            setSelectedMatch({
                              ...rec,
                              projectName: proj.projectName,
                            })
                          }
                          className="text-xs text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles size={12} className="text-emerald-600" />
                          <span>Inspect Match Rationale</span>
                        </button>

                        <span className="text-slate-300">•</span>

                        {/* SECTION 9: VIEW OPPORTUNITY DETAILS LINK */}
                        <Link
                          to={`/projects/${proj._id}`}
                          className="text-xs text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
                        >
                          <span>View Opportunity</span>
                          <ExternalLink size={12} className="text-slate-400" />
                        </Link>
                      </div>

                      {/* SECTION 10 & 11: APPLY NOW / ALREADY APPLIED BUTTON */}
                      {rec.hasApplied ? (
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 shadow-2xs">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span>Applied: {rec.applicationStatus || 'Under Review'}</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => setApplyModalProject(proj)}
                          className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer text-center"
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ================= SECTION 10: APPLY MODAL ================= */}
      {applyModalProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Apply to {applyModalProject.projectName}
                </h3>
                <p className="text-xs text-slate-500">
                  Developer: {applyModalProject.companyName || 'EPC Partner'}
                </p>
              </div>
              <button
                onClick={() => setApplyModalProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Introduction / Cover Note
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="State your renewable experience, hands-on field readiness, and availability date..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-emerald-600 focus:bg-white text-slate-900 leading-relaxed"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 space-y-0.5">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>Verified Skill Passport Attached</span>
                </span>
                <p className="text-emerald-700 text-[11px] leading-tight">
                  Your verified credentials, certifications, and technical benchmark scores will be
                  automatically presented to the EPC hiring manager.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApplyModalProject(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MATCH EXPLANATION MODAL ================= */}
      {selectedMatch && (
        <MatchExplanationModal
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
          matchData={selectedMatch}
          candidateName={user?.name}
          projectName={selectedMatch.projectName}
        />
      )}
    </div>
  );
};

export default RecommendedProjectsPage;
