import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Award,
  Search,
  Send,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TechniciansSection = () => {
  const { isTechnician, isAuthenticated } = useAuth();

  const capabilities = [
    {
      title: 'Create professional profile',
      desc: 'Set up your verified industry profile highlighting technical specializations, regional mobility, and contact credentials.',
      icon: User,
    },
    {
      title: 'Showcase verified skills',
      desc: 'Display certified proficiencies in Solar PV DC cabling, inverter systems, Wind turbine hydraulics, and electrical safety.',
      icon: ShieldCheck,
    },
    {
      title: 'Build Digital Skill Passport',
      desc: 'Consolidate government certifications, assessment scores, and audited field experience into a tamper-evident digital credential.',
      icon: Award,
    },
    {
      title: 'Find relevant opportunities',
      desc: 'Discover active renewable projects matched specifically to your verified competency levels and geographical availability.',
      icon: Search,
    },
    {
      title: 'Apply to projects',
      desc: 'Submit your verified credentials directly to EPC contractors with one-click applications and clear engagement terms.',
      icon: Send,
    },
  ];

  return (
    <section
      id="technicians"
      className="py-16 sm:py-24 bg-slate-50 text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            For Technicians
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Build Your Career
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Connect your verified technical expertise directly with trusted renewable-energy project contractors.
          </p>
        </div>

        {/* 5 Capability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span>Verified Standard</span>
                </div>
              </div>
            );
          })}

          {/* Action Card to fill the 6th slot cleanly */}
          <div className="bg-gradient-to-br from-emerald-800 to-teal-900 text-white p-6 sm:p-7 rounded-2xl flex flex-col justify-between shadow-xs">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-700/50 px-2.5 py-0.5 rounded">
                Get Started
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-3 leading-snug">
                Ready to showcase your credentials?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                Build your verified profile today and start matching with active EPC project contracts across India.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-700/60">
              <Link
                to={isAuthenticated && isTechnician ? '/technician/dashboard' : '/register?role=technician'}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-slate-900 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-2xs"
              >
                <span>Build Your Profile</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechniciansSection;
