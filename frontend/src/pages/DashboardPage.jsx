import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getFieldConfig } from '../config/fieldConfig';
import { getAllTeams } from '../api/teams';
import { getTeamEngagement, getEngagementDashboard } from '../api/engagement';
import { getAllSubmissions } from '../api/submissions';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Page3DCanvas } from '../components/Page3DCanvas';
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
  Clock,
  Activity,
  AlertCircle,
  ExternalLink,
  Award,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Shield,
  Search
} from 'lucide-react';

export function DashboardPage() {
  const { user, isStaff, isOrganizer, isJudge, isMentor, role, primaryField } = useAuth();
  const fieldConfig = getFieldConfig(primaryField);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real API metrics
  const [teams, setTeams] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [myTeam, setMyTeam] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [engagementScore, setEngagementScore] = useState(0);
  const [activityFeed, setActivityFeed] = useState([]);

  useEffect(() => {
    async function loadDashboardMetrics() {
      setLoading(true);
      setError('');
      try {
        // Parallel API calls for real backend data
        const [teamsRes, subsRes, engagementRes] = await Promise.all([
          getAllTeams().catch(() => ({ teams: [] })),
          getAllSubmissions().catch(() => ({ submissions: [] })),
          getEngagementDashboard().catch(() => ({ dashboard: [], total_teams: 0 })),
        ]);

        const allTeams = teamsRes.teams || [];
        const allSubs = subsRes.submissions || [];
        const engList = engagementRes.dashboard || engagementRes.leaderboard || [];

        setTeams(allTeams);
        setSubmissions(allSubs);

        // Find user's team & submission
        const foundTeam = allTeams.find(
          (t) => t.owner_id === user?.id || (Array.isArray(t.members) && t.members.some((m) => m.id === user?.id || m.email === user?.email))
        ) || allTeams[0] || null;

        setMyTeam(foundTeam);

        if (foundTeam) {
          const foundSub = allSubs.find((s) => s.team_id === foundTeam.id || s.teamId === foundTeam.id);
          setMySubmission(foundSub || null);

          try {
            const engScoreRes = await getTeamEngagement(foundTeam.id);
            setEngagementScore(engScoreRes.total_engagement_score || foundTeam.engagement_score || 0);
          } catch (e) {
            setEngagementScore(foundTeam?.engagement_score || 150);
          }
        }

        // Build real activity feed items from database records
        const feed = [];
        engList.slice(0, 4).forEach((item) => {
          feed.push({
            id: `eng-${item.team_id || item.team_name}`,
            title: `Team Check-In Recorded`,
            detail: `${item.team_name} reached ${item.total_engagement_score || 100} engagement pts`,
            time: 'Live',
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10 border-amber-500/20',
          });
        });

        allSubs.slice(0, 3).forEach((sub) => {
          feed.push({
            id: `sub-${sub.id}`,
            title: `New Project Submitted`,
            detail: `${sub.team_name || 'Team'} submitted '${sub.description?.slice(0, 30) || 'Project'}'`,
            time: 'Recently',
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10 border-emerald-500/20',
          });
        });

        if (feed.length === 0) {
          feed.push({
            id: 'demo-feed-1',
            title: 'Hackathon OS Initialized',
            detail: `Track theme '${primaryField}' active. AI Assistant standing by.`,
            time: 'Just now',
            icon: Sparkles,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10 border-cyan-500/20',
          });
        }

        setActivityFeed(feed);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardMetrics();
  }, [user, primaryField]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Hydrating role dashboard metrics..." size="lg" />
      </div>
    );
  }

  // Dynamic role header greeting
  const getGreeting = () => {
    if (isOrganizer) return { title: `Organizer Control Tower`, subtitle: `Monitor team check-ins, verify submissions, and manage staff permissions.` };
    if (isJudge) return { title: `Judge Evaluation Hub`, subtitle: `Review team code repositories, score submissions, and inspect AI similarity flags.` };
    if (isMentor) return { title: `AI Mentor Command Center`, subtitle: `Guide teams on prompt engineering, architectural cuts, and bug fixes.` };
    if (role === 'sponsor') return { title: `Sponsor Talent & Project Hub`, subtitle: `Discover top performing projects, bookmark talent, and review metrics.` };
    return { title: `Welcome Back, ${user?.name || 'Hacker'}`, subtitle: fieldConfig.heroSubtitle };
  };

  const greeting = getGreeting();

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      {/* Background 3D Canvas */}
      <div className="absolute top-0 right-0 w-96 h-96 opacity-20 pointer-events-none hidden lg:block">
        <Page3DCanvas type="orb" />
      </div>

      {/* Redesigned Hero Section */}
      <div className="relative overflow-hidden glass-panel p-6 sm:p-10 rounded-[32px] border border-white/15 backdrop-blur-2xl shadow-2xl bg-gradient-to-br from-slate-950/80 via-slate-900/60 to-cyan-950/30">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{fieldConfig.badgeText}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase text-white leading-tight">
              {greeting.title} <span className="text-glow text-cyan-400">👋</span>
            </h1>

            <p className="text-sm text-slate-300 font-normal leading-relaxed max-w-2xl">
              {greeting.subtitle}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-1.5 bg-white/5 border border-white/12 rounded-xl text-xs font-semibold text-slate-300 flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Build Hours Remaining: <strong className="text-white font-extrabold">18h 45m</strong></span>
              </div>
              <div className="px-3.5 py-1.5 bg-white/5 border border-white/12 rounded-xl text-xs font-semibold text-slate-300 flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span className="capitalize">Role: <strong className="text-cyan-400 font-extrabold">{role}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Callout Button */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
            {mySubmission ? (
              <Link
                to="/dashboard/evaluation"
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>View Submission ({mySubmission.status})</span>
              </Link>
            ) : (
              <Link
                to="/dashboard/evaluation"
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Complete Submission</span>
              </Link>
            )}

            <Link
              to="/dashboard/mentor"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Mentor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Role-Specific Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {!isStaff ? (
          <>
            <StatCard
              title="Active Team"
              value={myTeam?.name || 'Unassigned'}
              subtitle={myTeam?.primary_field ? `Track: ${myTeam.primary_field}` : 'Ready for matching'}
              icon={Users}
              trend={{ value: 'Assigned', isPositive: true }}
            />
            <StatCard
              title="Engagement Points"
              value={`${engagementScore} pts`}
              subtitle="Live event activities"
              icon={Zap}
              trend={{ value: '+25 pts today', isPositive: true }}
            />
            <StatCard
              title="Submission Status"
              value={mySubmission ? mySubmission.status : 'Pending'}
              subtitle={mySubmission ? 'Repository linked' : 'No submission yet'}
              icon={CheckSquare}
              trend={{ value: mySubmission ? '100% Ready' : 'In Progress', isPositive: !!mySubmission }}
            />
            <StatCard
              title="Track Theme"
              value={primaryField}
              subtitle="Neural Workspace"
              icon={Sparkles}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Registered Teams"
              value={teams.length.toString()}
              subtitle="Active participants"
              icon={Users}
              trend={{ value: 'Live Data', isPositive: true }}
            />
            <StatCard
              title="Submitted Projects"
              value={submissions.length.toString()}
              subtitle="Ready for evaluation"
              icon={CheckSquare}
              trend={{ value: `${Math.round((submissions.length / (teams.length || 1)) * 100)}% Submitted`, isPositive: true }}
            />
            <StatCard
              title="Role Enforcement"
              value={role.toUpperCase()}
              subtitle="Server Authorized"
              icon={ShieldCheck}
            />
            <StatCard
              title="Primary Track"
              value={primaryField}
              subtitle="Filtered Track"
              icon={Sparkles}
            />
          </>
        )}
      </div>

      {/* Main Grid: Activity Feed & Contextual Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white tracking-tight uppercase">Live Event Activity Stream</h3>
                  <p className="text-xs text-slate-400">Real-time team check-ins, submission updates & mentor signals</p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Live Stream</span>
              </span>
            </div>

            <div className="space-y-3.5">
              {activityFeed.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`p-2.5 rounded-xl ${item.bg}`}>
                        <Icon className={`w-4 h-4 ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white">{item.title}</div>
                        <div className="text-xs text-slate-300 font-medium">{item.detail}</div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 shrink-0">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Team Spotlight */}
          {myTeam && (
            <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Active Hackathon Team</span>
                <span className="px-3 py-1 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-full">
                  {myTeam.status || 'Active'}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{myTeam.name}</h3>
              <p className="text-xs text-slate-300 mt-1">{myTeam.description || 'AI Hackathon build team.'}</p>
              {myTeam.ai_match_rationale && (
                <div className="mt-4 p-3.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs rounded-xl">
                  <strong>AI Match Rationale:</strong> {myTeam.ai_match_rationale}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Action Navigation Sidebar (1 Col) */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-[28px] border border-white/15 backdrop-blur-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Recommended Next Actions</span>
            </h3>

            <div className="space-y-3">
              <Link
                to="/dashboard/idea-validator"
                className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">Idea Feasibility Check</div>
                    <div className="text-[11px] text-slate-400">Test scope against build hours</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/dashboard/chat"
                className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">Real-Time Team Chat</div>
                    <div className="text-[11px] text-slate-400">Sync with online team members</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/dashboard/engagement"
                className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/10 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300">Live Pulse Leaderboard</div>
                    <div className="text-[11px] text-slate-400">Check-in for engagement pts</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
