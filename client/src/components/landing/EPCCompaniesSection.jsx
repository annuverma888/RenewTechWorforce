import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Target,
  Briefcase,
  UserCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EPCCompaniesSection = () => {
  const { isCompany, isAuthenticated } = useAuth();

  const capabilities = [
    {
      title: 'Find skilled technicians',
      desc: 'Browse pre-screened solar PV installers, wind turbine specialists, and electrical wiremen ready for site mobilization.',
      icon: Users,
    },
    {
      title: 'Check verified credentials',
      desc: 'Inspect government-backed certifications, electrical licenses, GWO safety stamps, and practical assessment scores.',
      icon: ShieldCheck,
    },
    {
      title: 'Match workforce with project requirements',
      desc: 'Align technician competency, regional proximity, and availability with specific MW-scale project specifications.',
      icon: Target,
    },
    {
      title: 'Manage workforce',
      desc: 'Coordinate project rosters, track field mobilization status, monitor work shifts, and record milestone performance.',
      icon: Briefcase,
    },
    {
      title: 'Hire for projects',
      desc: 'Engage vetted technicians directly with clear contracts, guaranteed skill competencies, and zero recruiter friction.',
      icon: UserCheck,
    },
  ];

  return (
    <section
      id="epc-companies"
      className="py-16 sm:py-24 bg-white text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            For EPC Companies & Contractors
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Build the Right Workforce
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Eliminate project delays with verified, pre-screened clean energy technicians matched to your exact site requirements.
          </p>
        </div>

        {/* 5 Capability Cards Grid + CTA Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-white shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span>EPC Enterprise Ready</span>
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
                Connect with verified technicians across solar PV, wind generation, and electrical substation installations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800">
              <Link
                to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-2xs"
              >
                <span>Find Technicians</span>
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
