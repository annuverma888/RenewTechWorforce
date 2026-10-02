import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sun,
  Wind,
  CheckCircle2,
  ExternalLink,
  X,
} from 'lucide-react';

const Footer = () => {
  const [activeInfoModal, setActiveInfoModal] = useState(null);

  const handleInfoClick = (e, title, description) => {
    e.preventDefault();
    setActiveInfoModal({ title, description });
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      {/* Main Footer Container */}
      <div className="renew-container pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          {/* COLUMN 1: Brand & Mission */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 group focus-ring rounded-xl"
              aria-label="RenewTech Workforce Home"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-2xs">
                <Zap size={17} className="fill-white text-white" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                RenewTech <span className="text-emerald-400 font-extrabold">Workforce</span>
              </span>
            </Link>

            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              Building a verified and connected workforce for the renewable energy industry. Empowering utility solar, wind farms, and clean tech developers with competency-tested technicians.
            </p>

            {/* Trust Seal */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-[11px] text-emerald-300 font-semibold shadow-inner">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span>Verified Skills • Verified Workforce</span>
            </div>

            {/* Clean Energy Sectors */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1 font-medium">
                <Sun size={10} className="text-amber-400" /> Utility Solar
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1 font-medium">
                <Wind size={10} className="text-sky-400" /> Wind Turbines
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                BESS & Substation
              </span>
            </div>
          </div>

          {/* COLUMN 2: Platform Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Platform
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/projects"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Jobs & Active Projects
                </Link>
              </li>
              <li>
                <a
                  href="/#technicians"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Technicians Directory
                </a>
              </li>
              <li>
                <Link
                  to="/verify/skill-passport"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Skill Passport Verification
                </Link>
              </li>
              <li>
                <a
                  href="/#how-it-works"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  How It Works
                </a>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Browse Installations
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: For Workforce */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              For Workforce
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/register?role=technician"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded font-medium text-slate-300"
                >
                  Create Technician Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Technician Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/technician/assessments"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Skill Assessments
                </Link>
              </li>
              <li>
                <Link
                  to="/verify/skill-passport"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Digital Skill Passport
                </Link>
              </li>
              <li>
                <Link
                  to="/projects"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Find Opportunities
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: For EPC Companies */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              For EPC Companies
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/epc/technicians"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded font-medium text-slate-300"
                >
                  Find Skilled Technicians
                </Link>
              </li>
              <li>
                <Link
                  to="/epc/post-project"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Post Project & Mobilize Crew
                </Link>
              </li>
              <li>
                <Link
                  to="/verify/skill-passport"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Verify Skill Passport
                </Link>
              </li>
              <li>
                <Link
                  to="/epc/workforce"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  Workforce Management
                </Link>
              </li>
              <li>
                <Link
                  to="/register?role=epc_company"
                  className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-ring rounded"
                >
                  EPC Employer Registration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact & Support Strip */}
        <div className="py-6 border-b border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <MapPin size={15} className="text-emerald-400 shrink-0" />
            <span className="truncate">Sector 132, Noida, Uttar Pradesh 201301</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={15} className="text-emerald-400 shrink-0" />
            <span>+91 98765 00000</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={15} className="text-emerald-400 shrink-0" />
            <a
              href="mailto:support@renewtechworkforce.in"
              className="hover:text-emerald-400 transition-colors truncate"
            >
              support@renewtechworkforce.in
            </a>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-emerald-400 shrink-0" />
            <span className="truncate">National Clean Energy Talent Network</span>
          </div>
        </div>

        {/* Bottom Legal & Compliance Strip */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} RenewTech Workforce. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <button
              type="button"
              onClick={(e) =>
                handleInfoClick(
                  e,
                  'Security & Compliance',
                  'RenewTech Workforce enforces verification standards with verified accreditations from National Institute of Solar Energy (NISE), Skill Council for Green Jobs (SCGJ), and Global Wind Organisation (GWO).'
                )
              }
              className="hover:text-slate-300 transition-colors cursor-pointer focus-ring rounded"
            >
              Security & Compliance
            </button>

            <button
              type="button"
              onClick={(e) =>
                handleInfoClick(
                  e,
                  'Terms of Service',
                  'RenewTech Workforce terms govern the matching of certified technical specialists with EPC contractors, verified credential sharing, and transparent project milestone workflows.'
                )
              }
              className="hover:text-slate-300 transition-colors cursor-pointer focus-ring rounded"
            >
              Terms of Service
            </button>

            <button
              type="button"
              onClick={(e) =>
                handleInfoClick(
                  e,
                  'Privacy Policy',
                  'We safeguard contractor and technician credentials, phone contacts, and geolocation data. Only verified skills and accreditation numbers are shared publicly on Digital Skill Passports.'
                )
              }
              className="hover:text-slate-300 transition-colors cursor-pointer focus-ring rounded"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {/* Information Dialog Modal */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setActiveInfoModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg focus-ring cursor-pointer"
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3 text-emerald-400">
              <ShieldCheck size={20} />
              <h4 className="text-base font-bold tracking-tight text-white">
                {activeInfoModal.title}
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {activeInfoModal.description}
            </p>

            <button
              type="button"
              onClick={() => setActiveInfoModal(null)}
              className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
