import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  FileCheck,
  FileText,
  MapPin,
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Clock,
  User,
  Wrench,
  Compass,
  RefreshCw,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { matchingAPI, applicationAPI, technicianAPI, assessmentAPI } from '../../services/api';
import { getStatusLabel } from '../../utils/i18nHelpers';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const TechnicianDashboard = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [assessments, setAssessments] = useState([]);

  // Apply Modal state
  const [applyModalProject, setApplyModalProject] = useState(null);
  const [applyingId, setApplyingId] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setFetchError(null);

      const [recRes, appsRes, certsRes, assessRes] = await Promise.all([
        matchingAPI.getRecommendedForTechnician().catch((err) => {
          console.warn('[Dashboard] Could not load recommended projects:', err.message);
          return { data: { success: false, data: [] } };
        }),
        applicationAPI.getAll().catch((err) => {
          console.warn('[Dashboard] Could not load applications:', err.message);
          return { data: { success: false, data: [] } };
        }),
        technicianAPI.getMyCertificates().catch((err) => {
          console.warn('[Dashboard] Could not load certificates:', err.message);
          return { data: { success: false, data: [] } };
        }),
        assessmentAPI.getMyResults().catch((err) => {
          console.warn('[Dashboard] Could not load assessments:', err.message);
          return { data: { success: false, data: [] } };
        }),
      ]);

      if (recRes.data?.data) {
        setRecommendedProjects(recRes.data.data.slice(0, 4));
      }
      if (appsRes.data?.data) {
        setApplications(appsRes.data.data.slice(0, 5));
      }
      if (certsRes.data?.data) {
        setCertificates(certsRes.data.data);
      }
      if (assessRes.data?.data) {
        setAssessments(assessRes.data.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setFetchError('We could not load some of your dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!applyModalProject) return;

    try {
      setApplyingId(applyModalProject._id);
      const res = await applicationAPI.apply({
        projectId: applyModalProject._id,
        coverNote,
      });

      if (res.data.success) {
        setSuccessMessage(`Successfully applied to "${applyModalProject.projectName || 'Project'}"!`);
        setApplyModalProject(null);
        setCoverNote('');
        fetchData();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error submitting application.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setApplyingId(null);
    }
  };

  // Profile data derivations
  const verifiedCertsCount = certificates.filter((c) => c.status === 'Verified').length;
  const verifiedSkillsCount = profile?.renewableSkills
    ? profile.renewableSkills.filter((s) => s.isVerified).length
    : 0;
  const totalSkillsCount = profile?.renewableSkills?.length || 0;
  const profileCompletion = profile?.profileCompletion || 0;

  // Time-appropriate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('technician.goodMorning') : hour < 18 ? t('technician.goodAfternoon') : t('technician.goodEvening');
  const technicianName = user?.name || 'Technician';

  // Extract missing skills from recommended projects breakdown if available
  const extractedMissingSkills = [];
  recommendedProjects.forEach((item) => {
    const missing = item.breakdown?.skills?.missingSkills;
    if (Array.isArray(missing)) {
      missing.forEach((sk) => {
        const name = typeof sk === 'object' && sk !== null ? (sk.name || sk.skill) : String(sk);
        if (name && !extractedMissingSkills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
          extractedMissingSkills.push({
            name,
            requiredBy: item.project?.projectName || 'Recommended Project',
          });
        }
      });
    }
  });

  // Actionable Profile Completion Checklist
  const actionItems = [];
  if (totalSkillsCount < 3) {
    actionItems.push({
      title: t('technician.addSkillBtn', 'Add Renewable Skills'),
      desc: t('technician.attentionDesc', 'Add at least 3 technical skills to enhance algorithmic match scoring.'),
      to: '/technician/profile',
      cta: t('common.add', 'Add Skills'),
    });
  }
  if (verifiedCertsCount === 0) {
    actionItems.push({
      title: t('technician.uploadCertificate', 'Upload Certificate'),
      desc: t('technician.auditNotice', 'Submit SCGJ, GWO, or Wireman licenses for official platform audit.'),
      to: '/technician/certificates',
      cta: t('technician.uploadCertificate', 'Upload Certificate'),
    });
  }
  if (assessments.length === 0) {
    actionItems.push({
      title: t('technician.startAssessmentBtn', 'Complete Assessment'),
      desc: t('technician.assessmentsSubtitle', 'Take standardized exams to earn verified proficiency badges.'),
      to: '/technician/assessments',
      cta: t('technician.startAssessmentBtn', 'Take Assessment'),
    });
  }
  if (!profile?.previousProjects || profile.previousProjects.length === 0) {
    actionItems.push({
      title: t('technician.addProjectBtn', 'Add Experience'),
      desc: t('technician.projectHistory', 'Record commissioned MW and site hours to build contractor trust.'),
      to: '/technician/profile',
      cta: t('technician.addProjectBtn', 'Add Experience'),
    });
  }

  // Verification status check
  const isVerifiedTechnician = verifiedCertsCount > 0 || verifiedSkillsCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar with Drawer on Mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title={t('navigation.dashboard')}
          subtitle={t('technician.dashboard')}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Notifications / Alerts */}
          {successMessage && (
            <div
              role="status"
              className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
            >
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div
              role="alert"
              className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs"
            >
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {fetchError && (
            <div
              role="alert"
              className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0" />
                <span>{fetchError}</span>
              </div>
              <button
                type="button"
                onClick={fetchData}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                <span>{t('common.retry')}</span>
              </button>
            </div>
          )}

          {/* 1. VERIFICATION / SKILL STATUS SUMMARY (Mobile Priority #1) */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                {/* Profile Avatar */}
                <div className="relative shrink-0">
                  {user?.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={technicianName}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-extrabold text-xl shadow-2xs">
                      {technicianName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isVerifiedTechnician && (
                    <div
                      title={t('status.VERIFIED')}
                      className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs"
                    >
                      <ShieldCheck size={12} />
                    </div>
                  )}
                </div>

                {/* Identity & Status */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                      {greeting}, {technicianName}
                    </h1>
                    {isVerifiedTechnician ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>{t('status.VERIFIED')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertCircle size={12} className="text-amber-600" />
                        <span>{t('technician.pendingStatus')}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-medium">
                    <span className="font-semibold text-slate-800">
                      {profile?.profession || 'Renewable Energy Specialist'}
                    </span>
                    {(profile?.city || profile?.state) && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin size={13} className="text-slate-400" />
                        {[profile.city, profile.state].filter(Boolean).join(', ')}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>
                        {profile?.currentAvailability === 'Available'
                          ? t('technician.available')
                          : profile?.currentAvailability === 'On Project'
                          ? t('technician.onProject')
                          : profile?.currentAvailability === 'Unavailable'
                          ? t('technician.unavailable')
                          : (profile?.currentAvailability || t('technician.available'))}
                      </span>
                    </span>
                  </p>
                </div>
              </div>

              {/* Quick Actions (min 44px touch targets on mobile) */}
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 shrink-0 pt-1 sm:pt-0">
                <Link
                  to="/technician/skill-passport"
                  className="min-h-[44px] px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 focus-ring"
                >
                  <ShieldCheck size={16} />
                  <span>{t('navigation.skillPassport')}</span>
                </Link>
                <Link
                  to="/technician/profile"
                  className="min-h-[44px] px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center focus-ring"
                >
                  {t('technician.editProfile')}
                </Link>
              </div>
            </div>

            {/* Profile & Credentials Attention Alert if needed */}
            {!isVerifiedTechnician ? (
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2 text-amber-900">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t('technician.attentionTitle')}</span>
                    <p className="text-amber-800 text-[11px] sm:text-xs mt-0.5">
                      {t('technician.attentionDesc')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/technician/certificates"
                  className="min-h-[40px] px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 self-start sm:self-center flex items-center justify-center transition-colors"
                >
                  {t('technician.uploadCertificate')}
                </Link>
              </div>
            ) : profileCompletion < 80 ? (
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2 text-emerald-900">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{t('technician.profileCompletion')} {profileCompletion}%:</span>
                    <p className="text-emerald-800 text-[11px] sm:text-xs mt-0.5">
                      {t('technician.completeItemsBelow')}
                    </p>
                  </div>
                </div>
                <Link
                  to="/technician/profile"
                  className="min-h-[40px] px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shrink-0 self-start sm:self-center flex items-center justify-center transition-colors"
                >
                  {t('technician.editProfile')}
                </Link>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px] sm:text-xs">
                  {t('technician.profileReadyNotice')}
                </span>
              </div>
            )}
          </div>

          {/* 2. TOP KPI CARDS */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-28" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Profile Completion */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('technician.profileCompletion')}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {profileCompletion}%
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 mt-1 block">
                    {profileCompletion >= 80 ? t('technician.optimizedForMatching') : t('technician.completeItemsBelow')}
                  </span>
                </div>
              </div>

              {/* Card 2: Verified Skills */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('technician.verifiedSkills')}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Award size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">
                    {verifiedSkillsCount > 0 ? verifiedSkillsCount : totalSkillsCount}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    {verifiedSkillsCount > 0
                      ? `${verifiedSkillsCount} of ${totalSkillsCount} ${t('technician.skillsAudited')}`
                      : `${totalSkillsCount} Listed (${verifiedCertsCount} Certs)`}
                  </span>
                </div>
              </div>

              {/* Card 3: Recommended Opportunities */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('technician.recommendedProjects')}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <Compass size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {recommendedProjects.length}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-teal-700 block">
                    {recommendedProjects.length > 0 ? t('technician.activeMatchingProjects') : t('empty.noProjectsFound')}
                  </span>
                </div>
              </div>

              {/* Card 4: Active Applications */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      {t('navigation.applications')}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
                    {applications.length}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-blue-700 block">
                    {applications.length > 0 ? `${applications.length} ${t('navigation.applications')}` : t('technician.noApplicationsActive')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 3. MAIN DASHBOARD SPLIT: OPPORTUNITIES (LEFT 8) + SIDE PANEL (RIGHT 4) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT 8 COLUMNS: Recommended Opportunities & Recent Applications */}
            <div className="lg:col-span-8 space-y-6">
              {/* RECOMMENDED OPPORTUNITIES */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles size={17} className="text-emerald-600" />
                      <span>{t('technician.recommendedOpportunities')}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('technician.recommendedDesc')}
                    </p>
                  </div>
                  <Link
                    to="/technician/recommended"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 focus-ring rounded"
                  >
                    <span>{t('technician.viewAll')}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-3 py-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 animate-pulse h-32" />
                    ))}
                  </div>
                ) : recommendedProjects.length === 0 ? (
                  /* Empty state for recommended projects */
                  <div className="py-10 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <Compass size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{t('empty.noProjectsFound', 'No matching opportunities yet')}</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        {t('technician.attentionDesc', 'Complete your profile and add certifications to improve your match ranking with active EPC developers.')}
                      </p>
                    </div>
                    <div className="pt-1">
                      <Link
                        to="/technician/profile"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Wrench size={13} />
                        <span>{t('technician.editProfile', 'Update Profile')}</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {recommendedProjects.map((item, idx) => {
                      const proj = item.project || item;
                      const matchScore = item.matchScore || item.overallScore || 90;
                      const companyName =
                        proj.companyId?.companyName ||
                        proj.company?.name ||
                        proj.companyName ||
                        'Renewable EPC Partner';
                      const locationStr = proj.location
                        ? [proj.location.city, proj.location.state].filter(Boolean).join(', ')
                        : 'Location on Request';
                      const requiredSkills = proj.requiredSkills || [];
                      const isWind = proj.projectType?.toLowerCase().includes('wind');

                      return (
                        <div
                          key={proj._id || idx}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-white flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs"
                        >
                          <div className="space-y-2">
                            {/* Top row: Name & Match Score */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                                  {proj.projectName || 'Clean Energy Project'}
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">{companyName}</p>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                                {matchScore}% {t('technician.matchScore', 'Match')}
                              </span>
                            </div>

                            {/* Location & Sector */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-600 font-medium">
                              <span className="flex items-center gap-1">
                                <MapPin size={14} className="text-slate-400 shrink-0" />
                                <span>{locationStr}</span>
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                                {isWind ? `💨 ${t('sectors.windEnergy', 'Wind')}` : `☀️ ${t('landing.solarPVSector', 'Solar')}`}
                              </span>
                            </div>

                            {/* Key Skills */}
                            {requiredSkills.length > 0 && (
                              <div className="pt-1">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                  {t('epc.requiredSkills', 'Key Skills')}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {requiredSkills.slice(0, 3).map((sk, sIdx) => (
                                    <span
                                      key={sIdx}
                                      className="text-xs font-medium bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200"
                                    >
                                      {sk}
                                    </span>
                                  ))}
                                  {requiredSkills.length > 3 && (
                                    <span className="text-xs font-medium text-slate-400 px-1 py-1">
                                      +{requiredSkills.length - 3} {t('common.seeMore', 'more')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: View Details & Apply (touch target >= 44px) */}
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            <Link
                              to={proj._id ? `/projects/${proj._id}` : '/projects'}
                              className="min-h-[44px] px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm border border-slate-300 transition-colors flex items-center justify-center focus-ring"
                            >
                              {t('common.viewDetails')}
                            </Link>

                            {item.hasApplied ? (
                              <span className="min-h-[44px] px-3 py-2 bg-slate-100 text-slate-500 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1">
                                <CheckCircle2 size={14} /> {t('common.applied')}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setApplyModalProject(proj)}
                                className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center focus-ring"
                              >
                                {t('common.apply')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RECENT APPLICATIONS (Mobile Priority #3) */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText size={17} className="text-emerald-600" />
                      <span>{t('technician.recentApplications')}</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('technician.recentApplicationsDesc')}
                    </p>
                  </div>
                  <Link
                    to="/technician/applications"
                    className="min-h-[36px] px-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 focus-ring rounded"
                  >
                    <span>{t('technician.viewAll')}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {loading ? (
                  <div className="space-y-2 py-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : applications.length === 0 ? (
                  /* Empty state for applications */
                  <div className="py-8 text-center space-y-2.5">
                    <p className="text-xs text-slate-500">{t('empty.noApplicationsYet')}</p>
                    <Link
                      to="/technician/recommended"
                      className="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-2xs"
                    >
                      <Compass size={14} />
                      <span>{t('landing.findWorkCta')}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {applications.slice(0, 4).map((app) => {
                      const proj = app.project || {};
                      const projName = proj.projectName || 'Clean Energy Project';
                      const compName = proj.companyName || proj.company?.name || 'EPC Developer';
                      const appDate = app.createdAt
                        ? new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recent';

                      // Status badge styling
                      const status = app.status || 'Applied';
                      const statusColors = {
                        Applied: 'bg-blue-50 text-blue-800 border-blue-200',
                        Shortlisted: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                        Accepted: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold',
                        Rejected: 'bg-rose-50 text-rose-800 border-rose-200',
                        Completed: 'bg-slate-100 text-slate-800 border-slate-300',
                      };

                      return (
                        <div
                          key={app._id}
                          className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm">{projName}</h3>
                            <p className="text-slate-500 mt-0.5 text-xs">
                              {compName} • {t('common.applied')}: {appDate}
                            </p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold self-start sm:self-center ${statusColors[status] || statusColors.Applied}`}>
                            {getStatusLabel(status, t)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT 4 COLUMNS: Skill Passport (Priority #4), Next Action (Priority #5), Skills & Gap */}
            <div className="lg:col-span-4 space-y-6">
              {/* 4. DIGITAL SKILL PASSPORT CARD (Mobile Priority #4) */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-855 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {t('skillPassport.registryTitle', 'Credential Hub')}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">
                    {t('skillPassport.verifiedBadge', 'QR Ready')}
                  </span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <span>{t('skillPassport.title')}</span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {t('technician.passportSubtitle')}
                  </p>
                </div>

                <div className="pt-1">
                  <Link
                    to="/technician/skill-passport"
                    className="w-full min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors focus-ring"
                  >
                    <ShieldCheck size={16} />
                    <span>{t('technician.viewFullPassport', 'Access Skill Passport')}</span>
                  </Link>
                </div>
              </div>

              {/* 5. NEXT ACTION / COMPLETE YOUR PROFILE (Mobile Priority #5) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3.5">
                <div className="pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>{t('technician.recommendedOpportunities', 'Next Recommended Action')}</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('technician.recommendedDesc', 'Clear steps to increase your contractor match score.')}
                  </p>
                </div>

                {actionItems.length === 0 ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                      <span className="font-bold">{t('technician.profileReadyNotice', 'Profile 100% Ready')}</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      {t('technician.profileReadyNotice')}
                    </p>
                    <Link
                      to="/technician/recommended"
                      className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shadow-2xs"
                    >
                      <Compass size={14} />
                      <span>{t('technician.recommendedProjects', 'View Recommended Projects')}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {actionItems.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                        </div>
                        <Link
                          to={item.to}
                          className="shrink-0 min-h-[38px] px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center"
                        >
                          {item.cta}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* YOUR SKILLS SECTION */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Wrench size={16} className="text-emerald-600" />
                    <span>{t('technician.skillsSectionTitle', 'Your Skills')}</span>
                  </h2>
                  <Link
                    to="/technician/profile"
                    className="min-h-[36px] flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 focus-ring rounded"
                  >
                    {t('technician.viewAll', 'View All')}
                  </Link>
                </div>

                {profile?.renewableSkills && profile.renewableSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {profile.renewableSkills.slice(0, 8).map((sk, sIdx) => {
                      const skillName = typeof sk === 'object' ? sk.name : String(sk);
                      const isVerified = typeof sk === 'object' ? !!sk.isVerified : false;
                      const proficiency = typeof sk === 'object' ? sk.proficiency : null;

                      return (
                        <div
                          key={sIdx}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${
                            isVerified
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Clock size={12} className="text-slate-400 shrink-0" />
                          )}
                          <span>{skillName}</span>
                          {proficiency && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({proficiency.charAt(0)})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-slate-500">{t('technician.noSkillsYet', 'No skills added yet.')}</p>
                    <Link
                      to="/technician/profile"
                      className="min-h-[40px] inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <span>{t('technician.addSkillBtn', 'Add Skills')}</span>
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>

              {/* SKILL GAP / IMPROVEMENT SECTION */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span>Improve Your Skills</span>
                  </h2>
                  <Link
                    to="/technician/assessments"
                    className="min-h-[36px] flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 focus-ring rounded"
                  >
                    Take Test
                  </Link>
                </div>

                {extractedMissingSkills.length > 0 ? (
                  <div className="space-y-2.5 text-xs">
                    {extractedMissingSkills.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.name}</span>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            Missing Skill
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          Required by {item.requiredBy}. Boost your score with an assessment.
                        </p>
                      </div>
                    ))}
                    <div className="pt-1">
                      <Link
                        to="/technician/assessments"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Award size={14} />
                        <span>Take Assessment</span>
                      </Link>
                    </div>
                  </div>
                ) : assessments.length > 0 ? (
                  <div className="space-y-2.5 text-xs">
                    {assessments.slice(0, 2).map((a) => (
                      <div key={a._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {a.assessment?.title || 'Solar Competency Exam'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Score: {a.score || 85}% • {a.passed ? 'Passed' : 'Completed'}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      </div>
                    ))}
                    <Link
                      to="/technician/assessments"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline pt-1"
                    >
                      <span>Take another assessment →</span>
                    </Link>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-2">
                    <p className="text-slate-700 leading-snug">
                      Validate your technical competency with standardized renewable exams to boost your project match score.
                    </p>
                    <Link
                      to="/technician/assessments"
                      className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      <span>Browse Assessments</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                )}
              </div>

              {/* ACTIONABLE NEXT STEPS */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-3.5">
                <div className="pb-2 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Complete Your Profile</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Actionable steps to reach 100% verified workforce status.
                  </p>
                </div>

                {actionItems.length === 0 ? (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <span>Your profile is fully optimized for top EPC contractor matching!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {actionItems.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <h3 className="font-bold text-slate-800">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                        </div>
                        <Link
                          to={item.to}
                          className="shrink-0 px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 rounded-lg text-[11px] font-bold transition-colors"
                        >
                          {item.cta}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* QUICK ACTIONS */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {t('common.actions', 'Quick Navigation')}
                  </span>
                  <h2 className="text-base font-bold text-white mt-1">{t('common.actions', 'Quick Actions')}</h2>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    to="/technician/skill-passport"
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex flex-col justify-between transition-colors focus-ring"
                  >
                    <ShieldCheck size={16} className="text-emerald-400 mb-1" />
                    <span className="font-semibold text-white">{t('navigation.skillPassport')}</span>
                  </Link>

                  <Link
                    to="/technician/recommended"
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex flex-col justify-between transition-colors focus-ring"
                  >
                    <Compass size={16} className="text-teal-400 mb-1" />
                    <span className="font-semibold text-white">{t('technician.recommendedProjects')}</span>
                  </Link>

                  <Link
                    to="/technician/assessments"
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex flex-col justify-between transition-colors focus-ring"
                  >
                    <Award size={16} className="text-amber-400 mb-1" />
                    <span className="font-semibold text-white">{t('navigation.assessments')}</span>
                  </Link>

                  <Link
                    to="/technician/profile"
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl flex flex-col justify-between transition-colors focus-ring"
                  >
                    <User size={16} className="text-sky-400 mb-1" />
                    <span className="font-semibold text-white">{t('technician.editProfile')}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Apply to Project Modal */}
      {applyModalProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Briefcase size={16} />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {t('technician.confirmApplication')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setApplyModalProject(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg focus-ring cursor-pointer"
                aria-label={t('common.close')}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                {applyModalProject.projectName || 'Clean Energy Project'}
              </h3>
              <p className="text-xs text-slate-500">
                {applyModalProject.companyId?.companyName ||
                  applyModalProject.companyName ||
                  applyModalProject.company?.name ||
                  'EPC Contractor'}
              </p>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label htmlFor="apply-cover-note" className="block text-xs font-bold text-slate-700 mb-1">
                  {t('technician.coverNotePrompt')}
                </label>
                <textarea
                  id="apply-cover-note"
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Mention your relevant solar/wind project experience, team lead capability, and notice period..."
                  rows={3}
                  className="w-full text-sm sm:text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalProject(null)}
                  className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 cursor-pointer focus-ring flex items-center justify-center"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={applyingId === applyModalProject._id}
                  className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer focus-ring flex items-center justify-center"
                >
                  {applyingId === applyModalProject._id ? t('common.loading') : t('technician.submitApplication')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
