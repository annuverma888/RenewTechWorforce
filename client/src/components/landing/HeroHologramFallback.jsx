import React from 'react';
import {
  Sun,
  Wind,
  ShieldCheck,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const HeroHologramFallback = () => {
  return (
    <div className="relative w-full h-[440px] sm:h-[540px] flex items-center justify-center overflow-hidden px-3">
      {/* Radial glow background */}
      <div className="absolute w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Orbit Rings */}
      <div className="absolute w-56 sm:w-80 h-56 sm:h-80 rounded-full border border-emerald-500/30 animate-[spin_24s_linear_infinite]" />
      <div className="absolute w-72 sm:w-[420px] h-72 sm:h-[420px] rounded-full border border-teal-500/20 animate-[spin_36s_linear_infinite_reverse]" />
      <div className="hidden sm:block absolute w-[520px] h-[520px] rounded-full border border-slate-700/40 border-dashed" />

      {/* Central Core */}
      <div className="relative z-10 w-28 sm:w-36 h-28 sm:h-36 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-1 shadow-[0_0_50px_rgba(16,185,129,0.4)] flex items-center justify-center animate-pulse">
        <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center p-2 sm:p-3">
          <Sparkles className="text-emerald-400 mb-1" size={20} />
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
            Skill Core
          </span>
          <span className="text-[8px] sm:text-[9px] text-slate-400">AI Intelligence</span>
        </div>
      </div>

      {/* Floating Satellites (Responsive positions) */}
      <div className="absolute top-6 sm:top-12 left-2 sm:left-24 bg-slate-900/90 border border-emerald-500/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce [animation-duration:5s] max-w-[160px] sm:max-w-none">
        <div className="w-7 h-7 sm:w-8 h-8 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Sun size={15} />
        </div>
        <div>
          <span className="block text-[11px] sm:text-xs font-bold text-white leading-tight">Solar PV Array</span>
          <span className="block text-[9px] sm:text-[10px] text-emerald-400">500kW Utility</span>
        </div>
      </div>

      <div className="absolute top-8 sm:top-14 right-2 sm:right-24 bg-slate-900/90 border border-sky-500/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 animate-bounce [animation-duration:6s] max-w-[160px] sm:max-w-none">
        <div className="w-7 h-7 sm:w-8 h-8 rounded-lg sm:rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
          <Wind size={15} />
        </div>
        <div>
          <span className="block text-[11px] sm:text-xs font-bold text-white leading-tight">Wind Turbine</span>
          <span className="block text-[9px] sm:text-[10px] text-sky-400">GWO Crew</span>
        </div>
      </div>

      <div className="absolute bottom-6 sm:bottom-12 left-2 sm:left-20 bg-slate-900/90 border border-teal-500/40 p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 max-w-[160px] sm:max-w-none">
        <div className="w-7 h-7 sm:w-8 h-8 rounded-lg sm:rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
          <UserCheck size={15} />
        </div>
        <div>
          <span className="block text-[11px] sm:text-xs font-bold text-white leading-tight">Rahul Kumar</span>
          <span className="block text-[9px] sm:text-[10px] text-teal-300">96% Smart Match</span>
        </div>
      </div>

      <div className="hidden sm:flex absolute bottom-12 right-20 bg-slate-900/90 border border-amber-500/40 p-3 rounded-2xl shadow-xl backdrop-blur-md items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <span className="block text-xs font-bold text-white">Digital Skill Passport</span>
          <span className="block text-[10px] text-amber-300">Level 4 Verified</span>
        </div>
      </div>
    </div>
  );
};

export default HeroHologramFallback;
