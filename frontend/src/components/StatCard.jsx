import React from 'react';

export function StatCard({ title, value, subtitle, subtext, icon: Icon, trend, color = 'cyan' }) {
  const trendText = typeof trend === 'object' ? trend?.value : trend;
  const isPositive = typeof trend === 'object' ? trend?.isPositive !== false : true;
  const cardSubtitle = subtitle || subtext;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/15 backdrop-blur-2xl shadow-xl hover:border-cyan-500/30 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200 transition-colors">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black text-white tracking-tight truncate">{value}</span>
        {trendText && (
          <span
            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
      {cardSubtitle && <p className="mt-1.5 text-xs text-slate-400 truncate">{cardSubtitle}</p>}
    </div>
  );
}
