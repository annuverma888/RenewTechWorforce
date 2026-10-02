import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, CheckCircle2 } from 'lucide-react';

const FinalCTASection = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800">
          Get Started Today
        </span>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Ready to Build the Renewable Energy Workforce?
        </h2>

        <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Whether you're building your career or building your project team, RenewTech Workforce helps connect skills with opportunity.
        </p>

        {/* Dual Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/projects"
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Compass size={15} className="text-emerald-400" />
            <span>Explore Opportunities</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>100% Verified Accreditations</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Verified Skill Passports</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Zero Fake Credentials Policy</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
