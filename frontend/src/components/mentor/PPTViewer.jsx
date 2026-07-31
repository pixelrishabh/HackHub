import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Presentation, ChevronLeft, ChevronRight, Volume2, Copy, Check, Sparkles } from 'lucide-react';

export function PPTViewer({ pptData = {} }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(true);
  const [copied, setCopied] = useState(false);

  const title = pptData.presentationTitle || 'HackOps AI Pitch Deck';
  const subtitle = pptData.subtitle || 'Global Hackathon Presentation';
  const slides = pptData.slides || [];

  if (slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleCopyMarkdown = () => {
    let mdText = `# ${title}\n## ${subtitle}\n\n`;
    slides.forEach((s) => {
      mdText += `### Slide ${s.slideNumber}: ${s.title}\n`;
      s.bullets?.forEach((b) => {
        mdText += `- ${b}\n`;
      });
      if (s.speakerNotes) {
        mdText += `*Speaker Notes: ${s.speakerNotes}*\n\n`;
      }
    });
    navigator.clipboard.writeText(mdText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 glass-panel rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-black to-slate-900 overflow-hidden shadow-2xl space-y-4 p-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20">
            <Presentation className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-amber-300 font-mono">{subtitle}</p>
          </div>
        </div>

        <button
          onClick={handleCopyMarkdown}
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Deck!' : 'Copy Presentation'}</span>
        </button>
      </div>

      {/* Slide Canvas Display */}
      <div className="relative min-h-[260px] p-6 rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-inner">
        {/* Slide Number Badge */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
            SLIDE {currentSlide.slideNumber} OF {slides.length}
          </span>
          <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">
            {currentSlide.title}
          </span>
        </div>

        {/* Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-3 py-2"
          >
            <h4 className="text-xl font-black text-white tracking-tight text-glow">
              {currentSlide.title}
            </h4>

            <ul className="space-y-2 pl-2">
              {currentSlide.bullets?.map((bullet, bIdx) => (
                <li key={bIdx} className="flex items-start space-x-2.5 text-xs text-slate-200 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{bullet}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        {/* Speaker Notes */}
        {showSpeakerNotes && currentSlide.speakerNotes && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2 font-sans leading-relaxed">
            <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-amber-300 uppercase text-[10px] tracking-wider block mb-0.5">
                Speaker Notes Script:
              </strong>
              <span>"{currentSlide.speakerNotes}"</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {slides.map((_, sIdx) => (
            <button
              key={sIdx}
              onClick={() => setCurrentSlideIndex(sIdx)}
              className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                currentSlideIndex === sIdx
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/40'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:bg-white/15'
              }`}
            >
              {sIdx + 1}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentSlideIndex === 0}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
            disabled={currentSlideIndex === slides.length - 1}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white disabled:opacity-30 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
