import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  FolderPlus,
  Users,
  Send,
  Trophy,
  CheckSquare,
  Award,
  LogIn,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export function ActivityTimeline({ activities = [] }) {
  const [displayCount, setDisplayCount] = useState(6);

  const defaultActivities = [
    { id: '1', type: 'created_project', title: 'Created project: HackOps Autonomous Orchestrator', description: 'Initialized Git repository with PyTorch & Gemini APIs.', pointsEarned: 50, createdAt: '2026-07-28T14:20:00Z' },
    { id: '2', type: 'submitted_project', title: 'Submitted HackOps AI to Global Grand Prix', description: 'Pushed production build with demo video and live evaluation endpoint.', pointsEarned: 100, createdAt: '2026-07-25T18:45:00Z' },
    { id: '3', type: 'won_badge', title: 'Unlocked Badge: Top Innovator 2026', description: 'Awarded highest score in AI autonomy category.', pointsEarned: 75, createdAt: '2026-07-20T10:15:00Z' },
    { id: '4', type: 'joined_team', title: 'Joined Team: NeuralCrafters', description: 'Formed team with Devon Lee, Priya Sharma, and Liam O\'Connor.', pointsEarned: 25, createdAt: '2026-07-15T09:30:00Z' },
    { id: '5', type: 'judge_reviewed', title: 'Judge Evaluation Complete', description: 'Dr. Sarah Chen gave 9.5/10 on Technical Depth & Architecture.', pointsEarned: 40, createdAt: '2026-07-10T16:00:00Z' },
    { id: '6', type: 'received_certificate', title: 'Earned Grandmaster AI Architect Certificate', description: 'Verified credentials issued by HackHub AI Certification Body.', pointsEarned: 150, createdAt: '2026-07-02T11:00:00Z' },
    { id: '7', type: 'daily_login', title: 'Daily Activity Streak Maintained', description: 'Reached 14-day consecutive active streak.', pointsEarned: 15, createdAt: '2026-06-28T08:12:00Z' },
  ];

  const activeLogs = activities.length > 0 ? activities : defaultActivities;
  const visibleLogs = activeLogs.slice(0, displayCount);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'created_project': return { icon: FolderPlus, color: 'text-white bg-white/10 border-white/20' };
      case 'joined_team': return { icon: Users, color: 'text-white bg-white/10 border-white/20' };
      case 'submitted_project': return { icon: Send, color: 'text-white bg-white/10 border-white/20' };
      case 'won_badge': return { icon: Trophy, color: 'text-white bg-white/10 border-white/20' };
      case 'judge_reviewed': return { icon: CheckSquare, color: 'text-white bg-white/10 border-white/20' };
      case 'received_certificate': return { icon: Award, color: 'text-white bg-white/10 border-white/20' };
      default: return { icon: LogIn, color: 'text-white bg-white/10 border-white/20' };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">GitHub Style Activity Timeline</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Chronological audit feed of hackathon submissions, code commits, judge reviews, and team milestones.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 font-semibold">
          {activeLogs.length} Events Logged
        </span>
      </div>

      {/* Timeline Feed Container */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-white/30 before:via-zinc-600 before:to-transparent">
        <AnimatePresence>
          {visibleLogs.map((log, idx) => {
            const { icon: Icon, color } = getActivityIcon(log.type);
            const formattedDate = new Date(log.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="relative group"
              >
                {/* Timeline Marker Dot */}
                <div className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-8 h-8 rounded-xl border ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>

                {/* Timeline Card */}
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 hover:bg-white/10 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white tracking-tight">{log.title}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-mono font-bold text-white">
                        +{log.pointsEarned || 15} XP
                      </span>
                    </div>
                    {log.description && (
                      <p className="text-xs text-zinc-400 leading-relaxed">{log.description}</p>
                    )}
                  </div>

                  <div className="text-[11px] font-mono text-zinc-400 whitespace-nowrap self-start sm:self-center">
                    {formattedDate}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Pagination / Show More */}
      {visibleLogs.length < activeLogs.length && (
        <div className="mt-8 pt-4 border-t border-white/[0.08] flex justify-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 5)}
            className="px-6 py-2.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all flex items-center space-x-2 shadow-lg"
          >
            <span>Load More Activity Logs ({activeLogs.length - visibleLogs.length} remaining)</span>
            <ChevronDown className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
