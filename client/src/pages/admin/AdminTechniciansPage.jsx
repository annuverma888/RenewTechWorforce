import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  AlertCircle,
  Star,
  MapPin,
  Briefcase,
  Award,
  RefreshCw,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const AdminTechniciansPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, active, suspended
  const [verificationFilter, setVerificationFilter] = useState('All'); // All, verified, unverified
  const [selectedTech, setSelectedTech] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTechnicians();
      if (res.data?.success) {
        setTechnicians(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching technicians for admin:', err);
      showToast('Could not load technicians directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = newStatus === 'active' ? 'Reactivate' : 'Suspend';

    if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} user "${userObj.name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminAPI.toggleUserStatus(userObj._id, newStatus);
      if (res.data?.success) {
        showToast(`User "${userObj.name}" is now ${newStatus}.`, newStatus === 'active' ? 'success' : 'info');
        setTechnicians((prev) =>
          prev.map((item) =>
            item.user._id === userObj._id
              ? { ...item, user: { ...item.user, status: newStatus } }
              : item
          )
        );
        if (selectedTech && selectedTech.user._id === userObj._id) {
          setSelectedTech((prev) => ({
            ...prev,
            user: { ...prev.user, status: newStatus },
          }));
        }
      }
    } catch (err) {
      console.error('Error toggling user status:', err);
      showToast('Failed to update user status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering
  const filteredTechnicians = technicians.filter((item) => {
    const u = item.user;
    const p = item.profile;
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      u?.name?.toLowerCase().includes(query) ||
      u?.email?.toLowerCase().includes(query) ||
      p?.profession?.toLowerCase().includes(query) ||
      p?.city?.toLowerCase().includes(query) ||
      p?.state?.toLowerCase().includes(query) ||
      (p?.renewableSkills || []).some((s) => s.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'All' || u?.status === statusFilter;

    const matchesVerification =
      verificationFilter === 'All' ||
      (verificationFilter === 'verified' && (item.verifiedCertificatesCount > 0)) ||
      (verificationFilter === 'unverified' && (!item.verifiedCertificatesCount || item.verifiedCertificatesCount === 0));

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const totalCount = technicians.length;
  const verifiedCount = technicians.filter((t) => t.verifiedCertificatesCount > 0).length;
  const suspendedCount = technicians.filter((t) => t.user.status === 'suspended').length;
  const activeCount = totalCount - suspendedCount;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold border animate-in slide-in-from-top-4 duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : toast.type === 'info'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
          ) : toast.type === 'info' ? (
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Page Title & KPI Quick bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Workforce Directory
                </span>
                <span className="text-xs text-slate-500">Live Management</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                Technician Workforce Management
              </h1>
              <p className="text-xs text-slate-500">
                Oversee verified credentials, assessment scores, and platform access status across renewable technicians.
              </p>
            </div>

            <button
              onClick={fetchTechnicians}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all self-start sm:self-auto"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Directory</span>
            </button>
          </div>

          {/* KPI Summary Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Technicians</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                <ShieldCheck size={13} /> Verified Certified
              </span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{verifiedCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-sky-600 uppercase">Active Accounts</span>
              <p className="text-2xl font-black text-sky-700 mt-1">{activeCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-600 uppercase">Suspended</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{suspendedCount}</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, skill (e.g. PV Wiring), or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>

              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Verification</option>
                <option value="verified">Verified Credentials Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
          </div>

          {/* Technicians Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                Loading workforce records...
              </div>
            ) : filteredTechnicians.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No technicians match your search or filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
                  <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Technician</th>
                      <th className="py-3 px-4">Role & Experience</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Certifications</th>
                      <th className="py-3 px-4">Skill Score</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTechnicians.map((item) => {
                      const u = item.user;
                      const p = item.profile || {};
                      const isSuspended = u.status === 'suspended';

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  u.profilePhoto ||
                                  `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}&backgroundColor=059669`
                                }
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div>
                                <Link
                                  to={`/technicians/${u._id}`}
                                  className="font-bold text-slate-900 hover:text-emerald-700 hover:underline transition-colors flex items-center gap-1.5"
                                  title="View Full Profile"
                                >
                                  <span>{u.name}</span>
                                  {item.verifiedCertificatesCount > 0 && (
                                    <span title="Verified Credentials" className="text-emerald-600">
                                      <ShieldCheck size={14} />
                                    </span>
                                  )}
                                </Link>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">
                              {p.profession || 'Renewable Technician'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {p.yearsOfExperience || 0} years exp.
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 text-slate-700">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span>{p.city ? `${p.city}, ${p.state}` : 'Not Specified'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {item.verifiedCertificatesCount > 0 ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                  <ShieldCheck size={12} />
                                  {item.verifiedCertificatesCount} Verified
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">0 Verified</span>
                              )}
                              <span className="text-[10px] text-slate-400">({item.certificatesCount} total)</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-emerald-600 h-1.5 rounded-full"
                                  style={{ width: `${p.overallSkillScore || 50}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-800">{p.overallSkillScore || 50}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                                isSuspended
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to={`/verify/skill-passport/${u._id}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Inspect Public Digital Skill Passport"
                                className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              >
                                <ExternalLink size={15} />
                              </Link>

                              <button
                                onClick={() => setSelectedTech(item)}
                                title="Quick Profile Details"
                                className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={actionLoading}
                                title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
                                  isSuspended
                                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300'
                                }`}
                              >
                                {isSuspended ? 'Activate' : 'Suspend'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal: Quick Profile Inspection */}
      {selectedTech && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedTech.user.profilePhoto ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${selectedTech.user.name}&backgroundColor=059669`
                  }
                  alt={selectedTech.user.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedTech.user.name}
                    {selectedTech.verifiedCertificatesCount > 0 && (
                      <ShieldCheck size={16} className="text-emerald-600" />
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedTech.user.email} • {selectedTech.user.phone || 'No phone'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTech(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Profession</span>
                  <p className="font-semibold text-slate-900">{selectedTech.profile?.profession || 'Technician'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Experience</span>
                  <p className="font-semibold text-slate-900">{selectedTech.profile?.yearsOfExperience || 0} Years</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Expected Daily Rate</span>
                  <p className="font-semibold text-slate-900">₹{selectedTech.profile?.expectedDailyRate || 'Not Set'}/day</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Availability</span>
                  <p className="font-semibold text-slate-900">{selectedTech.profile?.currentAvailability || 'Available'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
                  Renewable Energy Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedTech.profile?.renewableSkills || []).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[11px] border border-emerald-200"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {selectedTech.profile?.bio && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Bio & Project Background
                  </span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl text-[11px] leading-relaxed">
                    {selectedTech.profile.bio}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <Link
                  to={`/technicians/${selectedTech.user._id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:underline"
                >
                  <span>Full Profile</span>
                  <ExternalLink size={12} />
                </Link>
                <Link
                  to={`/verify/skill-passport/${selectedTech.user._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  <ShieldCheck size={13} />
                  <span>Public Skill Passport</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              <button
                onClick={() => setSelectedTech(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
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

export default AdminTechniciansPage;
