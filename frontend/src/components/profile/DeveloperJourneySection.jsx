import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Zap,
  Lock,
  CheckCircle2,
  Award,
  Palette,
  Bot,
  Rocket,
  Flame,
  Star,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Compass
} from 'lucide-react';

export function DeveloperJourneySection({ profile = {}, user = {}, stats = {} }) {
  const currentLevel = profile?.xpLevel || 15;
  const currentXp = profile?.xpPoints || 5200;
  const targetXp = currentLevel * 433 + 100; // 6500 XP target for Level 15
  const xpPercentage = Math.min(100, Math.round((currentXp / targetXp) * 100));

  // 6 Growth Journey Stages
  const stages = [
    { id: 'beginner', title: 'Beginner', emoji: '🌱', minLevel: 1, maxLevel: 3, description: 'First code commits & fundamental track setup' },
    { id: 'explorer', title: 'Explorer', emoji: '⚡', minLevel: 4, maxLevel: 7, description: 'Exploring multi-agent tools & team collaboration' },
    { id: 'builder', title: 'Builder', emoji: '💻', minLevel: 8, maxLevel: 11, description: 'Shipping fullstack web apps & AI prototypes' },
    { id: 'innovator', title: 'Innovator', emoji: '🚀', minLevel: 12, maxLevel: 15, description: 'Architecting autonomous systems & winning tracks' },
    { id: 'champion', title: 'Champion', emoji: '🏆', minLevel: 16, maxLevel: 19, description: 'Top 1% hackathon finalist & domain authority' },
    { id: 'legend', title: 'Legend', emoji: '👑', minLevel: 20, maxLevel: 99, description: 'Grandmaster mentor & ecosystem creator' },
  ];

  // Determine stage status
  const getStageStatus = (stage) => {
    if (currentLevel > stage.maxLevel) return 'completed';
    if (currentLevel >= stage.minLevel && currentLevel <= stage.maxLevel) return 'active';
    return 'locked';
  };

  // Next Unlocks Data Cards
  const nextUnlocks = [
    {
      id: 'badge',
      title: 'New Badge',
      name: 'AI Systems Master',
      icon: Award,
      color: 'text-white',
      borderColor: 'border-white/15',
      bgColor: 'bg-white/5',
      remainingXp: 300,
      estDays: '2 Days',
      progress: 85,
    },
    {
      id: 'theme',
      title: 'Premium Theme',
      name: 'Cyber Neon Diamond',
      icon: Palette,
      color: 'text-white',
      borderColor: 'border-white/15',
      bgColor: 'bg-white/5',
      remainingXp: 700,
      estDays: '5 Days',
      progress: 65,
    },
    {
      id: 'mentor',
      title: 'AI Mentor Upgrade',
      name: 'Autonomous Auditor v3',
      icon: Bot,
      color: 'text-white',
      borderColor: 'border-white/15',
      bgColor: 'bg-white/5',
      remainingXp: 1100,
      estDays: '8 Days',
      progress: 45,
    },
    {
      id: 'rank',
      title: 'Elite Rank',
      name: 'Grandmaster V Rank',
      icon: Rocket,
      color: 'text-white',
      borderColor: 'border-white/15',
      bgColor: 'bg-white/5',
      remainingXp: 1300,
      estDays: '10 Days',
      progress: 30,
    },
  ];

  // SVG Circle Progress properties
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (xpPercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-[32px] border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden mb-10 text-white"
    >
      {/* Background Minimal Light Streaks */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-zinc-950/40 to-black pointer-events-none" />
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Header Banner */}
      <div className="px-6 sm:px-10 pt-8 pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white backdrop-blur-xl shadow-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-black tracking-tight text-white">
                Developer Journey
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                Growth OS
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Visualizing developer milestones, XP mastery, and upcoming rank unlocks.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl text-xs font-mono text-zinc-300">
          <Sparkles className="w-4 h-4 text-white" />
          <span>Active Track: <strong className="text-white font-bold">AI Systems Architecture</strong></span>
        </div>
      </div>

      {/* Main 3-Column Grid */}
      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* ================= LEFT SIDE: Vertical Journey Timeline (4 Cols) ================= */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-white/[0.08] bg-white/5 backdrop-blur-2xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Flame className="w-4 h-4 text-white" />
              <span>Milestone Stages</span>
            </h3>
            <span className="text-[11px] font-mono font-semibold text-zinc-400">Stage 4 of 6</span>
          </div>

          {/* Timeline Wrapper */}
          <div className="relative space-y-5 pl-2">
            {/* Animated Connection Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-zinc-400 via-slate-200 to-zinc-800 pointer-events-none" />

            {stages.map((stage) => {
              const status = getStageStatus(stage);
              const isCompleted = status === 'completed';
              const isActive = status === 'active';
              const isLocked = status === 'locked';

              return (
                <motion.div
                  key={stage.id}
                  whileHover={{ x: 4 }}
                  className={`relative flex items-center space-x-4 p-3 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 border border-white/30 shadow-xl scale-[1.02]'
                      : isCompleted
                      ? 'bg-white/5 border border-white/10 opacity-90'
                      : 'bg-black/40 border border-white/5 opacity-40'
                  }`}
                >
                  {/* Stage Node Icon Circle */}
                  <div
                    className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center text-base font-bold shadow-lg transition-transform ${
                      isActive
                        ? 'bg-white text-black border-2 border-white ring-4 ring-white/20'
                        : isCompleted
                        ? 'bg-white/10 border border-white/20 text-white'
                        : 'bg-white/5 border border-white/10 text-zinc-600'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : isLocked ? (
                      <Lock className="w-4 h-4 text-zinc-500" />
                    ) : (
                      <span>{stage.emoji}</span>
                    )}
                  </div>

                  {/* Stage Text & Level Info */}
                  <div className="flex-1 truncate">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold tracking-tight truncate ${isActive ? 'text-white font-bold' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
                        {stage.title}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white text-black font-extrabold'
                          : isCompleted
                          ? 'bg-white/10 text-white'
                          : 'bg-white/5 text-zinc-600'
                      }`}>
                        {isActive ? 'CURRENT' : `LVL ${stage.minLevel}-${stage.maxLevel}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= CENTER: Large XP Progress Ring (4 Cols) ================= */}
        <div className="lg:col-span-4 p-8 rounded-3xl border border-white/[0.08] bg-white/5 backdrop-blur-2xl flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="text-center space-y-1 mb-6 relative z-10">
            <span className="text-[10px] font-mono font-bold tracking-widest text-white uppercase bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Mastery Engine v2
            </span>
            <h3 className="text-xl font-black text-white tracking-tight pt-1">
              Level {currentLevel} Progress
            </h3>
          </div>

          {/* SVG Circular Progress Ring */}
          <div className="relative w-56 h-56 flex items-center justify-center my-2 z-10">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r={radius}
                className="stroke-white/10"
                strokeWidth="12"
                fill="transparent"
              />
              <motion.circle
                cx="100"
                cy="100"
                r={radius}
                stroke="url(#xpGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <defs>
                <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#71717A" />
                  <stop offset="50%" stopColor="#E4E4E7" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Glass Ring Center Node */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="w-32 h-32 rounded-full bg-black/80 border border-white/20 backdrop-blur-2xl flex flex-col items-center justify-center shadow-2xl space-y-0.5">
                <Trophy className="w-6 h-6 text-white" />
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {currentXp.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">/ {targetXp.toLocaleString()} XP</span>
                <span className="text-[9px] font-extrabold text-white font-mono pt-1">
                  {xpPercentage}% REACHED
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center z-10">
            <p className="text-xs font-semibold text-zinc-300 flex items-center justify-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>{targetXp - currentXp} XP until Level {currentLevel + 1} Unlock</span>
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Next Unlocks Cards (4 Cols) ================= */}
        <div className="lg:col-span-4 p-6 rounded-3xl border border-white/[0.08] bg-white/5 backdrop-blur-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Star className="w-4 h-4 text-white" />
              <span>Next Unlocks</span>
            </h3>
            <span className="text-[11px] font-mono text-zinc-400">4 Rewards Queued</span>
          </div>

          <div className="space-y-3">
            {nextUnlocks.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3.5 rounded-2xl border ${item.borderColor} ${item.bgColor} backdrop-blur-xl space-y-2.5 transition-all duration-200 shadow-md group`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className={`p-2 rounded-xl bg-black/50 border border-white/10 ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">{item.title}</div>
                        <div className="text-xs font-extrabold text-white truncate group-hover:text-zinc-200 transition-colors">{item.name}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-[11px] font-mono font-extrabold text-white">-{item.remainingXp} XP</div>
                      <div className="text-[9px] font-mono text-zinc-400">~{item.estDays}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-zinc-400 to-white rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= BOTTOM: AI Journey Analysis Banner ================= */}
      <div className="px-6 sm:px-10 py-5 bg-[#070707] border-t border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-3.5 max-w-4xl">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/20 text-white shadow-lg flex-shrink-0">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              AI Growth Telemetry & Recommendations
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed pt-0.5 italic font-medium">
              "You've been highly consistent this week. Your strongest area is Problem Solving. You're only 1,300 XP away from reaching Innovator. Complete two hackathons and one AI challenge to reach the next level."
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {}}
          className="px-5 py-2.5 rounded-2xl bg-white text-black font-extrabold text-xs shadow-xl hover:bg-zinc-200 transition-all flex items-center space-x-1.5 flex-shrink-0 active:scale-95"
        >
          <span>Claim Active XP Rewards</span>
          <ChevronRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </motion.div>
  );
}
