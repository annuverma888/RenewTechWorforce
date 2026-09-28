import React, { useState } from 'react';
import {
  X,
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { reviewAPI } from '../../services/api';

const RatingInput = ({ label, value, onChange, description }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
      <div>
        <span className="text-xs font-bold text-slate-800 block">{label}</span>
        {description && (
          <span className="text-[10px] text-slate-500 block">{description}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
          >
            <Star
              size={20}
              className={`${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 hover:text-amber-200'
              } transition-colors`}
            />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-700 w-6 text-right ml-1">
          {value}.0
        </span>
      </div>
    </div>
  );
};

const PerformanceReviewModal = ({
  isOpen,
  onClose,
  assignment,
  onSuccess,
}) => {
  if (!isOpen || !assignment) return null;

  const technician = assignment.technician;
  const project = assignment.project;

  const [overallRating, setOverallRating] = useState(5);
  const [technicalSkill, setTechnicalSkill] = useState(5);
  const [safety, setSafety] = useState(5);
  const [punctuality, setPunctuality] = useState(5);
  const [qualityOfWork, setQualityOfWork] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackComment.trim()) {
      setError('Please provide qualitative feedback for the technician.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        projectId: project?._id || project?.id,
        technicianId: technician?._id,
        technicalSkill,
        safety,
        punctuality,
        qualityOfWork,
        overallRating,
        feedbackComment: feedbackComment.trim(),
      };

      await reviewAPI.submit(payload);

      if (onSuccess) {
        onSuccess({
          technicianName: technician?.name,
          rating: overallRating,
        });
      }
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(
        err.response?.data?.message ||
          'Failed to record review. Please ensure you have not already reviewed this technician.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Award size={24} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-amber-400/20">
                <Sparkles size={11} />
                Skill Passport Verification
              </div>
              <h2 className="text-xl font-black text-white">
                Technician Performance Review
              </h2>
            </div>
          </div>
        </div>

        {/* Technician Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3 text-xs">
          <img
            src={
              technician?.profilePhoto ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${technician?.name}&backgroundColor=059669`
            }
            alt={technician?.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
          />
          <div>
            <span className="font-extrabold text-slate-900 block">
              {technician?.name}
            </span>
            <span className="text-slate-500 font-medium">
              Role: {assignment.roleAssigned} • Project: {project?.projectName}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2.5">
            <RatingInput
              label="Overall Performance Rating"
              description="General competency and field delivery"
              value={overallRating}
              onChange={setOverallRating}
            />

            <RatingInput
              label="Technical Competency"
              description="Wiring precision, tool handling, DC terminations"
              value={technicalSkill}
              onChange={setTechnicalSkill}
            />

            <RatingInput
              label="Safety Adherence (HSE)"
              description="PPE compliance, lock-out tag-out, harness safety"
              value={safety}
              onChange={setSafety}
            />

            <RatingInput
              label="Punctuality & Work Ethic"
              description="Shift arrival time, reliability, proactive attitude"
              value={punctuality}
              onChange={setPunctuality}
            />

            <RatingInput
              label="Workmanship & Quality"
              description="Clean cable dressing, zero rework, testing standards"
              value={qualityOfWork}
              onChange={setQualityOfWork}
            />
          </div>

          {/* Feedback Comment */}
          <div className="space-y-1 pt-1">
            <label className="block text-xs font-bold text-slate-700">
              Qualitative Feedback <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Detail specific achievements, safety practices, and field reliability. This will be recorded on the technician's Digital Skill Passport."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting to Passport...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Submit Verified Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceReviewModal;
