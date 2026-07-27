import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFieldConfig } from '../config/fieldConfig';
import { getAllTeams } from '../api/teams';
import { getTeamEngagement } from '../api/engagement';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import {
  Sparkles, Users, Bot, CheckSquare, FileCode, ShieldCheck,
  BarChart2, ArrowRight, User, Flame, Award, AlertCircle, PlusCircle
} from 'lucide-react';

export function DashboardPage() {
  const { user, isStaff, role, primaryField } = useAuth();
  const fieldConfig = getFieldConfig(primaryField);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [engagementScore, setEngagementScore] = useState(null);

  // Single-source check-in statistics from user profile
  const profile = user?.profile || {};
  const totalCheckIns = profile.check_in_count || 0;
  const currentStreak = profile.check_in_streak || 0;

  let unlockedBadgesCount = 0;
  try {
    const badgesArr = typeof profile.badges === 'string' ? JSON.parse(profile.badges || '[]') : (profile.badges || []);
    unlockedBadgesCount = badgesArr.length;
  } catch (e) {
    unlockedBadgesCount = 0;
  }

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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Loading workspace dashboard..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {isStaff ? 'Staff Administration Hub' : 'Participant Workspace'}
              </span>
              {!isStaff && (
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${fieldConfig.accentBadgeBg}`}>
                  Track: {fieldConfig.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, {user?.name || 'Hacker'} 👋
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
              {isStaff
                ? `Logged in as authorized ${role?.toUpperCase()}. Manage AI team matchmaking, evaluations, similarity scanning, and engagement.`
                : fieldConfig.heroSubtitle}
            </p>
          </div>

          {!isStaff && (
            <div className="flex items-center space-x-4 bg-surface p-4 rounded-2xl border border-slate-200/80">
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team Activity</span>
                <span className="text-xl font-black text-emerald-600">{engagementScore ?? 0} pts</span>
              </div>
              <Link
                to="/profile"
                className="px-3.5 py-2 bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold rounded-xl border border-primary-200 transition-colors flex items-center space-x-1.5"
                title="View Profile Check-in & Streak"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-semibold flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STAFF DASHBOARD */}
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
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
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
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 flex items-center justify-between">
                <span>Project Evaluation Queue</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">Run AI evaluation scorecards and enter manual judge scores.</p>
            </Link>

            <Link
              to="/dashboard/plagiarism"
              className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 flex items-center justify-between">
                <span>Plagiarism Radar</span>
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary-500" />
              </h3>
              <p className="mt-1 text-xs text-slate-500">Scan project submissions for code overlap and similarity flags.</p>
            </Link>
          </div>
        </div>
      ) : (
        /* PARTICIPANT DASHBOARD */
        <div className="space-y-8">
          
          {/* Top Metric Cards (Personal Check-ins & Streak read from Profile) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-tight">{totalCheckIns}</span>
                <span className="text-xs text-slate-500 font-semibold">Total Daily Check-ins</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-tight">{currentStreak} Days</span>
                <span className="text-xs text-slate-500 font-semibold">Current Active Streak</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 block leading-tight">{unlockedBadgesCount}</span>
                <span className="text-xs text-slate-500 font-semibold">Badges Unlocked</span>
              </div>
            </div>
          </div>

          {/* Active Team Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team Status</span>
                <h3 className="text-xl font-bold text-slate-900">
                  {teams.length > 0 ? teams[0].name : 'No Active Team'}
                </h3>
              </div>
              {teams.length > 0 ? (
                <Badge variant="success">Assigned</Badge>
              ) : (
                <Badge variant="warning">Unassigned</Badge>
              )}
            </div>

            {teams.length === 0 ? (
              <div className="p-6 bg-surface rounded-2xl border border-slate-200/60 text-center space-y-4">
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You are not currently in a hackathon team. Browse open recruitment teams or create a new team to get started!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/teams/browse"
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Browse Open Teams
                  </Link>
                  <Link
                    to="/teams/create"
                    className="px-4 py-2 bg-primary-500 text-white text-xs font-bold rounded-xl"
                  >
                    Create New Team
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Team Members ({teams[0].members?.length || (teams[0].member_ids || []).length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(teams[0].members || []).map((m) => (
                    <div key={m.id} className="p-3 bg-surface rounded-2xl border border-slate-200/70 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs border border-primary-200">
                        {m.name ? m.name.charAt(0) : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-slate-800 truncate">{m.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Tools Grid */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <span>Recommended Tools ({primaryField} Track)</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/dashboard/mentor"
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
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
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
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
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
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
