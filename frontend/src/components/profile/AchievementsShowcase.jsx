import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Brain,
  Clock,
  ShieldAlert,
  Zap,
  Trophy,
  GitPullRequest,
  CheckCircle2,
  Lock,
  Star
} from 'lucide-react';

export function AchievementsShowcase({ badges = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Top Innovator',
    'AI Master',
    'Early Bird',
    'Bug Hunter',
    'Fast Builder',
    'Winner',
    'Open Source',
  ];

  // Default badges list if empty
  const defaultBadges = [
    { badgeKey: 'top_innovator', name: 'Top Innovator 2026', category: 'Top Innovator', icon: Sparkles, description: 'Awarded for groundbreaking original AI agent design.', unlockedAt: '2026-05-12' },
    { badgeKey: 'ai_master', name: 'AI Mastermind', category: 'AI Master', icon: Brain, description: 'Demonstrated mastery over Gemini 1.5 Pro & Claude 3.5 integrations.', unlockedAt: '2026-06-01' },
    { badgeKey: 'winner', name: 'Hackathon Champion', category: 'Winner', icon: Trophy, description: 'Secured 1st Place overall in HackOps AI Global Sprint.', unlockedAt: '2026-06-18' },
    { badgeKey: 'bug_hunter', name: 'Bug Hunter Elite', category: 'Bug Hunter', icon: ShieldAlert, description: 'Identified and fixed 25+ critical runtime bottlenecks.', unlockedAt: '2026-06-25' },
    { badgeKey: 'fast_builder', name: 'Fast Builder', category: 'Fast Builder', icon: Zap, description: 'Shipped complete full-stack AI MVP within 24 hours.', unlockedAt: '2026-07-04' },
    { badgeKey: 'open_source', name: 'Open Source Titan', category: 'Open Source', icon: GitPullRequest, description: '100+ public contributions to open-source developer tooling.', unlockedAt: '2026-07-15' },
    { badgeKey: 'early_bird', name: 'Early Bird Submitter', category: 'Early Bird', icon: Clock, description: 'Submitted production-ready build 6 hours ahead of deadline.', unlockedAt: '2026-07-22' },
  ];

  const activeBadges = badges.length > 0 ? badges : defaultBadges;

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Brain': return Brain;
      case 'Trophy': return Trophy;
      case 'ShieldAlert': return ShieldAlert;
      case 'Zap': return Zap;
      case 'GitPullRequest': return GitPullRequest;
      case 'Clock': return Clock;
      default: return Sparkles;
    }
  };

  const filteredBadges = selectedCategory === 'All'
    ? activeBadges
    : activeBadges.filter(b => b.category === selectedCategory || b.badgeKey === selectedCategory.toLowerCase().replace(/\s+/g, '_'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">Verified Achievements & Badges</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Cryptographically verifiable credentials and badges earned during global hackathon competitions.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-white text-black font-extrabold shadow-md'
                  : 'bg-white/5 text-zinc-300 border border-white/10 hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredBadges.map((badge, idx) => {
            const Icon = typeof badge.icon === 'function' ? badge.icon : getIcon(badge.icon);

            return (
              <motion.div
                key={badge.id || badge.badgeKey || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="p-5 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl flex flex-col justify-between space-y-4 group relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:border-white/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]"
              >
                {/* Badge Top Bar */}
                <div className="flex items-start justify-between">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-black border border-white/40 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider">
                    {badge.category || 'Achievement'}
                  </span>
                </div>

                {/* Badge Content */}
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight group-hover:text-zinc-200 transition-colors">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Badge Bottom Date */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>Unlocked</span>
                  <span className="text-zinc-200 font-semibold">
                    {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Verified'}
                  </span>
                </div>

                {/* Crystal White Glow reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
