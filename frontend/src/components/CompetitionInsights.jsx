import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Flame, Globe, Users, Award, Clock, Zap, TrendingUp, Activity, CheckCircle2 } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

const LIVE_FEED_ITEMS = [
  { id: 1, type: 'submission', text: 'Team NeuralMatrix submitted final project artifacts', time: '1m ago', icon: Trophy, color: 'text-amber-400' },
  { id: 2, type: 'judge', text: 'Judge Dr. Aris Thorne evaluated scorecards for Team QuantumAI', time: '3m ago', icon: Award, color: 'text-accentCyan' },
  { id: 3, type: 'ai', text: 'Gemini AI updated composite technical score to 96.4/100', time: '5m ago', icon: Sparkles, color: 'text-emerald-400' },
  { id: 4, type: 'checkin', text: 'Team CyberForge logged milestone check-in (+5 pts)', time: '8m ago', icon: Zap, color: 'text-purple-400' },
  { id: 5, type: 'mentor', text: 'Mentor Marcus Vance joined chat room #track-ai', time: '12m ago', icon: Users, color: 'text-cyan-400' },
];

const AI_PREDICTIONS = [
  { rank: 1, team: 'NeuralMatrix', probability: 96.4, track: 'Autonomous Agents', delta: '+2.4%' },
  { rank: 2, team: 'QuantumAI', probability: 92.1, track: 'LLM Systems', delta: '+1.8%' },
  { rank: 3, team: 'CyberForge', probability: 88.5, track: 'Zero-Knowledge AI', delta: '━ 0.0%' },
  { rank: 4, team: 'AetherMind', probability: 84.2, track: 'Multimodal AI', delta: '+3.1%' },
  { rank: 5, team: 'SynapseLabs', probability: 81.0, track: 'AI Infrastructure', delta: '-0.5%' },
];

export function CompetitionInsights() {
  const [feedIndex, setFeedIndex] = useState(0);

  // Auto-advance live activity feed ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setFeedIndex((prev) => (prev + 1) % LIVE_FEED_ITEMS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Live Statistics & Hackathon Pulse Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-panel glass-panel-hover p-5 rounded-[22px] border border-white/12 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Prize Pool</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">$100,000</div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">● Cash & AI Cloud Credits</div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-[22px] border border-white/12 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Build Clock</span>
            <Clock className="w-4 h-4 text-accentCyan" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-accentCyan">14:22:08</div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">Final Submission Window</div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-[22px] border border-white/12 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Avg AI Score</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">89.4 <span className="text-xs text-slate-400 font-normal">/100</span></div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">+4.2 pts vs last event</div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-[22px] border border-white/12 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Global Reach</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            <AnimatedCounter value="42" suffix=" Countries" />
          </div>
          <div className="text-[10px] text-slate-400 font-semibold mt-1">Global Builder Network</div>
        </div>

        <div className="glass-panel glass-panel-hover p-5 rounded-[22px] border border-white/12 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest">Active Judges</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">18 <span className="text-xs text-slate-400 font-normal">Live</span></div>
          <div className="text-[10px] text-purple-400 font-semibold mt-1">Reviewing Scorecards</div>
        </div>
      </div>

      {/* Main Insights Panel: AI Predictions & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Win Probability Prediction Engine (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-accentCyan animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white tracking-tight uppercase">AI Victory Probability Model</h3>
                <p className="text-[11px] text-slate-400 font-normal">Gemini 3.6 real-time predictive analytics over code quality & judge weighting</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-white/10 border border-white/20 text-accentCyan text-xs font-bold rounded-full">
              Live Model
            </span>
          </div>

          <div className="space-y-4">
            {AI_PREDICTIONS.map((pred) => (
              <div key={pred.rank} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/25 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white text-xs font-black flex items-center justify-center">
                      #{pred.rank}
                    </span>
                    <span className="text-sm font-bold text-white">{pred.team}</span>
                    <span className="px-2.5 py-0.5 bg-white/5 border border-white/10 text-[10px] text-slate-400 rounded-md">
                      {pred.track}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-emerald-400">{pred.delta}</span>
                    <span className="text-sm font-black text-accentCyan">{pred.probability}%</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 via-accentCyan to-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pred.probability}%` }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Realtime Activity Feed Stream (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-accentCyan animate-pulse" />
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Live Pulse Ticker</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">● Streaming</span>
            </div>

            <div className="space-y-3 min-h-[260px]">
              <AnimatePresence mode="popLayout">
                {LIVE_FEED_ITEMS.slice(0, 4).map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                      className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center space-x-3"
                    >
                      <div className={`w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs text-slate-200 font-medium truncate">{item.text}</p>
                        <span className="text-[10px] text-slate-400">{item.time}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center">
            <span className="text-xs font-semibold text-slate-300">
              ⚡ Real-time Websocket Engine Connected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
