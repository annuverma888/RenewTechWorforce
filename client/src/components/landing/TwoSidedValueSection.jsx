import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Building2,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TwoSidedValueSection = () => {
  const { isAuthenticated, isCompany, isTechnician } = useAuth();

  const technicianCapabilities = [
    'Create professional profile',
    'Add skills',
    'Add certifications',
    'Take assessments',
    'Get eligible skills verified',
    'Get Skill Passport',
    'Discover projects',
    'Apply to projects',
    'Track applications',
  ];

  const epcCapabilities = [
    'Create company profile',
    'Post projects',
    'Search technicians',
    'View technician profiles',
    'Match technicians to projects',
    'Review applications',
    'Hire technicians',
    'Manage workforce',
  ];

  return (
    <section id="who-is-it-for" className="py-16 sm:py-24 bg-white text-slate-900 border-b border-slate-200 scroll-mt-[70px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Two-Sided Platform
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Who Is RenewTech Workforce For?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            A dedicated platform bridging verified renewable-energy talent with trusted EPC companies and project contractors.
          </p>
        </div>

        {/* Two Clear Columns / Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: TECHNICIANS */}
          <div className="bg-slate-50/90 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                  <Wrench size={24} />
                </div>
                <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Technicians
                </span>
              </div>

              {/* Tagline / Path */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Build → Verify → Discover → Apply
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  For Renewable Energy Technicians
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Build your professional profile, verify your skills, discover renewable-energy projects, and get hired.
                </p>
              </div>

              {/* Supported Capabilities List */}
              <div className="pt-2 border-t border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Supported Capabilities:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  {technicianCapabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link
                to="/projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all focus-ring"
              >
                <Compass size={16} />
                <span>Explore Opportunities</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Card 2: EPC COMPANIES */}
          <div className="bg-slate-50/90 rounded-3xl p-6 sm:p-8 lg:p-10 border border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-6">
              {/* Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-2xs">
                  <Building2 size={24} />
                </div>
                <span className="text-xs font-bold font-mono text-slate-800 bg-slate-200/80 px-3 py-1 rounded-full border border-slate-300">
                  EPC Companies
                </span>
              </div>

              {/* Tagline / Path */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Post → Match → Review → Hire → Manage
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  For EPC Companies & Contractors
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Find skilled renewable-energy technicians, match them to projects, review candidates, hire faster, and manage your workforce.
                </p>
              </div>

              {/* Supported Capabilities List */}
              <div className="pt-2 border-t border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Supported Capabilities:
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                  {epcCapabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <Link
                to={isAuthenticated && isCompany ? '/epc/technicians' : '/register?role=epc_company'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all focus-ring"
              >
                <Briefcase size={16} className="text-emerald-400" />
                <span>Find Skilled Technicians</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoSidedValueSection;
