import React from 'react';
import { Clock, Github, AlertTriangle, CheckCircle2, ShieldCheck, Upload, Award, FileText } from 'lucide-react';

export function ProjectAwarenessCard({
  team = {},
  repoUrl = '',
  onOpenReview,
  onOpenFileUpload,
  attachments = [],
}) {
  const teamName = team.name || 'NeuralCrafters';
  const hoursRemaining = 14;
  const progressPercent = 75;

  return (
    <div className="glass-panel p-6 rounded-[28px] border border-white/15 bg-black/60 backdrop-blur-2xl shadow-2xl space-y-6">
      {/* Deadline & Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Submission Deadline</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-[10px] font-mono font-extrabold uppercase">
            {hoursRemaining}h 45m Remaining
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Hackathon MVP Readiness</span>
            <span className="text-cyan-300 font-mono font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full shadow-lg shadow-cyan-400/40" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Project Status Checks */}
      <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-2 text-slate-300">
            <Github className="w-4 h-4 text-cyan-400" />
            <span>Repository Status</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            Connected
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Deployment Status</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            Vite / Vercel Live
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-2 text-slate-300">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Pending Tasks</span>
          </div>
          <span className="text-[10px] font-bold text-amber-300 font-mono">
            Demo Video Upload
          </span>
        </div>
      </div>

      {/* Uploaded File Attachments Count */}
      {attachments.length > 0 && (
        <div className="pt-2 border-t border-white/10 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analyzed Files ({attachments.length})</span>
          </div>
          <div className="space-y-1">
            {attachments.map((f, idx) => (
              <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center justify-between font-mono">
                <span className="truncate max-w-[180px]">{f.name}</span>
                <span className="text-[10px] text-cyan-300">{f.size}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 space-y-2">
        <button
          onClick={onOpenReview}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black font-extrabold text-xs transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] flex items-center justify-center space-x-2 active:scale-95"
        >
          <Award className="w-4 h-4 text-black" />
          <span>Run 9-Metric AI Scorecard Review</span>
        </button>

        <button
          onClick={onOpenFileUpload}
          className="w-full py-2.5 px-4 rounded-xl glass-panel border border-white/20 bg-white/5 hover:bg-white/15 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 active:scale-95"
        >
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Attach Document / File Context</span>
        </button>
      </div>
    </div>
  );
}
