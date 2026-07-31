import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, BarChart3, Award, Sparkles, CheckCircle } from 'lucide-react';

export function AIPerformanceSection({ stats = {} }) {
  // Radar Chart Attributes (6 metrics, max 100)
  const attributes = [
    { label: 'Innovation', score: 98 },
    { label: 'Code Quality', score: 95 },
    { label: 'Speed', score: 92 },
    { label: 'Architecture', score: 96 },
    { label: 'AI Integration', score: 99 },
    { label: 'Problem Solving', score: 94 },
  ];

  // Radar SVG Math setup
  const radius = 90;
  const center = 120;
  const numPoints = attributes.length;
  const angleStep = (Math.PI * 2) / numPoints;

  // Calculate polygon points
  const points = useMemo(() => {
    return attributes.map((attr, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (attr.score / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y, label: attr.label, score: attr.score };
    });
  }, [attributes, angleStep]);

  const pointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Hackathon History Sample List
  const hackathonHistory = [
    { name: 'HackOps Global AI Grand Prix 2026', place: '1st Place Winner', project: 'HackOps AI Orchestrator', date: 'Jul 2026', score: 9.8 },
    { name: 'Stanford Agentic Intelligence Hackathon', place: 'Top 3 Innovator', project: 'Glass Developer OS', date: 'Jun 2026', score: 9.5 },
    { name: 'Vercel AI & LLM Builder Sprint', place: 'Finalist', project: 'VectorMind Memory Engine', date: 'May 2026', score: 9.2 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">AI Performance & Developer Radar</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Multidimensional AI evaluation matrix based on automated code analysis and judge rubric feedback.
          </p>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white font-bold">
          AI Overall Score: {stats.aiScore || 94.8}/100
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl border border-white/[0.08] bg-white/5 relative">
          <h3 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-widest mb-2 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Capability Hexagon</span>
          </h3>

          <svg width="240" height="240" viewBox="0 0 240 240" className="overflow-visible">
            {/* Background Grid Hexagons (25%, 50%, 75%, 100%) */}
            {[0.25, 0.5, 0.75, 1].map((scale, gridIdx) => {
              const gridPoints = attributes.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = scale * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(' ');
              return (
                <polygon
                  key={gridIdx}
                  points={gridPoints}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeDasharray={scale === 1 ? 'none' : '3,3'}
                  strokeWidth="1"
                />
              );
            })}

            {/* Axes Lines */}
            {attributes.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Filled Polygon */}
            <motion.polygon
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              points={pointsString}
              fill="rgba(255, 255, 255, 0.12)"
              stroke="#FFFFFF"
              strokeWidth="2"
              className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            />

            {/* Points & Labels */}
            {points.map((p, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const labelRadius = radius + 22;
              const lx = center + labelRadius * Math.cos(angle);
              const ly = center + labelRadius * Math.sin(angle);

              return (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-mono font-bold fill-zinc-300"
                  >
                    {p.label} ({p.score})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hackathon History & Score Growth (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Award className="w-4 h-4 text-white" />
              <span>Verified Competition Record</span>
            </h3>
            <span className="text-xs text-zinc-400 font-mono">3 Competitions</span>
          </div>

          <div className="space-y-3">
            {hackathonHistory.map((item, hIdx) => (
              <div
                key={hIdx}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 hover:bg-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-white">{item.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/20 text-[10px] font-mono font-bold">
                      {item.place}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 flex items-center space-x-1.5">
                    <span>Project:</span>
                    <strong className="text-zinc-200">{item.project}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-zinc-400">{item.date}</span>
                  <div className="px-3 py-1 rounded-xl bg-white/10 border border-white/20 text-white font-bold">
                    Score: {item.score}/10
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
