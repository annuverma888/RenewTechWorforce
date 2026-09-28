import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  MapPin,
  Calendar,
  Clock,
  Star,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Info,
  Check,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';

const MatchExplanationModal = ({
  isOpen,
  onClose,
  matchData,
  candidateName = 'Technician',
  projectName = 'Project',
  onAction = null,
  actionLabel = '',
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'skills', 'factors'

  if (!isOpen || !matchData) return null;

  const score = matchData.matchScore || 0;
  const breakdown = matchData.breakdown || {};
  const reasons = breakdown.reasons || [];
  const strengths = breakdown.strengths || [];
  const gapAnalysis = breakdown.gapAnalysis || [];
  const matchedSkills = breakdown.matchedSkills || [];
  const missingSkills = breakdown.missingSkills || [];
  const matchedCertificates = breakdown.matchedCertificates || [];
  const missingCertificates = breakdown.missingCertificates || [];
  const summaryNarrative = breakdown.summaryNarrative || '';
  const proximityDescription = breakdown.proximityDescription || '';

  // Tier metadata
  let tierBadge = {
    label: 'Exceptional Match',
    description: 'Top-tier technical alignment with immediate deployment capability.',
    bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-emerald-500/20',
    barColor: 'bg-emerald-500',
    gradientHeader: 'from-emerald-950 via-teal-950 to-slate-900',
  };

  if (score >= 90) {
    tierBadge = {
      label: 'Top 5% Ideal Candidate',
      description: 'Exceptional technical alignment, verified credentials & rapid mobilization fit.',
      bgColor: 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-emerald-500/20',
      barColor: 'bg-emerald-500',
      gradientHeader: 'from-emerald-950 via-teal-950 to-slate-900',
    };
  } else if (score >= 75) {
    tierBadge = {
      label: 'High-Compatibility Match',
      description: 'Solid technical background and accredited skills fulfilling project needs.',
      bgColor: 'bg-teal-50 text-teal-900 border-teal-300 ring-teal-500/20',
      barColor: 'bg-teal-500',
      gradientHeader: 'from-teal-950 via-slate-900 to-emerald-950',
    };
  } else if (score >= 60) {
    tierBadge = {
      label: 'Moderate Qualified Match',
      description: 'Foundational renewable capabilities; minor skill overlap or travel alignment required.',
      bgColor: 'bg-amber-50 text-amber-900 border-amber-300 ring-amber-500/20',
      barColor: 'bg-amber-500',
      gradientHeader: 'from-amber-950 via-slate-900 to-teal-950',
    };
  } else {
    tierBadge = {
      label: 'Emerging Match',
      description: 'Lacks core mandatory accreditations or direct experience for this project scope.',
      bgColor: 'bg-slate-50 text-slate-800 border-slate-300 ring-slate-500/20',
      barColor: 'bg-slate-500',
      gradientHeader: 'from-slate-900 via-slate-800 to-slate-950',
    };
  }

  const factors = [
    {
      name: 'Technical Skills Overlap',
      weight: 35,
      score: breakdown.skillScore ?? 85,
      icon: Award,
      color: 'emerald',
      detail: `${matchedSkills.length} matched required skills`,
    },
    {
      name: 'Verified Certifications',
      weight: 20,
      score: breakdown.certScore ?? 80,
      icon: ShieldCheck,
      color: 'teal',
      detail: `${matchedCertificates.length} verified credentials on passport`,
    },
    {
      name: 'Field Experience',
      weight: 15,
      score: breakdown.expScore ?? 90,
      icon: Clock,
      color: 'blue',
      detail: `${breakdown.expScore >= 95 ? 'Meets or exceeds' : 'Building'} seniority criteria`,
    },
    {
      name: 'Geographic Proximity',
      weight: 10,
      score: breakdown.locScore ?? 80,
      icon: MapPin,
      color: 'indigo',
      detail: proximityDescription || 'Regional cluster mobilization',
    },
    {
      name: 'Mobilization Availability',
      weight: 10,
      score: breakdown.availScore ?? 100,
      icon: Calendar,
      color: 'purple',
      detail: breakdown.availScore === 100 ? 'Immediate deployment ready' : 'On ongoing assignment',
    },
    {
      name: 'Skill Assessment Index',
      weight: 5,
      score: breakdown.assessmentScore ?? 85,
      icon: Sparkles,
      color: 'amber',
      detail: 'Standardized competency evaluation score',
    },
    {
      name: 'Contractor Work Rating',
      weight: 5,
      score: breakdown.ratingScore ?? 95,
      icon: Star,
      color: 'rose',
      detail: 'Past EPC performance evaluations',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-200/90 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div
          className={`bg-gradient-to-r ${tierBadge.gradientHeader} px-6 py-5 text-white flex items-start justify-between border-b border-white/10`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Sparkles size={16} />
              </span>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-300">
                Transparent Smart Matching Engine
              </span>
            </div>
            <h3 className="text-xl font-black text-white">Why This Match Fits</h3>
            <p className="text-xs text-slate-300">
              Evaluating <strong className="text-emerald-300 font-bold">{candidateName}</strong> for{' '}
              <strong className="text-white font-bold">{projectName}</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-100 bg-slate-50/80 px-6 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Intelligence
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('factors')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'factors'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Formula Breakdown (7 Factors)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'skills'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Skills & Credential Audit
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* TAB 1: OVERVIEW & INTELLIGENCE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Score Hero Banner */}
              <div
                className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${tierBadge.bgColor}`}
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 text-xs font-black shadow-2xs border border-current">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>{tierBadge.label}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900">
                    Weighted Match Compatibility: {score}%
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-md">
                    {summaryNarrative || tierBadge.description}
                  </p>
                </div>

                {/* Circular Radial Score Badge */}
                <div className="shrink-0 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white shadow-xl ring-4 ring-emerald-500/30 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {score}%
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                      Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Strengths vs. Gaps Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strengths Card */}
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Key Match Drivers</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {strengths.length === 0 ? (
                      <li className="italic text-slate-500">
                        General competency across renewable domain.
                      </li>
                    ) : (
                      strengths.map((str, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Gaps / Deployment Considerations Card */}
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span>Deployment Considerations</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {gapAnalysis.length === 0 ? (
                      <li className="flex items-center gap-2 text-emerald-700 font-semibold">
                        <Check size={14} />
                        <span>Zero critical gaps detected for this deployment.</span>
                      </li>
                    ) : (
                      gapAnalysis.map((gap, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold text-xs mt-0.5">•</span>
                          <span>{gap}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* Top Verified Signals */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Algorithmic Verification Signals
                </h4>
                <div className="space-y-2">
                  {reasons.slice(0, 4).map((r, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700"
                    >
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{r.replace(/^✓\s*/, '').replace(/^ℹ\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORMULA BREAKDOWN (7 FACTORS) */}
          {activeTab === 'factors' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                <span>Multi-Factor Mathematical Calibration</span>
                <span className="font-bold text-slate-700">100% Normalized Weight</span>
              </div>

              <div className="space-y-3">
                {factors.map((factor, i) => {
                  const Icon = factor.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-all space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{factor.name}</h4>
                            <p className="text-[11px] text-slate-500">{factor.detail}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">
                            {factor.score}%
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold">
                            Weight: {factor.weight}%
                          </span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            factor.score >= 85
                              ? 'bg-emerald-500'
                              : factor.score >= 70
                              ? 'bg-teal-500'
                              : factor.score >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${factor.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS & CREDENTIAL AUDIT */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Matched Required Skills */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Award size={14} className="text-emerald-600" />
                    <span>Matched Project Skills ({matchedSkills.length})</span>
                  </h4>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {breakdown.skillScore}% Competency
                  </span>
                </div>

                {matchedSkills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                    No direct skill matches identified.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {matchedSkills.map((sk, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-900">{sk.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            {sk.proficiency}
                          </span>
                          {sk.isVerified && (
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills Warning */}
              {missingSkills.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Unmatched Requisite Skills ({missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {missingSkills.map((sk, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-3 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {sk} (Unfulfilled)
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Accreditations */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-teal-600" />
                  <span>Accreditation Verification Audit</span>
                </h4>

                {matchedCertificates.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                    No specific certified accreditations matched for this project scope.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {matchedCertificates.map((cert, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 flex items-start justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <ShieldCheck size={15} className="text-teal-600" />
                            <h5 className="font-extrabold text-teal-950">
                              {cert.certificateName}
                            </h5>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">
                            Issuing Authority: {cert.issuingOrganization} • ID: {cert.certificateNumber}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-md bg-teal-600 text-white font-extrabold text-[10px]">
                          Authenticated
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Info size={13} className="text-slate-400" />
            <span>Calibrated with weighted multi-factor scoring engine</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>

            {onAction && actionLabel && (
              <button
                type="button"
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
              >
                <Send size={13} />
                <span>{actionLabel}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchExplanationModal;
