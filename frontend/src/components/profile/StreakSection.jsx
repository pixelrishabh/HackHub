import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Award, Target, CheckCircle, Calendar, Sparkles } from 'lucide-react';

export function StreakSection({ streak = {} }) {
  const currentStreak = streak.currentStreak || 14;
  const longestStreak = streak.longestStreak || 38;
  const todayStatus = streak.todayStatus || 'ACTIVE';
  const weeklyGoal = streak.weeklyGoal || 5;
  const weeklyProgress = streak.weeklyProgress || 5;
  const monthlyGoal = streak.monthlyGoal || 20;
  const monthlyProgress = streak.monthlyProgress || 18;
  const yearlyGoal = streak.yearlyGoal || 200;
  const yearlyProgress = streak.yearlyProgress || 164;

  const weeklyPercent = Math.min(100, Math.round((weeklyProgress / weeklyGoal) * 100));
  const monthlyPercent = Math.min(100, Math.round((monthlyProgress / monthlyGoal) * 100));
  const yearlyPercent = Math.min(100, Math.round((yearlyProgress / yearlyGoal) * 100));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative overflow-hidden text-white"
    >
      {/* Background Subtle Light Streak */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Section: Animated Flame & Streak Counters (5 cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border-b lg:border-b-0 lg:border-r border-white/[0.08] pb-6 lg:pb-0 lg:pr-8">
          {/* Animated Flame Icon Container */}
          <div className="relative group flex-shrink-0">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-xl"
            >
              <Flame className="w-12 h-12 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
              <div className="absolute inset-0 bg-white/10 blur-xl rounded-3xl pointer-events-none" />
            </motion.div>

            {/* Today's Status Pill Badge */}
            <div className="absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 flex items-center space-x-1 px-3 py-1 rounded-full bg-black/90 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-lg whitespace-nowrap">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>Today: {todayStatus}</span>
            </div>
          </div>

          {/* Current & Longest Streak Counters */}
          <div className="space-y-3 text-center sm:text-left">
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 flex items-center justify-center sm:justify-start space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Current Streak</span>
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline justify-center sm:justify-start space-x-2">
                <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {currentStreak}
                </span>
                <span className="text-lg font-bold text-zinc-400">Days</span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start space-x-2 text-xs text-zinc-400">
              <Award className="w-4 h-4 text-white" />
              <span>Longest Streak: <strong className="text-white font-bold">{longestStreak} Days</strong></span>
            </div>
          </div>
        </div>

        {/* Right Section: Progress Goals Trackers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Consistency Milestones</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Target Syncing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            {/* Weekly Goal Card */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Weekly Goal</span>
                <span className="font-bold text-white font-mono">{weeklyProgress}/{weeklyGoal} Days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${weeklyPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-white rounded-full shadow-sm"
                />
              </div>
              <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                <span>{weeklyPercent}% Completed</span>
                <span>Active</span>
              </div>
            </div>

            {/* Monthly Goal Card */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Monthly Goal</span>
                <span className="font-bold text-white font-mono">{monthlyProgress}/{monthlyGoal} Days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${monthlyPercent}%` }}
                  transition={{ duration: 1, delay: 0.1, ease: 'easeOut' }}
                  className="h-full bg-zinc-300 rounded-full shadow-sm"
                />
              </div>
              <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                <span>{monthlyPercent}% Completed</span>
                <span>On Track</span>
              </div>
            </div>

            {/* Yearly Goal Card */}
            <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300">Yearly Goal</span>
                <span className="font-bold text-white font-mono">{yearlyProgress}/{yearlyGoal} Days</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${yearlyPercent}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                  className="h-full bg-zinc-400 rounded-full shadow-sm"
                />
              </div>
              <div className="text-[10px] text-zinc-400 flex justify-between font-mono">
                <span>{yearlyPercent}% Completed</span>
                <span>Master</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
