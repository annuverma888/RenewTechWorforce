import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  ExternalLink,
  User,
  Building,
  Calendar,
  Sparkles,
  ChevronLeft,
  X,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const AdminCertificatesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Pending'); // 'All', 'Pending', 'Verified', 'Rejected'
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected certificate for verification modal
  const [selectedCert, setSelectedCert] = useState(null);
  const [actionType, setActionType] = useState(null); // 'verify' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('Accreditation registration verified against national database.');
  const [processing, setProcessing] = useState(false);

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await adminAPI.getCertificates(params);
      if (res.data?.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching certificates for admin:', err);
      showToast('Could not load certificates queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  // Handle Verify or Reject
  const handleConfirmAction = async (e) => {
    e.preventDefault();
    if (!selectedCert || !actionType) return;

    try {
      setProcessing(true);
      const payload = {
        status: actionType === 'verify' ? 'Verified' : 'Rejected',
        adminNotes: adminNotes.trim(),
        rejectionReason: actionType === 'reject' ? rejectionReason.trim() : undefined,
      };

      const res = await adminAPI.verifyCertificate(selectedCert._id, payload);
      if (res.data?.success) {
        showToast(
          actionType === 'verify'
            ? `✓ Certificate for "${selectedCert.technician?.name}" verified and issued badge!`
            : `Certificate rejected with feedback for "${selectedCert.technician?.name}".`,
          actionType === 'verify' ? 'success' : 'info'
        );
        setSelectedCert(null);
        setActionType(null);
        setRejectionReason('');
        fetchCertificates();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error processing certificate verification.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  // Filter list
  const filteredCerts = certificates.filter((c) => {
    const techName = c.technician?.name?.toLowerCase() || '';
    const certName = c.certificateName?.toLowerCase() || '';
    const orgName = c.issuingOrganization?.toLowerCase() || '';
    const certNum = c.certificateNumber?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    const matchesSearch =
      techName.includes(q) || certName.includes(q) || orgName.includes(q) || certNum.includes(q);

    if (!matchesSearch) return false;
    if (categoryFilter !== 'All' && c.category !== categoryFilter) return false;

    return true;
  });

  // Calculate Metrics
  const totalCount = certificates.length;
  const pendingCount = certificates.filter((c) => c.status === 'Pending').length;
  const verifiedCount = certificates.filter((c) => c.status === 'Verified').length;
  const rejectedCount = certificates.filter((c) => c.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border animate-in slide-in-from-top-4 duration-300 ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : toast.type === 'info'
                  ? 'bg-slate-900 text-white border-slate-700'
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

          {/* Page Title & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/dashboard"
                  className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Admin Hub
                </Link>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Accreditation Authority
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
                <BadgeCheck className="text-emerald-600" size={30} />
                Renewable Certificate Verification Portal
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Audit and verify official clean energy credentials (Suryamitra, SCGJ, GWO, NISE) to ensure
                authentic competence across the platform.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchCertificates}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors self-start sm:self-center"
            >
              Refresh Queue
            </button>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setStatusFilter('Pending')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                statusFilter === 'Pending'
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/30'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-amber-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'Pending' ? 'text-amber-100' : 'text-slate-400'}`}>
                  Pending Review
                </span>
                <Clock size={18} className={statusFilter === 'Pending' ? 'text-amber-200' : 'text-amber-500'} />
              </div>
              <div className="text-2xl font-black mt-2">{pendingCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Pending' ? 'text-amber-100' : 'text-slate-500'}`}>
                Awaiting administrative audit
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Verified')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                statusFilter === 'Verified'
                  ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400/30'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'Verified' ? 'text-emerald-100' : 'text-slate-400'}`}>
                  Verified Badges
                </span>
                <ShieldCheck size={18} className={statusFilter === 'Verified' ? 'text-emerald-200' : 'text-emerald-500'} />
              </div>
              <div className="text-2xl font-black mt-2">{verifiedCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Verified' ? 'text-emerald-100' : 'text-slate-500'}`}>
                Accredited & passport enabled
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('Rejected')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                statusFilter === 'Rejected'
                  ? 'bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400/30'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-rose-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'Rejected' ? 'text-rose-100' : 'text-slate-400'}`}>
                  Rejected
                </span>
                <XCircle size={18} className={statusFilter === 'Rejected' ? 'text-rose-200' : 'text-rose-500'} />
              </div>
              <div className="text-2xl font-black mt-2">{rejectedCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'Rejected' ? 'text-rose-100' : 'text-slate-500'}`}>
                Failed verification check
              </p>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`p-5 rounded-2xl border text-left transition-all ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-400/30'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-400 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${statusFilter === 'All' ? 'text-slate-300' : 'text-slate-400'}`}>
                  Total In Vault
                </span>
                <FileCheck size={18} className={statusFilter === 'All' ? 'text-slate-300' : 'text-slate-500'} />
              </div>
              <div className="text-2xl font-black mt-2">{totalCount}</div>
              <p className={`text-[11px] mt-1 ${statusFilter === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
                All credential submissions
              </p>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search technician, certificate, org, or cert ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                <Filter size={14} /> Domain:
              </span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
              >
                <option value="All">All Domains</option>
                <option value="Solar">Solar PV</option>
                <option value="Wind">Wind Energy</option>
                <option value="Other">Safety / Electrical</option>
              </select>
            </div>
          </div>

          {/* Certificates Queue List */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading credential verification queue...
            </div>
          ) : filteredCerts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              <FileCheck size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No certificates matching this filter</p>
              <p className="text-xs text-slate-400 mt-1">Try switching status filters or clearing search criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCerts.map((cert) => {
                const isPending = cert.status === 'Pending';
                const isVerified = cert.status === 'Verified';
                const isRejected = cert.status === 'Rejected';

                return (
                  <div
                    key={cert._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Left: Technician Info & Certificate Details */}
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={
                          cert.technician?.profilePhoto ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${cert.technician?.name}&backgroundColor=059669`
                        }
                        alt={cert.technician?.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0 mt-0.5"
                      />

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            {cert.certificateName}
                          </h3>
                          <Badge
                            variant={
                              isVerified ? 'verified' : isPending ? 'pending' : 'rejected'
                            }
                          >
                            {isVerified ? '✓ Verified' : isPending ? 'Pending Audit' : 'Rejected'}
                          </Badge>
                          <Badge variant={cert.category === 'Solar' ? 'solar' : 'wind'}>
                            {cert.category}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {cert.technician?._id ? (
                            <Link
                              to={`/technicians/${cert.technician._id}`}
                              className="font-semibold text-slate-800 hover:text-emerald-700 flex items-center gap-1 hover:underline transition-colors"
                              title="View Technician Profile"
                            >
                              <User size={13} className="text-slate-400" />
                              {cert.technician.name || 'Technician'}
                            </Link>
                          ) : (
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <User size={13} className="text-slate-400" />
                              {cert.technician?.name || 'Technician'}
                            </span>
                          )}
                          {cert.technician?._id && (
                            <>
                              <span>•</span>
                              <Link
                                to={`/verify/skill-passport/${cert.technician._id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                                title="Open Public Skill Passport Verification"
                              >
                                <ShieldCheck size={12} /> Skill Passport <ExternalLink size={10} />
                              </Link>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-slate-600 font-medium">
                            {cert.issuingOrganization}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-600">ID: {cert.certificateNumber}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                          </span>
                          {cert.expiryDate && (
                            <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                          )}
                          {isVerified && cert.verifiedAt && (
                            <span className="text-emerald-700 font-semibold">
                              Verified on: {new Date(cert.verifiedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {/* Rejection / Admin notes */}
                        {isRejected && cert.rejectionReason && (
                          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                            <strong>Rejection Note:</strong> {cert.rejectionReason}
                          </div>
                        )}
                        {cert.adminNotes && (
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                            Note: "{cert.adminNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 self-end md:self-center">
                      {cert.documentUrl && (
                        <a
                          href={cert.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 text-xs text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                        >
                          <Eye size={13} /> View Document <ExternalLink size={11} />
                        </a>
                      )}

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCert(cert);
                                setActionType('verify');
                                setAdminNotes('Accreditation registration verified against national database.');
                              }}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
                            >
                              <CheckCircle2 size={13} /> Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCert(cert);
                                setActionType('reject');
                                setRejectionReason('Registration number could not be validated on government repository.');
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {isVerified && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCert(cert);
                              setActionType('reject');
                              setRejectionReason('Revoking verification: credential expired or invalidated.');
                            }}
                            className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            Revoke
                          </button>
                        )}

                        {isRejected && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCert(cert);
                              setActionType('verify');
                              setAdminNotes('Re-checked and approved following manual accreditation confirmation.');
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <CheckCircle2 size={13} /> Re-verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Verification / Rejection Modal */}
          {selectedCert && actionType && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-5 border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    {actionType === 'verify' ? (
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                        <XCircle size={18} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {actionType === 'verify' ? 'Verify & Issue Credential Badge' : 'Reject Certificate Submission'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Candidate: {selectedCert.technician?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCert(null);
                      setActionType(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Certificate Summary Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{selectedCert.certificateName}</span>
                    <Badge variant={selectedCert.category === 'Solar' ? 'solar' : 'wind'}>
                      {selectedCert.category}
                    </Badge>
                  </div>
                  <p className="text-slate-600">
                    Authority: <strong className="text-slate-800">{selectedCert.issuingOrganization}</strong>
                  </p>
                  <p className="font-mono text-slate-500">
                    Registration No: {selectedCert.certificateNumber}
                  </p>
                </div>

                <form onSubmit={handleConfirmAction} className="space-y-4">
                  {actionType === 'verify' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Accreditation Audit Note
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="e.g., Validated via SCGJ green skills repository registration lookup..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Approving will immediately grant the <strong>✓ Verified Certificate</strong> badge on this technician's profile, boosting their AI match ranking.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Reason for Rejection (Visible to Technician)
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why the certificate could not be verified (e.g., blurred document, credential ID not found)..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCert(null);
                        setActionType(null);
                      }}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={processing}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-50 transition-all ${
                        actionType === 'verify'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {processing
                        ? 'Processing...'
                        : actionType === 'verify'
                        ? 'Confirm Verification'
                        : 'Confirm Rejection'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminCertificatesPage;
