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

        // If participant has a team, fetch engagement score
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isStaff ? 'Staff Administration Hub' : 'Participant Dashboard'}
              </span>
              {!isStaff && (
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${fieldConfig.accentBadgeBg}`}>
                  Track: {fieldConfig.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Hacker'} 👋
            </h1>

            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              {isStaff
                ? `You are logged in as an authorized ${role?.toUpperCase()}. Oversee AI team matching, project evaluations, similarity scanning, and live engagement.`
                : fieldConfig.heroSubtitle}
            </p>
          </div>

          {!isStaff && teams.length > 0 && (
            <div className="flex items-center space-x-3 bg-surface p-3.5 rounded-xl border border-slate-200">
              <div className="text-right">
                <div className="text-xs font-semibold text-slate-500">Team Engagement</div>
                <div className="text-xl font-extrabold text-secondary-600">{engagementScore ?? 0} pts</div>
              </div>
              <button
                onClick={() => handleCheckIn(teams[0].id)}
                disabled={checkInLoading}
                className="px-3.5 py-2 bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{checkInLoading ? 'Checking in...' : 'Check-In (+5 pts)'}</span>
              </button>
            </div>
          )}
        </div>

        {checkInMessage && (
          <div className="mt-4 p-2.5 bg-secondary-50 border border-secondary-200 text-secondary-800 text-xs font-semibold rounded-lg">
            {checkInMessage}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STAFF OVERVIEW METRICS */}
      {isStaff ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Teams" value={teams.length} icon={Users} color="cyan" subtext="Formed or self-organized" />
            <StatCard title="Total Submissions" value={teams.filter(t => t.submissions?.length > 0).length} icon={CheckSquare} color="green" subtext="Projects submitted" />
            <StatCard title="Role Scope" value={role?.toUpperCase()} icon={Award} color="cyan" subtext="Authorized access level" />
            <StatCard title="AI Engine" value="Gemini 3.6" icon={Sparkles} color="green" subtext="Active & ready" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/dashboard/team-matching"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                <span>AI Team Formation</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">Match unassigned participants into balanced teams using AI skill analysis.</p>
            </Link>

            <Link
              to="/dashboard/evaluation"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-secondary-600 flex items-center justify-between">
                <span>Project Evaluation Queue</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-secondary-500" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">Run AI evaluation scorecards and enter manual judge scores.</p>
            </Link>

            <Link
              to="/dashboard/plagiarism"
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                <span>Plagiarism & Similarity Radar</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">Scan project submissions for code overlap and similarity flags.</p>
            </Link>
          </div>
        </div>
      ) : (
        /* PARTICIPANT FIELD-ADAPTED OVERVIEW */
        <div className="space-y-8">
          {/* Own Team Details or Empty State */}
          {teams.length === 0 ? (
            <EmptyState
              title={`No Team Assigned (${primaryField} Track)`}
              description={fieldConfig.emptyStateCopy}
              icon={Users}
              actionLabel="Validate Your Project Idea First"
              onAction={() => window.location.href = '/dashboard/idea-validator'}
            />
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Hackathon Team</span>
                  <h3 className="text-xl font-bold text-slate-900">{teams[0].name}</h3>
                </div>
                <Badge variant="success">Assigned</Badge>
              </div>

              {teams[0].match_rationale_text && (
                <div className="p-3 bg-primary-50/60 rounded-xl border border-primary-100 text-xs text-primary-900">
                  <span className="font-bold">AI Match Rationale:</span> {teams[0].match_rationale_text}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Team Members ({teams[0].members?.length || 0})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(teams[0].members || []).map((m) => (
                    <div key={m.id} className="p-3 bg-surface rounded-xl border border-slate-200/70 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                        {m.name?.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-800 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Navigation tailored by Primary Field */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span>Recommended Tools ({primaryField} Track)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/dashboard/mentor"
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                  <span>AI Mentor Chat</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                </h3>
                <p className="mt-1 text-xs text-slate-500">Ask technical questions tailored to your GitHub repository and hackathon rules.</p>
              </Link>

              <Link
                to="/dashboard/idea-validator"
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <FileCode className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 flex items-center justify-between">
                  <span>Idea Validator</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                </h3>
                <p className="mt-1 text-xs text-slate-500">Check feasibility given your remaining build hours & get instant scope cuts.</p>
              </Link>

              <Link
                to="/dashboard/evaluation"
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                  <span>Submit & View Evaluation</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
                </h3>
                <p className="mt-1 text-xs text-slate-500">Submit your GitHub repo and demo video links for judging scorecards.</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
