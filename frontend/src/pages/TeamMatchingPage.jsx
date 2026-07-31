import React, { useState, useEffect } from 'react';
import { matchTeams, getAllTeams } from '../api/teams';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Sparkles, Users, UserCheck, AlertCircle, Bot } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

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
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white">
      {/* Decorative 3D Quantum Element */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none hidden lg:block">
        <Page3DCanvas type="quantum" />
      </div>

      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 text-accentCyan text-xs font-semibold rounded-full border border-white/20 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Organizer / Judge Control Panel</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">AI Skill-Based Team Formation</h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal mt-1 leading-relaxed">
            Form balanced, multi-disciplinary teams automatically using Gemini LLM analysis over unmatched participant profiles.
          </p>
        </div>

        <button
          onClick={handleTriggerMatch}
          disabled={matchingLoading}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white text-black font-extrabold text-xs rounded-xl shadow-xl transition-all disabled:opacity-50 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>{matchingLoading ? 'Forming Teams with AI...' : 'Form Teams with AI'}</span>
        </button>
      </div>

      {matchMessage && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{matchMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Total Teams Formed" value={teams.length} icon={Users} color="cyan" />
        <StatCard title="Total Team Members" value={teams.reduce((acc, t) => acc + (t.members?.length || 0), 0)} icon={UserCheck} color="green" />
        <StatCard title="AI Match Engine" value="Gemini AI" icon={Bot} color="cyan" subtext="Balanced by skills & experience" />
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <EmptyState
          title="No Teams Formed Yet"
          description="Click 'Form Teams with AI' to trigger the automated skill matching engine for all unassigned participants."
          icon={Users}
          actionLabel="Run AI Team Matcher"
          onAction={handleTriggerMatch}
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>All Active Teams ({teams.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => (
              <div
                key={team.id}
                className="glass-panel glass-panel-hover p-6 sm:p-8 rounded-[28px] border border-white/12 space-y-4 backdrop-blur-2xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{team.name}</h3>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        {team.field || 'General Track'}
                      </span>
                    </div>
                    <Badge variant="primary">{team.members?.length || 0} Members</Badge>
                  </div>

                  {team.match_rationale_text && (
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed mb-4">
                      <span className="font-bold text-white">AI Rationale:</span> {team.match_rationale_text}
                    </div>
                  )}

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Members & Skill Matrix</h4>
                    <div className="space-y-2">
                      {(team.members || []).map((m) => (
                        <div key={m.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 text-white font-bold flex items-center justify-center text-xs">
                              {m.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{m.name}</div>
                              <div className="text-[10px] text-slate-400">{m.experience_level || 'Participant'}</div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[150px] justify-end">
                            {(m.skills || []).slice(0, 3).map((s) => (
                              <span key={s} className="px-2 py-0.5 bg-white/10 border border-white/15 text-[9px] text-slate-300 rounded-md">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
