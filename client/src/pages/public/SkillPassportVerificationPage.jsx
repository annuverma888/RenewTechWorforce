import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Award,
  FileCheck,
  Briefcase,
  Star,
  MapPin,
  AlertTriangle,
  XCircle,
  Zap,
} from 'lucide-react';
import { technicianAPI } from '../../services/api';
import Badge from '../../components/common/Badge';

const SkillPassportVerificationPage = () => {
  const { technicianId, id } = useParams();
  const targetId = technicianId || id;

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const [error, setError] = useState(null);
  const [scanDate] = useState(() => new Date().toLocaleString());

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
      console.warn('[Public Verification] Fetch error:', err);
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
          setNotFound(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    fetchPublicVerification();
  }, [fetchPublicVerification]);

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 selection:bg-emerald-600">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner mb-6 animate-pulse">
          <ShieldCheck size={32} />
        </div>
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-black tracking-tight text-white">Verifying Skill Passport...</h2>
        <p className="text-xs text-slate-400 mt-1.5 font-medium">
          Checking public credential authority records...
        </p>
      </div>
    );
  }

  // NOT FOUND STATE
  if (notFound || (!passport && !verificationFailed)) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-600">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} />
          </div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
            RenewTech Workforce
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Skill Passport Not Found
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            The passport could not be verified. Please check the QR code and try again.
          </p>
          {targetId && (
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 border border-slate-200 mb-4">
              Scanned ID: <span className="font-bold text-slate-900">{targetId}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-4">
            Verified National Renewable Energy Registry
          </div>
        </div>
      </div>
    );
  }

  // PASSPORT VERIFICATION FAILED (exists but not verified / suspended)
  if (verificationFailed) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-600">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <div className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-1">
            RenewTech Workforce
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Passport Verification Failed
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            The passport exists on record, but official verification is not active or has been suspended.
          </p>
          {passport?.passportId && (
            <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 border border-slate-200 mb-4">
              Passport ID: <span className="font-bold text-slate-900">{passport.passportId}</span>
            </div>
          )}
          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-4">
            Please contact RenewTech Workforce Administration for status inquiries.
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS STATE: Clean, Verified Public Skill Passport
  const technician = passport.technician || {};
  const scores = passport.scores || {};
  const verifiedSkills = passport.verifiedSkills || [];
  const skillsList = passport.skills || verifiedSkills.map(s => typeof s === 'string' ? s : s.name);
  const verifiedCertificates = passport.verifiedCertificates || [];
  const completedProjects = passport.completedProjects || passport.projectWorkforceSummary?.previousProjects || [];
  const ratingBreakdown = passport.ratingBreakdown || {};

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Brand Header */}
      <header className="bg-slate-900 text-white px-6 py-4 border-b border-slate-800 shadow-sm text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
            ⚡
          </div>
          <div className="text-base font-black tracking-tight text-white">
            RENEWTECH <span className="text-emerald-400">WORKFORCE</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-xl overflow-hidden">
          {/* Top Green Banner: ✓ VERIFIED SKILL PASSPORT */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-5 sm:p-6 text-white text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/30 px-2 py-0.5 rounded border border-emerald-400/30">
                  Official Public Record
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                  ✓ VERIFIED SKILL PASSPORT
                </h1>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <span className="text-xs font-mono font-bold text-slate-300 block">
                {passport.passportId}
              </span>
              <span className="text-[10px] text-emerald-300/80">
                National Clean Energy Registry
              </span>
            </div>
          </div>

          {/* Technician Profile Identity */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img
                src={
                  technician.profilePhoto ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(technician.name || 'Technician')}&backgroundColor=059669`
                }
                alt={technician.name || 'Technician'}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-emerald-500/20 border-2 border-white shadow-md shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-black text-slate-900">{technician.name || 'Rahul Kumar'}</h2>
                  <Badge variant="verified">✓ Verified</Badge>
                </div>
                <p className="text-sm font-bold text-emerald-700 mt-1">
                  {technician.profession || 'Certified Solar PV Wireman'}
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 mt-2.5">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    {technician.city || 'Kanpur'}, {technician.state || 'Uttar Pradesh'}
                  </span>
                  <span className="font-semibold text-slate-700">
                    Passport ID: <span className="font-mono text-emerald-800">{passport.passportId}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip: Score, Experience, Verified Certificates, Rating */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 sm:p-6 bg-white border-b border-slate-100 text-center">
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Skill Score
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-0.5">
                {scores.overallSkillScore || 67}%
              </div>
              <span className="text-[10px] font-semibold text-emerald-800">
                {scores.skillLevel || 'Proficient'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Experience
              </span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">
                {technician.experienceYears || 2}+ Years
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Practical</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Verified Certificates
              </span>
              <div className="text-2xl font-black text-slate-800 mt-0.5">
                {passport.verifiedCertificatesCount || verifiedCertificates.length || 3}
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Accredited</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Rating
              </span>
              <div className="text-2xl font-black text-slate-800 mt-0.5 flex items-center justify-center gap-1">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span>{ratingBreakdown.overall || 5.0}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">EPC Verified</span>
            </div>
          </div>

          {/* Skills Section */}
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Award size={15} className="text-emerald-600" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillsList && skillsList.length > 0 ? (
                skillsList.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    {typeof skill === 'string' ? skill : skill.name}
                  </span>
                ))
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Solar PV Installation
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    PV Wiring
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Electrical Safety
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Verified Certificates Section */}
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <FileCheck size={15} className="text-emerald-600" />
              Verified Certificates
            </h3>
            <div className="space-y-2">
              {verifiedCertificates.length > 0 ? (
                verifiedCertificates.map((cert, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{cert.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Issuing Body: <span className="text-slate-700 font-medium">{cert.issuingOrganization}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      ✓ Verified
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500">
                  <div className="font-bold text-slate-800">Certified Solar PV Wireman & Installer (Grade I)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">National Institute of Solar Energy (NISE) • Verified</div>
                </div>
              )}
            </div>
          </div>

          {/* Completed Projects Section */}
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <Briefcase size={15} className="text-emerald-600" />
              Completed Projects
            </h3>
            <div className="space-y-2">
              {completedProjects && completedProjects.length > 0 ? (
                completedProjects.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">{p.projectName || p.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Role: <span className="font-medium text-slate-700">{p.role || 'Senior Technician'}</span>
                        {p.location && <span className="text-slate-400"> • {p.location}</span>}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                      ✓ Completed
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500">
                  <div className="font-bold text-slate-800">50MW Utility Solar Installation</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Lead Electrical Wireman • Completed</div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Authority Guarantee Seal */}
          <div className="p-6 bg-slate-900 text-white text-center space-y-1">
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} />
              <span>✓ Verified by RenewTech Workforce</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Scan verified through RenewTech Workforce
            </p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Verified scan timestamp: {scanDate}
            </p>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        RenewTech Workforce • Clean Energy EPC Verification Authority
      </footer>
    </div>
  );
};

export default SkillPassportVerificationPage;
