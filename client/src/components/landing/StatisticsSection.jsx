import React, { useState, useEffect, useRef } from 'react';
import { Users, Building2, Briefcase, CheckCircle2, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, target, suffix = '+', label, subtext, color = '#059669' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let started = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const duration = 1200;
          const steps = 30;
          const stepTime = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOutProgress * target));

            if (currentStep >= steps) {
              setCount(target);
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [target]);

  return (
    <div
      ref={ref}
      className="p-6 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Verified
        </span>
      </div>

      <div>
        <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
          {count.toLocaleString()}
          <span className="text-emerald-600">{suffix}</span>
        </div>
        <h4 className="text-sm font-bold text-slate-800 mt-1">{label}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{subtext}</p>
      </div>
    </div>
  );
};

const StatisticsSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Platform Statistics
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Powering Renewable Infrastructure at Scale
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Real-time platform activity across utility-scale solar arrays and wind power generation assets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            target={10000}
            suffix="+"
            label="Verified Technicians"
            subtext="SCGJ, GWO & Wireman Certified"
          />
          <StatCard
            icon={Briefcase}
            target={500}
            suffix="+"
            label="Renewable Projects"
            subtext="Solar PV & Wind Farm Sites"
          />
          <StatCard
            icon={Building2}
            target={150}
            suffix="+"
            label="EPC Partners"
            subtext="Utility Developers & Contractors"
          />
          <StatCard
            icon={CheckCircle2}
            target={85}
            suffix="%"
            label="Successful Matching"
            subtext="Algorithmic Match Accuracy"
          />
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
