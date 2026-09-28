import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EPCCompaniesSection = () => {
  const { isCompany, isAuthenticated } = useAuth();
  const [selectedTech, setSelectedTech] = useState(0);

  const matchedTechnicians = [
    {
      name: 'Rahul Kumar',
      role: 'Certified Solar PV Wireman',
      location: 'Kanpur, UP',
      exp: '4 Years Experience',
      score: 96,
      skills: ['PV Installation', 'PV Wiring', 'Inverter Installation'],
      cert: 'Solar PV Installer Level 4',
      badge: 'Immediate Mobilization',
    },
    {
      name: 'Amit Sharma',
      role: 'Solar Mounting Installer',
      location: 'Lucknow, UP',
      exp: '3 Years Experience',
      score: 91,
      skills: ['Module Clamping', 'Array Grounding', 'Torque Calibration'],
      cert: 'SCGJ Rooftop Specialist',
      badge: 'Local UP Match',
    },
    {
      name: 'Vikas Singh',
      role: 'Commissioning Electrician',
      location: 'Noida, UP',
      exp: '5 Years Experience',
      score: 87,
      skills: ['HT Switchgear', 'Transformer Testing', 'Electrical Safety'],
      cert: 'State Wireman License A',
      badge: 'Utility Park Veteran',
    },
  ];

  return (
    <section
      id="epc-companies"
      className="py-16 sm:py-24 bg-white text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            For EPC Companies
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Deploy Verified Renewable Workforce Fast
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Eliminate project commissioning delays with pre-screened, certified solar PV installers and wind technicians matched with algorithmic precision.
          </p>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Project Posting Simulation */}
          <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Sun size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">500kW Solar Installation</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={11} /> Kanpur, Uttar Pradesh
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded">
                Active Hiring
              </span>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Project Type:</span>
                <span className="font-semibold text-slate-800">Utility Solar PV Ground Mount</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Workers Needed:</span>
                <span className="font-semibold text-slate-800">5 Certified PV Technicians</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Experience Required:</span>
                <span className="font-semibold text-slate-800">2+ Years</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-500">Start Date:</span>
                <span className="font-semibold text-slate-800">15 Oct 2026</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-emerald-700">3 Top Matches</span> found in Uttar Pradesh
              </div>
              <Link
                to={isAuthenticated && isCompany ? '/epc/post-project' : '/register?role=epc_company'}
                className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold text-center transition-colors"
              >
                Post Your Project
              </Link>
            </div>
          </div>

          {/* Right: Matched Candidates List */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Recommended Technicians for This Project
            </h4>
            {matchedTechnicians.map((tech, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedTech(idx)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  selectedTech === idx
                    ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-slate-900">{tech.name}</h5>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{tech.role} • {tech.location}</p>
                    <p className="text-[11px] text-slate-500">{tech.exp} • {tech.cert}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-emerald-600">{tech.score}%</span>
                    <span className="block text-[10px] font-semibold text-slate-500">Match</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {tech.skills.map((s, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {selectedTech === idx && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-emerald-700">
                      ✓ {tech.badge}
                    </span>
                    <Link
                      to={isAuthenticated ? (isCompany ? '/epc/technicians' : '/projects') : '/login'}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <span>{isAuthenticated && isCompany ? 'Browse Candidates' : 'Sign in to Contact'}</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EPCCompaniesSection;
