import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode,
  ShieldCheck,
  UserCheck,
  Award,
  History,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const VerifiedSkillsSection = () => {
  const passportStages = [
    {
      step: '01',
      title: 'Identity',
      desc: 'Government ID & background verification linked to a unique workforce registry ID.',
      icon: UserCheck,
    },
    {
      step: '02',
      title: 'Skills',
      desc: 'Evaluated competency scores across electrical, mechanical, and safety disciplines.',
      icon: Award,
    },
    {
      step: '03',
      title: 'Certifications',
      desc: 'Validated accreditations from SCGJ, NSDC Level 4, GWO BST, and State Wireman boards.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Experience',
      desc: 'Audited log of commissioned solar MW, wind site hours, and EPC contractor ratings.',
      icon: History,
    },
    {
      step: '05',
      title: 'QR Verification',
      desc: 'Instant cryptographic on-site verification via any smartphone camera or QR scanner.',
      icon: QrCode,
    },
  ];

  return (
    <section
      id="verified-skills"
      className="py-16 sm:py-24 bg-slate-50 text-slate-900 scroll-mt-[70px] border-b border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
            Digital Skill Passport
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            One Passport. Verified Skills. Trusted Workforce.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            A single, immutable digital credential carrying audited competencies, accredited licenses, and instant QR verification for every clean energy technician.
          </p>
        </div>

        {/* 5-Stage Flow Banner: Identity → Skills → Certifications → Experience → QR Verification */}
        <div className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {passportStages.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all relative"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {stage.step}
                    </span>
                    <Icon size={18} className="text-emerald-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{stage.title}</h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Skill Passport Interactive Display & Public Verification CTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Passport Credential Summary */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tamper-Evident Digital Credential
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Standardized Across Indian Renewable Projects
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Eliminate resume fraud and uncertified workers on high-voltage solar farms and wind installations. RenewTech Skill Passports are issued once, verified continuously, and recognized by premier EPC contractors.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Government Council Alignment (SCGJ)</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Real-time QR Code Verification</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Audited Field Safety Compliance</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Verifiable Megawatt Track Record</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/verify/skill-passport"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-2xs"
                >
                  <QrCode size={16} />
                  <span>Verify a Skill Passport</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: Mock Passport Visual Card */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-xs text-white">
                    RT
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white leading-none">RenewTech Skill Passport</h5>
                    <span className="text-[10px] text-emerald-400 font-mono">REG-IN-2026-8842</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Active Verified
                </span>
              </div>

              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Rahul Kumar</h4>
                    <p className="text-[11px] text-slate-400">Senior Solar PV Wireman • Level 4</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-mono font-black text-emerald-400">92%</span>
                    <span className="block text-[9px] text-slate-400 uppercase">Skill Score</span>
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 space-y-2 text-[11px]">
                  <div className="flex justify-between text-slate-300">
                    <span>Solar Installation:</span>
                    <span className="font-mono text-emerald-400 font-bold">92%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>PV DC Wiring:</span>
                    <span className="font-mono text-emerald-400 font-bold">88%</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Electrical Safety (LOTO):</span>
                    <span className="font-mono text-emerald-400 font-bold">95%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <QrCode size={14} />
                  <span>Public QR Verification</span>
                </div>
                <Link
                  to="/verify/skill-passport"
                  className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                >
                  Verify Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifiedSkillsSection;
