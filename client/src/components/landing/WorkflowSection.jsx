import React from 'react';
import {
  UserCheck,
  ShieldCheck,
  Sparkles,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const WorkflowSection = () => {
  const steps = [
    {
      num: '01',
      title: 'Create Profile',
      tag: 'Technician & EPC',
      desc: 'Build a comprehensive profile highlighting solar PV, wind turbine, electrical commissioning, and regional mobility.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Verify Skills',
      tag: 'Audit & Evaluation',
      desc: 'Verify government credentials (SCGJ, NSDC, GWO, Wireman) and complete standardized competency skill assessments.',
      icon: ShieldCheck,
    },
    {
      num: '03',
      title: 'Smart Match',
      tag: 'AI Precision Engine',
      desc: 'Algorithmic matching aligns candidates with active EPC projects based on skills, experience, location, and availability.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'Get Hired',
      tag: 'Direct Offer & Crew',
      desc: 'EPC companies review verified candidates, shortlist, conduct interviews, and hire directly onto the project roster.',
      icon: Briefcase,
    },
    {
      num: '05',
      title: 'Complete Projects',
      tag: 'Ratings & Passport',
      desc: 'Log shifts, commission clean megawatts, track milestones, and earn verifiable contractor endorsements on your Skill Passport.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200 scroll-mt-[70px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            5 Simple Steps to Mobilize Renewable Talent
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            A transparent, verified workflow connecting qualified technicians directly with leading EPC developers from initial sign-up to project completion.
          </p>
        </div>

        {/* 5-Step Flow with connecting line */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-white shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between relative group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-extrabold font-mono text-emerald-600">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {step.tag}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon size={20} />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span>Step {step.num}</span>
                  {idx < 4 ? (
                    <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  ) : (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  )}
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
