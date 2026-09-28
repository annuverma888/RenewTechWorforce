import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  FileCheck,
  Award,
  Compass,
  Briefcase,
  History,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TechniciansSection = () => {
  const { isTechnician, isAuthenticated } = useAuth();

  const features = [
    {
      title: 'Build Professional Profile',
      desc: 'Showcase specialized competencies in Solar PV DC stringing, inverter commissioning, Wind turbine hydraulics, and site mobilization radius.',
      icon: UserCheck,
    },
    {
      title: 'Verify Certifications',
      desc: 'Submit SCGJ, NSDC Level 4, GWO Working at Heights, and State Electrical wireman accreditations for rapid digital verification.',
      icon: FileCheck,
    },
    {
      title: 'Take Skill Assessments',
      desc: 'Test your practical and theoretical mastery with timed standardized exams designed by industry experts with instant scoring.',
      icon: Award,
    },
    {
      title: 'Find Relevant Projects',
      desc: 'Receive algorithmic recommendations matching your verified skills, experience level, location proximity, and wage criteria.',
      icon: Compass,
    },
    {
      title: 'Apply & Get Hired',
      desc: 'Apply in one click directly to leading EPC contractors with transparent daily/monthly rates, mobilization support, and guaranteed terms.',
      icon: Briefcase,
    },
    {
      title: 'Track Work History',
      desc: 'Maintain a verifiable log of commissioned megawatts, utility project milestones, safety compliance records, and contractor reviews.',
      icon: History,
    },
  ];

  return (
    <section
      id="technicians"
      className="py-16 sm:py-24 bg-slate-50 text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
            For Technicians
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Build Your Clean Energy Career
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Get verified, earn digital skill credentials, and connect directly with top solar and wind EPC companies across India.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-300 shadow-xs transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} />
                  <span>Standardized Credential</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-12 bg-white rounded-xl p-6 sm:p-8 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold text-slate-900">
              Ready to verify your renewable skills?
            </h4>
            <p className="text-xs sm:text-sm text-slate-600">
              Create your profile, upload certifications, and receive recommended EPC projects immediately.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={isAuthenticated && isTechnician ? '/technician/dashboard' : '/register?role=technician'}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <span>{isAuthenticated && isTechnician ? 'Open Dashboard' : 'Join as Technician'}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechniciansSection;
