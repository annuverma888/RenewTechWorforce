import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Target,
  ShieldCheck,
  Briefcase,
  UserCheck,
  LayoutDashboard,
  Clock,
  ArrowRight,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EPCCompaniesSection = () => {
  const { isCompany, isAuthenticated } = useAuth();

  const epcValueProps = [
    {
      title: 'Faster Hiring',
      tagline: 'Reduce recruitment cycle times',
      desc: 'Find relevant solar and wind technicians quickly instead of searching manually across fragmented channels.',
      icon: Clock,
    },
    {
      title: 'Skill-Based Matching',
      tagline: 'Objective technical compatibility',
      desc: 'Use the platform’s multi-factor matching system to identify suitable technicians aligned with your project requirements.',
      icon: Target,
    },
    {
      title: 'Verified Information',
      tagline: 'Transparent credential review',
      desc: 'Review available verification information including certified skills, government accreditations, standardized assessments, and Skill Passports.',
      icon: ShieldCheck,
    },
    {
      title: 'Project-Based Hiring',
      tagline: 'Tailored to site specifications',
      desc: 'Post multi-MW solar arrays, wind turbine sites, or BESS installations and recruit workers based on exact project milestones.',
      icon: Briefcase,
    },
    {
      title: 'Workforce Management',
      tagline: 'Full visibility after hiring',
      desc: 'Manage hired technicians through the built-in workforce tools, monitor active project rosters, and track performance.',
      icon: LayoutDashboard,
    },
  ];

  return (
    <section
      id="epc-companies"
      className="py-16 sm:py-24 bg-slate-50 text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            For EPC Companies & Contractors
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Built for Renewable Energy Businesses
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            RenewTech Workforce is designed to help EPC companies find, hire and manage skilled renewable-energy workers more efficiently.
          </p>
        </div>

        {/* 5 Value Prop Cards + CTA Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {epcValueProps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-emerald-700" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    {item.tagline}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>EPC Enterprise Value</span>
                </div>
              </div>
            );
          })}

          {/* Action Card */}
          <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-2xl flex flex-col justify-between shadow-xs border border-slate-800">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800/80">
                Staff Your Project
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-3 leading-snug">
                Need skilled technicians for your renewable site?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Connect with technicians across solar PV, wind generation, and substation installations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-2xs focus-ring"
              >
                <Users size={15} />
                <span>Find Skilled Technicians</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EPCCompaniesSection;
