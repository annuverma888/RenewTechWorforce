import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import TwoSidedValueSection from '../components/landing/TwoSidedValueSection';
import WorkflowSection from '../components/landing/WorkflowSection';
import TechniciansSection from '../components/landing/TechniciansSection';
import EPCCompaniesSection from '../components/landing/EPCCompaniesSection';
import VerifiedSkillsSection from '../components/landing/VerifiedSkillsSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import heroImg from '../assets/renewable-hero.jpg';
import OpeningExperience from '../components/landing/OpeningExperience';

const LandingPage = () => {
  const { t } = useTranslation();
  const { isCompany, isAuthenticated } = useAuth();

  // Intro State: 'active' (intro running, homepage hidden) | 'transitioning' (smooth cross-fade) | 'ended' (unmounted, normal page)
  const [introState, setIntroState] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('intro') === 'true') return 'active';
      const hasSeen = sessionStorage.getItem('renewtech_intro_seen') || sessionStorage.getItem('introShown');
      return hasSeen ? 'ended' : 'active';
    }
    return 'active';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('intro-active', introState === 'active' || introState === 'transitioning');
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('intro-active');
      }
    };
  }, [introState]);

  const handleTransitionStart = () => {
    setIntroState('transitioning');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('renewtech_intro_seen', 'true');
      sessionStorage.setItem('introShown', 'true');
    }
  };

  const handleIntroComplete = () => {
    setIntroState('ended');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('renewtech_intro_seen', 'true');
      sessionStorage.setItem('introShown', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-x-hidden">
      {/* 1. CINEMATIC FULL-SCREEN RENEWABLE ENERGY INTRO */}
      {introState !== 'ended' && (
        <OpeningExperience
          onTransitionStart={handleTransitionStart}
          onComplete={handleIntroComplete}
        />
      )}

      {/* 2. HOMEPAGE: SMOOTH CROSS-FADE TRANSITION ONCE INTRO COMPLETES */}
      <div
        id="homepage"
        className={`flex-col flex-1 w-full ${
          introState === 'active'
            ? 'homepage-hidden'
            : introState === 'transitioning'
            ? 'homepage-transitioning'
            : 'homepage-visible'
        }`}
      >
        <Navbar />

        <main className="flex-1 w-full">
          {/* 1. HERO SECTION */}
          <section className="relative w-full bg-white border-b border-slate-200 overflow-hidden">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-18">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
                {/* LEFT COLUMN: Hero text and CTAs */}
                <div className="lg:col-span-7 text-left space-y-4 sm:space-y-6">
                  {/* Small renewable-energy badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{t('landing.badge', 'RenewTech Workforce v4.0')}</span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.18] sm:leading-[1.12]">
                    {t('landing.heroHeading', 'Connecting Renewable Energy Talent with the Right Projects')}
                  </h1>

                  {/* Supporting Description */}
                  <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl">
                    {t('landing.heroSubtitle', 'Technicians build verified profiles and find opportunities. EPC companies discover skilled workers and build project-ready teams.')}
                  </p>

                  {/* Primary & Secondary CTAs with Strengthened EPC CTA */}
                  <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5">
                    {/* EPC Hiring CTA - High Authority Slate-900 with Emerald Accent & Badge */}
                    <Link
                      to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
                      className="px-6 py-3.5 min-h-[46px] bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 focus-ring border border-slate-900 group"
                    >
                      <Building2 size={17} className="text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                      <span>{t('landing.findTalentCta', 'Hire Skilled Technicians')}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/90 border border-emerald-800/80 px-2 py-0.5 rounded-md ml-0.5">
                        EPC
                      </span>
                      <ArrowRight size={15} className="text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>

                    {/* Technician Opportunities CTA */}
                    <Link
                      to="/projects"
                      className="px-6 py-3.5 min-h-[46px] bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus-ring group"
                    >
                      <Compass size={17} className="group-hover:rotate-45 transition-transform shrink-0" />
                      <span>{t('landing.findWorkCta', 'Find Opportunities')}</span>
                      <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </Link>
                  </div>

                  {/* Micro trust cues */}
                  <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] sm:text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{t('skillPassport.verifiedCompetencies', 'Standardized Technical Skills')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{t('navigation.skillPassport', 'QR-Verified Skill Passports')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                      <span>{t('landing.step3Title', 'Direct Project Mobilization')}</span>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Clean modern image container */}
                <div className="lg:col-span-5 relative mt-2 lg:mt-0">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900 group">
                    <img
                      src={heroImg}
                      alt="Renewable energy field operations - solar and wind technicians"
                      className="w-full h-[220px] sm:h-[320px] lg:h-[400px] object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
                      loading="eager"
                      fetchPriority="high"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/95 backdrop-blur-sm p-3 sm:p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-[11px] sm:text-xs">Verified Field Workforce</div>
                          <div className="text-[10px] sm:text-[11px] text-slate-500">Solar PV, Wind & Substation Specialists</div>
                        </div>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Verified Credentials
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. WHO IS IT FOR? (Two-Sided Value Section) */}
          <TwoSidedValueSection />

          {/* 3. HOW IT WORKS (Simple Two-Sided Workflow: EPC & Technician Journeys) */}
          <WorkflowSection />

          {/* 4. TECHNICIAN BENEFITS (Build profile, verify skills, find opportunities) */}
          <TechniciansSection />

          {/* 5. EPC BENEFITS (Find, match, review, hire and manage) */}
          <EPCCompaniesSection />

          {/* 6. SKILL PASSPORT / TRUST (Verified professional information and public QR verification) */}
          <VerifiedSkillsSection />

          {/* 7. FINAL CTA (Two clear actions: Find Opportunities, Hire Skilled Technicians) */}
          <FinalCTASection />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
