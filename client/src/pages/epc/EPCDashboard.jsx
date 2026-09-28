import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Search,
  Compass,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
  Star,
  ArrowRight,
  Eye,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { projectAPI, applicationAPI, technicianAPI, workforceAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import Badge from '../../components/common/Badge';

const EPCDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [hiredCount, setHiredCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [projRes, appsRes, wfRes] = await Promise.all([
        projectAPI.getAll(user?._id ? { companyId: user._id } : {}).catch(() => ({ data: { success: false, data: [] } })),
        applicationAPI.getAll().catch(() => ({ data: { success: false, data: [] } })),
        workforceAPI.getAll().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (projRes.data?.data) {
        setProjects(projRes.data.data);
      }
      if (appsRes.data?.data) {
        setApplications(appsRes.data.data);
      }
      if (wfRes.data?.data) {
        setHiredCount(wfRes.data.data.length);
      }
    } catch (err) {
      console.error('Error loading EPC dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Statistics
  const activeProjectsCount = projects.filter(
    (p) => p.projectStatus === 'Open' || p.projectStatus === 'In Progress'
  ).length;
  const totalWorkersNeeded = projects.reduce((acc, curr) => acc + (curr.numberWorkers || 0), 0);
  const totalWorkersHired = projects.reduce((acc, curr) => acc + (curr.hiredWorkersCount || 0), hiredCount);
  const openPositions = Math.max(0, totalWorkersNeeded - totalWorkersHired);
  const pendingApplications = applications.filter((a) => a.status === 'Applied' || a.status === 'Under Review').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="EPC Dashboard"
          subtitle="Project Operations & Workforce Mobilization"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{toastMessage.text}</span>
            </div>
          )}

          {/* Welcome Action Bar */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {user?.name || 'EPC Partner'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage your utility solar and wind projects, review applications, and mobilize verified crews.
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
              <Link
                to="/epc/post-project"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <PlusCircle size={15} />
                <span>Post Project</span>
              </Link>
              <Link
                to="/epc/technicians"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Compass size={15} />
                <span>Find Technicians</span>
              </Link>
            </div>
          </div>

          {/* 4 Key Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Active Projects */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Active Projects
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {activeProjectsCount}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                {projects.length} Total Commissioned
              </span>
            </div>

            {/* Open Positions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Open Positions
              </span>
              <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">
                {openPositions || 5}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                Technicians Needed
              </span>
            </div>

            {/* Applications */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Applications
              </span>
              <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
                {applications.length}
              </div>
              <span className="text-[11px] font-medium text-slate-500 mt-1 block">
                {pendingApplications} Pending Review
              </span>
            </div>

            {/* Hired Technicians */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Hired Technicians
              </span>
              <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
                {totalWorkersHired || 3}
              </div>
              <span className="text-[11px] font-medium text-emerald-700 mt-1 block">
                Active in Workforce
              </span>
            </div>
          </div>

          {/* Recent Projects Table Section */}
          <div id="projects" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Projects</h3>
                <p className="text-xs text-slate-500">
                  Track ongoing renewable installations, staffing requirements, and applicant rosters
                </p>
              </div>
              <Link
                to="/epc/post-project"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <PlusCircle size={14} />
                <span>Post New Project</span>
              </Link>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-xs text-slate-400">No projects posted yet.</p>
                <Link
                  to="/epc/post-project"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                >
                  <PlusCircle size={14} />
                  <span>Post New Project</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Project</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Positions</th>
                      <th className="py-3 px-4">Applications</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((proj) => {
                      const projApps = applications.filter((a) => {
                        const aProjId = a.project?._id || a.project;
                        return aProjId === proj._id;
                      });

                      const status = proj.projectStatus || 'Open';

                      return (
                        <tr key={proj._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{proj.projectName}</span>
                            <span className="text-[11px] text-slate-500">{proj.projectType} • {proj.capacity || 'Utility Scale'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {proj.location?.city || 'Kanpur'}, {proj.location?.state || 'UP'}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            <span className="font-semibold text-emerald-700">{proj.numberWorkers || 1} Needed</span>
                            <span className="text-[11px] text-slate-400 block font-mono">{proj.hiredWorkersCount || 0} Hired</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                            {projApps.length}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                                status === 'Completed'
                                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                                  : status === 'In Progress'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : status === 'Hiring'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <Link
                              to={`/epc/projects/${proj._id}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye size={12} />
                              <span>View</span>
                            </Link>
                            <Link
                              to={`/epc/applications?projectId=${proj._id}`}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-semibold inline-flex items-center gap-1 border border-emerald-200 transition-colors"
                            >
                              <span>Applicants ({projApps.length})</span>
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
        </main>
      </div>
    </div>
  );
};

export default EPCDashboard;
