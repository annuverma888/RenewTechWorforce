import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';
import { matchingAPI, applicationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';
import MatchScoreBadge from '../../components/matching/MatchScoreBadge';
import MatchExplanationModal from '../../components/matching/MatchExplanationModal';

const RecommendedProjectsPage = () => {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await matchingAPI.getRecommendedForTechnician();
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching recommended projects:', err);
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
      const res = await applicationAPI.apply({
        projectId: applyModalProject._id,
        coverNote,
      });

      if (res.data.success) {
        setSuccessMessage(`Application sent to ${applyModalProject.companyName}!`);
        setApplyModalProject(null);
        setCoverNote('');
        fetchRecommendations();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error submitting application.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setApplying(false);
    }
  };

  const filteredProjects = projects.filter((item) => {
    const proj = item.project;
    const matchesType = filterType === 'All' || proj.projectType === filterType;
    const matchesSearch =
      searchTerm === '' ||
      proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.location?.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proj.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Recommended Renewable Projects"
          subtitle="Smart AI project suggestions ranked by your verified skills, certificates, and location."
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-8 max-w-5xl space-y-6">
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600" />
              {errorMessage}
            </div>
          )}

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search projects, skills, or cities..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Domain:</span>
              {['All', 'Solar', 'Wind'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === type
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Calculating real-time candidate match scores...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-400">
              No recommended projects found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProjects.map((rec) => {
                const proj = rec.project;
                return (
                  <div
                    key={proj._id}
                    className="p-4 sm:p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all bg-white space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <Badge variant={proj.projectType === 'Solar' ? 'solar' : 'wind'}>
                            {proj.projectType} Project
                          </Badge>
                          <MatchScoreBadge
                            score={rec.matchScore}
                            onClick={() =>
                              setSelectedMatch({
                                ...rec,
                                projectName: proj.projectName,
                              })
                            }
                          />
                          <span className="text-xs text-slate-400 font-medium">
                            Posted by <strong className="text-slate-700">{proj.companyName}</strong>
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                          {proj.projectName}
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Contract Budget
                        </span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{proj.budget?.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {proj.workType}
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Requirements */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Location</span>
                        <span className="font-bold flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{proj.location?.city}, {proj.location?.state}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Duration</span>
                        <span className="font-bold flex items-center gap-1 mt-0.5">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          {proj.durationDays} Days
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Required Exp</span>
                        <span className="font-bold mt-0.5 block">
                          {proj.minimumExperience}+ Years
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-400 block">Required Certs</span>
                        <span className="font-bold text-emerald-800 mt-0.5 block truncate">
                          {proj.requiredCertifications?.join(', ') || 'Standard Renewable'}
                        </span>
                      </div>
                    </div>

                    {/* Why this matches highlights */}
                    {rec.breakdown?.reasons && rec.breakdown.reasons.length > 0 && (
                      <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                          Top Match Factors
                        </span>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-800">
                          {rec.breakdown.reasons.slice(0, 3).map((r, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                              <span>{r.replace(/^✓\s*/, '')}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() =>
                          setSelectedMatch({
                            ...rec,
                            projectName: proj.projectName,
                          })
                        }
                        className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Match Rationale
                      </button>

                      {rec.hasApplied ? (
                        <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 text-center">
                          Status: {rec.applicationStatus}
                        </span>
                      ) : (
                        <button
                          onClick={() => setApplyModalProject(proj)}
                          className="w-full sm:w-auto px-5 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer text-center"
                        >
                          Apply for Deployment
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

      {/* Apply Modal */}
      {applyModalProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Apply to {applyModalProject.projectName}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              EPC Developer: {applyModalProject.companyName}
            </p>

            <form onSubmit={handleApply} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Introduction / Work Summary
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="State your renewable experience, tool readiness, and site availability..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800">
                <span className="font-bold block">✓ Verified Skill Passport Attached</span>
                Your verified credentials and assessment score ({profile?.overallSkillScore || 85}%) will be forwarded with this application.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalProject(null)}
                  className="px-4 py-2 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                >
                  {applying ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Match Explanation Modal */}
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
