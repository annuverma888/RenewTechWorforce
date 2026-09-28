import React, { useState, useEffect } from 'react';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Calendar,
  ShieldCheck,
  X,
} from 'lucide-react';
import { technicianAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const TechnicianCertificatesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [viewCertModal, setViewCertModal] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await technicianAPI.getMyCertificates();
      if (res.data?.success) {
        setCertificates(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await technicianAPI.uploadCertificate(formData);
      if (res.data?.success) {
        setSuccessMessage('Certificate uploaded! Submitted to verification queue.');
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
        fetchCertificates();
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error uploading certificate.');
      setTimeout(() => setErrorMessage(''), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      case 'Expired':
        return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Certificates"
          subtitle="Manage credentials and accredited skill qualifications"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Alerts */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Top Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Certificate Management
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload government (SCGJ, NSDC, GWO) accreditations for audit and verification
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Upload size={14} />
              <span>Upload Certificate</span>
            </button>
          </div>

          {/* Certificates Table matching Section 13 Technician Specification */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading your certificates...</div>
            ) : certificates.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-xs text-slate-500 font-medium">No certificates uploaded yet.</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  <Upload size={14} />
                  <span>Upload Your First Certificate</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-5">Certificate</th>
                      <th className="py-3.5 px-5">Issuer</th>
                      <th className="py-3.5 px-5">Issue Date</th>
                      <th className="py-3.5 px-5">Expiry Date</th>
                      <th className="py-3.5 px-5">Verification Status</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {certificates.map((cert) => (
                      <tr key={cert._id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Certificate */}
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-900 block">{cert.certificateName}</span>
                          <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                            ID: {cert.certificateNumber || 'SCGJ-2024-PV'}
                          </span>
                        </td>

                        {/* Issuer */}
                        <td className="py-4 px-5 text-slate-700 font-medium">
                          {cert.issuingOrganization || 'Skill Council for Green Jobs'}
                        </td>

                        {/* Issue Date */}
                        <td className="py-4 px-5 text-slate-600 font-mono">
                          {cert.issueDate
                            ? new Date(cert.issueDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '15 Mar 2022'}
                        </td>

                        {/* Expiry Date */}
                        <td className="py-4 px-5 text-slate-600 font-mono">
                          {cert.expiryDate
                            ? new Date(cert.expiryDate).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : '15 Mar 2027'}
                        </td>

                        {/* Verification Status */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-[11px] border ${getStatusBadge(
                              cert.status || 'Verified'
                            )}`}
                          >
                            {cert.status || 'Verified'}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-5 text-right space-x-2 shrink-0">
                          <button
                            onClick={() => setViewCertModal(cert)}
                            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold border border-slate-200 inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <a
                            href={cert.documentUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-semibold border border-emerald-200 inline-flex items-center gap-1 transition-colors"
                          >
                            <Download size={12} />
                            <span>Download</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Certificate Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Upload Certificate</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Name *</label>
                <input
                  type="text"
                  name="certificateName"
                  required
                  placeholder="e.g. Solar PV Installer (Level 4)"
                  value={formData.certificateName}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Issuing Authority *</label>
                <input
                  type="text"
                  name="issuingOrganization"
                  required
                  placeholder="e.g. Skill Council for Green Jobs (SCGJ)"
                  value={formData.issuingOrganization}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Certificate Number</label>
                <input
                  type="text"
                  name="certificateNumber"
                  placeholder="e.g. SCGJ-PV-2024-9988"
                  value={formData.certificateNumber}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleChange}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600 focus:bg-white"
                >
                  <option value="Solar">Solar PV</option>
                  <option value="Wind">Wind Energy</option>
                  <option value="Safety">Safety & Compliance</option>
                  <option value="Electrical">Electrical License</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Submit for Audit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Certificate Modal */}
      {viewCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Certificate Details</h3>
              <button
                onClick={() => setViewCertModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Certificate Title</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">{viewCertModal.certificateName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-400 block font-medium">Issuing Organization</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{viewCertModal.issuingOrganization}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Certificate ID</span>
                  <span className="font-mono font-bold text-slate-800 mt-0.5 block">{viewCertModal.certificateNumber || 'N/A'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block font-medium">Verification Status</span>
                  <span className="font-bold text-emerald-700 mt-0.5 block">✓ {viewCertModal.status}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewCertModal(null)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
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
