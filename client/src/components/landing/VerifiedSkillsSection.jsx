import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  FileCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VerifiedSkillsSection = () => {
  const { isTechnician, isAuthenticated } = useAuth();

  const certificates = [
    {
      title: 'Solar PV Installer (Level 4)',
      issuer: 'Skill Council for Green Jobs (SCGJ)',
      date: 'Valid through 2027',
      badge: 'Verified',
    },
    {
      title: 'Electrical Safety (LOTO Protocol)',
      issuer: 'National Safety Council Accredited',
      date: 'Verified 2026',
      badge: 'Verified',
    },
    {
      title: 'Solar O&M & Thermography',
      issuer: 'National Institute of Solar Energy (NISE)',
      date: 'Audited 2026',
      badge: 'Verified',
    },
    {
      title: 'Wind Turbine Safety (GWO BST)',
      issuer: 'Global Wind Organisation Standard',
      date: 'Certified 2026',
      badge: 'Verified',
    },
  ];

  const skillScores = [
    { skill: 'Solar Installation', score: 92 },
    { skill: 'PV Wiring', score: 88 },
    { skill: 'Electrical Safety', score: 95 },
    { skill: 'Inverter Installation', score: 81 },
  ];

  return (
    <section
      id="verified-skills"
      className="py-16 sm:py-24 bg-white text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Verified Skills
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Cryptographically & Admin Audited Credentials
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Every technician credential undergoes automated validation and expert administrator review to eliminate fraudulent claims on renewable work sites.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Skill Scores Breakdown */}
          <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Sample Evaluated Talent
                </span>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                  Rahul Kumar <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">✓ Verified</span>
                </h3>
                <p className="text-xs text-slate-500">Solar Technician • Overall Skill Score: 87%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                87%
              </div>
            </div>

            <div className="space-y-4">
              {skillScores.map((s, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{s.skill}</span>
                    <span className="text-emerald-700 font-bold">{s.score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${s.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Tested across 4 technical domains
              </span>
              <Link
                to={isAuthenticated && isTechnician ? '/technician/passport' : '/register?role=technician'}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>View Digital Skill Passport</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right Column: Verified Certificates */}
          <div className="lg:col-span-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Recognized Government & Industry Certifications
            </h4>

            {certificates.map((cert, idx) => (
              <div
                key={idx}
                className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 leading-snug">{cert.title}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{cert.issuer}</p>
                    <span className="text-[11px] text-slate-400 mt-0.5 block">{cert.date}</span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 shrink-0 self-start sm:self-center">
                  {cert.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifiedSkillsSection;
