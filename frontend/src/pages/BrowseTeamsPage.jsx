import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Filter, Sparkles, UserCheck, Clock, 
  CheckCircle2, AlertCircle, PlusCircle, ArrowRight, Shield, Code, ChevronRight
} from 'lucide-react';
import { browseTeams, createJoinRequest, getTeamCompatibility } from '../api/teams';
import { useAuth } from '../hooks/useAuth';
import { Badge } from '../components/Badge';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function BrowseTeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filters
  const [category, setCategory] = useState('All');
  const [skillSearch, setSkillSearch] = useState('');
  const [techSearch, setTechSearch] = useState('');

  // AI Compatibility scores cache
  const [compatMap, setCompatMap] = useState({});
  const [compatLoadingMap, setCompatLoadingMap] = useState({});
  const [selectedCompModal, setSelectedCompModal] = useState(null);

  // Requesting status
  const [requestingMap, setRequestingMap] = useState({});

  const categories = ['All', 'Web Dev', 'AI/ML', 'Fintech', 'Cybersecurity', 'Healthcare', 'Mobile Dev', 'General'];

  const fetchTeams = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category !== 'All') params.category = category;
      if (skillSearch.trim()) params.skills = skillSearch.trim();
      if (techSearch.trim()) params.tech_stack = techSearch.trim();

      const res = await browseTeams(params);
      setTeams(res.teams || []);
    } catch (err) {
      setError(err.message || 'Failed to load browsable teams.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTeams();
  };

  // Fetch AI compatibility for a team
  const fetchCompatibility = async (teamId) => {
    if (compatMap[teamId] || compatLoadingMap[teamId]) return;
    setCompatLoadingMap(prev => ({ ...prev, [teamId]: true }));
    try {
      const res = await getTeamCompatibility(teamId);
      if (res.compatibility) {
        setCompatMap(prev => ({ ...prev, [teamId]: res.compatibility }));
      }
    } catch (err) {
      console.warn('Failed to load compatibility:', err);
    } finally {
      setCompatLoadingMap(prev => ({ ...prev, [teamId]: false }));
    }
  };

  // Handle Join Request submission
  const handleJoinRequest = async (teamId) => {
    setRequestingMap(prev => ({ ...prev, [teamId]: true }));
    setError('');
    setSuccessMsg('');

    try {
      await createJoinRequest(teamId);
      setSuccessMsg('Join request submitted successfully! The team leader will review your profile.');
      fetchTeams();
    } catch (err) {
      setError(err.message || 'Failed to submit join request.');
    } finally {
      setRequestingMap(prev => ({ ...prev, [teamId]: false }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary-500/20 text-primary-300 text-xs font-semibold rounded-full border border-primary-500/30 mb-3">
            <Users className="w-3.5 h-3.5" />
            <span>Open Recruitment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Browse Hackathon Teams</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Find open teams looking for your skill set. Check AI compatibility scores and request to join!
          </p>
        </div>

        <Link
          to="/teams/create"
          className="px-5 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary-500/20 transition-all flex items-center space-x-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Team</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Required Skill</label>
            <input
              type="text"
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              placeholder="e.g. React, Python"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Search Tech Stack</label>
            <input
              type="text"
              value={techSearch}
              onChange={(e) => setTechSearch(e.target.value)}
              placeholder="e.g. Node, PyTorch"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Search Teams</span>
            </button>
          </div>

        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-2xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center">
          <LoadingSpinner label="Loading open hackathon teams..." size="lg" />
        </div>
      ) : teams.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Open Teams Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            There are currently no open teams matching your filter parameters. Be the first to create one!
          </p>
          <Link
            to="/teams/create"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-500 text-white text-xs font-bold rounded-xl"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create a Team</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => {
            const currentCount = team.current_member_count || (team.member_ids || []).length;
            const maxMembers = team.max_members || 4;
            const availableSlots = team.available_slots ?? Math.max(0, maxMembers - currentCount);
            const isUserInTeam = (team.member_ids || []).includes(user?.id);
            const compat = compatMap[team.id];

            return (
              <div 
                key={team.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Top Row: Category & Capacity */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                      {team.category || 'General'}
                    </span>

                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center space-x-1 ${
                      availableSlots === 1 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      <Users className="w-3 h-3" />
                      <span>{currentCount}/{maxMembers} Members</span>
                    </span>
                  </div>

                  {/* Team Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{team.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {team.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Leader Info */}
                  <div className="text-xs text-slate-600 flex items-center space-x-2 pt-1 border-t border-slate-100">
                    <Shield className="w-3.5 h-3.5 text-primary-500" />
                    <span>Leader: <strong className="text-slate-900">{team.leader_name}</strong></span>
                  </div>

                  {/* Required Skills & Tech Stack */}
                  <div className="space-y-2 text-xs">
                    {team.required_skills && team.required_skills.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px] mb-1">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {team.required_skills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[11px] font-medium rounded-md border border-primary-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {team.tech_stack && team.tech_stack.length > 0 && (
                      <div>
                        <span className="text-slate-400 font-semibold block text-[11px] mb-1">Tech Stack:</span>
                        <div className="flex flex-wrap gap-1">
                          {team.tech_stack.map((t, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Compatibility Badge */}
                  <div className="pt-2">
                    {compat ? (
                      <button
                        onClick={() => setSelectedCompModal({ teamName: team.name, compat })}
                        className="w-full p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs hover:border-emerald-300 transition-colors"
                      >
                        <span className="flex items-center space-x-1.5 font-bold text-emerald-800">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>AI Compatibility Match:</span>
                        </span>
                        <span className="font-extrabold text-emerald-700 text-sm">{compat.compatibility_percent}%</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => fetchCompatibility(team.id)}
                        disabled={compatLoadingMap[team.id]}
                        className="w-full py-2 px-3 bg-surface border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary-500" />
                        <span>{compatLoadingMap[team.id] ? 'Calculating Match...' : 'Check AI Compatibility'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-3 border-t border-slate-100">
                  {isUserInTeam ? (
                    <div className="w-full py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl text-center border border-emerald-200 flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>You are a Member</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoinRequest(team.id)}
                      disabled={requestingMap[team.id]}
                      className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{requestingMap[team.id] ? 'Submitting Request...' : 'Request to Join'}</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* AI Compatibility Modal */}
      {selectedCompModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                <span>AI Compatibility Report</span>
              </h3>
              <button 
                onClick={() => setSelectedCompModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-3xl font-black text-emerald-600 block">
                {selectedCompModal.compat.compatibility_percent}% Match
              </span>
              <span className="text-xs text-slate-500 font-medium">for team "{selectedCompModal.teamName}"</span>
            </div>

            <div className="p-3.5 bg-surface rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <p className="italic">"{selectedCompModal.compat.ai_explanation}"</p>
            </div>

            {selectedCompModal.compat.matching_skills?.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">Matching Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCompModal.compat.matching_skills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedCompModal(null)}
              className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl mt-2"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
