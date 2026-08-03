import React, { useState } from 'react';
import { validateIdea } from '../api/ideas';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { FileCode, Sparkles, Clock, CheckCircle2, AlertTriangle, Lightbulb, Scissors } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

export function IdeaValidatorPage() {
  const [ideaDescription, setIdeaDescription] = useState('');
  const [hoursRemaining, setHoursRemaining] = useState(18);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ideaDescription.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await validateIdea({
        idea_description: ideaDescription.trim(),
        hours_remaining: hoursRemaining,
      });

      const valData = res.validation || res;
      setResult(valData);
      setHistory((prev) => [
        {
          id: `val-${Date.now()}`,
          ideaText: ideaDescription.trim(),
          hours: hoursRemaining,
          score: valData.overall_score || 85,
          data: valData,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.message || 'Idea validation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white">
      {/* Decorative 3D Holographic Matrix */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none hidden lg:block">
        <Page3DCanvas type="matrix" />
      </div>

      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-cyan-400 text-xs font-semibold rounded-full border border-white/20 mb-3">
            <FileCode className="w-3.5 h-3.5" />
            <span>Hackathon MVP Scope Calculator</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Realtime Idea Validator</h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Test project scope feasibility against remaining build hours with structured risk reports and concrete MVP next steps.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form and Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scope Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-5">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">Project Scope Parameters</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Idea & Architecture Overview *
                </label>
                <textarea
                  rows={4}
                  required
                  value={ideaDescription}
                  onChange={(e) => setIdeaDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none placeholder-slate-500"
                  placeholder="An automated RAG search engine for legal document analysis with realtime WebSockets..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Hours Remaining</label>
                  <span className="text-xs font-black text-cyan-400">{hoursRemaining} hrs</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="48"
                  step="1"
                  value={hoursRemaining}
                  onChange={(e) => setHoursRemaining(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>2 hrs (Final Polish)</span>
                  <span>24 hrs</span>
                  <span>48 hrs (Full Build)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !ideaDescription.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Analyzing Scope Feasibility...' : 'Validate Feasibility with AI'}
              </button>
            </form>
          </div>

          {/* Session History View */}
          {history.length > 0 && (
            <div className="glass-panel p-6 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Session Idea History ({history.length})
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {history.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => {
                      setResult(h.data);
                      setIdeaDescription(h.ideaText);
                      setHoursRemaining(h.hours);
                    }}
                    className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-left transition-all flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs font-bold text-white truncate">{h.ideaText}</div>
                      <div className="text-[10px] text-slate-400">{h.hours} hrs remaining • {h.timestamp}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs rounded-full">
                      {h.score}/100
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Structured Scorecard & Detailed Cards (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
          <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
            <span>Structured Feasibility Verdict</span>
            {result && (
              <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase rounded-full">
                Score: {result.overall_score || 85}/100
              </span>
            )}
          </h2>

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <LoadingSpinner label="Evaluating feasibility score & scope cuts..." size="md" />
            </div>
          ) : result ? (
            <div className="space-y-5">
              {/* Score Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/12">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Feasibility Score</div>
                  <div className="text-3xl font-black text-cyan-400">{result.overall_score || 85}/100</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/12">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Build Time</div>
                  <div className="text-3xl font-black text-white">{hoursRemaining} hrs</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/12 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Status</div>
                  <div className="text-xl font-extrabold text-emerald-400 capitalize">{result.feasibility || 'Green'}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block uppercase tracking-wider text-[10px]">Feasibility Summary:</span>
                <p className="leading-relaxed">{result.summary || `Scope is feasible given ${hoursRemaining} hours remaining.`}</p>
              </div>

              {/* Key Risks & Bottlenecks */}
              {(result.weaknesses?.length > 0 || result.key_risks?.length > 0) && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-200 space-y-2">
                  <span className="font-bold text-rose-300 block uppercase tracking-wider text-[10px]">⚠️ Key Risks & Architectural Bottlenecks:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {(result.weaknesses || result.key_risks || []).map((risk, idx) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Scope Adjustments */}
              {(result.improvement_suggestions?.length > 0 || result.scope_reductions?.length > 0) && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200 space-y-2">
                  <span className="font-bold text-amber-300 block uppercase tracking-wider text-[10px]">✂️ Suggested Scope Adjustments ({hoursRemaining}h remaining):</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {(result.improvement_suggestions || result.scope_reductions || []).map((cut, idx) => (
                      <li key={idx}>{cut}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concrete Next Steps */}
              {result.suggested_mvp && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-300 block uppercase tracking-wider text-[10px]">🚀 Concrete Next Steps:</span>
                  <p className="leading-relaxed">{result.suggested_mvp}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-400">
              Submit your project scope parameters on the left to receive instant feasibility scoring & scope cut recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
