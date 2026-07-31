import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

export function SmartSuggestions({ suggestions = [], onSelectSuggestion }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="pt-3 border-t border-white/10 space-y-2">
      <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Suggested Actionable Next Steps</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((sug, idx) => (
          <motion.button
            key={idx}
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectSuggestion(sug)}
            className="px-3 py-1.5 rounded-full glass-panel border border-white/15 bg-white/5 hover:bg-white/15 hover:border-cyan-400/50 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-md active:scale-95 group"
          >
            <span>{sug}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
