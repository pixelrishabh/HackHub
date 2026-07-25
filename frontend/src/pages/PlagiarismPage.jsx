import React, { useState, useEffect } from 'react';
import { checkSimilarity, getSimilarityFlags } from '../api/submissions';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { ShieldCheck, AlertTriangle, Sparkles, AlertCircle, RefreshCw, Github } from 'lucide-react';

export function PlagiarismPage() {
  const [flags, setFlags] = useState([]);
  const [threshold, setThreshold] = useState(0.85);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  const loadFlags = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getSimilarityFlags();
      setFlags(res.flagged_pairs || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch similarity flags.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  const handleRunScan = async () => {
    setScanning(true);
    setError('');
    setScanMessage('');
    try {
      const res = await checkSimilarity(threshold);
      setScanMessage(res.message || `Similarity check completed over ${res.total_submissions || 0} submissions.`);
      setFlags(res.flagged_pairs || []);
    } catch (err) {
      setError(err.message || 'Similarity check failed.');
    } finally {
      setScanning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading plagiarism & similarity radar..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organizer / Judge Anti-Plagiarism Tool</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Code Similarity & Plagiarism Radar</h1>
          <p className="text-sm text-slate-500">
            Compare submitted repositories and project descriptions to detect potential code duplication.
          </p>
        </div>

        {/* Scan Actions & Threshold Selector */}
        <div className="flex items-center space-x-3 bg-surface p-2.5 rounded-xl border border-slate-200">
          <div className="flex flex-col text-right">
            <label className="text-[10px] font-bold uppercase text-slate-400">Threshold: {(threshold * 100).toFixed(0)}%</label>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <button
            onClick={handleRunScan}
            disabled={scanning}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Run Similarity Scan'}</span>
          </button>
        </div>
      </div>

      {scanMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Flagged Submission Pairs" value={flags.length} icon={AlertTriangle} color={flags.length > 0 ? 'green' : 'cyan'} />
        <StatCard title="Scan Threshold" value={`${(threshold * 100).toFixed(0)}%`} icon={ShieldCheck} color="cyan" />
        <StatCard title="Status" value={flags.length === 0 ? 'Clean' : 'Review Required'} icon={Sparkles} color="green" />
      </div>

      {/* Flagged Pairs List */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Flagged High-Similarity Pairs</h2>

        {flags.length === 0 ? (
          <EmptyState
            title="No Plagiarism or Duplicate Submissions Flagged"
            description="All scanned project submissions show original codebase structure and descriptions within safety thresholds."
            icon={ShieldCheck}
            actionLabel="Run Fresh Scan"
            onAction={handleRunScan}
          />
        ) : (
          <div className="space-y-4">
            {flags.map((flag, idx) => {
              const pair = flag.pair || [];
              const score = (flag.similarity_score * 100).toFixed(1);

              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Flagged Pair #{idx + 1} — Similarity: {score}%</span>
                    </div>
                    <Badge variant="danger">HIGH SIMILARITY</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pair.map((sub, sIdx) => (
                      <div key={sIdx} className="p-4 bg-surface rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{sub.team_name || `Team ${sIdx + 1}`}</span>
                          {sub.repo_link && (
                            <a href={sub.repo_link} target="_blank" rel="noreferrer" className="text-xs text-primary-600 font-semibold flex items-center space-x-1">
                              <Github className="w-3.5 h-3.5" />
                              <span>View Repo</span>
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{sub.description || 'No description provided'}</p>
                      </div>
                    ))}
                  </div>

                  {flag.reason && (
                    <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl font-medium">
                      <span className="font-bold">Flag Rationale:</span> {flag.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
