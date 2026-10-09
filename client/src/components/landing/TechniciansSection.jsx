import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  ShieldCheck,
  Award,
  Search,
  CheckCircle2,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TechniciansSection = () => {
  const { t } = useTranslation();
  const { isTechnician, isAuthenticated } = useAuth();

  const benefits = [
    {
      title: t('landing.techBen1Title', 'Build Professional Profile'),
      desc: t('landing.techBen1Desc', 'Show your skills, experience, and specializations.'),
      icon: User,
    },
    {
      title: t('landing.techBen2Title', 'Add Skills & Certifications'),
      desc: t('landing.techBen2Desc', 'Add your skills and relevant certificates.'),
      icon: Award,
    },
    {
      title: t('landing.techBen3Title', 'Verify Skills'),
      desc: t('landing.techBen3Desc', 'Complete assessments to demonstrate your skills.'),
      icon: ShieldCheck,
    },
    {
      title: t('landing.techBen4Title', 'Get Skill Passport'),
      desc: t('landing.techBen4Desc', 'Share your professional credentials.'),
      icon: CheckCircle2,
    },
    {
      title: t('landing.techBen5Title', 'Find Projects'),
      desc: t('landing.techBen5Desc', 'Discover suitable projects and apply.'),
      icon: Search,
    },
  ];

  return (
    <section
      id="technicians"
      className="py-10 sm:py-16 lg:py-20 bg-white text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('navigation.forTechnicians', 'For Technicians')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            {t('landing.forTechHeading', 'Empowering Green Energy Technicians')}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-2.5 leading-relaxed">
            {t(
              'landing.forTechDesc',
              'Build your profile, verify your skills, and find projects.'
            )}
          </p>
        </div>

        {/* Single Shared Feature Container (Matching Workflow Row Style) */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* 5 Compact Horizontal Feature Rows */}
          <div className="divide-y divide-slate-100">
            {benefits.map((item, idx) => {
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

          {/* Integrated Action / CTA Strip */}
          <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                {t('landing.readyToFindOpportunities', 'Ready to find verified opportunities?')}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                {t(
                  'landing.readyToFindOpportunitiesDesc',
                  'Build your profile, complete your skills assessment, and discover active solar and wind projects across India.'
                )}
              </p>
            </div>
            <Link
              to={isAuthenticated && isTechnician ? '/technician/dashboard' : '/projects'}
              className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs hover:shadow transition-all focus-ring group"
            >
              <Compass size={15} className="group-hover:rotate-45 transition-transform" />
              <span>{t('landing.exploreOpportunities', 'Explore Opportunities')}</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechniciansSection;
