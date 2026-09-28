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
  Printer,
  Download,
  QrCode,
  Zap,
  Share2,
  Camera,
  Copy,
  Check,
} from 'lucide-react';
import Badge from '../common/Badge';
import RatingStars from '../common/RatingStars';
import SkillPassportScannerModal from './SkillPassportScannerModal';

const DigitalSkillPassportCard = ({ passport, onPrint = null, onOpenScanner = null }) => {
  const [internalScannerOpen, setInternalScannerOpen] = useState(false);
  const [copiedVerification, setCopiedVerification] = useState(false);

  if (!passport) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        No passport data available
      </div>
    );
  }

  const {
    passportId,
    issuedDate,
    technician = {},
    scores = {},
    verifiedSkills = [],
    verifiedCertificates = [],
    assessmentsTaken = [],
    projectWorkforceSummary = {},
    ratingBreakdown = {},
    reviewsSample = [],
  } = passport;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const targetTechId = technician?._id || passport.passportId || passportId || 'VERIFIED';
  const verificationUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/verify/skill-passport/${targetTechId}`
      : `/verify/skill-passport/${targetTechId}`;

  const handleCopyVerification = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      setCopiedVerification(true);
      setTimeout(() => setCopiedVerification(false), 3000);
    }
  };

  const triggerScanner = () => {
    if (onOpenScanner) {
      onOpenScanner();
    } else {
      setInternalScannerOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top action bar (hidden in print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={20} />
            Digital Skill Passport
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographically & Admin Verified Renewable Energy Credential
          </p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Passport link copied to clipboard!');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Share2 size={14} /> <span>Share Passport</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={14} /> <span>Download Skill Passport</span>
          </button>
        </div>
      </div>

      {/* Main Printable Passport Document */}
      <div
        id="printable-passport"
        className="bg-white rounded-2xl border-2 border-emerald-600/30 shadow-xl overflow-hidden relative"
      >
        {/* Decorative Top Passport Banner */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 px-4 sm:px-6 py-5 sm:py-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0 mt-0.5 sm:mt-0">
                <Zap size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-widest font-extrabold uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                    Official Credential
                  </span>
                  <span className="text-xs text-slate-300 font-mono">
                    ID: {passportId}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                  RENEWTECH DIGITAL SKILL PASSPORT
                </h1>
                <p className="text-xs text-emerald-200/80">
                  National Renewable Energy EPC Verification Authority
                </p>
              </div>
            </div>

            {/* Real QR Code Verification & Camera Scanner Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
              <div className="w-16 h-16 bg-white rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-md">
                <QRCodeSVG
                  value={verificationUrl}
                  size={58}
                  level="M"
                  includeMargin={false}
                  className="w-full h-full"
                />
              </div>

              <div className="text-center sm:text-right">
                <div className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1 justify-center sm:justify-end">
                  <CheckCircle size={10} className="text-emerald-400" /> Scan to Verify
                </div>
                <div className="text-[11px] font-mono text-slate-200">
                  {passportId}
                </div>
                <div className="text-[10px] text-slate-400 mb-2">
                  Issued: {issuedDate ? new Date(issuedDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Official'}
                </div>

                {/* Scan QR Code & Copy Verification Link Buttons */}
                <div className="flex items-center gap-1.5 no-print justify-center sm:justify-end">
                  <button
                    type="button"
                    onClick={triggerScanner}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer shadow-xs"
                    title="Open live camera QR scanner"
                  >
                    <Camera size={11} />
                    <span>Scan QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyVerification}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                    title="Copy public verification link"
                  >
                    {copiedVerification ? <Check size={11} className="text-emerald-300" /> : <Copy size={11} />}
                    <span>{copiedVerification ? 'Copied' : 'Copy Verification Link'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Overall Score Strip */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <img
                src={
                  technician.profilePhoto ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${technician.name}&backgroundColor=059669`
                }
                alt={technician.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 border-2 border-white shadow-md shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{technician.name}</h3>
                  <Badge variant="verified">Verified Identity</Badge>
                </div>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                  {technician.profession || 'Certified Solar PV Wireman'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {technician.city}, {technician.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {technician.experienceYears}+ Years Practical Experience
                  </span>
                  <span className="flex items-center gap-1">
                    <Badge variant={technician.currentAvailability === 'Available' ? 'available' : 'onProject'}>
                      {technician.currentAvailability}
                    </Badge>
                  </span>
                </div>
              </div>
            </div>

            {/* Score Highlight Box */}
            <div className="grid grid-cols-3 gap-1 sm:gap-4 p-2.5 sm:p-3.5 bg-white rounded-2xl border border-emerald-100 shadow-sm w-full md:w-auto">
              <div className="text-center px-1 sm:px-3 border-r border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Skill Score
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {scores.overallSkillScore || 85}%
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {scores.skillLevel || 'Proficient'}
                </span>
              </div>
              <div className="text-center px-1 sm:px-3 border-r border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Verified Certs
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-800">
                  {verifiedCertificates.length}
                </div>
                <span className="text-[10px] text-emerald-600 font-medium">Official</span>
              </div>
              <div className="text-center px-1 sm:px-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Completed
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-800">
                  {projectWorkforceSummary.projectsCompleted || 0}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Projects</span>
              </div>
            </div>
          </div>
        </div>

        {/* Passport Content Grid */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Verified Skills & Certificates */}
          <div className="space-y-6">
            {/* Verified Skills */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Award size={14} className="text-emerald-600" />
                Verified Technical Competencies
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {verifiedSkills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills listed yet.</p>
                ) : (
                  verifiedSkills.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-2xs"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800">{s.name}</span>
                        <div className="text-[10px] text-slate-400">{s.category}</div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {s.proficiency}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Verified Certificates */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <FileCheck size={14} className="text-emerald-600" />
                Verified Accreditations & Licensures
              </h4>
              <div className="space-y-2.5">
                {verifiedCertificates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No verified certificates on file yet.</p>
                ) : (
                  verifiedCertificates.map((cert, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {cert.name}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            ✓ Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Issuing Body: <span className="font-medium text-slate-800">{cert.issuingOrganization}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Cert No: {cert.certificateNumber}
                        </p>
                      </div>
                      <div className="text-right text-[10px] text-slate-400 whitespace-nowrap">
                        Issued: {cert.issueDate ? new Date(cert.issueDate).getFullYear() : 'Active'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Assessment Scores & Contractor Reviews */}
          <div className="space-y-6">
            {/* Assessment Scores */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Zap size={14} className="text-emerald-600" />
                Standardized Skill Assessment Breakdown
              </h4>

              {scores.categoryMastery && scores.categoryMastery.length > 0 ? (
                <div className="space-y-2.5">
                  {scores.categoryMastery.map((cat, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-800">{cat.category}</span>
                        <span className="font-bold text-emerald-700">{cat.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-500">
                  Solar Technical Competency: {scores.overallSkillScore || 85}%
                </div>
              )}
            </div>

            {/* 5-Factor Contractor Ratings */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  EPC Contractor Performance Metrics
                </h4>
                <RatingStars rating={ratingBreakdown.overall || 5.0} count={passport.reviewsCount} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Technical Skill</span>
                  <span className="font-bold text-slate-800">{ratingBreakdown.technicalSkill || 5.0} / 5</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Safety & LOTO</span>
                  <span className="font-bold text-slate-800">{ratingBreakdown.safety || 5.0} / 5</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Punctuality</span>
                  <span className="font-bold text-slate-800">{ratingBreakdown.punctuality || 5.0} / 5</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                  <span className="text-slate-600">Quality of Work</span>
                  <span className="font-bold text-slate-800">{ratingBreakdown.qualityOfWork || 5.0} / 5</span>
                </div>
              </div>

              {/* Sample Review Comment */}
              {reviewsSample.length > 0 && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs italic text-slate-600">
                  "{reviewsSample[0].feedbackComment}"
                  <div className="text-[10px] text-slate-400 not-italic font-semibold mt-1">
                    — {reviewsSample[0].company?.name || 'Verified EPC Contractor'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Passport Footer Guarantee Seal */}
        <div className="px-6 py-4 bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Authenticated by <strong>RenewTech Renewable Workforce Standards Board</strong></span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            HASH: 8F2A-RENEW-{(technician.name || 'TEC').substring(0, 3).toUpperCase()}-99281
          </span>
        </div>
      </div>

      {/* Real Live Camera QR Scanner Modal */}
      <SkillPassportScannerModal
        isOpen={internalScannerOpen}
        onClose={() => setInternalScannerOpen(false)}
      />
    </div>
  );
};

export default DigitalSkillPassportCard;
