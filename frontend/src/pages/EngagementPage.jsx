import React, { useState, useEffect } from 'react';
import { getEngagementDashboard, checkInTeam } from '../api/engagement';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { CompetitionInsights } from '../components/CompetitionInsights';
import { HallOfFame } from '../components/HallOfFame';
import { BarChart2, Users, CheckSquare, Zap, Trophy, AlertCircle, RefreshCw, Award, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

import { useAuth } from '../hooks/useAuth';
import { AVAILABLE_FIELDS } from '../config/fieldConfig';

export function EngagementPage() {
  const { primaryField, setPrimaryField } = useAuth();
  const [selectedTrackFilter, setSelectedTrackFilter] = useState(primaryField || 'ALL');
  const [dashboardData, setDashboardData] = useState([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const loadEngagementData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEngagementDashboard();
      const rawData = res.dashboard || res.leaderboard || [];
      setDashboardData(rawData);
      setTotalTeams(res.total_teams || rawData.length);
    } catch (err) {
      setError(err.message || 'Failed to fetch engagement dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagementData();

    // Block 11: Real-time Live Polling for Organizer Engagement Leaderboard
    const pollInterval = setInterval(() => {
      loadEngagementData();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    if (primaryField) {
      setSelectedTrackFilter(primaryField);
    }
  }, [primaryField]);

  const handleAdminCheckIn = async (teamId, teamName) => {
    setActionLoadingId(teamId);
    setActionMessage('');
    try {
      const res = await checkInTeam(teamId);
      setActionMessage(res.message || `Check-in recorded for team '${teamName}'.`);
      await loadEngagementData();
    } catch (err) {
      setError(err.message || 'Check-in failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading Live Engagement Leaderboard & Pulse..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-white">
      {/* Decorative 3D Energy Pulsar Element */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none hidden lg:block">
        <Page3DCanvas type="pulsar" />
      </div>

      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-accentCyan text-xs font-semibold rounded-full border border-white/20 mb-3">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Live Hackathon Operating System</span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
            Live Engagement <span className="text-glow text-accentCyan">Leaderboard</span>
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Real-time activity pulse, AI win probability models, team check-ins, and Hall of Fame champions.
          </p>
        </div>

        <button
          onClick={loadEngagementData}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white text-black font-extrabold text-xs rounded-xl shadow-xl hover:bg-slate-100 transition-all flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4 text-black" />
          <span>Refresh Pulse Data</span>
        </button>
      </div>

      {/* Field / Track Filter Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-2">Filter Track:</span>
        <button
          onClick={() => {
            setSelectedTrackFilter('ALL');
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            selectedTrackFilter === 'ALL'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
          }`}
        >
          All Tracks
        </button>
        {AVAILABLE_FIELDS.map((field) => (
          <button
            key={field.id}
            onClick={() => {
              setSelectedTrackFilter(field.id);
              setPrimaryField(field.id);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedTrackFilter === field.id
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            {field.name}
          </button>
        ))}
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <Zap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* NEW SECTION 1: Live Competition Insights & AI Predictions */}
      <CompetitionInsights />

      {/* NEW SECTION 2: Hall of Fame Champions */}
      <HallOfFame />

      {/* SECTION 3: Live Realtime Team Standings Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Realtime Team Standings</h2>
            <p className="text-xs text-slate-400 font-normal">Sorted by live composite weighted score</p>
          </div>
          <span className="px-3 py-1 bg-white/10 border border-white/20 text-accentCyan text-xs font-bold rounded-full">
            {dashboardData.length} Teams Ranked
          </span>
        </div>

        {dashboardData.length === 0 ? (
          <EmptyState
            title="No Teams Active Yet"
            description="Teams will automatically rank here as they perform check-ins, mentor messages, and submissions."
            icon={BarChart2}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-4">Rank</th>
                  <th className="pb-3 px-4">Trend</th>
                  <th className="pb-3 px-4">Team Name</th>
                  <th className="pb-3 px-4">Check-ins</th>
                  <th className="pb-3 px-4">Chat Activity</th>
                  <th className="pb-3 px-4">Submission Status</th>
                  <th className="pb-3 px-4 text-right">Total Score</th>
                  <th className="pb-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {dashboardData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-4 font-black text-white">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-4 px-4">
                      {idx % 2 === 0 ? (
                        <span className="inline-flex items-center text-emerald-400 text-[10px] font-bold">
                          <ArrowUp className="w-3 h-3 mr-0.5" /> +1
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-slate-400 text-[10px] font-bold">
                          <Minus className="w-3 h-3 mr-0.5" /> 0
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-white group-hover:text-accentCyan transition-colors">{item.name}</td>
                    <td className="py-4 px-4 text-slate-300">{item.check_ins || 0}</td>
                    <td className="py-4 px-4 text-slate-300">{item.chat_messages || 0}</td>
                    <td className="py-4 px-4">
                      {item.has_submitted ? <Badge variant="success">Submitted</Badge> : <Badge variant="warning">In Progress</Badge>}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-accentCyan text-sm">
                      {item.total_score || 0} pts
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleAdminCheckIn(item.id, item.name)}
                        disabled={actionLoadingId === item.id}
                        className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[11px] font-bold rounded-xl transition-all disabled:opacity-50"
                      >
                        {actionLoadingId === item.id ? 'Checking in...' : '+ Record Check-In'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
