import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Shield, CheckCircle2, XCircle, LogOut, Sparkles, 
  Clock, PlusCircle, AlertCircle, Award, FileCode, ChevronRight, User, AlertTriangle, UserPlus, Search
} from 'lucide-react';
import { getAllTeams, getTeamDashboardDetailed, acceptJoinRequest, rejectJoinRequest, leaveTeam, addTeamMember } from '../api/teams';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function MyTeamPage() {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState(null);

  // Direct Add Member state
  const [addMemberQuery, setAddMemberQuery] = useState('');
  const [addMemberLoading, setAddMemberLoading] = useState(false);

  // Leave team modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const fetchMyTeam = async () => {
    setLoading(true);
    setError('');
    try {
      // Get all teams scoped to current user
      const res = await getAllTeams();
      const userTeams = res.teams || [];
      if (userTeams.length > 0) {
        // Fetch detailed dashboard for first team
        const detailedRes = await getTeamDashboardDetailed(userTeams[0].id);
        if (detailedRes.team) {
          setTeam(detailedRes.team);
        } else {
          setTeam(userTeams[0]);
        }
      } else {
        setTeam(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load your team details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTeam();
  }, []);

  // Handle Accept Join Request
  const handleAccept = async (requestId) => {
    if (!team) return;
    setActionMsg(null);
    try {
      const res = await acceptJoinRequest(team.id, requestId);
      setActionMsg({ type: 'success', text: res.message || 'Join request accepted!' });
      fetchMyTeam();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to accept request.' });
    }
  };

  // Handle Reject Join Request
  const handleReject = async (requestId) => {
    if (!team) return;
    setActionMsg(null);
    try {
      const res = await rejectJoinRequest(team.id, requestId);
      setActionMsg({ type: 'success', text: res.message || 'Join request rejected.' });
      fetchMyTeam();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to reject request.' });
    }
  };

  // Handle Leave Team
  const handleLeaveTeam = async () => {
    if (!team) return;
    setLeaveLoading(true);
    setActionMsg(null);
    try {
      await leaveTeam(team.id);
      setShowLeaveModal(false);
      setTeam(null);
      setActionMsg({ type: 'success', text: 'You have left the team.' });
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to leave team.' });
      setShowLeaveModal(false);
    } finally {
      setLeaveLoading(false);
    }
  };

  // Handle Direct Add Member (Leader Only)
  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    if (!team || !addMemberQuery.trim()) return;
    setAddMemberLoading(true);
    setActionMsg(null);

    try {
      const res = await addTeamMember(team.id, addMemberQuery.trim());
      setActionMsg({ type: 'success', text: res.message || 'Member added directly to team!' });
      setAddMemberQuery('');
      fetchMyTeam();
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to add member directly.' });
    } finally {
      setAddMemberLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <LoadingSpinner label="Loading your team dashboard..." size="lg" />
      </div>
    );
  }

  // State: No team found
  if (!team) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        {actionMsg && (
          <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center space-x-2 ${
            actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{actionMsg.text}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">You Are Not in a Team</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Join an open team looking for your skills or create a new team to lead your project!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/teams/browse"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl transition-colors flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Browse Open Teams</span>
            </Link>

            <Link
              to="/teams/create"
              className="w-full sm:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm rounded-2xl shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Team</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const memberIds = team.member_ids || [];
  const maxMembers = team.max_members || 4;
  const isLeader = team.is_current_user_leader || team.leader_id === user?.id || memberIds[0] === user?.id;
  const pendingRequests = team.joinRequests || [];

  let reqSkills = [];
  try { reqSkills = typeof team.required_skills === 'string' ? JSON.parse(team.required_skills || '[]') : (team.required_skills || []); } catch (e) {}

  let techStack = [];
  try { techStack = typeof team.tech_stack === 'string' ? JSON.parse(team.tech_stack || '[]') : (team.tech_stack || []); } catch (e) {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Action Notification */}
      {actionMsg && (
        <div className={`p-4 rounded-2xl text-sm font-semibold flex items-center space-x-2 ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-500/30 text-xs font-bold rounded-full">
                {team.category || 'General'}
              </span>
              {isLeader && (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-full flex items-center space-x-1">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span>Team Leader</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{team.name}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {team.description || 'No description provided for this team.'}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {reqSkills.map((s, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-white/10 text-white text-xs font-medium rounded-lg border border-white/10">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Member Capacity & Leave button */}
          <div className="flex flex-col items-end space-y-4 flex-shrink-0 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-right w-full sm:w-auto">
              <span className="text-2xl font-black block leading-tight text-white">
                {memberIds.length} / {maxMembers} <span className="text-xs font-normal text-slate-300">Members</span>
              </span>
              <span className="text-xs text-emerald-400 font-semibold">
                {memberIds.length >= maxMembers ? 'Team Full' : `${maxMembers - memberIds.length} Slot(s) Available`}
              </span>
            </div>

            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Team</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1 & 2: Pending Requests & Team Roster */}
        <div className="lg:col-span-2 space-y-6">

          {/* Leader Direct Add Member Card */}
          {isLeader && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-primary-500" />
                  <span>Direct Add Team Member</span>
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">
                  Leader Action
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Directly add a participant to your team by entering their registered email address or username.
              </p>

              <form onSubmit={handleAddMemberSubmit} className="flex flex-col sm:flex-row gap-3 pt-1">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={addMemberQuery}
                    onChange={(e) => setAddMemberQuery(e.target.value)}
                    placeholder="Enter email or username (e.g. alex@gmail.com)"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none bg-surface/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addMemberLoading || !addMemberQuery.trim()}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 flex-shrink-0"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{addMemberLoading ? 'Adding Member...' : 'Add Member'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Pending Requests Section (Leader Only) */}
          {isLeader && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-primary-500" />
                  <span>Pending Join Requests</span>
                </h3>
                <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-full">
                  {pendingRequests.length} Pending
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No pending join requests at the moment. Participants browsing teams can request to join.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div 
                      key={req.id}
                      className="p-4 bg-surface rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-slate-900">{req.user?.name || 'Applicant'}</span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">
                            {req.user?.profile?.experience_level || 'Intermediate'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{req.user?.email}</p>
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="flex-1 sm:flex-initial px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="flex-1 sm:flex-initial px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Team Roster Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Users className="w-5 h-5 text-emerald-500" />
              <span>Team Member Roster</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(team.members || []).map((m) => (
                <div key={m.id} className="p-4 bg-surface rounded-2xl border border-slate-200/80 flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm border border-primary-200">
                    {m.name ? m.name.charAt(0) : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm font-bold text-slate-900 truncate">{m.name}</span>
                      {(m.is_leader || m.id === team.leader_id) && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md flex-shrink-0">
                          Leader
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 block truncate">{m.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column 3: Submissions & Activity */}
        <div className="space-y-6">
          
          {/* Submissions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileCode className="w-5 h-5 text-primary-500" />
              <span>Team Submission</span>
            </h3>

            {(team.submissions || []).length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500 text-center space-y-2">
                <p>No project submission logged for this team yet.</p>
                <Link to="/dashboard/evaluation" className="inline-block text-primary-600 font-bold hover:underline">
                  Go to Submissions →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {team.submissions.map((s) => (
                  <div key={s.id} className="p-3.5 bg-surface rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800 block truncate">Repo: {s.repo_link}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md inline-block">
                      Status: {s.status || 'SUBMITTED'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Engagement Activity */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Engagement Activity</span>
            </h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(team.engagementEvents || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No activity logged yet.</p>
              ) : (
                team.engagementEvents.map((ev) => (
                  <div key={ev.id} className="p-2.5 bg-surface rounded-xl text-xs flex items-center justify-between border border-slate-100">
                    <span className="font-medium text-slate-700 capitalize">{ev.event_type.replace('_', ' ')}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Leave Team Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Leave Team?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to leave "{team.name}"? You can join or create another team afterwards.
            </p>
            
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => setShowLeaveModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLeaveTeam}
                disabled={leaveLoading}
                className="flex-1 py-2.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-md"
              >
                {leaveLoading ? 'Leaving...' : 'Confirm Leave'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
