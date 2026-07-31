import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Flame, Zap, Clock, Info } from 'lucide-react';

export function ContributionHeatmap({ contributions = {}, summary = {} }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate 365 days data grid ending today
  const { weeks, monthLabels, totalDaysCount, activeDaysCount, totalPoints, totalHours } = useMemo(() => {
    const today = new Date();
    const daysArr = [];

    // 52 weeks * 7 days = 364 + 1 = 365 days
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = contributions[dateStr] || {
        date: dateStr,
        count: 0,
        points: 0,
        hoursSpent: 0,
        activityTypes: [],
      };

      daysArr.push({
        date: dateStr,
        dateObj: d,
        count: dayData.count || 0,
        points: dayData.points || 0,
        hoursSpent: dayData.hoursSpent || 0,
        activityTypes: dayData.activityTypes || [],
      });
    }

    // Group into 7-day columns (weeks)
    const weeksArr = [];
    let currentWeek = [];

    // Pad start of first week to line up day of week (0=Sun, 6=Sat)
    const firstDayOfWeek = daysArr[0].dateObj.getDay();
    for (let p = 0; p < firstDayOfWeek; p++) {
      currentWeek.push(null);
    }

    for (const day of daysArr) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeksArr.push(currentWeek);
    }

    // Compute month label positions
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabelsArr = [];
    let lastMonth = -1;

    weeksArr.forEach((w, wIndex) => {
      const firstValidDay = w.find((d) => d !== null);
      if (firstValidDay) {
        const m = firstValidDay.dateObj.getMonth();
        if (m !== lastMonth) {
          monthLabelsArr.push({ month: months[m], weekIndex: wIndex });
          lastMonth = m;
        }
      }
    });

    const activeDays = daysArr.filter((d) => d.count > 0).length;
    const pointsSum = daysArr.reduce((acc, d) => acc + d.points, 0);
    const hoursSum = daysArr.reduce((acc, d) => acc + d.hoursSpent, 0);

    return {
      weeks: weeksArr,
      monthLabels: monthLabelsArr,
      totalDaysCount: daysArr.length,
      activeDaysCount: summary.activeDaysCount || activeDays,
      totalPoints: summary.totalPoints || pointsSum,
      totalHours: summary.totalHours || Math.round(hoursSum * 10) / 10,
    };
  }, [contributions, summary]);

  // Compute cell intensity level (0 to 4)
  const getIntensityLevel = (count) => {
    if (!count || count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 7) return 3;
    return 4;
  };

  const getCellClasses = (level) => {
    switch (level) {
      case 1:
        return 'bg-[#27272a] border-zinc-700/40 hover:bg-[#3f3f46] shadow-sm';
      case 2:
        return 'bg-[#52525b] border-zinc-500/50 hover:bg-[#71717a] shadow-md';
      case 3:
        return 'bg-[#a1a1aa] border-zinc-300 hover:bg-[#d4d4d8] shadow-lg';
      case 4:
        return 'bg-white border-white hover:scale-125 shadow-[0_0_15px_rgba(255,255,255,0.6)]';
      default:
        return 'bg-[#121212] border-white/[0.04] hover:border-white/20';
    }
  };

  const handleMouseEnter = (day, e) => {
    if (!day) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setHoveredDay(day);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">365-Day Developer Activity Grid</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time contribution frequency, commits, submission logs & XP generated over the past year.
          </p>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-white font-mono font-semibold flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>{totalPoints} Points Earned</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/15 text-zinc-300 font-mono font-semibold flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-white" />
            <span>{totalHours} hrs Active</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/20">
        <div className="min-w-[760px]">
          {/* Month Labels Row */}
          <div className="flex text-[11px] font-mono text-zinc-400 mb-2 pl-8 relative h-5">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute transform -translate-x-1/2 font-semibold text-zinc-300"
                style={{ left: `${m.weekIndex * 14.5 + 34}px` }}
              >
                {m.month}
              </span>
            ))}
          </div>

          {/* Grid + Weekday Labels */}
          <div className="flex">
            {/* Weekday Labels Column */}
            <div className="flex flex-col justify-between text-[10px] font-mono text-zinc-500 pr-2 pt-1 h-[105px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day, dIdx) => {
                    if (!day) {
                      return <div key={dIdx} className="w-3 h-3 rounded-sm opacity-0" />;
                    }

                    const level = getIntensityLevel(day.count);
                    const cellClasses = getCellClasses(level);

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={(e) => handleMouseEnter(day, e)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-sm border transition-all duration-200 cursor-pointer ${cellClasses}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Legend & Summary */}
      <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <span className="text-zinc-400 font-medium">
          Active in <strong className="text-white">{activeDaysCount}</strong> of last 365 days
        </span>

        {/* Legend: Graphite -> Silver -> Diamond White */}
        <div className="flex items-center space-x-2 text-[11px] text-zinc-400 font-mono font-medium">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-sm bg-[#121212] border border-white/[0.04]" />
            <div className="w-3 h-3 rounded-sm bg-[#27272a] border border-zinc-700/40" />
            <div className="w-3 h-3 rounded-sm bg-[#52525b] border border-zinc-500/50" />
            <div className="w-3 h-3 rounded-sm bg-[#a1a1aa] border border-zinc-300" />
            <div className="w-3 h-3 rounded-sm bg-white border border-white" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      <AnimatePresence>
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            transition={{ duration: 0.15 }}
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
          >
            <div className="p-3 rounded-xl border border-white/20 bg-[#0B0B0B]/95 backdrop-blur-xl shadow-2xl text-xs space-y-1 w-52 text-white">
              <div className="font-bold text-white text-sm border-b border-white/10 pb-1 flex justify-between items-center">
                <span>{new Date(hoveredDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                  {hoveredDay.count} {hoveredDay.count === 1 ? 'event' : 'events'}
                </span>
              </div>
              <div className="text-zinc-300 pt-1 space-y-0.5">
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Points Earned:</span>
                  <span className="font-bold text-white">+{hoveredDay.points} XP</span>
                </div>
                <div className="flex justify-between text-zinc-400 font-mono">
                  <span>Time Dedicated:</span>
                  <span className="font-semibold text-zinc-200">{hoveredDay.hoursSpent || 0.5} hrs</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Activity Types:</span>
                  <span className="font-medium text-zinc-200 capitalize">
                    {hoveredDay.activityTypes?.length > 0 ? hoveredDay.activityTypes.join(', ') : 'Code / Task'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
