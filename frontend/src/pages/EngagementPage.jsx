import React, { useState, useEffect } from 'react';
import { getEngagementDashboard, checkInTeam } from '../api/engagement';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { BarChart2, Users, CheckSquare, Zap, Trophy, AlertCircle, RefreshCw } from 'lucide-react';

export function EngagementPage() {
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
      setDashboardData(res.dashboard || []);
      setTotalTeams(res.total_teams || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch engagement dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEngagementData();
  }, []);

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

  const activeTeamsCount = dashboardData.filter((t) => t.total_score > 0).length;
  const submissionsCount = dashboardData.filter((t) => t.has_submitted).length;
  const avgScore =
    dashboardData.length > 0
      ? (dashboardData.reduce((acc, t) => acc + t.total_score, 0) / dashboardData.length).toFixed(1)
      : '0.0';

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading live engagement leaderboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200 mb-2">
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Staff Engagement Monitoring</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Live Hackathon Engagement Dashboard</h1>
          <p className="text-sm text-slate-500">
            Real-time activity points weighted by check-ins (+5), mentor chat messages (+2), and submission updates (+10).
          </p>
        </div>

        <button
          onClick={loadEngagementData}
          className="px-4 py-2 bg-surface hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5 self-start md:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Leaderboard</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <Zap className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Registered Teams" value={totalTeams} icon={Users} color="cyan" />
        <StatCard title="Active Now" value={activeTeamsCount} icon={Zap} color="green" subtext="Teams with logged events" />
        <StatCard title="Submissions In" value={submissionsCount} icon={CheckSquare} color="cyan" />
        <StatCard title="Avg Engagement" value={`${avgScore} pts`} icon={BarChart2} color="green" />
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Hackathon Leaderboard</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Sorted by Total Weighted Points</span>
        </div>

        {dashboardData.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Teams Active Yet"
              description="Zero teams found. Teams will automatically rank here as they perform check-ins, mentor messages, and submissions."
              icon={BarChart2}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface text-slate-500 font-semibold text-xs border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">Team Name</th>
                  <th className="px-6 py-3">Check-Ins</th>
                  <th className="px-6 py-3">Chat Activity</th>
                  <th className="px-6 py-3">Submission</th>
                  <th className="px-6 py-3 text-right">Total Score</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dashboardData.map((team, idx) => (
                  <tr key={team.team_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {idx === 0 ? (
                        <span className="text-amber-500 font-extrabold flex items-center space-x-1">
                          <span>🥇 #1</span>
                        </span>
                      ) : idx === 1 ? (
                        <span className="text-slate-400 font-bold">🥈 #2</span>
                      ) : idx === 2 ? (
                        <span className="text-amber-700 font-bold">🥉 #3</span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>

                    <td className="px-6 py-4 font-bold text-slate-900">{team.team_name}</td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {team.events_breakdown?.check_in || 0} check-ins
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {team.events_breakdown?.chat_message || 0} msgs
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={team.has_submitted ? 'success' : 'neutral'}>
                        {team.submission_status || (team.has_submitted ? 'SUBMITTED' : 'NOT SUBMITTED')}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-right text-base font-extrabold text-secondary-600">
                      {team.total_score} pts
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleAdminCheckIn(team.team_id, team.team_name)}
                        disabled={actionLoadingId === team.team_id}
                        className="px-3 py-1.5 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-lg border border-secondary-200 transition-colors disabled:opacity-50"
                      >
                        {actionLoadingId === team.team_id ? 'Recording...' : '+ Check-In'}
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
