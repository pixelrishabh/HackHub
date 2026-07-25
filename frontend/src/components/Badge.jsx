import React from 'react';

export function Badge({ children, variant = 'info', className = '' }) {
  const variantClasses = {
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    success: 'bg-secondary-50 text-secondary-700 border-secondary-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantClasses[variant] || variantClasses.info} ${className}`}
    >
      {children}
    </span>
  );
}
