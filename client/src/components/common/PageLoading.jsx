import React from 'react';

/**
 * Lightweight, zero-dependency PageLoading component for React.lazy route transitions.
 * Styled with pure Tailwind CSS to avoid adding any chunk weight to initial bundle.
 */
const PageLoading = () => {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center px-4"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer subtle glow ring */}
        <div className="w-12 h-12 rounded-full border-4 border-emerald-100 animate-pulse" />
        {/* Spinning emerald active ring */}
        <div className="absolute w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
      </div>
      <div className="mt-4 flex flex-col items-center">
        <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
          RenewTech Workforce
        </span>
      </div>
    </div>
  );
};

export default PageLoading;
