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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ideaDescription.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await validateIdea({
        idea_description: ideaDescription.trim(),
        hours_remaining: hoursRemaining,
      });
      setResult(res.validation || res);
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
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-accentCyan text-xs font-semibold rounded-full border border-white/20 mb-3">
            <FileCode className="w-3.5 h-3.5" />
            <span>Hackathon MVP Scope Calculator</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Realtime Idea Validator</h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Test project scope feasibility against remaining build hours with instant MVP scope reduction recommendations.
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
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-5">
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
                className="w-full px-4 py-3 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-white focus:outline-none placeholder-slate-500"
                placeholder="An automated RAG search engine for legal document analysis with realtime WebSockets..."
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Hours Remaining</label>
                <span className="text-xs font-black text-accentCyan">{hoursRemaining} hrs</span>
              </div>
              <input
                type="range"
                min="2"
                max="48"
                step="1"
                value={hoursRemaining}
                onChange={(e) => setHoursRemaining(Number(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
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
              className="w-full py-3.5 bg-white text-black font-extrabold text-xs rounded-xl shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Analyzing Scope Feasibility...' : 'Validate Feasibility with AI'}
            </button>
          </form>
        </div>

        {/* Right Column: AI Analysis Scorecard (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
          <h2 className="text-base font-bold text-white border-b border-white/10 pb-3 flex items-center justify-between">
            <span>Scope Analysis & Feasibility Verdict</span>
            {result && <Badge variant={result.is_feasible ? 'success' : 'warning'}>{result.badge_text || 'Analyzed'}</Badge>}
          </h2>

          {loading ? (
            <div className="min-h-[300px] flex items-center justify-center">
              <LoadingSpinner label="Calculating build hour feasibility..." size="md" />
            </div>
          ) : result ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/12">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Feasibility Tier</div>
                  <div className="text-2xl font-black text-accentCyan">{result.badge_text || 'Feasible'}</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/12">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Est. Build Hours</div>
                  <div className="text-3xl font-black text-white">{result.estimated_hours || hoursRemaining} hrs</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/12 col-span-2 sm:col-span-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Complexity</div>
                  <div className="text-xl font-extrabold text-emerald-400">{result.complexity || 'Moderate'}</div>
                </div>
              </div>

              {result.reasoning && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-white block">AI Feasibility Reasoning:</span>
                  <p className="leading-relaxed">{result.reasoning}</p>
                </div>
              )}

              {result.scope_reductions?.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-white block">Recommended MVP Scope Cuts:</span>
                  <ul className="list-disc pl-4 space-y-1">
                    {result.scope_reductions.map((cut, idx) => (
                      <li key={idx}>{cut}</li>
                    ))}
                  </ul>
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
