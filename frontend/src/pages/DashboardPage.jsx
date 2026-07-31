import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFieldConfig } from '../config/fieldConfig';
import { getAllTeams } from '../api/teams';
import { checkInTeam, getTeamEngagement } from '../api/engagement';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import {
  Sparkles,
  Users,
  Bot,
  CheckSquare,
  FileCode,
  ShieldCheck,
  BarChart2,
  ArrowRight,
  User,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award
} from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

export function DashboardPage() {
  const { user, isStaff, isOrganizer, role, primaryField } = useAuth();
  const fieldConfig = getFieldConfig(primaryField);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState('');
  const [engagementScore, setEngagementScore] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      setError('');
      try {
        const res = await getAllTeams();
        const userTeams = res.teams || [];
        setTeams(userTeams);

        if (userTeams.length > 0) {
          try {
            const engRes = await getTeamEngagement(userTeams[0].id);
            setEngagementScore(engRes.total_engagement_score || 0);
          } catch (e) {
            console.warn('Could not fetch engagement score:', e);
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const handleCheckIn = async (teamId) => {
    setCheckInLoading(true);
    setCheckInMessage('');
    try {
      const res = await checkInTeam(teamId);
      setCheckInMessage(res.message || 'Check-in successful! (+5 pts)');
      const updatedEng = await getTeamEngagement(teamId);
      setEngagementScore(updatedEng.total_engagement_score || 0);
    } catch (err) {
      setCheckInMessage(err.message || 'Check-in failed.');
    } finally {
      setCheckInLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading workspace dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white">
      {/* 3D Background Decorative Element */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-25 pointer-events-none hidden lg:block">
        <Page3DCanvas type="orb" />
      </div>

      {/* Header Banner */}
      <div className="glass-panel rounded-[28px] p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {isStaff ? 'Staff Administration Hub' : 'Participant Dashboard'}
              </span>
              {!isStaff && (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 border border-white/20 text-accentCyan">
                  Track: {fieldConfig.name}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase">
              Welcome back, <span className="text-glow">{user?.name || 'Hacker'}</span> 👋
            </h1>

            <p className="mt-2 text-sm text-slate-300 max-w-2xl font-normal">
              {isStaff
                ? `You are logged in as an authorized ${role?.toUpperCase()}. Oversee AI team matching, project evaluations, similarity scanning, and live engagement.`
                : fieldConfig.heroSubtitle}
            </p>
          </div>

          {!isStaff && teams.length > 0 && (
            <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-400">Team Engagement</div>
                <div className="text-2xl font-black text-accentCyan">{engagementScore ?? 0} pts</div>
              </div>
              <button
                onClick={() => handleCheckIn(teams[0].id)}
                disabled={checkInLoading}
                className="px-4 py-2.5 bg-white text-black hover:bg-slate-100 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 text-black" />
                <span>{checkInLoading ? 'Checking in...' : 'Check-In (+5 pts)'}</span>
              </button>
            </div>
          )}
        </div>

        {checkInMessage && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl">
            {checkInMessage}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-300 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STAFF OVERVIEW METRICS */}
      {isStaff ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Active Teams" value={teams.length} icon={Users} color="cyan" subtext="Formed or self-organized" />
            <StatCard title="Total Submissions" value={teams.filter(t => t.submissions?.length > 0).length} icon={CheckSquare} color="green" subtext="Projects submitted" />
            <StatCard title="Role Scope" value={role?.toUpperCase()} icon={Award} color="cyan" subtext="Authorized access level" />
            <StatCard title="AI Engine" value="Gemini 3.6" icon={Sparkles} color="green" subtext="Active & ready" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/dashboard/team-matching"
              className="glass-panel glass-panel-hover p-6 rounded-[24px] border border-white/12 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-accentCyan" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-accentCyan flex items-center justify-between transition-colors">
                  <span>AI Team Formation</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accentCyan" />
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">Match unassigned participants into balanced teams using AI skill analysis.</p>
              </div>
            </Link>

            <Link
              to="/dashboard/evaluation"
              className="glass-panel glass-panel-hover p-6 rounded-[24px] border border-white/12 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <CheckSquare className="w-6 h-6 text-accentCyan" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-accentCyan flex items-center justify-between transition-colors">
                  <span>Project Evaluation Queue</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accentCyan" />
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">Run AI evaluation scorecards and enter manual judge scores.</p>
              </div>
            </Link>

            <Link
              to="/dashboard/plagiarism"
              className="glass-panel glass-panel-hover p-6 rounded-[24px] border border-white/12 flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-accentCyan" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-accentCyan flex items-center justify-between transition-colors">
                  <span>Plagiarism & Similarity Radar</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accentCyan" />
                </h3>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">Scan project submissions for code overlap and similarity flags.</p>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        /* PARTICIPANT OVERVIEW */
        <div className="space-y-8">
          {teams.length === 0 ? (
            <EmptyState
              title={`No Team Assigned (${primaryField} Track)`}
              description={fieldConfig.emptyStateCopy}
              icon={Users}
              actionLabel="Validate Your Project Idea First"
              onAction={() => window.location.href = '/dashboard/idea-validator'}
            />
          ) : (
            <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/12 space-y-5 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Active Hackathon Team</span>
                  <h3 className="text-2xl font-bold text-white">{teams[0].name}</h3>
                </div>
                <Badge variant="success">Assigned</Badge>
              </div>

              {teams[0].match_rationale_text && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 leading-relaxed">
                  <span className="font-bold text-white">AI Match Rationale:</span> {teams[0].match_rationale_text}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Team Members ({teams[0].members?.length || 0})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(teams[0].members || []).map((m) => (
                    <div key={m.id} className="p-3.5 bg-white/5 rounded-2xl border border-white/10 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 text-white font-bold flex items-center justify-center text-xs">
                        {m.name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Navigation */}
          <div>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-accentCyan" />
              <span>Recommended Tools ({primaryField} Track)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/dashboard/mentor"
                className="glass-panel glass-panel-hover p-6 rounded-[24px] border border-white/12 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Bot className="w-6 h-6 text-accentCyan" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-accentCyan flex items-center justify-between transition-colors">
                    <span>AI Mentor Chat</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accentCyan" />
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">Ask technical questions tailored to your GitHub repository and hackathon rules.</p>
                </div>
              </Link>

              <Link
                to="/dashboard/idea-validator"
                className="glass-panel glass-panel-hover p-6 rounded-[24px] border border-white/12 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileCode className="w-6 h-6 text-accentCyan" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-accentCyan flex items-center justify-between transition-colors">
                    <span>Idea Validator</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accentCyan" />
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">Check feasibility given your remaining build hours & get instant scope cuts.</p>
                </div>
              </Link>

              <Link
                to="/dashboard/evaluation"
                className="glass-panel glass-panel-hover p-6 rounded-[24px] border border-white/12 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <CheckSquare className="w-6 h-6 text-accentCyan" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-accentCyan flex items-center justify-between transition-colors">
                    <span>Submit & View Evaluation</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-accentCyan" />
                  </h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed font-normal">Submit your GitHub repo and demo video links for judging scorecards.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
