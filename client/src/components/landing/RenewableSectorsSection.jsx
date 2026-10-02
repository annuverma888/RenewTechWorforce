import React from 'react';
import { Sun, Wind, BatteryCharging, Zap, Layers } from 'lucide-react';

const sectors = [
  {
    name: 'Solar',
    label: 'Utility & Rooftop Solar',
    desc: 'DC array stringing, inverter commissioning, mounting structures, and SCADA monitoring.',
    icon: Sun,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
  },
  {
    name: 'Wind',
    label: 'Onshore Wind Turbines',
    desc: 'Tower wiring, nacelle mechanicals, pitch hydraulics, and GWO Working at Heights safety.',
    icon: Wind,
    color: 'text-sky-600 bg-sky-50 border-sky-200',
  },
  {
    name: 'Battery Energy Storage',
    label: 'BESS Installations',
    desc: 'Lithium container staging, BMS telemetry integration, thermal management, and DC busbars.',
    icon: BatteryCharging,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  },
  {
    name: 'Substation / Electrical',
    label: 'High Voltage Switchgear',
    desc: 'Step-up transformers, HT switchyards, relay protection, earthing grid, and grid tie-in.',
    icon: Zap,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  },
  {
    name: 'Renewable Infrastructure',
    label: 'Power Transmission & Microgrids',
    desc: 'Transmission corridors, civil foundations, site logistics, and green microgrid networks.',
    icon: Layers,
    color: 'text-teal-600 bg-teal-50 border-teal-200',
  },
];

const RenewableSectorsSection = () => {
  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Sectors Covered
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2.5 tracking-tight">
            Renewable Energy Sectors We Mobilize
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Standardized technical workforce credentials across core clean energy verticals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {sectors.map((sec, idx) => {
            const Icon = sec.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 hover:bg-white transition-all shadow-2xs hover:shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 border ${sec.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{sec.name}</h3>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{sec.label}</div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RenewableSectorsSection;
