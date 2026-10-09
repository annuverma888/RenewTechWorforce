import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Wrench,
  Building2,
  ArrowRight,
  Compass,
  User,
  ShieldCheck,
  Award,
  Search,
  PlusCircle,
  Users,
  Target,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TwoSidedValueSection = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isCompany } = useAuth();
  const [activeTab, setActiveTab] = useState('technician'); // 'technician' | 'epc'

  const technicianCapabilities = [
    {
      title: t('landing.techCap1Title', 'Build Profile'),
      desc: t('landing.techCap1Desc', 'Add skills and experience.'),
      icon: User,
    },
    {
      title: t('landing.techCap2Title', 'Verify Skills'),
      desc: t('landing.techCap2Desc', 'Upload certificates and complete assessments.'),
      icon: ShieldCheck,
    },
    {
      title: t('landing.techCap3Title', 'Get Skill Passport'),
      desc: t('landing.techCap3Desc', 'Share verified credentials.'),
      icon: Award,
    },
    {
      title: t('landing.techCap4Title', 'Find Opportunities'),
      desc: t('landing.techCap4Desc', 'Discover projects and track applications.'),
      icon: Search,
    },
  ];

  const epcCapabilities = [
    {
      title: t('landing.epcCap1Title', 'Post Projects'),
      desc: t('landing.epcCap1Desc', 'Define project requirements.'),
      icon: PlusCircle,
    },
    {
      title: t('landing.epcCap2Title', 'Find Technicians'),
      desc: t('landing.epcCap2Desc', 'Discover skilled workers.'),
      icon: Users,
    },
    {
      title: t('landing.epcCap3Title', 'Review Matches'),
      desc: t('landing.epcCap3Desc', 'Compare skills and suitability.'),
      icon: Target,
    },
    {
      title: t('landing.epcCap4Title', 'Hire & Manage'),
      desc: t('landing.epcCap4Desc', 'Coordinate your workforce.'),
      icon: LayoutDashboard,
    },
  ];

  return (
    <section
      id="who-is-it-for"
      className="py-10 sm:py-16 lg:py-20 bg-white text-slate-900 border-b border-slate-200 scroll-mt-[70px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('landing.whoIsItForBadge', 'Two-Sided Platform')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            {t('landing.whoIsItForTitle', 'Who Is RenewTech Workforce For?')}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-2.5 leading-relaxed">
            {t(
              'landing.whoIsItForSubtitle',
              'Connecting skilled renewable-energy technicians with trusted EPC companies.'
            )}
          </p>

          {/* Segmented Control Tabs */}
          <div className="mt-4 sm:mt-5 max-w-xs sm:max-w-sm mx-auto grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab('technician')}
              className={`w-full py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'technician'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Wrench size={15} className={activeTab === 'technician' ? 'text-white' : 'text-slate-500'} />
              <span>{t('navigation.technicians', 'Technicians')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('epc')}
              className={`w-full py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'epc'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Building2
                size={15}
                className={activeTab === 'epc' ? 'text-emerald-400' : 'text-slate-500'}
              />
              <span>{t('navigation.epcCompanies', 'EPC Companies')}</span>
            </button>
          </div>
        </div>

        {/* Selected Audience Panel (One Clean Shared Container Matching Workflow Row Style) */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto w-full min-w-0">
          {activeTab === 'technician' ? (
            /* TECHNICIAN CONTENT PANEL */
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5.5 lg:p-6 border border-slate-200 shadow-2xs transition-all w-full min-w-0">
              {/* Header: Icon + Audience Badge */}
              <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shadow-2xs shrink-0">
                  <Wrench size={16} />
                </div>
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/70">
                  {t('navigation.technicians', 'Technicians')}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {t('landing.forTechniciansTitle', 'For Renewable Energy Technicians')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {t(
                    'landing.forTechniciansDesc',
                    'Build your profile, verify your skills, and find projects.'
                  )}
                </p>
              </div>

              {/* Feature List: Single Shared Container with Thin Dividers */}
              <div className="mt-3.5 sm:mt-4 divide-y divide-slate-100 border-y border-slate-100">
                {technicianCapabilities.map((item, idx) => {
                  const CapIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="py-2.5 sm:py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shadow-2xs shrink-0 mt-0.5">
                        <CapIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action CTA */}
              <div className="mt-3.5 sm:mt-4">
                <Link
                  to="/projects"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all focus-ring group"
                >
                  <Compass size={16} className="group-hover:rotate-45 transition-transform shrink-0" />
                  <span>{t('landing.exploreOpportunities', 'Explore Projects')}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>
            </div>
          ) : (
            /* EPC COMPANIES CONTENT PANEL */
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5.5 lg:p-6 border border-slate-200 shadow-2xs transition-all w-full min-w-0">
              {/* Header: Icon + Audience Badge */}
              <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-emerald-400 flex items-center justify-center border border-slate-800 shadow-2xs shrink-0">
                  <Building2 size={16} />
                </div>
                <span className="text-xs font-bold font-mono text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                  {t('navigation.epcCompanies', 'EPC Companies')}
                </span>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  {t('landing.forEpcTitle', 'For Renewable Energy Companies')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                  {t(
                    'landing.forEpcDesc',
                    'Find skilled technicians, hire suitable teams, and manage project deployment.'
                  )}
                </p>
              </div>

              {/* Feature List: Single Shared Container with Thin Dividers */}
              <div className="mt-3.5 sm:mt-4 divide-y divide-slate-100 border-y border-slate-100">
                {epcCapabilities.map((item, idx) => {
                  const CapIcon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="py-2.5 sm:py-3 flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shadow-2xs shrink-0 mt-0.5">
                        <CapIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action CTA */}
              <div className="mt-3.5 sm:mt-4">
                <Link
                  to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 min-h-[44px] bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all focus-ring group"
                >
                  <Building2 size={16} className="text-emerald-400 group-hover:scale-105 transition-transform shrink-0" />
                  <span>{t('landing.findSkilledTechnicians', 'Find Technicians')}</span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TwoSidedValueSection;
