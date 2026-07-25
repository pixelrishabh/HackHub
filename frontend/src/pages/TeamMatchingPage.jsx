import React, { useState, useEffect } from 'react';
import { matchTeams, getAllTeams } from '../api/teams';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Sparkles, Users, UserCheck, AlertCircle, Bot } from 'lucide-react';

export function TeamMatchingPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchMessage, setMatchMessage] = useState('');

  const loadTeams = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllTeams();
      setTeams(res.teams || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleTriggerMatch = async () => {
    setMatchingLoading(true);
    setError('');
    setMatchMessage('');

    try {
      const res = await matchTeams();
      setMatchMessage(res.message || 'Team formation completed.');
      await loadTeams();
    } catch (err) {
      setError(err.message || 'Team formation failed.');
    } finally {
      setMatchingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading AI Team Matcher status..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Organizer / Judge Control Panel</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Skill-Based Team Formation</h1>
          <p className="text-sm text-slate-500">
            Form balanced, multi-disciplinary teams automatically using Gemini LLM analysis over unmatched participant profiles.
          </p>
        </div>

        <button
          onClick={handleTriggerMatch}
          disabled={matchingLoading}
          className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>{matchingLoading ? 'Forming Teams with AI...' : 'Form Teams with AI'}</span>
        </button>
      </div>

      {matchMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{matchMessage}</span>
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
        <StatCard title="Total Teams Formed" value={teams.length} icon={Users} color="cyan" />
        <StatCard title="Total Team Members" value={teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)} icon={UserCheck} color="green" />
        <StatCard title="AI Match Engine" value="Gemini AI" icon={Bot} color="cyan" subtext="Balanced by skills & experience" />
      </div>

      {/* Teams Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Active Formed Teams</h2>
        {teams.length === 0 ? (
          <EmptyState
            title="No Teams Formed Yet"
            description="There are currently no active teams. Click 'Form Teams with AI' above to match unassigned registered participants."
            icon={Users}
            actionLabel="Run AI Matchmaker"
            onAction={handleTriggerMatch}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">{team.name}</h3>
                    <Badge variant="info">{team.members?.length || 0} Members</Badge>
                  </div>

                  {team.match_rationale_text && (
                    <div className="mt-3 p-3 bg-surface rounded-xl border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
                      <span className="font-semibold text-slate-800">AI Rationale:</span> {team.match_rationale_text}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Team Roster</div>
                    <div className="space-y-2">
                      {(team.members || []).map((m) => {
                        let skills = [];
                        try {
                          skills = typeof m.profile?.skills === 'string' ? JSON.parse(m.profile.skills) : (m.profile?.skills || []);
                        } catch (e) {}

                        return (
                          <div key={m.id} className="p-3 rounded-xl bg-surface border border-slate-200/60 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                                {m.name?.charAt(0)}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-800">{m.name}</div>
                                <div className="text-[10px] text-slate-400">{m.email}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                              {skills.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-white text-[10px] font-semibold text-slate-600 rounded border border-slate-200">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span>Team ID: {team.id.substring(0, 13)}...</span>
                  <span>Formed: {new Date(team.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
