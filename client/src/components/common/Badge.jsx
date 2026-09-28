import React from 'react';

const Badge = ({ variant = 'default', children, className = '' }) => {
  const styles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
    pending: 'bg-amber-50 text-amber-700 border-amber-300',
    rejected: 'bg-rose-50 text-rose-700 border-rose-300',
    solar: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
    wind: 'bg-sky-50 text-sky-800 border-sky-300 font-medium',
    available: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium',
    onProject: 'bg-blue-50 text-blue-700 border-blue-300 font-medium',
    unavailable: 'bg-slate-100 text-slate-600 border-slate-300',
    primary: 'bg-emerald-600 text-white font-medium border-transparent',
    novice: 'bg-slate-100 text-slate-700 border-slate-300',
    competent: 'bg-blue-50 text-blue-700 border-blue-300',
    proficient: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    master: 'bg-purple-50 text-purple-800 border-purple-300 font-semibold',
  };

  const selectedStyle = styles[variant] || styles.default;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border ${selectedStyle} ${className}`}
    >
      {variant === 'verified' && <span className="text-emerald-600 font-bold">✓</span>}
      {children}
    </span>
  );
};

export default Badge;
