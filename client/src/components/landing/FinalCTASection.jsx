import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Users, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FinalCTASection = () => {
  const { isAuthenticated, isCompany } = useAuth();

  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800">
          Get Started Today
        </span>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Connecting Renewable Energy Talent with the Right Projects
        </h2>

        <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Technicians build verified profiles and find opportunities. EPC companies discover skilled workers and build project-ready teams.
        </p>

        {/* Dual Action CTAs: Find Opportunities & Hire Skilled Technicians */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            to="/projects"
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 focus-ring"
          >
            <Compass size={16} />
            <span>Find Opportunities</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
            className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 focus-ring"
          >
            <Users size={16} className="text-emerald-400" />
            <span>Hire Skilled Technicians</span>
          </Link>
        </div>

        {/* Real Trust Badges */}
        <div className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Standardized Technical Profiles</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Digital Skill Passports</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Direct Project Mobilization</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
