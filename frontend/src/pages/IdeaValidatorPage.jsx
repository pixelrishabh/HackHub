import React, { useState } from 'react';
import { validateIdea } from '../api/ideas';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  FileCode,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
  Scissors,
  AlertCircle
} from 'lucide-react';

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

  const getBadgeVariant = (badgeText) => {
    const text = (badgeText || '').toUpperCase();
    if (text.includes('GREEN') || text.includes('HIGH')) return 'success';
    if (text.includes('YELLOW') || text.includes('MEDIUM')) return 'warning';
    return 'danger';
  };

  const getFeasibilityIcon = (badgeText) => {
    const text = (badgeText || '').toUpperCase();
    if (text.includes('GREEN') || text.includes('HIGH')) {
      return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
    }
    if (text.includes('YELLOW') || text.includes('MEDIUM')) {
      return <AlertTriangle className="w-6 h-6 text-amber-500" />;
    }
    return <XCircle className="w-6 h-6 text-rose-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200 mb-2">
            <FileCode className="w-3.5 h-3.5" />
            <span>AI Feasibility & MVP Scope Check</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Idea Validator</h1>
          <p className="text-sm text-slate-500">
            Validate whether your hackathon project concept can be completed within your remaining build hours.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hackathon Idea & Architecture Description *
            </label>
            <textarea
              rows={4}
              required
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="An automated RAG search engine for legal document analysis with realtime WebSockets and multi-tenant authentication..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-primary-500" />
              <span>Hours Remaining in Hackathon:</span>
              <span className="font-bold text-primary-600">{hoursRemaining} hours</span>
            </label>
            <input
              type="range"
              min="2"
              max="48"
              step="1"
              value={hoursRemaining}
              onChange={(e) => setHoursRemaining(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2 hours (Final Polish)</span>
              <span>24 hours</span>
              <span>48 hours (Full Build)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ideaDescription.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? 'Analyzing Feasibility...' : 'Validate Idea Scope'}</span>
          </button>
        </form>
      </div>

      {loading && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
          <LoadingSpinner label="AI is calculating timeline feasibility & scope recommendations..." size="lg" />
        </div>
      )}

      {/* Styled Validation Report Card */}
      {result && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-3">
              {getFeasibilityIcon(result.feasibility_badge || result.feasibility_score)}
              <div>
                <h3 className="text-lg font-bold text-slate-900">Idea Feasibility Assessment</h3>
                <p className="text-xs text-slate-500">Evaluation based on {hoursRemaining} hours build window</p>
              </div>
            </div>

            <Badge variant={getBadgeVariant(result.feasibility_badge || result.feasibility_score)}>
              Feasibility: {(result.feasibility_badge || result.feasibility_score || 'FEASIBLE').toString().toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Originality Note */}
            <div className="p-4 bg-surface rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Originality Analysis</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.originality_note || result.originality || 'Idea presents unique value propositions.'}
              </p>
            </div>

            {/* Scope Note */}
            <div className="p-4 bg-surface rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Time Scope Assessment</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {result.scope_note || result.scope || 'Scope is feasible if core features are prioritized.'}
              </p>
            </div>
          </div>

          {/* Suggested MVP Cut */}
          {result.suggested_mvp_cut && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-800">
                <Scissors className="w-4 h-4 text-emerald-600" />
                <span>Recommended MVP Scope Cut</span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                {result.suggested_mvp_cut}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
