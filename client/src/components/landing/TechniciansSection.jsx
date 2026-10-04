import React from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Award,
  Search,
  Send,
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TechniciansSection = () => {
  const { isTechnician, isAuthenticated } = useAuth();

  const benefits = [
    {
      title: 'Build Professional Profile',
      desc: 'Create a comprehensive technical resume showcasing your renewable-energy expertise, field specializations, and regional mobility.',
      icon: User,
    },
    {
      title: 'Add Skills & Certifications',
      desc: 'Record verified qualifications in Solar PV DC stringing, wind turbine hydraulics, electrical wiring, and high-voltage safety.',
      icon: Award,
    },
    {
      title: 'Take Assessments & Verify Skills',
      desc: 'Complete standardized technical evaluations to earn verified credentials displayed directly on your public Skill Passport.',
      icon: ShieldCheck,
    },
    {
      title: 'Discover Renewable Projects',
      desc: 'Explore active utility-scale solar farms, rooftop arrays, and wind projects looking for your exact skills and experience.',
      icon: Search,
    },
    {
      title: 'Apply & Track Applications',
      desc: 'Apply directly to project postings with one click and track the status of your applications from submission to selection.',
      icon: Send,
    },
  ];

  return (
    <section
      id="technicians"
      className="py-16 sm:py-24 bg-white text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            For Technicians
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Build Your Career in Renewable Energy
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Build your professional profile, verify your skills, discover renewable-energy projects, and get hired.
          </p>
        </div>

        {/* 5 Capability Cards Grid + CTA Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50/80 p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-white shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} className="shrink-0" />
                  <span>Supported Capability</span>
                </div>
              </div>
            );
          })}

          {/* Action Card to fill the 6th slot cleanly */}
          <div className="bg-emerald-800 text-white p-6 sm:p-7 rounded-2xl flex flex-col justify-between shadow-xs">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-200 bg-emerald-700/60 px-2.5 py-0.5 rounded">
                Technician Hub
              </span>
              <h3 className="text-lg sm:text-xl font-bold mt-3 leading-snug">
                Ready to find verified opportunities?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                Build your profile, complete your skills assessment, and discover active solar and wind projects across India.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-700/60">
              <Link
                to={isAuthenticated && isTechnician ? '/technician/dashboard' : '/projects'}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-emerald-50 text-slate-900 font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-2xs focus-ring"
              >
                <Compass size={15} className="text-emerald-700" />
                <span>Explore Opportunities</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechniciansSection;
