import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  QrCode,
  ShieldCheck,
  UserCheck,
  Award,
  History,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const VerifiedSkillsSection = () => {
  const { t } = useTranslation();

  const passportComponents = [
    {
      title: t('landing.passportStep1Title', 'Overview'),
      desc: t('landing.passportStep1Desc', 'View technician experience and professional details.'),
      icon: UserCheck,
    },
    {
      title: t('landing.passportStep2Title', 'Verified Skills & Competencies'),
      desc: t('landing.passportStep2Desc', 'Review assessed technical skills.'),
      icon: Award,
    },
    {
      title: t('landing.passportStep3Title', 'Audited Certifications'),
      desc: t('landing.passportStep3Desc', 'Review certification and verification status.'),
      icon: ShieldCheck,
    },
    {
      title: t('landing.passportStep4Title', 'Project Experience'),
      desc: t('landing.passportStep4Desc', 'See relevant renewable-energy project history.'),
      icon: History,
    },
    {
      title: t('landing.passportStep5Title', 'Public QR Verification'),
      desc: t('landing.passportStep5Desc', 'Scan unique QR code to view live verification status.'),
      icon: QrCode,
    },
  ];

  const verificationBenefits = [
    t('landing.benefitStandardizedSkills', 'Standardized Skill Competencies'),
    t('landing.benefitPublicQr', 'Public QR Verification Available'),
    t('landing.benefitFieldAssessments', 'Documented Field Assessments'),
    t('landing.benefitVerificationBadges', 'Transparent Verification Badges'),
  ];

  return (
    <section
      id="verified-skills"
      className="py-10 sm:py-16 lg:py-20 bg-white text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section 1 Header */}
        <div className="text-center max-w-2xl sm:max-w-3xl mx-auto mb-5 sm:mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('landing.trustBadge', 'Trust & Verification')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            {t('skillPassport.title', 'Digital Skill Passport')}
          </h2>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-2.5 leading-relaxed max-w-xl mx-auto">
            {t(
              'landing.skillPassportDesc',
              'Share verified skills, certifications, and project experience through one digital passport.'
            )}
          </p>
        </div>

        {/* Section 1: Single Shared Container for Passport Categories */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs overflow-hidden mb-8 sm:mb-12">
          <div className="divide-y divide-slate-100">
            {passportComponents.map((item, idx) => {
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

        {/* Section 2: Transparent Skill Credentials at a Glance */}
        <div className="max-w-5xl lg:max-w-6xl mx-auto w-full min-w-0 bg-slate-50/90 rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-7 lg:p-9 shadow-2xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center w-full min-w-0">
            {/* Left: Credential Summary & Verification Benefits */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5 w-full min-w-0">
              <div className="w-full min-w-0">
                <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-200">
                  {t('landing.transparentSkillEyebrow', 'TRANSPARENT SKILL TRANSPARENCY')}
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5 leading-snug">
                  {t('landing.verifiedCredentialsHeading', 'Verified Technical Credentials at a Glance')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xl">
                  {t(
                    'landing.verifiedCredentialsDesc',
                    'Help EPC companies review technician credentials and verify eligible Skill Passports through public QR verification.'
                  )}
                </p>
              </div>

              {/* Single Shared Container for Verification Benefits */}
              <div className="w-full min-w-0 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white divide-y divide-slate-100 overflow-hidden shadow-2xs">
                {verificationBenefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/90">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug min-w-0 flex-1">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Public QR Verification CTA */}
              <div className="pt-0.5 sm:pt-1 w-full min-w-0">
                <Link
                  to="/verify/skill-passport"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs hover:shadow focus-ring group"
                >
                  <QrCode size={16} className="shrink-0" />
                  <span>{t('landing.verifyPassportCta', 'Verify Any Skill Passport')}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                </Link>
              </div>
            </div>

            {/* Right: Skill Passport Preview Card */}
            <div className="lg:col-span-5 w-full min-w-0 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col justify-between">
              {/* Header */}
              <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs">
                    RT
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                      RenewTech Skill Passport
                    </h5>
                    <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                      REG-IN-2026-8842
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800/80 shrink-0">
                  {t('landing.passportIssuedBadge', 'Passport Issued')}
                </span>
              </div>

              {/* Technician Details & Skill Score */}
              <div className="py-3 sm:py-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug truncate">
                    Rahul Kumar
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 leading-tight truncate">
                    Solar PV Wireman • Level 4
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 leading-none block">
                    92%
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                    {t('landing.skillScoreLabel', 'Skill Score')}
                  </span>
                </div>
              </div>

              {/* Simplified Verified Skills Panel */}
              <div className="bg-slate-800/60 rounded-xl border border-slate-700/60 divide-y divide-slate-700/50 overflow-hidden">
                {[
                  { name: 'Solar Installation', score: '92%', verified: true },
                  { name: 'PV DC Wiring', score: '88%', verified: true },
                  { name: 'Electrical Safety (LOTO)', score: '95%', verified: true },
                ].map((skill, sIdx) => (
                  <div
                    key={sIdx}
                    className="px-3 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 text-[11px] sm:text-xs"
                  >
                    <span className="text-slate-200 font-medium truncate min-w-0 flex-1">
                      {skill.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-slate-200 font-bold">
                        {skill.score}
                      </span>
                      {skill.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/60">
                          <CheckCircle2 size={10} className="shrink-0 text-emerald-400" />
                          <span>{t('common.verified', 'Verified')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fixed Public Verification Footer */}
              <div className="mt-3.5 sm:mt-4 pt-3 pb-0.5 border-t border-slate-800/80 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <QrCode size={14} className="text-emerald-400 shrink-0" />
                  <span>{t('landing.publicVerification', 'Public Verification')}</span>
                </div>
                <Link
                  to="/verify/skill-passport"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors py-1"
                >
                  <span>{t('landing.verifyOnline', 'Verify Online')}</span>
                  <ArrowRight size={12} className="shrink-0" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifiedSkillsSection;
