import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Layers,
  Award,
  MapPin,
  Calendar,
  Star,
  Zap,
} from 'lucide-react';

const SmartMatchingSection = () => {
  const matchFactors = [
    { name: 'Required Skills', weight: '40%', desc: 'Direct mapping of technical solar and wind capabilities' },
    { name: 'Certification', weight: '20%', desc: 'Government-verified SCGJ, NSDC, and GWO credentials' },
    { name: 'Experience', weight: '15%', desc: 'Field MW scale and years of utility commissioning work' },
    { name: 'Location Proximity', weight: '15%', desc: 'State and city mobilization radius' },
    { name: 'Timeline Availability', weight: '10%', desc: 'Active calendar availability during project deployment' },
  ];

  const candidateMatches = [
    {
      name: 'Rahul Kumar',
      role: 'Certified Solar PV Wireman',
      score: 96,
      reasons: [
        'Required skills matched (PV Installation, PV Wiring)',
        'Experience matched (4 years exceeds 2-year requirement)',
        'Certificate matched (Solar PV Installer Level 4 verified)',
        'Location matched (Kanpur, Uttar Pradesh site proximity)',
        'Availability confirmed for project schedule window',
      ],
    },
    {
      name: 'Amit Sharma',
      role: 'Solar Mounting Installer',
      score: 91,
      reasons: [
        'Required skills matched (Mounting, Array Grounding)',
        'Experience matched (3 years utility solar)',
        'Certificate matched (SCGJ Rooftop Specialist)',
        'Location matched (Lucknow / Kanpur region)',
        'Availability confirmed for immediate deployment',
      ],
    },
  ];

  return (
    <section
      id="smart-matching"
      className="py-16 sm:py-24 bg-slate-50 text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
            Smart Matching
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Transparent Skill & Location Matching
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            No black-box algorithms. We calculate transparent compatibility scores based on verified skills, experience, certifications, and availability.
          </p>
        </div>

        {/* Project Demo Card + Candidate Matches */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Project Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Target Project
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">500kW Solar Installation</h3>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-emerald-400" /> Kanpur, Uttar Pradesh • 5 Technicians Required
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <span className="text-xs text-slate-400 block font-medium">Algorithmic Match</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">96%</span>
            </div>
          </div>

          {/* Recommended Candidates with Reasons */}
          <div className="p-6 sm:p-8 space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recommended Technicians & Matching Criteria
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidateMatches.map((cand, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-base font-bold text-slate-900">{cand.name}</h5>
                        <p className="text-xs text-slate-500">{cand.role}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-black text-emerald-600">{cand.score}%</span>
                        <span className="block text-[10px] text-slate-500 font-semibold">Match</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 pt-3 border-t border-slate-200">
                      {cand.reasons.map((reason, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Matching Criteria Breakdown */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Scoring Weights Breakdown
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {matchFactors.map((f, fIdx) => (
                  <div key={fIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-base font-black text-emerald-700 block">{f.weight}</span>
                    <span className="text-xs font-bold text-slate-800 block mt-0.5">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SmartMatchingSection;
