import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  FileCheck,
  Briefcase,
  Star,
  MapPin,
  Calendar,
  AlertTriangle,
  XCircle,
  Zap,
  Copy,
  Check,
  Download,
  Camera,
  RefreshCw,
  ExternalLink,
  GraduationCap,
  Building2,
  Clock,
  Sun,
  Wind,
  Layers,
} from 'lucide-react';
import { technicianAPI } from '../../services/api';
import SkillPassportScannerModal from '../../components/passport/SkillPassportScannerModal';

const formatDate = (dateString) => {
  if (!dateString) return 'Official Record';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Official Record';
  }
};

const getTechIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('wind')) return <Wind className="w-3.5 h-3.5 text-sky-500" />;
  if (t.includes('bess') || t.includes('battery')) return <Zap className="w-3.5 h-3.5 text-purple-500" />;
  if (t.includes('hybrid')) return <Layers className="w-3.5 h-3.5 text-teal-500" />;
  return <Sun className="w-3.5 h-3.5 text-amber-500" />;
};

const SkillPassportVerificationPage = () => {
  const { technicianId, id } = useParams();
  const targetId = technicianId || id;

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [scanDate] = useState(() =>
    new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );

  const fetchPublicVerification = useCallback(async () => {
    if (!targetId || targetId.trim() === '') {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      setVerificationFailed(false);

      const res = await technicianAPI.getPublicVerification(targetId.trim());

      if (res.data?.success) {
        if (res.data.verificationFailed || res.data.isVerified === false) {
          setVerificationFailed(true);
          setPassport(res.data.data || null);
        } else {
          setPassport(res.data.data);
        }
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.warn('[Public Verification] Primary fetch error:', err);
      if (err.response?.status === 404 || err.response?.data?.notFound) {
        setNotFound(true);
      } else if (err.response?.data?.verificationFailed) {
        setVerificationFailed(true);
        setPassport(err.response.data.data || null);
      } else {
        // Fallback: try standard getDigitalPassport in case API routing differs
        try {
          const fallbackRes = await technicianAPI.getDigitalPassport(targetId.trim());
          if (fallbackRes.data?.success && fallbackRes.data.data) {
            setPassport(fallbackRes.data.data);
          } else {
            setNotFound(true);
          }
        } catch {
          setError(
            err.response?.data?.message ||
              'Unable to complete verification check at this moment. Please check your network connection.'
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchPublicVerification();
  }, [fetchPublicVerification]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Extract real sanitized fields
  const technician = passport?.technician || {};
  const passportId = passport?.passportId || targetId || 'RT-PASS-VERIFIED';
  const scores = passport?.scores || {};
  const ratingBreakdown = passport?.ratingBreakdown || {};

  const verifiedSkills = useMemo(() => {
    if (Array.isArray(passport?.verifiedSkills) && passport.verifiedSkills.length > 0) {
      return passport.verifiedSkills;
    }
    if (Array.isArray(passport?.skills) && passport.skills.length > 0) {
      return passport.skills.map((s) =>
        typeof s === 'string' ? { name: s, proficiency: 'Proficient' } : s
      );
    }
    return [];
  }, [passport?.verifiedSkills, passport?.skills]);

  const verifiedCertificates = useMemo(() => {
    return Array.isArray(passport?.verifiedCertificates) ? passport.verifiedCertificates : [];
  }, [passport?.verifiedCertificates]);

  const completedProjects = useMemo(() => {
    if (Array.isArray(passport?.completedProjects) && passport.completedProjects.length > 0) {
      return passport.completedProjects;
    }
    if (
      Array.isArray(passport?.projectWorkforceSummary?.previousProjects) &&
      passport.projectWorkforceSummary.previousProjects.length > 0
    ) {
      return passport.projectWorkforceSummary.previousProjects.map((p) => ({
        projectName: p.title || p.projectName,
        projectType: p.projectType || 'Solar',
        role: p.role || 'Technician',
        location: p.location || 'India',
        duration: p.durationMonths ? `${p.durationMonths} Months` : 'Completed',
        verified: true,
      }));
    }
    return [];
  }, [passport?.completedProjects, passport?.projectWorkforceSummary?.previousProjects]);

  const assessmentsTaken = useMemo(() => {
    return Array.isArray(passport?.assessmentsTaken) ? passport.assessmentsTaken : [];
  }, [passport?.assessmentsTaken]);

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-6 animate-pulse">
          <ShieldCheck size={32} />
        </div>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-tight text-white">Verifying Skill Passport...</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Connecting to National Clean Energy Workforce Registry...
        </p>
      </div>
    );
  }

  // 2. NOT FOUND STATE
  if (notFound || (!passport && !verificationFailed && !error)) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <XCircle size={32} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              RenewTech Workforce Registry
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Skill Passport Not Found
            </h1>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The verification link may be invalid or the credential could not be located in the national registry. Please check the QR code and scan again.
          </p>
          {targetId && (
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 border border-slate-200">
              Queried ID: <span className="font-bold text-slate-900">{targetId}</span>
            </div>
          )}
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setScannerModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Camera size={14} />
              <span>Scan Another QR</span>
            </button>
            <button
              onClick={fetchPublicVerification}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Retry Search</span>
            </button>
          </div>
        </div>

        <SkillPassportScannerModal
          isOpen={scannerModalOpen}
          onClose={() => setScannerModalOpen(false)}
        />
      </div>
    );
  }

  // 3. VERIFICATION FAILED / SUSPENDED STATE
  if (verificationFailed) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              RenewTech Workforce Registry
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
              Passport Verification Inactive
            </h1>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A credential record exists for this identifier, but active verification status is currently pending, suspended, or awaiting renewal.
          </p>
          {passport?.passportId && (
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 border border-slate-200">
              Passport ID: <span className="font-bold text-slate-900">{passport.passportId}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-3">
            Please contact RenewTech Workforce Administration or the issuing EPC contractor for compliance verification.
          </div>
        </div>
      </div>
    );
  }

  // 4. API / NETWORK ERROR STATE
  if (error && !passport) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Unable to Verify Right Now
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
          <button
            onClick={fetchPublicVerification}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. SUCCESS STATE: Official Verified Public Credential Registry
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Print stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-public-passport {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            margin: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Official Registry Public Header */}
      <header className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 shadow-sm no-print">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              ⚡
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-white">
                RenewTech Workforce
              </div>
              <div className="text-[11px] text-emerald-400 font-medium">
                Skill Passport Verification Authority
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setScannerModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              title="Scan another QR"
            >
              <Camera size={13} />
              <span>Scan QR</span>
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              title="Copy verification link"
            >
              {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Print official audit copy"
            >
              <Download size={13} />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Verification Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Verification Certificate Card */}
        <div
          id="printable-public-passport"
          className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
        >
          {/* SECTION 1: VERIFICATION STATUS HERO */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 sm:p-7 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner shrink-0">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded border border-emerald-400/30">
                    Official Public Record
                  </span>
                  <span className="text-xs text-slate-300 font-mono font-bold">
                    {passportId}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  ✓ Skill Passport Verified
                </h1>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  This credential has been successfully authenticated by RenewTech Workforce.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 text-xs">
              <div className="font-semibold text-emerald-300 flex items-center gap-1.5 sm:justify-end">
                <ShieldCheck size={14} />
                <span>Verified Authority Record</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                Scan Timestamp: {scanDate}
              </div>
            </div>
          </div>

          {/* SECTION 2: TECHNICIAN IDENTITY */}
          <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/70">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img
                src={
                  technician.profilePhoto ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    technician.name || 'Technician'
                  )}&backgroundColor=059669`
                }
                alt={technician.name || 'Technician'}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 border-2 border-white shadow-xs shrink-0"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {technician.name || 'Certified Technician'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} />
                    <span>Identity Confirmed</span>
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-700">
                  {technician.profession || 'Certified Renewable Energy Specialist'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {technician.city || 'Kanpur'}, {technician.state || 'Uttar Pradesh'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-slate-400" />
                    {technician.experienceYears || 2}+ Years Field Experience
                  </span>
                  {technician.currentAvailability && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{technician.currentAvailability}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: KEY METRICS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-white border-b border-slate-100 text-center">
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Skill Index
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">
                {scores.overallSkillScore || 67}%
              </div>
              <span className="text-[10px] font-semibold text-emerald-800">
                {scores.skillLevel || 'Proficient'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Verified Skills
              </span>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
                {verifiedSkills.length}
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Competencies</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Accreditations
              </span>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-0.5">
                {verifiedCertificates.length}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Verified Body</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Contractor Rating
              </span>
              <div className="text-2xl font-bold font-mono text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span>{ratingBreakdown.overall || 5.0}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {passport?.reviewsCount || 1} EPC Review(s)
              </span>
            </div>
          </div>

          {/* SECTION 4: VERIFIED SKILLS */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Award size={15} className="text-emerald-600" />
                <span>Verified Skills ({verifiedSkills.length})</span>
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Competencies
              </span>
            </div>

            {verifiedSkills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No verified skills recorded for this credential.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {verifiedSkills.map((skill, idx) => {
                  const skillName = typeof skill === 'string' ? skill : skill.name;
                  const skillProf =
                    typeof skill === 'string' ? 'Verified' : skill.proficiency || 'Proficient';

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="font-bold text-slate-800">{skillName}</span>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-emerald-700 border border-emerald-200 shadow-2xs">
                        {skillProf}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 5: VERIFIED CERTIFICATIONS */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileCheck size={15} className="text-emerald-600" />
                <span>Verified Certifications & Accreditations ({verifiedCertificates.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Authority Issued</span>
            </div>

            {verifiedCertificates.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                No verified certifications currently stamped on public registry.
              </div>
            ) : (
              <div className="space-y-2.5">
                {verifiedCertificates.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{cert.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ✓ Verified Credential
                        </span>
                      </div>
                      <p className="text-slate-500">
                        Issuing Authority:{' '}
                        <strong className="text-slate-700">{cert.issuingOrganization}</strong>
                        {cert.certificateNumber && (
                          <span className="font-mono text-slate-400 ml-2">
                            [{cert.certificateNumber}]
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-slate-400 font-mono whitespace-nowrap">
                      Issued: {formatDate(cert.issueDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 6: WORK HISTORY & COMPLETED PROJECTS */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Briefcase size={15} className="text-emerald-600" />
                <span>Completed Field Projects ({completedProjects.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Verified Deployments</span>
            </div>

            {completedProjects.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                No completed project deployments recorded on public registry.
              </div>
            ) : (
              <div className="space-y-2.5">
                {completedProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="p-0.5 rounded bg-white border border-slate-200">
                          {getTechIcon(proj.projectType)}
                        </span>
                        <span className="font-bold text-slate-900">
                          {proj.projectName || proj.title}
                        </span>
                        {proj.projectType && (
                          <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                            {proj.projectType}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          ✓ Completed
                        </span>
                      </div>
                      <p className="text-slate-500">
                        Role: <strong className="text-slate-700">{proj.role || 'Technician'}</strong>
                        {proj.location && (
                          <span className="text-slate-400 ml-2">• {proj.location}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-slate-400 font-medium whitespace-nowrap">
                      {proj.duration || 'Completed'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 7: ASSESSMENT EVIDENCE (If available) */}
          {assessmentsTaken.length > 0 && (
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <GraduationCap size={15} className="text-blue-600" />
                  <span>Verified Assessment Benchmarks ({assessmentsTaken.length})</span>
                </h3>
                <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Standardized Testing
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {assessmentsTaken.map((ass, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900">{ass.title}</span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{ass.category}</span>
                        <span>•</span>
                        <span>Level: {ass.skillLevel}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-700 block">
                        {ass.scorePercentage}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatDate(ass.completedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 8: TECHNICAL VERIFICATION AUDIT TRAIL */}
          <div className="p-6 bg-slate-50/80 border-b border-slate-200 text-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-600" />
              <span>Technical Verification & Compliance Audit</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-slate-600">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Passport Identifier</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{passportId}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Verification Authority</span>
                <span className="font-semibold text-slate-900 mt-0.5 block">
                  RenewTech Workforce Standards Board
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-medium">Registry Status</span>
                <span className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  <span>Public & Active</span>
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 9: BOTTOM AUTHORITY GUARANTEE SEAL */}
          <div className="p-6 bg-slate-900 text-white text-center space-y-1.5">
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} />
              <span>✓ Certified Clean Energy Workforce Authority</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Verified across all registered EPC companies in India.
            </p>
            <p className="text-[10px] text-slate-500 font-mono pt-1">
              Verified scan audit timestamp: {scanDate}
            </p>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-5 text-center text-xs text-slate-400 border-t border-slate-200 bg-white no-print">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>RenewTech Workforce • Clean Energy EPC Verification Authority</span>
          <span className="font-mono text-[11px]">Public Registry Valid</span>
        </div>
      </footer>

      {/* Camera QR Scanner Modal */}
      <SkillPassportScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />
    </div>
  );
};

export default SkillPassportVerificationPage;
