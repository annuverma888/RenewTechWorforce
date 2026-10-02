import React from 'react';
import { ShieldCheck, Target, UserCheck, LayoutDashboard } from 'lucide-react';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Verified Skills',
    tagline: 'Know what a technician can actually do.',
    desc: 'Audited government certifications, electrical wireman licenses, and practical skill evaluations before any technician joins the active talent pool.',
  },
  {
    icon: Target,
    title: 'Better Matching',
    tagline: 'Connect workforce skills with project requirements.',
    desc: 'Match specialized technician capabilities, regional location proximity, and availability with specific solar array and wind project specifications.',
  },
  {
    icon: UserCheck,
    title: 'Trusted Hiring',
    tagline: 'Verify credentials before mobilizing workers.',
    desc: 'Instant QR code and tamper-evident Skill Passport validation to ensure safe, fully compliant site mobilization with zero credential ambiguity.',
  },
  {
    icon: LayoutDashboard,
    title: 'Workforce Visibility',
    tagline: 'Manage technicians and project workforce in one platform.',
    desc: 'Keep complete oversight of active contractor rosters, site deployment schedules, work history records, and skill development in real time.',
  },
];

const WhyRenewTechSection = () => {
  return (
    <section id="why-renewtech" className="py-16 sm:py-24 bg-slate-50 text-slate-900 border-b border-slate-200 scroll-mt-[70px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            Platform Advantages
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Why RenewTech Workforce?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Built to solve critical workforce challenges across utility-scale solar and wind projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    {item.tagline}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                    {item.desc}
                  </p>
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
