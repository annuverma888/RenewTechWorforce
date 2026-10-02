import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Filter,
  Building,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  AlertCircle,
  MapPin,
  FolderGit2,
  Users,
  RefreshCw,
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const AdminCompaniesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [domainFilter, setDomainFilter] = useState('All');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCompanies();
      if (res.data?.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching companies for admin:', err);
      showToast('Could not load companies directory.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleStatus = async (userObj) => {
    const newStatus = userObj.status === 'suspended' ? 'active' : 'suspended';
    const actionLabel = newStatus === 'active' ? 'Reactivate' : 'Suspend';

    if (!window.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} company account "${userObj.name}"?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminAPI.toggleUserStatus(userObj._id, newStatus);
      if (res.data?.success) {
        showToast(`Company account "${userObj.name}" is now ${newStatus}.`, newStatus === 'active' ? 'success' : 'info');
        setCompanies((prev) =>
          prev.map((item) =>
            item.user._id === userObj._id
              ? { ...item, user: { ...item.user, status: newStatus } }
              : item
          )
        );
        if (selectedCompany && selectedCompany.user._id === userObj._id) {
          setSelectedCompany((prev) => ({
            ...prev,
            user: { ...prev.user, status: newStatus },
          }));
        }
      }
    } catch (err) {
      console.error('Error toggling company status:', err);
      showToast('Failed to update company account status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter companies
  const filteredCompanies = companies.filter((item) => {
    const u = item.user;
    const p = item.profile || {};
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      (p.companyName || u?.name || '').toLowerCase().includes(query) ||
      (u?.email || '').toLowerCase().includes(query) ||
      (p.city || '').toLowerCase().includes(query) ||
      (p.state || '').toLowerCase().includes(query) ||
      (p.registrationNumber || '').toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' || u?.status === statusFilter;

    const matchesDomain =
      domainFilter === 'All' || p.primaryDomain === domainFilter;

    return matchesSearch && matchesStatus && matchesDomain;
  });

  const totalCompanies = companies.length;
  const totalActiveProjects = companies.reduce((acc, c) => acc + (c.activeProjects || 0), 0);
  const suspendedCount = companies.filter((c) => c.user.status === 'suspended').length;
  const activeCount = totalCompanies - suspendedCount;

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
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Employer Partners
                </span>
                <span className="text-xs text-slate-500">EPC Enterprise Accounts</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                EPC Company & Employer Management
              </h1>
              <p className="text-xs text-slate-500">
                Monitor clean energy project contractors, company verification credentials, and workforce deployment volumes.
              </p>
            </div>

            <button
              onClick={fetchCompanies}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-all self-start sm:self-auto"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Companies</span>
            </button>
          </div>

          {/* KPI Summary Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Registered EPCs</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalCompanies}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase">Active Accounts</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-indigo-600 uppercase">Active Projects</span>
              <p className="text-2xl font-black text-indigo-700 mt-1">{totalActiveProjects}</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-rose-600 uppercase">Suspended EPCs</span>
              <p className="text-2xl font-black text-rose-600 mt-1">{suspendedCount}</p>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by company name, email, registration GSTIN, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Domains</option>
                <option value="Solar EPC">Solar EPC</option>
                <option value="Wind EPC">Wind EPC</option>
                <option value="Hybrid Renewable EPC">Hybrid Renewable EPC</option>
                <option value="Solar Rooftop">Solar Rooftop</option>
                <option value="Solar Utility Scale">Solar Utility Scale</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center text-xs text-slate-400">
                <RefreshCw size={24} className="animate-spin mx-auto text-emerald-600 mb-2" />
                Loading company accounts...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400">
                No EPC companies match your search or filter parameters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 min-w-[650px]">
                  <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Company Name</th>
                      <th className="py-3 px-4">Sector Domain</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Projects</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCompanies.map((item) => {
                      const u = item.user;
                      const p = item.profile || {};
                      const isSuspended = u.status === 'suspended';

                      return (
                        <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                <Building size={18} />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">
                                  {p.companyName || u.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-800">
                              {p.primaryDomain || 'Solar EPC'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 text-slate-700">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span>{p.city ? `${p.city}, ${p.state}` : 'Headquarters'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="text-slate-700">{p.companySize || '50-200'} staff</span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1 font-bold text-slate-800">
                              <FolderGit2 size={13} className="text-indigo-600" />
                              <span>{item.activeProjects || 0} active</span>
                              <span className="text-[10px] text-slate-400 font-normal">({item.projectsCount || 0} total)</span>
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
                              <button
                                onClick={() => setSelectedCompany(item)}
                                title="View Company Dossier"
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

      {/* Modal: Company Details */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-4 sm:p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Building size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedCompany.profile?.companyName || selectedCompany.user.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCompany.user.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Primary Domain</span>
                  <p className="font-semibold text-slate-900">{selectedCompany.profile?.primaryDomain || 'Solar EPC'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Company Size</span>
                  <p className="font-semibold text-slate-900">{selectedCompany.profile?.companySize || '50-200'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Registration / GSTIN</span>
                  <p className="font-mono text-slate-900">{selectedCompany.profile?.registrationNumber || '07AABCU9603R1ZX'}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Contact Person</span>
                  <p className="font-semibold text-slate-900">{selectedCompany.profile?.contactPerson || 'Project Director'}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Company Overview
                </span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl text-[11px] leading-relaxed">
                  {selectedCompany.profile?.description || 'Premier renewable energy engineering contractor.'}
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Projects on Platform</span>
                  <p className="font-bold text-emerald-950 text-sm">
                    {selectedCompany.activeProjects || 0} Active / {selectedCompany.projectsCount || 0} Total Posted
                  </p>
                </div>
                <Link
                  to="/projects"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Browse Projects
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedCompany(null)}
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

export default AdminCompaniesPage;
