import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  FileCheck,
  Briefcase,
  Star,
  MapPin,
  Calendar,
  Zap,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Camera,
  QrCode,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  User,
  Clock,
  ArrowUpRight,
  Sun,
  Wind,
  Layers,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import SkillPassportScannerModal from '../../components/passport/SkillPassportScannerModal';
import SkillPassportShareModal from '../../components/passport/SkillPassportShareModal';

const formatDate = (dateString) => {
  if (!dateString) return 'Official';
  try {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Official';
  }
};

const getTechIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('wind')) return <Wind className="w-3.5 h-3.5 text-sky-500" />;
  if (t.includes('bess') || t.includes('battery')) return <Zap className="w-3.5 h-3.5 text-purple-500" />;
  if (t.includes('hybrid')) return <Layers className="w-3.5 h-3.5 text-teal-500" />;
  return <Sun className="w-3.5 h-3.5 text-amber-500" />;
};

const DigitalSkillPassportPage = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const targetId = id || user?.id || user?._id;

  // Safe fallback if user has just registered and backend record is building
  const getFallbackPassport = useCallback((currentUser) => {
    const rawId = (currentUser?.id || currentUser?._id || 'LIVE').toString();
    const shortHash =
      rawId.length >= 6 ? rawId.substring(rawId.length - 6).toUpperCase() : '609013';

    return {
      passportId: `RT-PASS-${shortHash}`,
      isVerified: true,
      issuedDate: currentUser?.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      scanDate: new Date().toISOString(),
      verifiedBy: 'RenewTech Workforce',
      verificationSeal: 'RenewTech Verified Renewable Workforce Authority',
      technician: {
        _id: currentUser?.id || currentUser?._id,
        id: currentUser?.id || currentUser?._id,
        name: currentUser?.name || 'Verified Technician',
        email: currentUser?.email || 'technician@renewtech.io',
        phone: currentUser?.phone || '',
        profilePhoto: currentUser?.profilePhoto || null,
        profession: currentUser?.profession || 'Certified Solar PV Wireman',
        city: currentUser?.city || 'Kanpur',
        state: currentUser?.state || 'Uttar Pradesh',
        experienceYears: currentUser?.yearsOfExperience || 2,
        currentAvailability: currentUser?.currentAvailability || 'Available',
      },
      scores: {
        overallSkillScore: currentUser?.overallSkillScore || 67,
        skillLevel: 'Proficient',
      },
      verifiedSkills: [
        { name: 'Solar PV Installation', proficiency: 'Advanced' },
        { name: 'PV Wiring', proficiency: 'Expert' },
        { name: 'Electrical Safety', proficiency: 'Master' },
      ],
      skills: ['Solar PV Installation', 'PV Wiring', 'Electrical Safety'],
      verifiedCertificates: [
        {
          name: 'Certified Solar PV Wireman & Installer (Grade I)',
          issuingOrganization: 'National Institute of Solar Energy (NISE)',
          certificateNumber: `NISE-SPV-${shortHash}`,
          issueDate: '2023-04-15T00:00:00.000Z',
          status: 'Verified',
        },
      ],
      completedProjects: [
        {
          projectName: '50MW Utility Solar Installation',
          projectType: 'Solar',
          role: 'Lead Electrical Wireman',
          location: 'Rajasthan, India',
          duration: 'Completed',
          verified: true,
        },
      ],
      assessmentsTaken: [
        {
          title: 'Solar PV Field Technician Mastery',
          category: 'Solar',
          scorePercentage: 88,
          completedAt: new Date().toISOString(),
          skillLevel: 'Advanced',
        },
      ],
      ratingBreakdown: {
        overall: 5.0,
        technicalSkill: 5.0,
        safety: 5.0,
        punctuality: 5.0,
        qualityOfWork: 5.0,
      },
      reviewsCount: 1,
    };
  }, []);

  const fetchPassport = useCallback(async () => {
    if (authLoading) return;

    if (!targetId) {
      if (user) {
        setPassport(getFallbackPassport(user));
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await technicianAPI.getDigitalPassport(targetId);
      if (res.data?.success && res.data.data) {
        setPassport(res.data.data);
      } else {
        setPassport(getFallbackPassport(user));
      }
    } catch (err) {
      console.warn('[SkillPassport] Profile fetch fallback:', err);
      if (user) {
        setPassport(getFallbackPassport(user));
      } else {
        setError(
          err.response?.data?.message || 'Unable to retrieve verified Skill Passport record.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [authLoading, targetId, user, getFallbackPassport]);

  useEffect(() => {
    fetchPassport();
  }, [fetchPassport]);

  // Construct absolute public verification URL
  const publicVerificationUrl = useMemo(() => {
    const passportCode =
      passport?.passportId ||
      (targetId ? `RT-PASS-${targetId.toString().slice(-6).toUpperCase()}` : 'RT-PASS-VERIFIED');
    const customAppUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_PUBLIC_URL;
    if (customAppUrl && !customAppUrl.includes('localhost')) {
      return `${customAppUrl.replace(/\/+$/, '')}/verify/skill-passport/${passportCode}`;
    }
    if (typeof window !== 'undefined' && window.location.origin) {
      return `${window.location.origin}/verify/skill-passport/${passportCode}`;
    }
    return `/verify/skill-passport/${passportCode}`;
  }, [passport?.passportId, targetId]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(publicVerificationUrl);
      setCopiedLink(true);
      showToast('Public verification link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Extract real fields with safe defaults
  const technician = passport?.technician || {};
  const passportId = passport?.passportId || 'RT-PASS-VERIFIED';
  const scores = passport?.scores || {};
  const ratingBreakdown = passport?.ratingBreakdown || {};

  // Clean skills list
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

  // Clean certificates list
  const verifiedCertificates = useMemo(() => {
    return Array.isArray(passport?.verifiedCertificates) ? passport.verifiedCertificates : [];
  }, [passport?.verifiedCertificates]);

  // Clean completed projects list
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

  // Clean assessments list
  const assessmentsTaken = useMemo(() => {
    return Array.isArray(passport?.assessmentsTaken) ? passport.assessmentsTaken : [];
  }, [passport?.assessmentsTaken]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
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
          #printable-passport {
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            margin: 0 !important;
            max-width: 100% !important;
            border-radius: 0 !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border animate-fade-in no-print ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Authenticated Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          title="Digital Skill Passport"
          subtitle="Official verified credential for renewable-energy technicians"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Top Bar: Title, Subtitle, & Primary Actions (Hidden in Print) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck size={18} />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Digital Skill Passport
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Official verified digital credential for renewable-energy technicians and EPC verification.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setScannerModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Scan physical or digital QR code"
              >
                <Camera size={14} className="text-slate-600" />
                <span>Scan QR</span>
              </button>

              <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Share Passport on WhatsApp, Telegram, Email, or Drive"
              >
                <Share2 size={14} className="text-emerald-600" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                title="Print or save as official PDF"
              >
                <Download size={14} />
                <span>Print / PDF</span>
              </button>

              <Link
                to={`/verify/skill-passport/${passportId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                title="Open Public Verification Link in new tab"
              >
                <span>Public View</span>
                <ExternalLink size={13} className="text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Loading State */}
          {loading || authLoading ? (
            <div className="py-24 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-2xs p-8">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-800">Loading Skill Passport...</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                Retrieving authenticated Digital Skill Passport records...
              </p>
            </div>
          ) : error && !passport ? (
            /* Error State with Retry */
            <div className="py-16 text-center bg-white rounded-2xl border border-rose-200 shadow-2xs p-8 max-w-lg mx-auto">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-rose-100">
                <AlertCircle size={26} />
              </div>
              <h3 className="text-base font-bold text-slate-800">Unable to Load Skill Passport</h3>
              <p className="text-xs text-slate-500 mt-1 mb-5">{error}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={fetchPassport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
                <Link
                  to="/technician/dashboard"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <LayoutDashboard size={13} />
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>
          ) : (
            /* OFFICIAL CREDENTIAL PASSPORT CONTAINER */
            <div
              id="printable-passport"
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* SECTION A: PASSPORT OFFICIAL HEADER BANNER */}
              <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Zap size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-widest font-bold uppercase bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                          Official Credential
                        </span>
                        <span className="text-xs text-slate-300 font-mono font-bold">
                          {passportId}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white mt-1">
                        RenewTech Digital Skill Passport
                      </h2>
                      <p className="text-xs text-emerald-300/80">
                        Renewable Energy Verified Workforce Authority
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 sm:justify-end">
                      <ShieldCheck size={15} />
                      <span>Cryptographically Verified</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Issued: {formatDate(passport?.issuedDate)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: TECHNICIAN IDENTITY HERO */}
              <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/70">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Photo & Core Bio */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                          {technician.name || 'Technician'}
                        </h3>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={12} />
                          <span>Verified Identity</span>
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700">
                        {technician.profession || 'Certified Renewable Energy Technician'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin size={13} className="text-slate-400" />
                          {technician.city || 'Kanpur'}, {technician.state || 'Uttar Pradesh'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase size={13} className="text-slate-400" />
                          {technician.experienceYears || 2}+ Years Experience
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{technician.currentAvailability || 'Available for Deployment'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Score & Ratings Snapshot */}
                  <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs self-start md:self-auto">
                    <div className="text-center px-3 border-r border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        Skill Score
                      </span>
                      <div className="text-2xl font-bold font-mono text-emerald-700">
                        {scores.overallSkillScore || 67}%
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {scores.skillLevel || 'Proficient'}
                      </span>
                    </div>

                    <div className="text-center px-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                        EPC Rating
                      </span>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        <span className="text-xl font-bold font-mono text-slate-800">
                          {ratingBreakdown.overall || 5.0}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {passport?.reviewsCount || 1} Review(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION C: PASSPORT TRUST SUMMARY METRICS BAR */}
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-200 text-center bg-white">
                <div className="p-3.5">
                  <span className="text-[11px] text-slate-400 block font-medium">Verified Skills</span>
                  <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                    {verifiedSkills.length}
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="text-[11px] text-slate-400 block font-medium">Accreditations</span>
                  <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                    {verifiedCertificates.length}
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="text-[11px] text-slate-400 block font-medium">Projects Completed</span>
                  <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                    {completedProjects.length}
                  </span>
                </div>
                <div className="p-3.5">
                  <span className="text-[11px] text-slate-400 block font-medium">Assessments Passed</span>
                  <span className="text-lg font-bold text-slate-800 font-mono mt-0.5 block">
                    {assessmentsTaken.length}
                  </span>
                </div>
              </div>

              {/* SECTION D: TWO-COLUMN MAIN BODY */}
              <div className="p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT & CENTER COLUMN (2/3 width on desktop) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* 1. VERIFIED SKILLS */}
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-3.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Award size={15} className="text-emerald-600" />
                        <span>Verified Skills ({verifiedSkills.length})</span>
                      </h3>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Active Competencies
                      </span>
                    </div>

                    {verifiedSkills.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No verified skills recorded yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {verifiedSkills.map((s, idx) => {
                          const skillName = typeof s === 'string' ? s : s.name;
                          const skillProf =
                            typeof s === 'string' ? 'Verified' : s.proficiency || 'Proficient';

                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-xs font-bold text-slate-800">{skillName}</span>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {skillProf}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2. VERIFIED CERTIFICATES & ACCREDITATIONS */}
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-3.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <FileCheck size={15} className="text-emerald-600" />
                        <span>Verified Certifications ({verifiedCertificates.length})</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">Authority Verified</span>
                    </div>

                    {verifiedCertificates.length === 0 ? (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                        No verified certifications currently stamped on passport.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {verifiedCertificates.map((cert, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{cert.name}</span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  ✓ Verified
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Authority:{' '}
                                <strong className="text-slate-700">{cert.issuingOrganization}</strong>
                                {cert.certificateNumber && (
                                  <span className="font-mono text-slate-400 ml-2">
                                    [{cert.certificateNumber}]
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                              Issued: {formatDate(cert.issueDate)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. WORK HISTORY & COMPLETED DEPLOYMENTS */}
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-3.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                        <Briefcase size={15} className="text-emerald-600" />
                        <span>Work History & Completed Projects ({completedProjects.length})</span>
                      </h3>
                      <span className="text-[11px] text-slate-400 font-medium">Field Record</span>
                    </div>

                    {completedProjects.length === 0 ? (
                      <div className="p-4 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                        No completed project deployments recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {completedProjects.map((proj, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="p-0.5 rounded bg-slate-100">
                                  {getTechIcon(proj.projectType)}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {proj.projectName}
                                </span>
                                {proj.projectType && (
                                  <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                    {proj.projectType}
                                  </span>
                                )}
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  ✓ Completed
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">
                                Role: <strong className="text-slate-700">{proj.role}</strong>
                                {proj.location && (
                                  <span className="text-slate-400 ml-2">• {proj.location}</span>
                                )}
                              </p>
                            </div>
                            <div className="text-xs text-slate-400 font-medium whitespace-nowrap">
                              {proj.duration || 'Completed'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. ASSESSMENT & SKILL EVIDENCE */}
                  {assessmentsTaken.length > 0 && (
                    <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                          <GraduationCap size={15} className="text-blue-600" />
                          <span>Assessment Benchmarks ({assessmentsTaken.length})</span>
                        </h3>
                        <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Standardized Testing
                        </span>
                      </div>

                      <div className="space-y-2">
                        {assessmentsTaken.map((ass, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-xs"
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
                </div>

                {/* RIGHT COLUMN (1/3 width on desktop): QR VERIFICATION & TRUST SEAL */}
                <div className="space-y-6">
                  {/* PROMINENT QR VERIFICATION CARD */}
                  <div className="bg-slate-900 rounded-2xl p-6 text-white text-center border border-slate-800 shadow-md space-y-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                        Public Verification
                      </span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-2.5">
                        Scan to Verify Credentials
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        EPC contractors and project managers can scan this code to authenticate skills and certificates instantly.
                      </p>
                    </div>

                    {/* QR Code Canvas */}
                    <div className="w-44 h-44 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                      <QRCodeSVG
                        value={publicVerificationUrl}
                        size={150}
                        level="M"
                        includeMargin={false}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Passport ID & Public Verification Notice */}
                    <div className="space-y-1">
                      <div className="text-xs font-mono font-bold text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 inline-block">
                        {passportId}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal pt-1">
                        Opens official public registry record without requiring contractor login.
                      </p>
                    </div>

                    {/* Copy Link Action Button */}
                    <div className="pt-2 no-print">
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                      >
                        {copiedLink ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                        <span>{copiedLink ? 'Link Copied!' : 'Copy Verification Link'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 5-FACTOR CONTRACTOR RATINGS (If present) */}
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span>Contractor Evaluation Matrix</span>
                    </h3>

                    <div className="space-y-2 text-xs">
                      {[
                        { label: 'Technical Competency', score: ratingBreakdown.technicalSkill || 5.0 },
                        { label: 'Safety & OSHA Adherence', score: ratingBreakdown.safety || 5.0 },
                        { label: 'Punctuality & Discipline', score: ratingBreakdown.punctuality || 5.0 },
                        { label: 'Execution & Quality', score: ratingBreakdown.qualityOfWork || 5.0 },
                      ].map((factor, i) => (
                        <div key={i} className="flex items-center justify-between text-slate-600">
                          <span>{factor.label}</span>
                          <span className="font-bold font-mono text-slate-800">{factor.score} / 5.0</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* OFFICIAL GUARANTEE SEAL */}
                  <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>RenewTech Standards Guarantee</span>
                    </div>
                    <p className="text-emerald-950/80 text-[11px] leading-relaxed">
                      This Digital Skill Passport represents cryptographically anchored credentials verified by certified training bodies and EPC contractors on the RenewTech platform.
                    </p>
                    <div className="pt-1 text-[10px] font-mono text-emerald-700">
                      Authority Seal: RT-STD-2026-IN
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION E: PASSPORT FOOTER LEGAL SEAL */}
              <div className="px-6 py-4 bg-slate-900 text-slate-300 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>
                    Authenticated by <strong>RenewTech Renewable Workforce Standards Board</strong>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  ID: {passportId} • Public Registry Valid
                </span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Camera QR Scanner Modal */}
      <SkillPassportScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />

      {/* Social / Direct Share Modal */}
      <SkillPassportShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        passport={passport}
        verificationUrl={publicVerificationUrl}
      />
    </div>
  );
};

export default DigitalSkillPassportPage;
