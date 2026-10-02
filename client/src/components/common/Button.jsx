import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon = null,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus-ring disabled:opacity-60 disabled:cursor-not-allowed select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2.5 min-h-[42px] gap-2',
    lg: 'text-sm sm:text-base px-5 py-3 min-h-[48px] gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs hover:shadow-sm border border-emerald-600',
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 shadow-2xs',
    outline:
      'bg-transparent hover:bg-emerald-50 active:bg-emerald-100 text-emerald-700 border border-emerald-300 hover:border-emerald-400',
    ghost:
      'bg-transparent hover:bg-slate-100 active:bg-slate-200 text-slate-600 hover:text-slate-900 border border-transparent',
    danger:
      'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs hover:shadow-sm border border-rose-600',
  };

  const selectedSize = sizeStyles[size] || sizeStyles.md;
  const selectedVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${selectedSize} ${selectedVariant} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
};

export default Button;
