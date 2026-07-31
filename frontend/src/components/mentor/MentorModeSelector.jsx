import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Palette, Trophy, Rocket, Sparkles } from 'lucide-react';

export function MentorModeSelector({ currentMode = 'developer', onSelectMode }) {
  const modes = [
    {
      id: 'developer',
      label: 'Developer Mode',
      shortLabel: 'Developer',
      icon: Code2,
      description: 'Code reviews, debugging, architecture & APIs',
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
      activeBg: 'bg-cyan-500 text-black shadow-cyan-500/30',
    },
    {
      id: 'designer',
      label: 'Designer Mode',
      shortLabel: 'Designer',
      icon: Palette,
      description: 'UI/UX layout, glassmorphism & accessibility',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40',
      activeBg: 'bg-purple-500 text-white shadow-purple-500/30',
    },
    {
      id: 'judge',
      label: 'Judge Mode',
      shortLabel: 'Judge',
      icon: Trophy,
      description: 'Rubric scoring, pitch evaluation & demo review',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
      activeBg: 'bg-amber-400 text-black shadow-amber-400/30',
    },
    {
      id: 'startup',
      label: 'Startup Advisor',
      shortLabel: 'Startup',
      icon: Rocket,
      description: 'Business model, pitch deck & value prop',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
      activeBg: 'bg-emerald-400 text-black shadow-emerald-400/30',
    },
  ];

  return (
    <div className="glass-panel p-2 rounded-2xl border border-white/15 bg-black/60 backdrop-blur-xl shadow-xl flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
      {modes.map((m) => {
        const Icon = m.icon;
        const isActive = currentMode === m.id;

        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center space-x-2 relative group ${
              isActive
                ? `${m.activeBg} font-black shadow-lg scale-[1.02]`
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-current' : 'text-slate-400 group-hover:text-cyan-300'}`} />
            <div className="flex flex-col text-left leading-tight">
              <span className="truncate">{m.shortLabel}</span>
              <span className={`text-[9px] font-normal truncate opacity-80 ${isActive ? 'text-current' : 'text-slate-400'}`}>
                {m.id === 'developer' ? 'Code & Arch' : m.id === 'designer' ? 'UI/UX' : m.id === 'judge' ? 'Rubric Score' : 'Pitch Deck'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
