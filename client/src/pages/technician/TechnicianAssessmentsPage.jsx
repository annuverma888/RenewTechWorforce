import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Zap,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sun,
  Wind,
  Check,
  RefreshCw,
  X,
  ChevronRight,
  BarChart2,
  BookOpen,
  ShieldCheck,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import { assessmentAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const TechnicianAssessmentsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Filter & Navigation Tabs
  const [activeTab, setActiveTab] = useState('All'); // 'All' | 'Available' | 'Completed'
  const [domainFilter, setDomainFilter] = useState('All'); // 'All' | 'Solar' | 'Wind'
  const [viewResultModal, setViewResultModal] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [assessRes, resultsRes] = await Promise.all([
        assessmentAPI.getAll().catch((err) => {
          console.warn('[Assessments] Error fetching modules:', err.message);
          return { data: { success: false, data: [] } };
        }),
        assessmentAPI.getMyResults().catch((err) => {
          console.warn('[Assessments] Error fetching my results:', err.message);
          return { data: { success: false, data: [] } };
        }),
      ]);

      if (assessRes.data?.success) {
        setAssessments(assessRes.data.data || []);
      } else {
        setFetchError('Unable to load assessments catalogue. Please check your connection.');
      }

      if (resultsRes.data?.success) {
        setMyResults(resultsRes.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching assessments data:', err);
      setFetchError('Unable to load assessments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real data metrics
  const totalAssessments = assessments.length;
  const completedCount = myResults.length;
  const avgScore =
    myResults.length > 0
      ? Math.round(myResults.reduce((sum, r) => sum + (r.scorePercentage || 0), 0) / myResults.length)
      : 0;
  const passedCount = myResults.filter(
    (r) => r.passed || (r.scorePercentage || 0) >= (r.assessment?.passingPercentage || 70)
  ).length;

  // Helper: check if a test was attempted
  const getAttemptForTest = (testId, testTitle) => {
    return myResults.find(
      (r) =>
        (r.assessment?._id && r.assessment._id === testId) ||
        (r.assessment && r.assessment === testId) ||
        r.assessmentTitle === testTitle
    );
  };

  // Filtered available assessments
  const availableUncompleted = assessments.filter(
    (a) => !getAttemptForTest(a._id, a.title)
  );

  // Filter based on active tab and domain filter
  const filteredAssessments = assessments.filter((test) => {
    if (domainFilter !== 'All' && test.category !== domainFilter) return false;
    const attempt = getAttemptForTest(test._id, test.title);
    if (activeTab === 'Available') return !attempt;
    if (activeTab === 'Completed') return !!attempt;
    return true;
  });

  const filteredResults = myResults.filter((res) => {
    if (domainFilter !== 'All' && res.category !== domainFilter) return false;
    return true;
  });

  // Recommended next assessment (first available uncompleted test)
  const nextRecommended = availableUncompleted.length > 0 ? availableUncompleted[0] : null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Assessments"
          subtitle="Validate your renewable-energy skills through technical assessments."
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* ================= SECTION 2: PAGE HEADER & OBJECTIVE ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Technical Assessments
              </h1>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Validate your renewable-energy skills through technical assessments. Standardized
                evaluations test your practical knowledge in Solar PV and Wind energy systems, strengthening
                your Skill Passport and helping EPC companies evaluate your qualifications.
              </p>
            </div>

            <Link
              to="/technician/skill-passport"
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <QrCode size={14} className="text-slate-500" />
              <span>Skill Passport</span>
            </Link>
          </div>

          {/* ================= SECTION 3: ASSESSMENT SUMMARY METRICS ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Assessments */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Catalog
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">{totalAssessments}</div>
              <p className="text-[11px] text-slate-500">Available modules</p>
            </div>

            {/* Completed Assessments */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Completed
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">{completedCount}</div>
              <p className="text-[11px] text-slate-500">Evaluations taken</p>
            </div>

            {/* Average Score */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Average Score
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {completedCount > 0 ? `${avgScore}%` : '0%'}
              </div>
              <p className="text-[11px] text-slate-500">Across completed tests</p>
            </div>

            {/* Passed Modules */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Passed Modules
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-mono">{passedCount}</div>
              <p className="text-[11px] text-slate-500">Benchmark met</p>
            </div>
          </div>

          {/* ================= SECTION 8: RECOMMENDED NEXT ASSESSMENT ================= */}
          {nextRecommended && (
            <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Zap size={12} />
                  <span>Continue Building Your Skills</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {nextRecommended.title}
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {nextRecommended.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span>{nextRecommended.durationMinutes} Minutes</span>
                  <span>•</span>
                  <span>{nextRecommended.totalQuestions || 10} Questions</span>
                  <span>•</span>
                  <span>Passing Score: {nextRecommended.passingPercentage}%</span>
                </div>
              </div>

              <Link
                to={`/technician/assessments/${nextRecommended._id}/take`}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 self-start md:self-auto shadow-xs"
              >
                <span>Take Assessment</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* ================= SECTION 7: SKILL IMPROVEMENT / BENCHMARK PROGRESS ================= */}
          {myResults.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Your Assessment Progress</h2>
                    <p className="text-[11px] text-slate-500">
                      Demonstrated competency scores across verified renewable domains
                    </p>
                  </div>
                </div>
                <Link
                  to="/technician/skill-passport"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  <span>Skill Passport</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {myResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 truncate pr-1">
                        {res.assessmentTitle}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 shrink-0">
                        {res.scorePercentage}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${res.scorePercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700">{res.skillLevel} Level</span>
                      <span>
                        {res.passed || res.scorePercentage >= 70 ? (
                          <span className="text-emerald-700 font-bold inline-flex items-center gap-0.5">
                            <Check size={11} className="stroke-[3]" /> Passed
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold">Not Passed</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= SECTION 13: FILTERS & NAVIGATION TABS ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {[
                { label: 'All', count: totalAssessments },
                { label: 'Available', count: availableUncompleted.length },
                { label: 'Completed', count: completedCount },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab.label
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      activeTab === tab.label
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Category Sector Filter */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
              <span className="text-slate-500 font-medium hidden sm:inline">Sector:</span>
              {['All', 'Solar', 'Wind'].map((domain) => (
                <button
                  key={domain}
                  onClick={() => setDomainFilter(domain)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer border ${
                    domainFilter === domain
                      ? 'bg-slate-800 text-white border-slate-800 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {domain === 'All' ? 'All Sectors' : domain}
                </button>
              ))}
            </div>
          </div>

          {/* ================= SECTIONS 4, 5, 6: ASSESSMENTS LIST / RESULTS ================= */}
          {loading ? (
            /* SECTION 11: LOADING SKELETON STATE */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-slate-200 rounded w-1/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/6" />
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-full" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            /* SECTION 12: ERROR STATE */
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Unable to load assessments</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{fetchError}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : activeTab === 'Completed' && filteredResults.length === 0 ? (
            /* SECTION 10: EMPTY COMPLETED STATE */
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Award size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Completed Assessments</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Complete your first technical assessment to demonstrate your skills and benchmark your
                technical capabilities.
              </p>
              <button
                onClick={() => setActiveTab('Available')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Explore Assessments</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ) : filteredAssessments.length === 0 ? (
            /* SECTION 10: EMPTY AVAILABLE STATE */
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-3 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Assessments Available</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Technical assessments will appear here when available. Check back soon for new competency modules.
              </p>
              <button
                onClick={() => {
                  setActiveTab('All');
                  setDomainFilter('All');
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            /* Assessment Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredAssessments.map((test) => {
                const attempt = getAttemptForTest(test._id, test.title);
                const hasPassed = attempt && (attempt.passed || attempt.scorePercentage >= test.passingPercentage);

                return (
                  <div
                    key={test._id}
                    className={`bg-white rounded-xl border p-5 sm:p-6 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm space-y-4 ${
                      hasPassed
                        ? 'border-emerald-200/80 bg-white'
                        : attempt
                        ? 'border-amber-200 bg-white'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges: Category + Attempt Status */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          {test.category === 'Solar' ? (
                            <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                              <Sun size={14} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-md bg-sky-50 text-sky-600 flex items-center justify-center">
                              <Wind size={14} />
                            </div>
                          )}
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {test.category} Domain
                          </span>
                        </div>

                        {attempt ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                                hasPassed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {hasPassed ? '✓ Passed' : '○ Not Passed'} ({attempt.scorePercentage}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            Not Attempted
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {test.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          {test.description}
                        </p>
                      </div>

                      {/* Technical Specs: Duration, Questions, Passing */}
                      <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Duration</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            <span>{test.durationMinutes} Mins</span>
                          </span>
                        </div>

                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Questions</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block flex items-center gap-1">
                            <HelpCircle size={12} className="text-slate-400" />
                            <span>{test.totalQuestions || test.questions?.length || 10} Qs</span>
                          </span>
                        </div>

                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Passing Mark</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                            {test.passingPercentage}%
                          </span>
                        </div>
                      </div>

                      {/* Topics Covered */}
                      {test.topics && test.topics.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Topics Evaluated
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {test.topics.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 4 & 5: ACTION BUTTONS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {attempt ? (
                        <>
                          <button
                            onClick={() => setViewResultModal(attempt)}
                            className="flex-1 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-200 inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <BarChart2 size={13} />
                            <span>View Result</span>
                          </button>

                          <Link
                            to={`/technician/assessments/${test._id}/take`}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors inline-flex items-center justify-center gap-1 shadow-xs"
                          >
                            <RotateCcw size={13} />
                            <span>Retake</span>
                          </Link>
                        </>
                      ) : (
                        <Link
                          to={`/technician/assessments/${test._id}/take`}
                          className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <span>Take Assessment</span>
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ================= SECTION 6: ASSESSMENT RESULT MODAL ================= */}
      {viewResultModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <BarChart2 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assessment Evaluation</h3>
                  <p className="text-xs text-slate-500">Official technical benchmark score</p>
                </div>
              </div>
              <button
                onClick={() => setViewResultModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Test Name & Status */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Assessment Module</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                    {viewResultModal.assessmentTitle}
                  </h4>
                  <span className="text-[11px] text-slate-500 block mt-1">
                    Completed: {new Date(viewResultModal.completedAt || Date.now()).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-black text-emerald-700 font-mono block">
                    {viewResultModal.scorePercentage}%
                  </span>
                  <span
                    className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 ${
                      viewResultModal.passed || viewResultModal.scorePercentage >= 70
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {viewResultModal.passed || viewResultModal.scorePercentage >= 70
                      ? '✓ Passed'
                      : '○ Not Passed'}
                  </span>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Questions Correct</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {viewResultModal.correctAnswers} / {viewResultModal.totalQuestions}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Demonstrated Level</span>
                  <span className="font-bold text-emerald-700 text-sm mt-0.5 block">
                    {viewResultModal.skillLevel || 'Competent'}
                  </span>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              {viewResultModal.categoryBreakdown && viewResultModal.categoryBreakdown.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Knowledge Domain Breakdown
                  </span>
                  <div className="space-y-2.5">
                    {viewResultModal.categoryBreakdown.map((cat, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                          <span className="truncate pr-1">{cat.category}</span>
                          <span className="font-mono font-bold text-emerald-700 shrink-0">
                            {cat.percentage}% ({cat.score || 0}/{cat.total || 0})
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setViewResultModal(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>

              <Link
                to={`/technician/assessments/${
                  viewResultModal.assessment?._id || viewResultModal.assessment
                }/take`}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
              >
                <RotateCcw size={13} />
                <span>Retake Test</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianAssessmentsPage;
