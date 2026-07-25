import React from 'react';

export function StatCard({ title, value, icon: Icon, subtext, trend, color = 'cyan' }) {
  const isGreen = color === 'green';

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${isGreen ? 'bg-secondary-50 text-secondary-600' : 'bg-primary-50 text-primary-600'}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-slate-800 tracking-tight">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-secondary-600 bg-secondary-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      {subtext && <p className="mt-1 text-xs text-slate-400">{subtext}</p>}
    </div>
  );
}
