import React, { useState, useEffect } from 'react';
import { checkSimilarity, getSimilarityFlags } from '../api/submissions';
import { getAllTeams } from '../api/teams';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Sparkles, ShieldCheck, AlertCircle, FileCode, ShieldAlert } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

export function PlagiarismPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanLoading, setScanLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanResults, setScanResults] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllTeams();
      setTeams(res.teams || []);
    } catch (err) {
      setError(err.message || 'Failed to load teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunScan = async () => {
    setScanLoading(true);
    setError('');
    try {
      const res = await checkSimilarity(0.75);
      setScanResults(res.flagged_pairs || res);
    } catch (err) {
      setError(err.message || 'Plagiarism scan failed.');
    } finally {
      setScanLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading Plagiarism & Similarity Radar..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white">
      {/* Decorative 3D Radar Shield Element */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none hidden lg:block">
        <Page3DCanvas type="shield" />
      </div>

      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-accentCyan text-xs font-semibold rounded-full border border-white/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Organizer Code Integrity Defense</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Plagiarism & Code Similarity Radar</h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Automated submission comparison alerting organizers of duplicate codebase structures and threshold flags.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanLoading}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white text-black font-extrabold text-xs rounded-xl shadow-xl transition-all disabled:opacity-50 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>{scanLoading ? 'Scanning Repositories...' : 'Run Similarity Radar Scan'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Active Submissions Scanned" value={teams.filter((t) => t.submissions?.length > 0).length} icon={FileCode} color="cyan" />
        <StatCard title="Similarity Threshold Alert" value="> 75%" icon={ShieldAlert} color="green" subtext="Automated Organizer Flag" />
        <StatCard title="Scan Engine Status" value="Online" icon={ShieldCheck} color="cyan" subtext="AST & Token Overlap" />
      </div>

      {/* Scan Results Display */}
      {scanResults ? (
        <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-white/10 pb-4 flex items-center justify-between">
            <span>Scan Report & Flagged Pairs</span>
            <Badge variant="success">Scan Complete</Badge>
          </h2>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300">
            {typeof scanResults === 'string' ? scanResults : JSON.stringify(scanResults, null, 2)}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-[28px] border border-white/15 backdrop-blur-2xl text-xs text-slate-400">
          Click 'Run Similarity Radar Scan' above to compare all project submission codebases for overlap flags.
        </div>
      )}
    </div>
  );
}
