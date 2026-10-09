import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Compass, Users, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FinalCTASection = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isCompany } = useAuth();

  return (
    <section className="py-10 sm:py-16 lg:py-20 bg-slate-900 text-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 sm:space-y-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800">
          {t('landing.getStartedToday', 'Get Started Today')}
        </span>

        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          {t('landing.heroHeading', 'Connecting Renewable Energy Talent with the Right Projects')}
        </h2>

        <p className="text-xs sm:text-sm lg:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t('landing.heroSubtitle', 'Technicians build verified profiles and find opportunities. EPC companies discover skilled workers and build project-ready teams.')}
        </p>

        {/* Dual Action CTAs: High-Priority EPC Hiring & Verified Opportunities */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 pt-2 sm:pt-4">
          {/* Prominent High-Contrast EPC CTA */}
          <Link
            to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
            className="w-full sm:w-auto px-7 py-3.5 min-h-[46px] bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 focus-ring border border-white group"
          >
            <Building2 size={16} className="text-emerald-700 group-hover:scale-110 transition-transform shrink-0" />
            <span>{t('landing.findTalentCta', 'Hire Skilled Technicians')}</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md ml-0.5">
              For EPCs
            </span>
            <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          {/* Technician Opportunities CTA */}
          <Link
            to="/projects"
            className="w-full sm:w-auto px-7 py-3.5 min-h-[46px] bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus-ring group"
          >
            <Compass size={16} className="group-hover:rotate-45 transition-transform shrink-0" />
            <span>{t('landing.findWorkCta', 'Find Opportunities')}</span>
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>
        </div>

        {/* Real Trust Badges */}
        <div className="pt-5 sm:pt-7 border-t border-slate-800 flex flex-wrap items-center justify-center gap-3.5 sm:gap-6 text-[11px] sm:text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{t('landing.standardizedProfiles', 'Standardized Technical Profiles')}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>{t('landing.digitalSkillPassports', 'Digital Skill Passports')}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span>{t('landing.directMobilization', 'Direct Project Mobilization')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
