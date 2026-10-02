import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Upload,
  Eye,
  Download,
  Calendar,
  Building,
  Award,
  FileCheck,
  FileText,
  Filter,
  RefreshCw,
  QrCode,
  ArrowRight,
  ExternalLink,
  X,
  Plus,
  Check,
} from 'lucide-react';
import { technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const TechnicianCertificatesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modals & UI state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewCertModal, setViewCertModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  // Upload form state
  const [formData, setFormData] = useState({
    certificateName: '',
    issuingOrganization: 'Skill Council for Green Jobs (SCGJ)',
    certificateNumber: '',
    issueDate: '',
    expiryDate: '',
    category: 'Solar',
    documentUrl: '',
  });

  const [selectedFileName, setSelectedFileName] = useState('');

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const res = await technicianAPI.getMyCertificates();
      if (res.data?.success) {
        setCertificates(res.data.data || []);
      } else {
        setFetchError('Could not load certificates. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
      setFetchError('Unable to load certifications. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle local file selection and convert to Data URL for preview/upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds 5MB limit. Please upload a smaller file.');
        setTimeout(() => setErrorMessage(''), 4000);
        return;
      }
      setSelectedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, documentUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenUploadForReplace = (cert) => {
    setFormData({
      certificateName: cert.certificateName || '',
      issuingOrganization: cert.issuingOrganization || 'Skill Council for Green Jobs (SCGJ)',
      certificateNumber: cert.certificateNumber ? `${cert.certificateNumber}-REV` : '',
      issueDate: '',
      expiryDate: '',
      category: cert.category || 'Solar',
      documentUrl: '',
    });
    setSelectedFileName('');
    setShowUploadModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.certificateName.trim()) {
      setErrorMessage('Please enter the certificate name.');
      return;
    }
    if (!formData.issuingOrganization.trim()) {
      setErrorMessage('Please enter the issuing organization.');
      return;
    }
    if (!formData.certificateNumber.trim()) {
      setErrorMessage('Please enter the certificate or registration number.');
      return;
    }
    if (!formData.issueDate) {
      setErrorMessage('Please select the issue date.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await technicianAPI.uploadCertificate(formData);
      if (res.data?.success) {
        setSuccessMessage('Certificate uploaded! Submitted to official verification queue.');
        setShowUploadModal(false);
        setFormData({
          certificateName: '',
          issuingOrganization: 'Skill Council for Green Jobs (SCGJ)',
          certificateNumber: '',
          issueDate: '',
          expiryDate: '',
          category: 'Solar',
          documentUrl: '',
        });
        setSelectedFileName('');
        fetchCertificates();
        setTimeout(() => setSuccessMessage(''), 4500);
      }
    } catch (err) {
      console.error('Error uploading certificate:', err);
      setErrorMessage(
        err.response?.data?.message || 'Error submitting certificate. Please verify all fields.'
      );
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Expiry calculation helpers
  const isCertExpired = (cert) => {
    if (cert.status === 'Expired') return true;
    if (!cert.expiryDate) return false;
    return new Date(cert.expiryDate) < new Date();
  };

  const isCertExpiringSoon = (cert) => {
    if (isCertExpired(cert)) return false;
    if (!cert.expiryDate) return false;
    const diffTime = new Date(cert.expiryDate) - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 60;
  };

  // Metrics calculated from real existing data
  const totalCount = certificates.length;
  const verifiedCount = certificates.filter((c) => c.status === 'Verified' && !isCertExpired(c)).length;
  const pendingCount = certificates.filter((c) => c.status === 'Pending').length;
  const rejectedCount = certificates.filter((c) => c.status === 'Rejected').length;
  const expiredCount = certificates.filter((c) => isCertExpired(c)).length;

  // Filtered certificates list
  const filteredCertificates = certificates.filter((cert) => {
    if (activeFilter === 'Verified') return cert.status === 'Verified' && !isCertExpired(cert);
    if (activeFilter === 'Pending') return cert.status === 'Pending';
    if (activeFilter === 'Rejected') return cert.status === 'Rejected';
    if (activeFilter === 'Expired') return isCertExpired(cert);
    return true; // 'All'
  });

  const getStatusBadge = (cert) => {
    if (isCertExpired(cert)) {
      return {
        label: 'Expired',
        icon: AlertTriangle,
        className: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
      };
    }
    if (cert.status === 'Verified') {
      return {
        label: 'Verified',
        icon: CheckCircle2,
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
      };
    }
    if (cert.status === 'Rejected') {
      return {
        label: 'Rejected',
        icon: AlertCircle,
        className: 'bg-rose-50 text-rose-800 border-rose-200 font-bold',
      };
    }
    // Default: Pending
    return {
      label: 'Pending Review',
      icon: Clock,
      className: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Certificates"
          subtitle="Manage renewable credentials, licenses and verified qualifications"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Notifications */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
              <button
                onClick={() => setSuccessMessage('')}
                className="text-emerald-700 hover:text-emerald-900 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage('')}
                className="text-rose-700 hover:text-rose-900 p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* ================= SECTION 2: PAGE HEADER & ACTION ================= */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                My Certifications
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Manage your renewable-energy certifications and verified credentials.
              </p>
            </div>

            <button
              onClick={() => {
                setFormData({
                  certificateName: '',
                  issuingOrganization: 'Skill Council for Green Jobs (SCGJ)',
                  certificateNumber: '',
                  issueDate: '',
                  expiryDate: '',
                  category: 'Solar',
                  documentUrl: '',
                });
                setSelectedFileName('');
                setShowUploadModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Upload size={14} />
              <span>Upload Certificate</span>
            </button>
          </div>

          {/* ================= SUMMARY METRICS ROW ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Certificates */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Award size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">{totalCount}</div>
              <p className="text-[11px] text-slate-500">Registered credentials</p>
            </div>

            {/* Verified Certificates */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Verified
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-700 font-mono">{verifiedCount}</div>
              <p className="text-[11px] text-slate-500">Audit-verified credentials</p>
            </div>

            {/* Pending Review */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                  Pending Review
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-700 font-mono">{pendingCount}</div>
              <p className="text-[11px] text-slate-500">Awaiting admin review</p>
            </div>

            {/* Expired / Due */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Expired
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-800 font-mono">{expiredCount}</div>
              <p className="text-[11px] text-slate-500">Requiring renewal</p>
            </div>
          </div>

          {/* ================= SECTION 12: SKILL PASSPORT INFORMATIONAL CARD ================= */}
          <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Build Trust with Verified Credentials
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Verified certifications strengthen your Skill Passport and help EPC companies
                  evaluate your qualifications.
                </p>
              </div>
            </div>

            <Link
              to="/technician/skill-passport"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5 shrink-0 self-start md:self-auto shadow-xs"
            >
              <span>View Skill Passport</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* ================= SECTION 10: FILTERS BAR ================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              {[
                { label: 'All', count: totalCount },
                { label: 'Verified', count: verifiedCount },
                { label: 'Pending', count: pendingCount },
                { label: 'Rejected', count: rejectedCount },
                { label: 'Expired', count: expiredCount },
              ].map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveFilter(tab.label)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeFilter === tab.label
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      activeFilter === tab.label
                        ? 'bg-emerald-700/80 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredCertificates.length} of {totalCount} certificates
            </span>
          </div>

          {/* ================= SECTION 3 - 7: CERTIFICATE CARDS / LIST ================= */}
          {loading ? (
            /* Loading Skeleton State */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-5 bg-slate-200 rounded-full w-1/3" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                  <div className="h-16 bg-slate-50 rounded-lg p-3" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : fetchError ? (
            /* Error State */
            <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h2 className="text-base font-bold text-slate-900">Failed to Load Certificates</h2>
              <p className="text-xs text-slate-600">{fetchError}</p>
              <button
                onClick={fetchCertificates}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            </div>
          ) : totalCount === 0 ? (
            /* SECTION 11: OVERALL EMPTY STATE */
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 sm:p-14 text-center space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <ShieldCheck size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  No certifications added yet
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Upload your renewable-energy certifications to build a verified professional profile
                  and qualify for EPC project shortlists.
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <Upload size={14} />
                <span>Upload Your First Certificate</span>
              </button>
            </div>
          ) : filteredCertificates.length === 0 ? (
            /* Filter Empty State */
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
              <p className="text-xs text-slate-500">
                No certificates match the <strong className="text-slate-700">"{activeFilter}"</strong>{' '}
                filter.
              </p>
              <button
                onClick={() => setActiveFilter('All')}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Show All Certificates
              </button>
            </div>
          ) : (
            /* Certificate Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCertificates.map((cert) => {
                const statusMeta = getStatusBadge(cert);
                const StatusIcon = statusMeta.icon;
                const isExpired = isCertExpired(cert);
                const isExpiring = isCertExpiringSoon(cert);

                const issueFormatted = cert.issueDate
                  ? new Date(cert.issueDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A';

                const expiryFormatted = cert.expiryDate
                  ? new Date(cert.expiryDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Lifetime Validity';

                return (
                  <div
                    key={cert._id || cert.id}
                    className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm space-y-4 ${
                      cert.status === 'Verified' && !isExpired
                        ? 'border-emerald-200/80 bg-white'
                        : cert.status === 'Rejected'
                        ? 'border-rose-200 bg-white'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {/* Top Row: Category tag + Status Badge */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {cert.category || 'Solar PV'}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full border ${statusMeta.className}`}
                        >
                          <StatusIcon size={12} className="shrink-0" />
                          <span>{statusMeta.label}</span>
                        </span>
                      </div>

                      {/* Certificate Title & Organization */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {cert.certificateName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                          <Building size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{cert.issuingOrganization}</span>
                        </div>
                      </div>

                      {/* Certificate ID */}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500 block">Registration Number</span>
                        <span className="font-mono font-bold text-slate-800 tracking-wide mt-0.5 block truncate">
                          {cert.certificateNumber || 'N/A'}
                        </span>
                      </div>

                      {/* Dates Summary */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Issued</span>
                          <span className="font-mono text-slate-700 font-semibold text-[11px] mt-0.5 block">
                            {issueFormatted}
                          </span>
                        </div>
                        <div className="p-2 bg-slate-50/70 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">Valid Until</span>
                          <span
                            className={`font-mono font-semibold text-[11px] mt-0.5 block ${
                              isExpired
                                ? 'text-rose-600 font-bold'
                                : isExpiring
                                ? 'text-amber-700 font-bold'
                                : 'text-slate-700'
                            }`}
                          >
                            {expiryFormatted}
                          </span>
                        </div>
                      </div>

                      {/* SECTION 5: PENDING REVIEW NOTICE */}
                      {cert.status === 'Pending' && !isExpired && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[11px] text-amber-800 space-y-0.5">
                          <span className="font-bold block">Under Verification Review</span>
                          <p className="text-amber-700 leading-tight">
                            Your certificate is under review. Verification typically takes 24–48 hours.
                          </p>
                        </div>
                      )}

                      {/* SECTION 6: REJECTED NOTICE & REASON */}
                      {cert.status === 'Rejected' && (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-800 space-y-1">
                          <span className="font-bold flex items-center gap-1">
                            <AlertCircle size={12} className="text-rose-600" />
                            <span>Verification Rejected</span>
                          </span>
                          <p className="text-rose-700 leading-relaxed">
                            {cert.rejectionReason
                              ? `Reason: ${cert.rejectionReason}`
                              : 'The submitted document was unclear or details did not match official registry records.'}
                          </p>
                          <button
                            onClick={() => handleOpenUploadForReplace(cert)}
                            className="mt-1 text-xs font-bold text-rose-800 hover:text-rose-900 underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Re-upload / Replace Certificate</span>
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      )}

                      {/* SECTION 7: EXPIRY WARNING */}
                      {isExpiring && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between gap-2">
                          <span className="font-semibold">Certificate expiring soon</span>
                          <button
                            onClick={() => handleOpenUploadForReplace(cert)}
                            className="font-bold text-amber-900 underline cursor-pointer shrink-0"
                          >
                            Renew / Replace
                          </button>
                        </div>
                      )}

                      {isExpired && (
                        <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-lg text-[11px] text-slate-700 flex items-center justify-between gap-2">
                          <span className="font-semibold">Certificate expired</span>
                          <button
                            onClick={() => handleOpenUploadForReplace(cert)}
                            className="font-bold text-slate-900 underline cursor-pointer shrink-0"
                          >
                            Renew / Replace
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SECTION 9: ACTION BUTTONS */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => setViewCertModal(cert)}
                        className="flex-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg font-semibold border border-slate-200 inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>View Details</span>
                      </button>

                      {cert.documentUrl ? (
                        <a
                          href={cert.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-semibold border border-emerald-200 inline-flex items-center justify-center gap-1 transition-colors"
                          title="Open or download certificate document"
                        >
                          <ExternalLink size={13} />
                          <span>Document</span>
                        </a>
                      ) : (
                        <button
                          onClick={() => setViewCertModal(cert)}
                          className="py-1.5 px-3 bg-slate-50 text-slate-400 rounded-lg font-semibold border border-slate-200 inline-flex items-center justify-center gap-1 cursor-not-allowed"
                          title="No document file attached"
                        >
                          <FileText size={13} />
                          <span>Info</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ================= SECTION 8: UPLOAD CERTIFICATE MODAL ================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Certificate</h3>
                <p className="text-xs text-slate-500">
                  Submit credentials for accreditation audit and Skill Passport verification
                </p>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Certificate Name *
                </label>
                <input
                  type="text"
                  name="certificateName"
                  required
                  placeholder="e.g. Certified Solar PV Wireman & Installer (Grade I)"
                  value={formData.certificateName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  name="issuingOrganization"
                  required
                  placeholder="e.g. Skill Council for Green Jobs (SCGJ), NISE, GWO, NSDC"
                  value={formData.issuingOrganization}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Certificate / Reg. Number *
                  </label>
                  <input
                    type="text"
                    name="certificateNumber"
                    required
                    placeholder="e.g. SCGJ-PV-2024-9988"
                    value={formData.certificateNumber}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Technology Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 text-xs"
                  >
                    <option value="Solar">Solar PV</option>
                    <option value="Wind">Wind Energy</option>
                    <option value="Safety">Safety & Compliance</option>
                    <option value="General Electrical">General Electrical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    name="issueDate"
                    required
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Expiry Date <span className="font-normal text-slate-400">(if applicable)</span>
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-900 text-xs"
                  />
                </div>
              </div>

              {/* Certificate File Upload / Document URL */}
              <div className="space-y-1.5 pt-1">
                <label className="block font-semibold text-slate-700">
                  Certificate Document File
                </label>
                <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    id="cert-file-upload"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="cert-file-upload"
                    className="cursor-pointer block space-y-1"
                  >
                    <Upload size={18} className="mx-auto text-slate-400" />
                    <span className="text-xs font-semibold text-emerald-700 block">
                      {selectedFileName ? selectedFileName : 'Choose certificate file (PDF, JPG, PNG)'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Max file size: 5MB
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={13} className="animate-spin" />
                      <span>Submitting for Audit...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      <span>Upload Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= VIEW CERTIFICATE DETAILS MODAL ================= */}
      {viewCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Certificate Details</h3>
              </div>
              <button
                onClick={() => setViewCertModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[11px] text-slate-400 block font-medium">Certificate Title</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {viewCertModal.certificateName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Issuing Organization
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {viewCertModal.issuingOrganization}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Category / Sector
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {viewCertModal.category || 'Solar PV'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Certificate Registration ID
                  </span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">
                    {viewCertModal.certificateNumber || 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">
                    Verification Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold mt-0.5 ${
                      viewCertModal.status === 'Verified'
                        ? 'text-emerald-700'
                        : viewCertModal.status === 'Rejected'
                        ? 'text-rose-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {viewCertModal.status === 'Verified' && <CheckCircle2 size={13} />}
                    {viewCertModal.status === 'Rejected' && <AlertCircle size={13} />}
                    {viewCertModal.status === 'Pending' && <Clock size={13} />}
                    <span>{viewCertModal.status}</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Issue Date</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">
                    {viewCertModal.issueDate
                      ? new Date(viewCertModal.issueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] text-slate-400 block font-medium">Expiry Date</span>
                  <span className="font-mono text-slate-700 mt-0.5 block">
                    {viewCertModal.expiryDate
                      ? new Date(viewCertModal.expiryDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Lifetime Validity'}
                  </span>
                </div>
              </div>

              {viewCertModal.status === 'Rejected' && viewCertModal.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <AlertCircle size={13} className="text-rose-600" />
                    <span>Audit Rejection Reason</span>
                  </span>
                  <p className="text-rose-700 leading-relaxed text-[11px]">
                    {viewCertModal.rejectionReason}
                  </p>
                </div>
              )}

              {viewCertModal.documentUrl && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 block font-medium mb-1">
                    Certificate Document Preview
                  </span>
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-48 bg-slate-100 flex items-center justify-center">
                    <img
                      src={viewCertModal.documentUrl}
                      alt={viewCertModal.certificateName}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {viewCertModal.documentUrl ? (
                <a
                  href={viewCertModal.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  <span>Open Full Document</span>
                </a>
              ) : (
                <div />
              )}

              <button
                onClick={() => setViewCertModal(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianCertificatesPage;
