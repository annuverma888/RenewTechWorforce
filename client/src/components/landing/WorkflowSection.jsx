import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  User,
  Award,
  ShieldCheck,
  Search,
  Briefcase,
  PlusCircle,
  Users,
  Target,
  UserCheck,
  LayoutDashboard,
  ArrowRight,
  Building2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WorkflowSection = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isCompany } = useAuth();
  const [activeWorkflow, setActiveWorkflow] = useState('epc'); // 'epc' | 'technician'

  const technicianSteps = [
    {
      num: '01',
      title: t('landing.stepTech1Title', 'Create Profile'),
      desc: t('landing.stepTech1Desc', 'Add your skills, experience, and location.'),
      icon: User,
    },
    {
      num: '02',
      title: t('landing.stepTech2Title', 'Add Skills & Certifications'),
      desc: t('landing.stepTech2Desc', 'Upload certificates and list your skills.'),
      icon: Award,
    },
    {
      num: '03',
      title: t('landing.stepTech3Title', 'Verify Skills'),
      desc: t('landing.stepTech3Desc', 'Complete assessments to verify your skills.'),
      icon: ShieldCheck,
    },
    {
      num: '04',
      title: t('landing.stepTech4Title', 'Find Projects'),
      desc: t('landing.stepTech4Desc', 'Explore suitable renewable energy projects.'),
      icon: Search,
    },
    {
      num: '05',
      title: t('landing.stepTech5Title', 'Apply & Get Hired'),
      desc: t('landing.stepTech5Desc', 'Apply for projects and track your applications.'),
      icon: Briefcase,
    },
  ];

  const epcSteps = [
    {
      num: '01',
      title: t('landing.stepEpc1Title', 'Post Project'),
      desc: t('landing.stepEpc1Desc', 'Add project details and required skills.'),
      icon: PlusCircle,
    },
    {
      num: '02',
      title: t('landing.stepEpc2Title', 'Find Technicians'),
      desc: t('landing.stepEpc2Desc', 'Discover suitable skilled technicians.'),
      icon: Users,
    },
    {
      num: '03',
      title: t('landing.stepEpc3Title', 'Review & Match'),
      desc: t('landing.stepEpc3Desc', 'Compare skills and matching scores.'),
      icon: Target,
    },
    {
      num: '04',
      title: t('landing.stepEpc4Title', 'Hire'),
      desc: t('landing.stepEpc4Desc', 'Select technicians for your project.'),
      icon: UserCheck,
    },
    {
      num: '05',
      title: t('landing.stepEpc5Title', 'Manage Workforce'),
      desc: t('landing.stepEpc5Desc', 'Coordinate your hired team.'),
      icon: LayoutDashboard,
    },
  ];

  const currentSteps = activeWorkflow === 'epc' ? epcSteps : technicianSteps;

  return (
    <section
      id="how-it-works"
      className="py-10 sm:py-16 lg:py-20 bg-slate-50 text-slate-900 border-b border-slate-200 scroll-mt-[70px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            {t('navigation.howItWorks', 'How It Works')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            {t('landing.howItWorksTitle', 'How RenewTech Workforce Works')}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-3 leading-relaxed">
            {t('landing.howItWorksSubtitle', 'Connect skilled technicians with renewable energy projects through verified skills and smarter hiring.')}
          </p>

          {/* Workflow Toggle Buttons */}
          <div className="mt-4 sm:mt-6 inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveWorkflow('epc')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeWorkflow === 'epc'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users size={16} className={activeWorkflow === 'epc' ? 'text-emerald-400' : 'text-slate-500'} />
              <span>{t('landing.epcWorkflowTab', 'EPC Workflow')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveWorkflow('technician')}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeWorkflow === 'technician'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <User size={16} className={activeWorkflow === 'technician' ? 'text-white' : 'text-slate-500'} />
              <span>{t('landing.techWorkflowTab', 'Technician Workflow')}</span>
            </button>
          </div>
        </div>

        {/* Workflow Steps Container */}
        <div className="space-y-2.5 sm:space-y-3.5">
          {/* Journey Header */}
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate">
              {activeWorkflow === 'epc'
                ? t('landing.epcWorkflowTab', 'EPC Workflow')
                : t('landing.techWorkflowTab', 'Technician Workflow')}
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
              <span>
                {activeWorkflow === 'epc'
                  ? t('landing.epcFlowBadge', 'Post → Match → Review → Hire → Manage')
                  : t('landing.techFlowBadge', 'Profile → Skills → Verify → Projects → Hired')}
              </span>
            </div>
          </div>

          {/* MOBILE LAYOUT (< 768px): Compact Horizontal Rows */}
          <div className="block md:hidden bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
            {currentSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-3 sm:p-3.5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Left Column: Compact Step Number Badge + Icon */}
                  <div className="relative shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/70 shadow-2xs">
                      <Icon size={16} />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-white text-[9px] font-mono font-bold flex items-center justify-center ring-2 ring-white">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Main Column: Title + Short Description */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TABLET & DESKTOP LAYOUT (>= 768px): Responsive Grid Cards */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {currentSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center mb-2.5 sm:mb-3">
                      <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                        {t('landing.stepLabel', 'Step')} {step.num}
                      </span>
                    </div>

                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon size={18} />
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Workflow Conversion CTA Strip */}
          {activeWorkflow === 'epc' ? (
            <div className="mt-5 sm:mt-7 p-4 sm:p-5.5 bg-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 border border-slate-800 shadow-sm">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                  <Building2 size={13} />
                  <span>{t('landing.epcMobilizationBadge', 'EPC Project Mobilization')}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {t('landing.epcMobilizationTitle', 'Ready to staff your renewable energy site?')}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('landing.epcMobilizationDesc', 'Connect with certified solar and wind specialists with verified Skill Passports.')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Link
                  to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 focus-ring group"
                >
                  <Building2 size={15} />
                  <span>{t('landing.findTalentCta', 'Hire Skilled Technicians')}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 sm:mt-7 p-4 sm:p-5.5 bg-emerald-900 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-3.5 sm:gap-4 border border-emerald-800 shadow-sm">
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-200 mb-0.5">
                  <Compass size={13} />
                  <span>{t('landing.techCareerBadge', 'Technician Career Journey')}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  {t('landing.readyToFindOpportunities', 'Ready to find verified opportunities?')}
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {t('landing.readyToFindOpportunitiesDesc', 'Build your profile, complete your skills assessment, and discover active solar and wind projects across India.')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
                <Link
                  to="/projects"
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-emerald-50 text-slate-900 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 focus-ring group"
                >
                  <Compass size={15} className="text-emerald-700" />
                  <span>{t('landing.exploreOpportunities', 'Explore Opportunities')}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkflowSection;
