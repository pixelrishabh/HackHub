import React from 'react';
import { motion } from 'framer-motion';
import { AnimatedCounter } from '../AnimatedCounter';
import {
  FolderGit2,
  Trophy,
  Award,
  GitCommit,
  CheckSquare,
  Brain,
  Star,
  Users,
  UserCheck
} from 'lucide-react';

export function ProfileStatsGrid({ stats = {} }) {
  const statItems = [
    {
      label: 'Projects Created',
      value: stats.projectsCreated || 4,
      icon: FolderGit2,
    },
    {
      label: 'Hackathons Joined',
      value: stats.hackathonsJoined || 6,
      icon: Trophy,
    },
    {
      label: 'Hackathons Won',
      value: stats.hackathonsWon || 2,
      icon: Award,
    },
    {
      label: 'Commits Pushed',
      value: stats.commits || 184,
      icon: GitCommit,
    },
    {
      label: 'Tasks Completed',
      value: stats.tasksCompleted || 42,
      icon: CheckSquare,
    },
    {
      label: 'AI Score',
      value: stats.aiScore ? `${stats.aiScore}` : '94.8',
      suffix: '%',
      icon: Brain,
    },
    {
      label: 'Judge Rating',
      value: stats.judgeRating ? `${stats.judgeRating}` : '4.9',
      suffix: '/5',
      icon: Star,
    },
    {
      label: 'Followers',
      value: stats.followers || 142,
      icon: Users,
    },
    {
      label: 'Following',
      value: stats.following || 38,
      icon: UserCheck,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Platform Developer Performance Stats</h3>
        <span className="text-xs font-mono text-zinc-400">9 Core Dimensions</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {statItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-2xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-xl flex flex-col justify-between space-y-3 relative overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors" />
              </div>

              <div>
                <div className="text-2xl font-black text-white tracking-tight font-mono">
                  {typeof item.value === 'number' ? (
                    <AnimatedCounter value={item.value.toString()} suffix={item.suffix || ''} />
                  ) : (
                    <span>{item.value}{item.suffix || ''}</span>
                  )}
                </div>
                <div className="text-[11px] font-mono font-semibold text-zinc-400 tracking-wide mt-0.5 line-clamp-1">
                  {item.label}
                </div>
              </div>

              {/* Shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
