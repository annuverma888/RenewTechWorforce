import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Sun,
  Wind,
  AlertCircle,
  Eye,
  ExternalLink,
  Calendar,
  Compass,
  RefreshCw,
  FolderGit2,
  Activity,
  Layers,
  Award,
} from 'lucide-react';
import { adminAPI, projectAPI, applicationAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pendingCerts, setPendingCerts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, analyticsRes, certsRes, techsRes, compRes, projRes, appsRes] = await Promise.all([
        adminAPI.getStatistics().catch((err) => {
          console.error('Stats fetch failed:', err);
          return { data: { success: false, data: null } };
        }),
        adminAPI.getAnalytics().catch((err) => {
          console.error('Analytics fetch failed:', err);
          return { data: { success: false, data: null } };
        }),
        adminAPI.getCertificates({ status: 'Pending' }).catch((err) => {
          console.error('Certificates fetch failed:', err);
          return { data: { success: false, data: [] } };
        }),
        adminAPI.getTechnicians().catch((err) => {
          console.error('Technicians fetch failed:', err);
          return { data: { success: false, data: [] } };
        }),
        adminAPI.getCompanies().catch((err) => {
          console.error('Companies fetch failed:', err);
          return { data: { success: false, data: [] } };
        }),
        projectAPI.getAll().catch((err) => {
          console.error('Projects fetch failed:', err);
          return { data: { success: false, data: [] } };
        }),
        applicationAPI.getAll().catch((err) => {
          console.error('Applications fetch failed:', err);
          return { data: { success: false, data: [] } };
        }),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      if (certsRes.data?.data) setPendingCerts(certsRes.data.data.slice(0, 5));

      // Combine technicians and companies for recent user registrations
      const usersList = [];
      if (techsRes.data?.data) {
        techsRes.data.data.slice(0, 4).forEach((t) => {
          usersList.push({
            id: t.user?._id || t._id,
            name: t.user?.name || t.name || 'Technician',
            role: 'Technician',
            email: t.user?.email || t.email || '-',
            date: t.user?.createdAt || t.createdAt,
            status: t.user?.status === 'suspended' ? 'Suspended' : 'Active',
            profileId: t.user?._id,
          });
        });
      }
      if (compRes.data?.data) {
        compRes.data.data.slice(0, 4).forEach((c) => {
          usersList.push({
            id: c.user?._id || c._id,
            name: c.profile?.companyName || c.user?.name || c.name || 'EPC Company',
            role: 'EPC Company',
            email: c.user?.email || c.email || '-',
            date: c.user?.createdAt || c.createdAt,
            status: c.user?.status === 'suspended' ? 'Suspended' : 'Active',
          });
        });
      }
      usersList.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      setRecentUsers(usersList.slice(0, 6));

      if (projRes.data?.data) setRecentProjects(projRes.data.data.slice(0, 5));
      if (appsRes.data?.data) setRecentApplications(appsRes.data.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
      setError('We could not load this data right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyCert = async (certId, status) => {
    try {
      const res = await adminAPI.verifyCertificate(certId, {
        status,
        adminNotes: status === 'Verified' ? 'Approved by admin' : 'Rejected due to documentation mismatch',
      });
      if (res.data?.success) {
        showToast(`Certificate marked as ${status}!`);
        fetchAdminData();
      }
    } catch (err) {
      showToast('Error updating certificate status.', 'error');
    }
  };

  // Real KPIs (No fallback or fake numbers)
  const totalTechnicians = stats?.totalTechnicians ?? 0;
  const verifiedTechnicians = stats?.verifiedTechnicians ?? 0;
  const epcCompanies = stats?.totalCompanies ?? 0;
  const activeProjects = stats?.activeProjects ?? 0;
  const totalApplications = stats?.totalApplications ?? 0;
  const successfulHires = stats?.successfulHires ?? 0;
  const pendingCertificatesCount = stats?.pendingCertificates ?? pendingCerts.length;
  const solarCount = stats?.renewableSplit?.solar ?? 0;
  const windCount = stats?.renewableSplit?.wind ?? 0;

  // Real growth data from analytics
  const monthlyGrowth = analytics?.monthlyGrowth || [];
  const maxMonthlyVal = Math.max(
    ...monthlyGrowth.flatMap((d) => [d.technicians || 0, d.projects || 0, d.hires || 0]),
    1
  );

  // Sector breakdown from real analytics or split
  const sectorBreakdown = analytics?.sectorBreakdown || [];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Admin Dashboard"
          subtitle="Platform Administration & Compliance Oversight"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto min-w-0">
          {/* Toast Alert */}
          {toastMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-lg animate-in fade-in duration-200 ${
                toastMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              }`}
            >
              {toastMessage.type === 'error' ? (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={fetchAdminData}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold self-start sm:self-auto transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Operational Banner */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  <ShieldCheck size={12} /> Production Oversight
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-semibold text-slate-500">Live Renewable Operations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Workforce Operations Hub
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                National clean energy workforce verification, employer audits, active installation tenders, and deployed roster governance.
              </p>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={fetchAdminData}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5"
                title="Refresh dashboard metrics"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <Link
                to="/admin/certificates"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <FileCheck size={15} />
                <span>Verification Queue ({pendingCertificatesCount})</span>
              </Link>
            </div>
          </div>

          {/* Priority Review Alert Area (if pending items exist) */}
          {pendingCertificatesCount > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900">
                    {pendingCertificatesCount} Credential Submission{pendingCertificatesCount > 1 ? 's' : ''} Awaiting Review
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Technician certifications require administrative verification before badges and Skill Passports are authenticated.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/certificates"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shrink-0 self-start sm:self-auto transition-colors flex items-center gap-1"
              >
                <span>Audit Certificates</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          )}

          {/* 6 Real KPI Cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse space-y-2">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-7 w-12 bg-slate-200 rounded" />
                  <div className="h-2.5 w-16 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Technicians */}
              <Link
                to="/admin/technicians"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Technicians
                  </span>
                  <Users size={16} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1.5">
                  {totalTechnicians}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Registered profiles</span>
              </Link>

              {/* Verified Technicians */}
              <Link
                to="/admin/technicians"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Verified Techs
                  </span>
                  <ShieldCheck size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono mt-1.5">
                  {verifiedTechnicians}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">✓ Accredited credentials</span>
              </Link>

              {/* EPC Companies */}
              <Link
                to="/admin/companies"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    EPC Companies
                  </span>
                  <Briefcase size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1.5">
                  {epcCompanies}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Solar & wind employers</span>
              </Link>

              {/* Active Projects */}
              <Link
                to="/projects"
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-xs transition-all block group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Active Projects
                  </span>
                  <FolderGit2 size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1.5">
                  {activeProjects}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Open installation tenders</span>
              </Link>

              {/* Applications */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Applications
                  </span>
                  <TrendingUp size={16} className="text-slate-400" />
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1.5">
                  {totalApplications}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Total candidate submissions</span>
              </div>

              {/* Successful Hires */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Roster Hires
                  </span>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-emerald-600 font-mono mt-1.5">
                  {successfulHires}
                </div>
                <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">Deployed to projects</span>
              </div>
            </div>
          )}

          {/* Platform Capacity & Trends Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Growth Timeline Chart (2 cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Activity size={16} className="text-emerald-600" />
                    Platform Growth & Placement Timeline
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real month-over-month onboarding of technicians, active tenders, and deployed workers
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 shrink-0">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" /> Technicians
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600 inline-block" /> Projects
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" /> Hires
                  </span>
                </div>
              </div>

              {monthlyGrowth.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Initial platform onboarding period — activity will chart here as monthly records accumulate.
                </div>
              ) : (
                <div className="pt-4 pb-2">
                  <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-40 border-b border-slate-100 pb-2">
                    {monthlyGrowth.map((item, idx) => {
                      const techH = Math.max(Math.round(((item.technicians || 0) / maxMonthlyVal) * 120), 4);
                      const projH = Math.max(Math.round(((item.projects || 0) / maxMonthlyVal) * 120), 4);
                      const hireH = Math.max(Math.round(((item.hires || 0) / maxMonthlyVal) * 120), 4);

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end min-w-0">
                          <div className="flex items-end gap-1 w-full justify-center">
                            <div
                              className="bg-emerald-600 w-2.5 sm:w-3.5 rounded-t-xs transition-all"
                              style={{ height: `${techH}px` }}
                              title={`Technicians: ${item.technicians || 0}`}
                            />
                            <div
                              className="bg-blue-600 w-2.5 sm:w-3.5 rounded-t-xs transition-all"
                              style={{ height: `${projH}px` }}
                              title={`Projects: ${item.projects || 0}`}
                            />
                            <div
                              className="bg-indigo-600 w-2.5 sm:w-3.5 rounded-t-xs transition-all"
                              style={{ height: `${hireH}px` }}
                              title={`Hires: ${item.hires || 0}`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold truncate w-full text-center">
                            {item.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                    <span>Base: 0</span>
                    <span>Peak monthly volume: {maxMonthlyVal}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Renewable Sector Distribution & Platform Health (1 col) */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Sun size={16} className="text-amber-500" />
                  Sector & Capacity Footprint
                </h3>

                <div className="mt-4 space-y-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Sun size={14} className="text-amber-500" /> Solar Photovoltaic
                    </span>
                    <span className="font-bold font-mono text-slate-900">{solarCount} Projects</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{
                        width: `${
                          solarCount + windCount > 0
                            ? Math.round((solarCount / (solarCount + windCount)) * 100)
                            : 50
                        }%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Wind size={14} className="text-sky-500" /> Wind Energy
                    </span>
                    <span className="font-bold font-mono text-slate-900">{windCount} Projects</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-sky-500 h-2 rounded-full"
                      style={{
                        width: `${
                          solarCount + windCount > 0
                            ? Math.round((windCount / (solarCount + windCount)) * 100)
                            : 50
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {sectorBreakdown.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Tender Allocations
                    </span>
                    {sectorBreakdown.map((s, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] text-slate-600">
                        <span>{s.sector} ({s.activeProjects} active)</span>
                        <span className="font-mono font-bold text-slate-800">{s.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Navigation Hub */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs font-bold">
                <Link
                  to="/admin/technicians"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition-colors border border-slate-200/60"
                >
                  Techs Directory
                </Link>
                <Link
                  to="/admin/companies"
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors border border-slate-200/60"
                >
                  EPC Directory
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Oversight Tables */}
          {/* Table 1: Pending Certificates Queue */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck size={16} className="text-emerald-600" />
                  1. Pending Certificate Audits
                </h3>
                <p className="text-xs text-slate-500">
                  Government & industry credentials awaiting administrative verification
                </p>
              </div>
              <Link
                to="/admin/certificates"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 self-start sm:self-auto flex items-center gap-1"
              >
                <span>Full Queue ({pendingCerts.length})</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {pendingCerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 size={24} className="mx-auto text-emerald-500 mb-1.5" />
                All uploaded technician credentials have been reviewed.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Certificate</th>
                      <th className="py-3 px-4">Technician</th>
                      <th className="py-3 px-4">Issuing Authority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingCerts.map((cert) => (
                      <tr key={cert._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{cert.certificateName}</div>
                          <div className="text-[10px] font-mono text-slate-400">ID: {cert.certificateNumber || 'Pending'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {cert.technician?._id ? (
                            <Link
                              to={`/technicians/${cert.technician._id}`}
                              className="font-semibold text-slate-800 hover:text-emerald-700 hover:underline"
                            >
                              {cert.technician.name || 'Technician'}
                            </Link>
                          ) : (
                            <span className="text-slate-700 font-semibold">{cert.technician?.name || 'Technician'}</span>
                          )}
                          {cert.technician?._id && (
                            <Link
                              to={`/verify/skill-passport/${cert.technician._id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-[10px] text-emerald-700 font-semibold hover:underline mt-0.5"
                            >
                              Inspect Passport ↗
                            </Link>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{cert.issuingOrganization || 'Accreditation Agency'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md text-[10px] font-bold border border-amber-200 uppercase">
                            {cert.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleVerifyCert(cert._id, 'Verified')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleVerifyCert(cert._id, 'Rejected')}
                            className="px-2 py-1 text-slate-500 hover:text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table 2: Recent User Registrations */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  2. Recent User Registrations
                </h3>
                <p className="text-xs text-slate-500">
                  Newly registered technicians and renewable energy employers
                </p>
              </div>
              <Link
                to="/admin/technicians"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>Directory</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {recentUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No user registrations found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">User / Organization</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Email Address</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentUsers.map((u, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          {u.profileId ? (
                            <Link
                              to={`/technicians/${u.profileId}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                            >
                              {u.name}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-900">{u.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              u.role === 'Technician'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{u.email}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'Suspended'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table 3: Commissioned Projects */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderGit2 size={16} className="text-indigo-600" />
                  3. Commissioned Projects
                </h3>
                <p className="text-xs text-slate-500">
                  Clean energy site tenders and workforce requirements
                </p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1"
              >
                <span>All Projects</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active projects commissioned yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Project Name</th>
                      <th className="py-3 px-4">Sector & Location</th>
                      <th className="py-3 px-4">Staffing Required</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentProjects.map((p) => {
                      const locStr =
                        p.location && typeof p.location === 'object'
                          ? [p.location.city, p.location.state].filter(Boolean).join(', ')
                          : p.location || 'India';

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <Link
                              to={`/projects/${p._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                            >
                              {p.projectName}
                            </Link>
                            <div className="text-[10px] text-slate-400">
                              {p.company?.name || 'EPC Contractor'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span className="font-semibold text-slate-800">{p.projectType || 'Solar'}</span> • {locStr}
                          </td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                            {p.numberWorkers ? `${p.numberWorkers} Workers` : '-'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">
                              {p.projectStatus || 'Open'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/projects/${p._id}`}
                              className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
                            >
                              Inspect
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Table 4: Candidate Applications */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-600" />
                  4. Candidate Applications
                </h3>
                <p className="text-xs text-slate-500">
                  Technician applications submitted across active tenders
                </p>
              </div>
            </div>

            {recentApplications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No technician applications recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Match Score</th>
                      <th className="py-3 px-4">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          {app.technician?._id ? (
                            <Link
                              to={`/technicians/${app.technician._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                            >
                              {app.technician.name || 'Candidate'}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-900">{app.technician?.name || 'Candidate'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {app.project?._id ? (
                            <Link
                              to={`/projects/${app.project._id}`}
                              className="text-slate-700 hover:text-emerald-700 hover:underline font-medium"
                            >
                              {app.project.projectName || 'Project'}
                            </Link>
                          ) : (
                            <span className="text-slate-700">{app.project?.projectName || 'Project'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                          {app.matchScore != null ? `${app.matchScore}%` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-semibold border border-slate-200">
                            {app.status || 'Applied'}
                          </span>
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
    </div>
  );
};

export default AdminDashboard;
