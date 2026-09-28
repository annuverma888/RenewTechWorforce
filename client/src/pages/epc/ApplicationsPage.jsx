import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  BookmarkCheck,
  UserCheck,
  XCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { applicationAPI, projectAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const ApplicationsPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialProjectId = searchParams.get('projectId') || 'All';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedProjectId !== 'All') params.projectId = selectedProjectId;
      if (selectedStatus !== 'All') params.status = selectedStatus;

      const [appsRes, projRes] = await Promise.all([
        applicationAPI.getAll(params).catch(() => ({ data: { success: false, data: [] } })),
        projectAPI.getAll().catch(() => ({ data: { success: false, data: [] } })),
      ]);

      if (appsRes.data?.data) {
        setApplications(appsRes.data.data);
      }
      if (projRes.data?.data) {
        setProjects(projRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedProjectId, selectedStatus]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await applicationAPI.updateStatus(appId, {
        status: newStatus,
        notes: `Application marked as ${newStatus} by EPC employer.`,
      });
      if (res.data?.success) {
        showToast(`Status updated to "${newStatus}"!`);
        fetchData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating application status.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Selected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'Shortlisted':
        return 'bg-blue-50 text-blue-700 border-blue-300 font-bold';
      case 'Interview':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      case 'Under Review':
        return 'bg-purple-50 text-purple-700 border-purple-300 font-bold';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-bold';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title="Applications"
          subtitle="Review candidate submissions and shortlist verified talent"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Toast */}
          {toastMessage && (
            <div
              className={`p-4 rounded-lg text-xs font-semibold flex items-center gap-2 border ${
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

          {/* Page Top Controls & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Filter by Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  <option value="All">All Projects</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-600"
                >
                  <option value="All">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
              Total Applications: <span className="text-slate-800 font-bold">{applications.length}</span>
            </div>
          </div>

          {/* Pipeline Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Hiring Pipeline Flow
            </span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'].map((step, idx, arr) => (
                <React.Fragment key={step}>
                  <span className="font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    {step}
                  </span>
                  {idx < arr.length - 1 && <span className="text-slate-300 font-bold">→</span>}
                </React.Fragment>
              ))}
              <span className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-semibold ml-auto">
                Rejected (Separate Status)
              </span>
            </div>
          </div>

          {/* Applications Table matching Section 11 EPC Columns */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading applicant pipeline...</div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">No applications found.</p>
                <p>Applications will appear here when technicians apply to your projects.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-5">Applicant</th>
                      <th className="py-3.5 px-5">Project</th>
                      <th className="py-3.5 px-5">Skill Score</th>
                      <th className="py-3.5 px-5">Match</th>
                      <th className="py-3.5 px-5">Applied On</th>
                      <th className="py-3.5 px-5">Status Pipeline</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => {
                      const tech = app.technician || {};
                      const prof = app.technicianProfile || {};
                      const proj = app.project || {};
                      const status = app.status || 'Applied';
                      const pipelineSteps = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];
                      const stepIdx = pipelineSteps.indexOf(status);

                      return (
                        <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Applicant */}
                          <td className="py-4 px-5">
                            <Link
                              to={`/technicians/${tech._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 block transition-colors"
                            >
                              {tech.name || 'Rahul Kumar'}
                            </Link>
                            <span className="text-[11px] text-slate-500 block">
                              {prof.profession || 'Solar Technician'} • {prof.city || 'Lucknow'}
                            </span>
                          </td>

                          {/* Project */}
                          <td className="py-4 px-5 font-semibold text-slate-800">
                            {proj.projectName || '500kW Solar Installation'}
                          </td>

                          {/* Skill Score */}
                          <td className="py-4 px-5 font-mono font-bold text-slate-800">
                            {prof.overallSkillScore || 87}%
                          </td>

                          {/* Match Score */}
                          <td className="py-4 px-5 font-mono font-bold text-emerald-600">
                            {app.matchScore || 96}%
                          </td>

                          {/* Applied On */}
                          <td className="py-4 px-5 text-slate-600 font-mono">
                            {new Date(app.createdAt || Date.now()).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-5">
                            {status === 'Rejected' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Rejected
                              </span>
                            ) : (
                              <div className="space-y-1.5">
                                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] border ${getStatusBadge(status)}`}>
                                  {status}
                                </span>
                                <div className="flex items-center gap-1 w-24">
                                  {pipelineSteps.map((st, i) => (
                                    <div
                                      key={st}
                                      className={`h-1.5 rounded-full flex-1 ${
                                        i <= stepIdx
                                          ? 'bg-emerald-600'
                                          : 'bg-slate-200'
                                      }`}
                                      title={st}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-5 text-right space-x-1.5 shrink-0">
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-semibold border border-blue-200 transition-colors"
                            >
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Interview')}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded text-xs font-semibold border border-amber-200 transition-colors"
                            >
                              Interview
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Selected')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-2xs"
                            >
                              Select / Hire
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              className="px-2 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
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

export default ApplicationsPage;
