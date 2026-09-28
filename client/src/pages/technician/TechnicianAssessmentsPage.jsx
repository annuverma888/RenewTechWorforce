import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Zap,
  Clock,
  HelpCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Sun,
  Wind,
} from 'lucide-react';
import { assessmentAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const TechnicianAssessmentsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assessRes, resultsRes] = await Promise.all([
          assessmentAPI.getAll(),
          assessmentAPI.getMyResults(),
        ]);

        if (assessRes.data.success) {
          setAssessments(assessRes.data.data);
        }
        if (resultsRes.data.success) {
          setMyResults(resultsRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching assessments data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Skill Assessments & Technical Benchmarks"
          subtitle="Test your technical knowledge in Solar PV or Wind Turbine systems to boost your Match Score."
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-8 max-w-5xl space-y-8">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-emerald-400" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-300">
                Verified Technical Evaluation
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Validate Your Renewable Energy Craftsmanship
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Standardized multiple-choice examinations crafted by renewable industry experts.
              Scoring high updates your <strong>Digital Skill Passport</strong> and unlocks top-tier
              EPC project recommendations.
            </p>
          </div>

          {/* Available Assessments Cards */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award size={18} className="text-emerald-600" />
              Available Competency Modules ({assessments.length})
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading assessment catalog...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assessments.map((test) => {
                  const recentAttempt = myResults.find(
                    (r) => r.assessment?._id === test._id || r.assessmentTitle === test.title
                  );

                  return (
                    <div
                      key={test._id}
                      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {test.category === 'Solar' ? (
                              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                <Sun size={18} />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                                <Wind size={18} />
                              </div>
                            )}
                            <Badge variant={test.category === 'Solar' ? 'solar' : 'wind'}>
                              {test.category} Domain
                            </Badge>
                          </div>
                          {recentAttempt && (
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              Best: {recentAttempt.scorePercentage}%
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-bold text-slate-900">{test.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {test.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span className="flex items-center gap-1">
                            <Clock size={13} className="text-slate-400" />
                            {test.durationMinutes} Minutes
                          </span>
                          <span className="flex items-center gap-1">
                            <HelpCircle size={13} className="text-slate-400" />
                            {test.totalQuestions || test.questions?.length || 10} Questions
                          </span>
                          <span>Passing: {test.passingPercentage}%</span>
                        </div>

                        {/* Covered Topics */}
                        {test.topics && test.topics.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                              Topics Tested
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {test.topics.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link
                          to={`/technician/assessments/${test._id}/take`}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                        >
                          <span>{recentAttempt ? 'Retake Assessment' : 'Start Assessment'}</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past Assessment Results & Category Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-600" />
              Your Assessment Track Record & Category Mastery
            </h3>

            {myResults.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                You have not completed any skill assessments yet. Select a test above to begin!
              </div>
            ) : (
              <div className="space-y-6">
                {myResults.map((result) => (
                  <div
                    key={result._id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">
                            {result.assessmentTitle}
                          </h4>
                          <Badge
                            variant={
                              result.skillLevel === 'Master'
                                ? 'master'
                                : result.skillLevel === 'Proficient'
                                ? 'proficient'
                                : 'competent'
                            }
                          >
                            {result.skillLevel}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-1">
                          Completed on: {new Date(result.completedAt).toLocaleDateString()} • {result.correctAnswers} / {result.totalQuestions} Correct
                        </span>
                      </div>
                      <div className="sm:text-right text-left">
                        <span className="text-2xl font-black text-emerald-700">
                          {result.scorePercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Category Breakdown Bars */}
                    {result.categoryBreakdown && result.categoryBreakdown.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {result.categoryBreakdown.map((cat, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                              <span className="truncate pr-1">{cat.category}</span>
                              <span className="text-emerald-700 font-bold shrink-0">
                                {cat.percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: `${cat.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TechnicianAssessmentsPage;
