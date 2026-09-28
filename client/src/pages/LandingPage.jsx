import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Compass,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import WorkflowSection from '../components/landing/WorkflowSection';
import WhyRenewTechSection from '../components/landing/WhyRenewTechSection';
import TechniciansSection from '../components/landing/TechniciansSection';
import EPCCompaniesSection from '../components/landing/EPCCompaniesSection';
import VerifiedSkillsSection from '../components/landing/VerifiedSkillsSection';
import StatisticsSection from '../components/landing/StatisticsSection';
import FinalCTASection from '../components/landing/FinalCTASection';
import heroBackgroundImg from '../assets/renewable-hero.jpg';
import OpeningExperience from '../components/landing/OpeningExperience';

const LandingPage = () => {
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
        {/* 1. HERO SECTION WITH RENEWABLE ENERGY HERO IMAGE */}
        <section className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden border-b border-slate-200 bg-slate-900">
          {/* Full Hero Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroBackgroundImg}
              alt="RenewTech Clean Energy Network & Skilled Workforce"
              className="w-full h-full object-cover object-[75%_center] sm:object-[center_right] lg:object-right select-none opacity-90"
              loading="eager"
              fetchPriority="high"
            />
            {/* Left Clean Light Gradient Overlay so Text Remains Highly Readable */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 via-50% to-white/30 sm:bg-gradient-to-r sm:from-white sm:via-white/95 sm:via-55% md:via-white/90 md:via-60% sm:to-transparent pointer-events-none" />
            {/* Soft Bottom Fade */}
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none" />
          </div>

          {/* Hero Content Container - Positioned on the Left */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
            <div className="max-w-2xl text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-semibold mb-6 shadow-2xs max-w-full leading-tight">
                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                <span className="truncate sm:whitespace-normal">Connecting Verified Renewable Energy Talent with EPC Projects</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Powering Renewable Projects with{' '}
                <span className="text-emerald-600 block sm:inline">Verified Skilled Talent</span>
              </h1>

              {/* Short supporting description */}
              <p className="mt-5 text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                Connect certified solar and wind technicians with renewable-energy EPC projects based on skills, experience, certification, location, and availability.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  to={isAuthenticated && isCompany ? '/epc/post-project' : '/register?role=epc_company'}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span>Find Skilled Talent</span>
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/projects"
                  className="px-6 py-3.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl text-sm font-semibold border border-slate-300 shadow-2xs hover:border-slate-400 transition-all flex items-center justify-center gap-2"
                >
                  <Compass size={16} className="text-slate-500" />
                  <span>Find Projects</span>
                </Link>
              </div>

              {/* Micro Stats Banner */}
              <div className="mt-10 pt-6 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                <div className="p-1 text-left sm:text-center">
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">100%</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium leading-tight">Verified Accreditations</div>
                </div>
                <div className="p-1 text-left sm:text-center">
                  <div className="text-2xl font-extrabold text-emerald-600 font-mono">96.8%</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium leading-tight">Match Accuracy</div>
                </div>
                <div className="p-1 text-left sm:text-center">
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">10K+</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium leading-tight">Solar & Wind Techs</div>
                </div>
                <div className="p-1 text-left sm:text-center">
                  <div className="text-2xl font-extrabold text-slate-900 font-mono">Zero</div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-medium leading-tight">Fake Credentials Policy</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PLATFORM STATISTICS (Section 4.A) */}
        <StatisticsSection />

        {/* 3. HOW IT WORKS (Section 4.B) */}
        <WorkflowSection />

        {/* 4. WHY RENEWTECH WORKFORCE (Section 4.C) */}
        <WhyRenewTechSection />

        {/* 5. FOR TECHNICIANS (Section 4.D) */}
        <TechniciansSection />

        {/* 6. FOR EPC COMPANIES (Section 4.E) */}
        <EPCCompaniesSection />

        {/* 7. VERIFIED SKILLS AUDIT DEEP-DIVE */}
        <VerifiedSkillsSection />

        {/* 8. FINAL CTA (Section 4.F) */}
        <FinalCTASection />
      </main>

      <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
