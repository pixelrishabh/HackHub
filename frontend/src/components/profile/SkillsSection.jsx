import React from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Cpu, Cloud, Shield, Layers, Sparkles } from 'lucide-react';

export function SkillsSection({ skills = [] }) {
  const coreTrackSkills = [
    { name: 'AI & Machine Learning', icon: Cpu, percent: 96 },
    { name: 'Frontend Engineering', icon: Code, percent: 92 },
    { name: 'Backend Architecture', icon: Server, percent: 90 },
    { name: 'Cloud & DevOps', icon: Cloud, percent: 84 },
    { name: 'Blockchain & Web3', icon: Layers, percent: 78 },
    { name: 'Cybersecurity & Auth', icon: Shield, percent: 88 },
  ];

  let parsedSkillsList = [];
  try {
    parsedSkillsList = typeof skills === 'string' ? JSON.parse(skills) : (skills || []);
  } catch (e) {
    parsedSkillsList = ['React', 'Python', 'PyTorch', 'Node.js', 'TailwindCSS', 'TypeScript', 'Docker', 'Gemini AI', 'FastAPI', 'PostgreSQL'];
  }

  if (parsedSkillsList.length === 0) {
    parsedSkillsList = ['React', 'Python', 'PyTorch', 'Node.js', 'TailwindCSS', 'TypeScript', 'Docker', 'Gemini AI', 'FastAPI', 'PostgreSQL'];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">Technical Mastery & Skill Matrix</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Verified technical skill proficiencies evaluated by AI code execution and hackathon submissions.
          </p>
        </div>

        <span className="text-xs font-mono text-white px-3 py-1 rounded-full bg-white/10 border border-white/20 font-bold">
          Level 14 Mastery
        </span>
      </div>

      {/* Core Tracks Grid (6 Progress Rings / Bars) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {coreTrackSkills.map((track, idx) => {
          const Icon = track.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 space-y-3 relative overflow-hidden group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide">{track.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-white">{track.percent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${track.percent}%` }}
                  transition={{ duration: 1.2, delay: idx * 0.1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-zinc-400 via-slate-200 to-white rounded-full shadow-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Verified Developer Skill Tags */}
      <div className="pt-4 border-t border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between text-xs font-mono font-semibold text-zinc-400">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Active Frameworks & Technologies</span>
          </span>
          <span>{parsedSkillsList.length} Verified Skills</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {parsedSkillsList.map((skill, sIdx) => (
            <motion.span
              key={sIdx}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/15 text-zinc-200 hover:text-white hover:bg-white/15 hover:border-white/40 transition-all cursor-default shadow-sm backdrop-blur-md"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
