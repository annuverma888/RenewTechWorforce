import React from 'react';
import { Sparkles } from 'lucide-react';

const MatchScoreBadge = ({ score = 85, size = 'md', onClick = null, showIcon = true }) => {
  let colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-500/20';
  let badgeText = `${score}% Match`;

  if (score >= 90) {
    colorClasses = 'bg-emerald-100 text-emerald-900 border-emerald-400 ring-emerald-600/30';
  } else if (score >= 75) {
    colorClasses = 'bg-teal-50 text-teal-800 border-teal-300 ring-teal-500/20';
  } else if (score >= 60) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-500/20';
  } else {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 ring-slate-400/20';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-extrabold',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ring-2 ${colorClasses} ${
        sizeClasses[size] || sizeClasses.md
      } ${onClick ? 'cursor-pointer hover:scale-105 transition-all' : 'cursor-default'}`}
      title={onClick ? 'Click to see match score breakdown' : 'Smart AI Match Score'}
    >
      {showIcon && <Sparkles size={size === 'lg' ? 14 : 12} className="text-emerald-600 animate-pulse" />}
      <span>{badgeText}</span>
    </button>
  );
};

export default MatchScoreBadge;
