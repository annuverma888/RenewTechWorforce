import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Target,
  ShieldCheck,
  Briefcase,
  LayoutDashboard,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EPCCompaniesSection = () => {
  const { t } = useTranslation();
  const { isCompany, isAuthenticated } = useAuth();

  const epcValueProps = [
    {
      title: t('landing.epcVal1Title', 'Faster Hiring'),
      desc: t('landing.epcVal1Desc', 'Find relevant solar and wind technicians faster.'),
      icon: Clock,
    },
    {
      title: t('landing.epcVal2Title', 'Skill-Based Matching'),
      desc: t('landing.epcVal2Desc', 'Compare technician skills with project requirements.'),
      icon: Target,
    },
    {
      title: t('landing.epcVal3Title', 'Verified Information'),
      desc: t('landing.epcVal3Desc', 'Review certified skills, assessments, and digital Skill Passports.'),
      icon: ShieldCheck,
    },
    {
      title: t('landing.epcVal4Title', 'Project-Based Hiring'),
      desc: t('landing.epcVal4Desc', 'Recruit technicians based on site specifications and project milestones.'),
      icon: Briefcase,
    },
    {
      title: t('landing.epcVal5Title', 'Workforce Management'),
      desc: t('landing.epcVal5Desc', 'Coordinate hired technicians, monitor project rosters, and track performance.'),
      icon: LayoutDashboard,
    },
  ];

  return (
    <section
      id="epc-companies"
      className="py-10 sm:py-16 lg:py-20 bg-slate-50 text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-5 sm:mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            {t('landing.forEpcsBadge', 'FOR EPCS')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            {t('landing.builtForRenewable', 'Built for Renewable Energy Businesses')}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-2.5 leading-relaxed max-w-xl mx-auto">
            {t(
              'landing.builtForRenewableDesc',
              'Find, hire, and manage skilled renewable-energy technicians in one place.'
            )}
          </p>

          {/* Simplified EPC Quick-Actions */}
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full">
            <Link
              to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all focus-ring group"
            >
              <Users size={15} className="text-emerald-400 group-hover:scale-105 transition-transform" />
              <span>{t('landing.hireVerifiedTechnicians', 'Hire Verified Technicians')}</span>
              <ArrowRight size={14} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              to={isAuthenticated && isCompany ? '/epc/projects/new' : '/register?role=epc_company'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs hover:border-slate-300 transition-all focus-ring"
            >
              <Briefcase size={15} className="text-emerald-600" />
              <span>{t('landing.postProjectRequirements', 'Post Project Requirements')}</span>
            </Link>
          </div>
        </div>

        {/* Single Shared Feature Container (Matching Workflow & Technician Row Style) */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {epcValueProps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 sm:p-4 flex items-start gap-3 sm:gap-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left Column: Aligned Icon */}
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shadow-2xs shrink-0 mt-0.5">
                    <Icon size={16} />
                  </div>

                  {/* Text Column: Title + Concise Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EPCCompaniesSection;
