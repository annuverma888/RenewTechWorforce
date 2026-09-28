import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FinalCTASection = () => {
  const { isCompany, isTechnician, isAuthenticated } = useAuth();

  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800">
          Get Started Today
        </span>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Build the Renewable Workforce of Tomorrow
        </h2>

        <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join thousands of certified solar wiremen, wind turbine specialists, and leading renewable EPC contractors accelerating clean energy deployment.
        </p>

        {/* Dual Action CTAs matching Section 4.F */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/projects"
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>Find Projects</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to={isAuthenticated && isCompany ? '/epc/post-project' : '/register?role=epc_company'}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Find Skilled Talent</span>
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
            <span>Algorithmic Match Scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Digital Skill Passports</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
