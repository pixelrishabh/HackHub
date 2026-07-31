import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Sparkles, Github, Video, ExternalLink, X, Users, CheckCircle2, Star, ShieldCheck, Code } from 'lucide-react';
import { Modal } from './Modal';

const CHAMPIONS = [
  {
    id: 1,
    title: 'NeuralMatrix OS',
    award: 'Grand Prize Champion',
    badgeColor: 'from-amber-400 to-yellow-600',
    icon: Trophy,
    score: 98.4,
    teamName: 'Team NeuralMatrix',
    members: [
      { name: 'Elena Rostova', role: 'AI Architect' },
      { name: 'Marcus Vance', role: 'Frontend Lead' },
      { name: 'David Kim', role: 'Systems Engineer' },
    ],
    github: 'https://github.com/facebook/react',
    video: 'https://youtube.com',
    stack: ['React 18', 'Three.js', 'Gemini 3.6 API', 'Express', 'Prisma', 'Tailwind CSS'],
    summary: 'Autonomous multi-agent orchestration operating system designed for enterprise AI deployment and continuous code review.',
    judgeFeedback: 'Outstanding architectural completeness. The real-time vector search integration and silky-smooth glass UI set a new benchmark.',
    aiScorecard: {
      originality: 99,
      technicalDepth: 98,
      completeness: 97,
      clarity: 100,
    },
  },
  {
    id: 2,
    title: 'AetherMind AI',
    award: 'Best UI/UX Design Award',
    badgeColor: 'from-accentCyan to-blue-600',
    icon: Star,
    score: 96.8,
    teamName: 'Team AetherMind',
    members: [
      { name: 'Sophia Chen', role: 'UX Designer' },
      { name: 'Liam O’Connor', role: 'React Engineer' },
    ],
    github: 'https://github.com/facebook/react',
    video: 'https://youtube.com',
    stack: ['Vite', 'Framer Motion', 'R3F Drei', 'Node.js', 'Tailwind CSS'],
    summary: 'Immersive spatial 3D canvas for node-based prompt engineering and autonomous workflow visualization.',
    judgeFeedback: 'Exceptional visual polish. Micro-interactions and glassmorphic spatial design feel like Apple Vision Pro software.',
    aiScorecard: {
      originality: 97,
      technicalDepth: 95,
      completeness: 96,
      clarity: 99,
    },
  },
  {
    id: 3,
    title: 'ZeroProof Shield',
    award: 'Most Innovative AI Architecture',
    badgeColor: 'from-emerald-400 to-teal-600',
    icon: ShieldCheck,
    score: 95.2,
    teamName: 'Team ZeroProof',
    members: [
      { name: 'Arjun Patel', role: 'Cryptography Lead' },
      { name: 'Zoe Martinez', role: 'ML Researcher' },
    ],
    github: 'https://github.com/facebook/react',
    video: 'https://youtube.com',
    stack: ['Python', 'PyTorch', 'TypeScript', 'FastAPI', 'PostgreSQL'],
    summary: 'Zero-knowledge verifiable AI model inference defense system preventing adversarial prompt injections.',
    judgeFeedback: 'Breakthrough security architecture solving critical LLM verification bottlenecks for real-world enterprise adoption.',
    aiScorecard: {
      originality: 100,
      technicalDepth: 99,
      completeness: 92,
      clarity: 90,
    },
  },
];

export function HallOfFame() {
  const [selectedWinner, setSelectedWinner] = useState(null);

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-accentCyan text-xs font-semibold rounded-full border border-white/20 mb-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Hackathon Winners Showcase</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Hall of Fame Champions</h2>
        </div>
      </div>

      {/* Champions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CHAMPIONS.map((champ) => {
          const Icon = champ.icon;
          return (
            <motion.div
              key={champ.id}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => setSelectedWinner(champ)}
              className="glass-panel glass-panel-hover p-6 rounded-[28px] border border-white/15 cursor-pointer backdrop-blur-2xl flex flex-col justify-between group shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 bg-gradient-to-r ${champ.badgeColor} text-black font-extrabold text-[10px] uppercase rounded-full shadow-lg`}>
                    {champ.award}
                  </span>
                  <span className="text-xl font-black text-accentCyan">{champ.score} <span className="text-xs text-slate-400 font-normal">/100</span></span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-accentCyan" />
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-accentCyan transition-colors mb-1">
                  {champ.title}
                </h3>
                <span className="text-xs text-slate-400 font-medium block mb-3">{champ.teamName}</span>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 font-normal">
                  {champ.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 font-bold group-hover:text-white transition-colors">
                <span>View Winner Scorecard & Demo</span>
                <ExternalLink className="w-4 h-4 text-accentCyan group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fullscreen Winner Glass Modal */}
      <AnimatePresence>
        {selectedWinner && (
          <Modal isOpen={!!selectedWinner} onClose={() => setSelectedWinner(null)} title={selectedWinner.award}>
            <div className="space-y-6 text-white max-w-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-black uppercase text-white">{selectedWinner.title}</h3>
                  <span className="text-xs text-accentCyan font-bold">{selectedWinner.teamName}</span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-amber-400">{selectedWinner.score}</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Composite Score</div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/12 text-xs text-slate-200 leading-relaxed font-normal">
                <span className="font-bold text-white block mb-1">Project Summary:</span>
                {selectedWinner.summary}
              </div>

              {/* Multidimensional AI Scorecard Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">AI Scorecard Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Originality</div>
                    <div className="text-xl font-black text-white">{selectedWinner.aiScorecard.originality}%</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Tech Depth</div>
                    <div className="text-xl font-black text-accentCyan">{selectedWinner.aiScorecard.technicalDepth}%</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Completeness</div>
                    <div className="text-xl font-black text-white">{selectedWinner.aiScorecard.completeness}%</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Clarity</div>
                    <div className="text-xl font-black text-emerald-400">{selectedWinner.aiScorecard.clarity}%</div>
                  </div>
                </div>
              </div>

              {/* Judge Feedback */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">Official Judge Feedback:</span>
                "{selectedWinner.judgeFeedback}"
              </div>

              {/* Tech Stack Chips */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Technology Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedWinner.stack.map((s) => (
                    <span key={s} className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-semibold rounded-lg">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* External Artifact Links */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <a
                  href={selectedWinner.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 bg-white text-black font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2"
                >
                  <Github className="w-4 h-4 text-black" />
                  <span>Inspect GitHub Repo</span>
                </a>
                <a
                  href={selectedWinner.video}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                >
                  <Video className="w-4 h-4 text-accentCyan" />
                  <span>Watch Demo Video</span>
                </a>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
