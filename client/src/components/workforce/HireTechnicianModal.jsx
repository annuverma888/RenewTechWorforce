import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Briefcase,
  IndianRupee,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  FileText,
  DollarSign,
  Send,
} from 'lucide-react';
import { workforceAPI, applicationAPI } from '../../services/api';
import MatchScoreBadge from '../matching/MatchScoreBadge';

const PRESET_DAILY_RATES = [1500, 1800, 2000, 2200, 2500, 3000];

const POPULAR_ROLES = [
  'Solar PV Wireman',
  'Inverter Commissioning Tech',
  'Solar DC Stringer',
  'Array Structural Lead',
  'Wind Turbine Tech',
  'Site Quality & Safety Lead',
  'Solar O&M Specialist',
];

const HireTechnicianModal = ({
  isOpen,
  onClose,
  technician,
  project,
  applicationId = null,
  onSuccess,
}) => {
  if (!isOpen || !technician) return null;

  const defaultStartDate = project?.startDate
    ? new Date(project.startDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const defaultEndDate = project?.endDate
    ? new Date(project.endDate).toISOString().split('T')[0]
    : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

  const [roleAssigned, setRoleAssigned] = useState(
    project?.workerRoles?.[0]?.role ||
      technician?.profession ||
      technician?.technicianProfile?.profession ||
      'Solar PV Wireman'
  );
  const [dailyRateAgreed, setDailyRateAgreed] = useState(
    technician?.expectedDailyRate ||
      technician?.technicianProfile?.expectedDailyRate ||
      1800
  );
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [notes, setNotes] = useState(
    'Report to Site Project Engineer at 08:30 AM with standard PPE (Safety boots, hard hat, safety glasses) and certified multimeter.'
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Compute duration in days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end - start);
  const durationDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  const estimatedTotalPayout = durationDays * Number(dailyRateAgreed || 0);

  const techName = technician?.name || technician?.user?.name || 'Technician';
  const techPhoto =
    technician?.profilePhoto ||
    technician?.user?.profilePhoto ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${techName}&backgroundColor=059669`;
  const techExp =
    technician?.yearsOfExperience ||
    technician?.technicianProfile?.yearsOfExperience ||
    2;
  const techCity =
    technician?.city ||
    technician?.technicianProfile?.city ||
    'India';
  const techScore =
    technician?.overallSkillScore ||
    technician?.technicianProfile?.overallSkillScore ||
    85;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        projectId: project?._id,
        technicianId: technician?._id || technician?.user?._id || technician?.user,
        roleAssigned,
        dailyRateAgreed: Number(dailyRateAgreed),
        startDate,
        endDate,
        notes,
      };

      if (applicationId) {
        // Update application status to Hired with full deployment payload
        await applicationAPI.updateStatus(applicationId, {
          status: 'Hired',
          roleAssigned,
          dailyRateAgreed: Number(dailyRateAgreed),
          startDate,
          endDate,
          note: notes,
        });
      } else {
        // Direct workforce assignment
        await workforceAPI.assign(payload);
      }

      if (onSuccess) {
        onSuccess({
          technicianName: techName,
          projectName: project?.projectName,
          roleAssigned,
          dailyRateAgreed,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error hiring technician:', err);
      setError(
        err.response?.data?.message ||
          'Failed to complete hiring. Please verify that project dates and details are correct.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-emerald-400/20">
                <Sparkles size={11} />
                Workforce Deployment
              </div>
              <h2 className="text-xl font-black text-white">
                Hire & Assign Technician
              </h2>
            </div>
          </div>
        </div>

        {/* Candidate & Project Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <img
              src={techPhoto}
              alt={techName}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0"
            />
            <div>
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{techName}</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded-md font-bold">
                  ✓ Verified
                </span>
              </div>
              <p className="text-slate-500 font-medium">
                {techCity} • {techExp} yrs exp • {techScore}% Skill Index
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Target Project
            </span>
            <span className="font-bold text-slate-800 line-clamp-1">
              {project?.projectName || 'Selected Project'}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {project?.location?.city || 'India'}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Assigned Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Assigned Crew Role <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={roleAssigned}
              onChange={(e) => setRoleAssigned(e.target.value)}
              placeholder="e.g. Lead PV Wireman"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />

            {/* Quick role suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_ROLES.slice(0, 5).map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setRoleAssigned(role)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all ${
                    roleAssigned === role
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Agreed Daily Rate */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Agreed Daily Wage (₹ INR / day) <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Expectation: ₹{technician?.expectedDailyRate || 1800}/day
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                ₹
              </span>
              <input
                type="number"
                min="500"
                step="50"
                required
                value={dailyRateAgreed}
                onChange={(e) => setDailyRateAgreed(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
              />
            </div>

            {/* Rate presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
              {PRESET_DAILY_RATES.map((rate) => (
                <button
                  type="button"
                  key={rate}
                  onClick={() => setDailyRateAgreed(rate)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition-all ${
                    Number(dailyRateAgreed) === rate
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  ₹{rate}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Deployment Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Deployment End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Financial Calculation Box */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                Estimated Contract Commitment
              </span>
              <span className="text-xs text-emerald-950 font-medium">
                {durationDays} Days @ ₹{dailyRateAgreed || 0}/day
              </span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-emerald-700">
                ₹{estimatedTotalPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 block font-medium">
                Accrues upon daily attendance
              </span>
            </div>
          </div>

          {/* Instructions / Notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Deployment Instructions / Site Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide instructions regarding PPE, reporting time, site engineer contact..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Deploying to Crew...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Confirm Hiring & Deploy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HireTechnicianModal;
