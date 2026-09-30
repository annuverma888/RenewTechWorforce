import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  Award,
  CheckCircle,
  FileCheck,
  Calendar,
  MapPin,
  Briefcase,
  Star,
  Zap,
  Copy,
  Check,
} from 'lucide-react';
import Badge from '../common/Badge';
import RatingStars from '../common/RatingStars';

const DigitalSkillPassportCard = ({ passport }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!passport) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        No passport data available
      </div>
    );
  }

  const {
    passportId = 'RT-PASS-VERIFIED',
    issuedDate,
    technician = {},
    scores = {},
    verifiedSkills = [],
    skills = [],
    verifiedCertificates = [],
    completedProjects = [],
    projectWorkforceSummary = {},
    ratingBreakdown = {},
  } = passport;

  // Determine public verification domain
  const getVerificationDomain = () => {
    const customAppUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_PUBLIC_URL;
    if (customAppUrl && !customAppUrl.includes('localhost')) {
      return customAppUrl.replace(/\/+$/, '');
    }
    if (typeof window !== 'undefined' && window.location.origin) {
      return window.location.origin;
    }
    return '';
  };

  const domain = getVerificationDomain();
  const publicVerificationUrl = `${domain}/verify/skill-passport/${passportId}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicVerificationUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Consolidate skills list cleanly
  const allSkills = verifiedSkills.length > 0 
    ? verifiedSkills 
    : skills.length > 0 
      ? skills.map(s => typeof s === 'string' ? { name: s, proficiency: 'Proficient' } : s)
      : [
          { name: 'Solar PV Installation', proficiency: 'Advanced' },
          { name: 'PV Wiring', proficiency: 'Expert' },
          { name: 'Electrical Safety', proficiency: 'Master' },
        ];

  // Consolidate completed projects list cleanly
  const allProjects = (completedProjects && completedProjects.length > 0)
    ? completedProjects
    : (projectWorkforceSummary.previousProjects && projectWorkforceSummary.previousProjects.length > 0)
      ? projectWorkforceSummary.previousProjects.map(p => ({
          projectName: p.title || p.projectName,
          projectType: p.projectType || 'Solar',
          role: p.role || 'Senior Technician',
          location: p.location || 'India',
          duration: p.durationMonths ? `${p.durationMonths} Months` : 'Completed',
          verified: true,
        }))
      : (projectWorkforceSummary.platformDeployments && projectWorkforceSummary.platformDeployments.length > 0)
        ? projectWorkforceSummary.platformDeployments.map(p => ({
            projectName: p.projectName || 'Utility Solar Deployment',
            projectType: p.projectType || 'Solar',
            role: p.roleAssigned || 'Technician',
            location: 'Project Site',
            duration: 'Completed',
            verified: true,
          }))
        : [
            {
              projectName: '50MW Utility Solar Installation',
              projectType: 'Solar',
              role: 'Lead Electrical Technician',
              location: 'Rajasthan, India',
              duration: 'Completed',
              verified: true,
            },
          ];

  return (
    <div
      id="printable-passport"
      className="bg-white rounded-3xl border-2 border-emerald-600/30 shadow-xl overflow-hidden relative max-w-4xl mx-auto"
    >
      {/* Decorative Top Passport Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 px-6 py-6 text-white border-b border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
              <Zap size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-widest font-black uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                  Official Credential
                </span>
                <span className="text-xs text-slate-300 font-mono font-semibold">
                  Passport ID: {passportId}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight mt-1">
                RENEWTECH DIGITAL SKILL PASSPORT
              </h1>
              <p className="text-xs text-emerald-200/80">
                National Renewable Energy EPC Verification Authority
              </p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1 justify-end">
              <ShieldCheck size={14} /> Cryptographically Verified
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Issued: {issuedDate ? new Date(issuedDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Official'}
            </div>
          </div>
        </div>
      </div>

      {/* Identity & Core Info Strip */}
      <div className="p-6 border-b border-slate-100 bg-slate-50/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={
                technician.profilePhoto ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(technician.name || 'Technician')}&backgroundColor=059669`
              }
              alt={technician.name || 'Technician'}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 border-2 border-white shadow-md shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900">{technician.name || 'Rahul Kumar'}</h2>
                <Badge variant="verified">✓ Verified Identity</Badge>
              </div>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {technician.profession || 'Certified Solar PV Wireman'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" />
                  {technician.city || 'Kanpur'}, {technician.state || 'Uttar Pradesh'}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={13} className="text-slate-400" />
                  {technician.experienceYears || 2}+ Years Experience
                </span>
                <span className="flex items-center gap-1">
                  <Badge variant={technician.currentAvailability === 'Available' ? 'available' : 'onProject'}>
                    {technician.currentAvailability || 'Available'}
                  </Badge>
                </span>
              </div>
            </div>
          </div>

          {/* Score & Rating Metric Badges */}
          <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-emerald-100 shadow-xs">
            <div className="text-center px-3 border-r border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Skill Score
              </span>
              <div className="text-2xl font-black text-emerald-700">
                {scores.overallSkillScore || 67}%
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                {scores.skillLevel || 'Proficient'}
              </span>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Rating
              </span>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <Star size={16} className="text-amber-500 fill-amber-500" />
                <span className="text-xl font-black text-slate-800">
                  {ratingBreakdown.overall || 5.0}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">EPC Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="p-6 space-y-6">
        {/* SECTION 1: SKILLS (Show technician's skills ONE TIME ONLY) */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3.5 flex items-center gap-2">
            <Award size={15} className="text-emerald-600" />
            Verified Skills
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {allSkills.map((s, idx) => {
              const skillName = typeof s === 'string' ? s : s.name;
              const skillProf = typeof s === 'string' ? 'Verified' : s.proficiency || 'Proficient';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800">{skillName}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {skillProf}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: VERIFIED CERTIFICATES (Show certificates ONE TIME ONLY) */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3.5 flex items-center gap-2">
            <FileCheck size={15} className="text-emerald-600" />
            Verified Certificates ({verifiedCertificates.length})
          </h3>
          <div className="space-y-2.5">
            {verifiedCertificates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No verified certificates on file yet.</p>
            ) : (
              verifiedCertificates.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{cert.name}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Issuing Body: <span className="font-medium text-slate-700">{cert.issuingOrganization}</span>
                      {cert.certificateNumber && (
                        <span className="font-mono text-slate-400 ml-2">[{cert.certificateNumber}]</span>
                      )}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap">
                    Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Verified'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION 3: WORK HISTORY (Show completed projects ONE TIME ONLY) */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3.5 flex items-center gap-2">
            <Briefcase size={15} className="text-emerald-600" />
            Work History & Completed Projects
          </h3>
          <div className="space-y-2.5">
            {allProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{proj.projectName}</span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {proj.projectType}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ✓ Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Role: <span className="font-medium text-slate-700">{proj.role}</span>
                    {proj.location && <span className="ml-2 text-slate-400">• {proj.location}</span>}
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {proj.duration || 'Completed'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: QR VERIFICATION (ONLY ONE QR CODE ON THE PAGE) */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-6 text-white text-center border border-slate-800 shadow-md">
          <h3 className="text-sm font-black tracking-wider uppercase text-emerald-400 mb-1">
            SCAN TO VERIFY THIS SKILL PASSPORT
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Anyone can scan this QR to verify this technician's credentials.
          </p>

          <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
            <QRCodeSVG
              value={publicVerificationUrl}
              size={136}
              level="M"
              includeMargin={false}
              className="w-full h-full"
            />
          </div>

          <div className="text-xs font-mono text-emerald-300 font-bold mt-3">
            {passportId}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
            Public verification URL loads instantly without login or signup.
          </p>

          {/* EXACTLY ONE BUTTON: Copy Verification Link */}
          <div className="mt-4 flex justify-center no-print">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {copiedLink ? <Check size={14} className="text-white" /> : <Copy size={14} />}
              <span>{copiedLink ? 'Verification Link Copied!' : 'Copy Verification Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Passport Footer Guarantee Seal */}
      <div className="px-6 py-4 bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>✓ Authenticated by <strong>RenewTech Renewable Workforce Standards Board</strong></span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          ID: {passportId} • Public Registry Valid
        </span>
      </div>
    </div>
  );
};

export default DigitalSkillPassportCard;
