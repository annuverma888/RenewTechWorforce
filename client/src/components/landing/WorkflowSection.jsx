import React from 'react';
import {
  Wrench,
  ShieldCheck,
  Award,
  Search,
  Briefcase,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

const WorkflowSection = () => {
  const steps = [
    {
      num: '01',
      title: 'Build Skills',
      desc: 'Develop standardized competencies in Solar PV, Wind, BESS, and electrical systems.',
      icon: Wrench,
    },
    {
      num: '02',
      title: 'Verify Skills',
      desc: 'Validate government certifications, safety licenses, and practical field assessments.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Skill Passport',
      desc: 'Issue a tamper-proof digital passport with verified credentials and QR validation.',
      icon: Award,
    },
    {
      num: '04',
      title: 'Find Opportunity',
      desc: 'Match with active utility-scale renewable projects seeking pre-verified talent.',
      icon: Search,
    },
    {
      num: '05',
      title: 'Get Hired',
      desc: 'Mobilize onto project rosters with direct hiring, clear terms, and verified trust.',
      icon: Briefcase,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200 scroll-mt-[70px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Platform Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            From Skills to Opportunity
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            A structured pathway connecting skilled technicians with verified renewable-energy projects.
          </p>
        </div>

        {/* 5-Step Stacked on Mobile, 5-col on Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-white transition-all flex flex-col justify-between group shadow-2xs hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
                      Step {step.num}
                    </span>
                    {idx < steps.length - 1 ? (
                      <ArrowRight size={14} className="hidden lg:block text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    ) : null}
                  </div>

                  <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon size={20} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between lg:hidden text-xs text-slate-400">
                  <span className="font-semibold text-emerald-700">0{idx + 1} of 05</span>
                  {idx < steps.length - 1 && <ArrowDown size={13} className="text-slate-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
