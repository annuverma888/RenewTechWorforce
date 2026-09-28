import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sun,
  Wind,
  SlidersHorizontal,
} from 'lucide-react';
import { projectAPI, applicationAPI, matchingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const ALL_SKILLS = [
  'All',
  'PV Installation',
  'PV Wiring',
  'Inverter Installation',
  'Solar O&M',
  'Wind Turbine Installation',
  'Turbine Maintenance',
  'Blade Inspection',
  'Tower Climbing',
  'Electrical Safety',
];

const LOCATIONS = ['All', 'Kanpur', 'Noida', 'Lucknow', 'Jaisalmer', 'Bengaluru', 'Gujarat', 'Rajasthan', 'Uttar Pradesh'];

const ProjectListingPage = () => {
  const { user, isTechnician, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [recommendedMatches, setRecommendedMatches] = useState({});

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedType, setSelectedType] = useState('All'); // All, Solar, Wind
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All'); // All, 1, 2, 3, 5
  const [selectedAvailability, setSelectedAvailability] = useState('All');

  // Application Modal state
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);
  const [successToast, setSuccessToast] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll();
      if (res.data?.success) {
        setProjects(res.data.data);
      }

      // If technician, fetch recommended matches to get scores
      if (isTechnician) {
        const matchRes = await matchingAPI.getRecommendedForTechnician().catch(() => ({ data: { data: [] } }));
        if (matchRes.data?.data) {
          const matchMap = {};
          matchRes.data.data.forEach((m) => {
            const pId = m.project?._id || m.project;
            matchMap[pId] = m.overallScore || 96;
          });
          setRecommendedMatches(matchMap);
        }
      }
    } catch (err) {
      console.error('Error fetching project catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [isTechnician]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyModalProject) return;

    try {
      setSubmittingApp(true);
      const res = await applicationAPI.apply({
        projectId: applyModalProject._id,
        coverNote,
      });

      if (res.data.success) {
        setSuccessToast(`Application sent to ${applyModalProject.companyName}!`);
        setApplyModalProject(null);
        setCoverNote('');
        setTimeout(() => setSuccessToast(''), 4000);
      }
    } catch (err) {
      setErrorToast(err.response?.data?.message || 'Error submitting application.');
      setTimeout(() => setErrorToast(''), 4000);
    } finally {
      setSubmittingApp(false);
    }
  };

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter logic
  const filteredProjects = projects.filter((proj) => {
    // Search
    const matchesSearch =
      searchQuery === '' ||
      proj.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proj.requiredSkills || []).some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    // Location
    const matchesLocation =
      selectedLocation === 'All' ||
      proj.location?.city?.toLowerCase() === selectedLocation.toLowerCase() ||
      proj.location?.state?.toLowerCase().includes(selectedLocation.toLowerCase());

    // Project Type
    const matchesType = selectedType === 'All' || proj.projectType === selectedType;

    // Required Skill
    const matchesSkill =
      selectedSkill === 'All' || (proj.requiredSkills || []).includes(selectedSkill);

    // Experience
    const matchesExp =
      selectedExperience === 'All' ||
      (proj.minExperienceYears || 0) <= parseInt(selectedExperience, 10);

    return matchesSearch && matchesLocation && matchesType && matchesSkill && matchesExp;
  });

  const activeFilterCount =
    (selectedLocation !== 'All' ? 1 : 0) +
    (selectedType !== 'All' ? 1 : 0) +
    (selectedSkill !== 'All' ? 1 : 0) +
    (selectedExperience !== 'All' ? 1 : 0) +
    (selectedAvailability !== 'All' ? 1 : 0);

  const content = (
    <div className="space-y-6">
      {/* Toast Alerts */}
      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}
      {errorToast && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-rose-600 shrink-0" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Renewable Energy Projects
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore utility solar installations and wind farm projects hiring certified technical crews
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Search Input & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by title, skill, location or EPC..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
            />
          </div>
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors border border-slate-200"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Filter Dropdowns Grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-2.5 pt-1">
          {/* Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Project Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
            >
              <option value="All">All Types</option>
              <option value="Solar">Solar PV</option>
              <option value="Wind">Wind Turbine</option>
              <option value="Hybrid">Hybrid Clean Energy</option>
            </select>
          </div>

          {/* Required Skill */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Required Skill</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
            >
              {ALL_SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Experience</label>
            <select
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
            >
              <option value="All">Any Experience</option>
              <option value="1">1+ Years</option>
              <option value="2">2+ Years</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
            </select>
          </div>

          {/* Availability */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value)}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
            >
              <option value="All">Any Availability</option>
              <option value="Immediate">Immediate Start</option>
              <option value="Scheduled">Upcoming Window</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal / Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-xl p-5 border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Filter Projects</h3>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="All">All Types</option>
                  <option value="Solar">Solar PV</option>
                  <option value="Wind">Wind Turbine</option>
                  <option value="Hybrid">Hybrid Clean Energy</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skill</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {ALL_SKILLS.map((sk) => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                <select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="All">Any Experience</option>
                  <option value="1">1+ Years</option>
                  <option value="2">2+ Years</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Availability</label>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="All">Any Availability</option>
                  <option value="Immediate">Immediate Start</option>
                  <option value="Scheduled">Upcoming Window</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedLocation('All');
                  setSelectedType('All');
                  setSelectedSkill('All');
                  setSelectedExperience('All');
                  setSelectedAvailability('All');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-700"
              >
                Apply Filters ({filteredProjects.length} Projects)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Showing {filteredProjects.length} active renewable projects</span>
        {(searchQuery || activeFilterCount > 0) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedLocation('All');
              setSelectedType('All');
              setSelectedSkill('All');
              setSelectedExperience('All');
              setSelectedAvailability('All');
            }}
            className="text-emerald-700 hover:underline font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading renewable projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-600">No projects match your current filters.</p>
          <p>Try clearing filters to view all available solar and wind projects.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => {
            const matchScore = recommendedMatches[proj._id] || (isTechnician ? 92 : null);

            return (
              <div
                key={proj._id}
                className="bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-400 shadow-2xs transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Row: Type & Match Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      {proj.projectType === 'Solar' ? 'Solar PV' : 'Wind Turbine'}
                    </span>
                    {matchScore && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {matchScore}% Match
                      </span>
                    )}
                  </div>

                  {/* Title & Company */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {proj.projectName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">
                      {proj.companyName || 'Tata Power Renewable'}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span>{proj.location?.city || 'Kanpur'}, {proj.location?.state || 'Uttar Pradesh'}</span>
                    </p>
                  </div>

                  {/* Requirements & Duration details */}
                  <div className="py-2.5 border-t border-b border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Workers Required:</span>
                      <span className="font-bold text-slate-800">{proj.numberWorkers || 5} Workers</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Experience:</span>
                      <span className="font-bold text-slate-800">{proj.minExperienceYears || 2}+ Years</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Duration:</span>
                      <span className="font-bold text-slate-800">
                        {proj.durationWeeks ? `${proj.durationWeeks} Weeks` : proj.duration || '6 Months'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Start Date:</span>
                      <span className="font-semibold text-slate-800">
                        {proj.startDate ? new Date(proj.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 Oct 2026'}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Required Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.requiredSkills || ['PV Installation', 'PV Wiring']).map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to={`/projects/${proj._id}`}
                    className="py-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        window.location.href = '/login';
                      } else {
                        setApplyModalProject(proj);
                      }
                    }}
                    className="py-2 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
              <p className="text-xs text-slate-500">{applyModalProject.companyName} • {applyModalProject.location?.city}</p>
            </div>

            <form onSubmit={handleApply} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Availability details (Optional)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Mention your relevant solar/wind project experience and daily/monthly availability..."
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
                  disabled={submittingApp}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  {submittingApp ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // If user is authenticated technician or EPC inside portal, render with dashboard sidebar.
  // Otherwise render with full public Navbar and Footer.
  if (isAuthenticated && (isTechnician || user?.role === 'admin')) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            title="Projects"
            subtitle="Search and apply to renewable installations"
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
            {content}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {content}
      </main>
      <Footer />
    </div>
  );
};

export default ProjectListingPage;
