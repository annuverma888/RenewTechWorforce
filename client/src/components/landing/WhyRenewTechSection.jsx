import React from 'react';
import { ShieldCheck, Sparkles, Award, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhyRenewTechSection = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'Verified Skills',
      badge: 'Audit & Compliance',
      description:
        'All government accreditations (SCGJ, NSDC Level 4, GWO, State Wireman) undergo rigorous automated and administrator validation before deployment.',
      highlights: ['Zero fake credentials', 'Live license verification', 'Standardized assessments'],
    },
    {
      icon: Sparkles,
      title: 'Smart Matching',
      badge: 'AI Scoring Engine',
      description:
        'Algorithmic match scoring evaluates technical skills, years of field experience, location radius, and availability windows with 100% explainability.',
      highlights: ['96.8% match accuracy', 'Skill compatibility rating', 'Instant shortlisting'],
    },
    {
      icon: Award,
      title: 'Digital Skill Passport',
      badge: 'Tamper-Proof ID',
      description:
        'A comprehensive digital workforce passport featuring verified skill scores, project history, contractor ratings, and instantaneous QR verification.',
      highlights: ['Verifiable QR stamp', 'Contractor 5-factor ratings', 'Exportable credential'],
    },
    {
      icon: Users,
      title: 'Workforce Management',
      badge: 'End-to-End Mobilization',
      description:
        'Complete visibility into project crew deployment, attendance shifts, milestones completed, and post-project performance endorsements.',
      highlights: ['Real-time attendance', 'Project crew rosters', 'Milestone completion logs'],
    },
  ];

  return (
    <section id="why-renewtech" className="py-16 sm:py-24 bg-slate-50 text-slate-900 border-b border-slate-200 scroll-mt-[70px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            Why RenewTech Workforce
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            The Operating System for Clean Energy Talent
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Built specifically for utility-scale solar arrays and wind power generation projects to eliminate hiring friction, ensure safety, and accelerate commissioning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Icon size={22} />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-1.5">
                    {item.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyRenewTechSection;
