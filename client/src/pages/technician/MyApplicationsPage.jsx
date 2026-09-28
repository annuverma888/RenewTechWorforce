import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MapPin,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { applicationAPI } from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

const MyApplicationsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationAPI.getAll();
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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
          subtitle="Track submitted project proposals and hiring stages"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                My Project Applications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review review statuses, contractor interview invitations, and project assignments
              </p>
            </div>
            <Link
              to="/projects"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs self-start sm:self-auto"
            >
              Explore More Projects
            </Link>
          </div>

          {/* Application Pipeline Banner */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Application Pipeline Stages
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
                Rejected (Separate Final Status)
              </span>
            </div>
          </div>

          {/* Applications Table / Cards */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-400">Loading your applications...</div>
            ) : applications.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <p className="text-xs text-slate-500 font-medium">No applications submitted yet.</p>
                <p className="text-xs text-slate-400">Your applications will appear here when you apply to a project.</p>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  <span>Browse Projects</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3.5 px-5">Project</th>
                      <th className="py-3.5 px-5">Company</th>
                      <th className="py-3.5 px-5">Applied On</th>
                      <th className="py-3.5 px-5">Match</th>
                      <th className="py-3.5 px-5">Status Pipeline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applications.map((app) => {
                      const proj = app.project || {};
                      const matchPct = app.matchScore || 96;
                      const status = app.status || 'Applied';
                      const pipelineSteps = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];
                      const stepIdx = pipelineSteps.indexOf(status);

                      return (
                        <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-5">
                            <Link
                              to={`/projects/${proj._id}`}
                              className="font-bold text-slate-900 hover:text-emerald-700 block transition-colors"
                            >
                              {proj.projectName || '500kW Solar Installation'}
                            </Link>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin size={11} /> {proj.location?.city || 'Kanpur'}, {proj.location?.state || 'UP'}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-slate-700 font-medium">
                            {proj.companyName || 'GreenVolt Energy EPC'}
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-mono">
                            {new Date(app.createdAt || Date.now()).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-4 px-5 font-mono font-bold text-emerald-600">
                            {matchPct}%
                          </td>
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
                                {/* Mini progress bar */}
                                <div className="flex items-center gap-1">
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

export default MyApplicationsPage;
