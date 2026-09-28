import React from 'react';
import { Sun, Wind, CheckCircle2, Zap } from 'lucide-react';

const SolarWindEcosystemSection = () => {
  return (
    <section className="py-16 sm:py-24 bg-slate-50 text-slate-900 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
            Solar & Wind Specialization
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            One Platform. Dual Clean Energy Domains.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Tailored specifically for utility and commercial Solar PV parks and high-altitude Wind Turbine generation assets.
          </p>
        </div>

        {/* Split Grid: Solar and Wind */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Solar Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Sun size={24} />
                </div>
                <span className="text-xs font-bold uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                  Solar PV Domain
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Solar Photovoltaic Ecosystem
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                From distributed commercial rooftops to 500MW utility parks. Deploy certified wiremen, inverter specialists, and O&M crews with verified string testing credentials.
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  { title: 'PV Installation', desc: 'Racking assembly, tracker calibration, module clamping' },
                  { title: 'PV Wiring', desc: 'DC stringing, combiner boxes, cable trenching, MC4 crimping' },
                  { title: 'Solar O&M', desc: 'Infrared thermography, I-V curve tracing, preventive repair' },
                  { title: 'Inverter Installation', desc: 'Central & string inverter grid sync, LOTO isolation' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                      <span className="text-[11px] text-slate-500 block">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Wind Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Wind size={24} />
                </div>
                <span className="text-xs font-bold uppercase text-sky-700 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                  Wind Turbine Domain
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Wind Energy Ecosystem
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                High-altitude tower climbing and nacelle operations. Deploy certified GWO technicians experienced in hydraulic yaw systems, torque checks, and blade maintenance.
              </p>

              <div className="mt-6 space-y-2.5">
                {[
                  { title: 'Tower Climbing & Safety', desc: 'GWO BST working at heights, fall arrest system protocols' },
                  { title: 'Turbine Maintenance', desc: 'Gearbox lube sampling, hydraulic brake inspection, yaw drive service' },
                  { title: 'Blade Inspection', desc: 'Leading edge erosion detection, aerodynamic gelcoat repair' },
                  { title: 'Wind Turbine Installation', desc: 'Heavy-lift mechanical assembly, generator alignment' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">{item.title}</span>
                      <span className="text-[11px] text-slate-500 block">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolarWindEcosystemSection;
