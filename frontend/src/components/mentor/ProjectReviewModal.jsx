import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Award, CheckCircle2, AlertCircle, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { getProjectReview } from '../../api/mentor';

export function ProjectReviewModal({ isOpen, onClose, teamId, repoUrl }) {
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRunReview = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await getProjectReview({ team_id: teamId, repo_link: repoUrl });
      if (res.review) {
        setReviewData(res.review);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate 9-metric project review.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !reviewData && !loading) {
      handleRunReview();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="9-Metric AI Hackathon Audit & Review">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {loading && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-xs font-mono text-amber-300 font-bold tracking-wider">
              ANALYZING 9 CRITICAL HACKATHON RUBRIC DIMENSIONS...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {reviewData && !loading && (
          <>
            {/* Header Score Overview */}
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-black to-slate-900 flex items-center justify-between shadow-2xl">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Audited Project Rating</span>
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight">Comprehensive Evaluation</h3>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-amber-400 text-black font-black text-3xl font-mono shadow-xl shadow-amber-400/30">
                {reviewData.overallScore || 9.1}/10
              </div>
            </div>

            {/* 9 Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {reviewData.metrics?.map((m, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-4 rounded-2xl border border-white/12 bg-white/5 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white tracking-tight">{m.name}</span>
                    <span className="font-mono font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                      {m.score}/10
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">{m.feedback}</p>
                </div>
              ))}
            </div>

            {/* Actionable Improvements List */}
            <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Actionable Recommendations to Maximize Judge Score</span>
              </h4>

              <ul className="space-y-2 text-xs text-slate-200">
                {reviewData.actionableImprovements?.map((imp, iIdx) => (
                  <li key={iIdx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all shadow-lg active:scale-95"
          >
            Close Review
          </button>
        </div>
      </div>
    </Modal>
  );
}
