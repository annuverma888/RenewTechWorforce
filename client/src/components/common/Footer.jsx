import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  Sun,
  Wind,
  Mail,
  Phone,
  MapPin,
  Globe,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                ⚡
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                RenewTech <span className="text-emerald-400 font-extrabold">Workforce</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Connecting verified renewable energy talent with EPC projects. Empowering solar and wind infrastructure developers with competency-tested technical crews across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck size={16} /> Verified Skills • Verified Workforce
            </div>
          </div>

          {/* Renewable Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Sun size={14} className="text-amber-400" /> Renewable Domains
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-300">Certified Solar PV Wiremen</li>
              <li className="text-slate-300">Solar Panel & Structure Installers</li>
              <li className="text-slate-300">Solar O&M & Thermography Specialists</li>
              <li className="text-slate-300">Wind Turbine Mechanical Technicians</li>
              <li className="text-slate-300">GWO Blade Inspection & Climbing Crews</li>
            </ul>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-1.5">
              <Wind size={14} className="text-sky-400" /> Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/projects" className="text-slate-300 hover:text-white transition-colors">
                  Browse Active Projects
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                  Technician Login
                </Link>
              </li>
              <li>
                <Link to="/register?role=epc_company" className="text-slate-300 hover:text-white transition-colors">
                  EPC Employer Registration
                </Link>
              </li>
              <li>
                <Link to="/register?role=technician" className="text-slate-300 hover:text-white transition-colors">
                  Technician Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-300 hover:text-white transition-colors">
                  Admin Verification Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Contact & Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400 shrink-0" />
                <span>Sector 132, Noida, Uttar Pradesh 201301</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-emerald-400 shrink-0" />
                <span>+91 98765 00000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-emerald-400 shrink-0" />
                <span>support@renewtechworkforce.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={14} className="text-emerald-400 shrink-0" />
                <span>National Clean Energy Talent Network</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} RenewTech Workforce. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <span>Security & Compliance</span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
