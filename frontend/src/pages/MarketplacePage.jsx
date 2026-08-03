import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Calendar,
  MapPin,
  Trophy,
  Users,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
  Clock,
  Shield,
  Zap,
  Globe,
  Award,
} from 'lucide-react';
import { getHackathons, getHackathonById, registerUserForHackathon } from '../api/hackathons';
import { useAuth } from '../hooks/useAuth';

const FIELD_CATEGORIES = ['All', 'AI/ML', 'Web3', 'FinTech', 'Data Science', 'CyberSecurity'];

export function MarketplacePage() {
  const { user } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [trackFilter, setTrackFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Hackathon Modal
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    fetchHackathons();
  }, [statusFilter, trackFilter]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getHackathons({
        status: statusFilter,
        track: trackFilter,
        search: searchQuery,
      });
      if (res.success) {
        setHackathons(res.hackathons || []);
      }
    } catch (err) {
      console.error('Failed to load hackathons:', err);
      setError(err.message || 'Failed to fetch hackathons.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHackathons();
  };

  const handleOpenDetail = async (id) => {
    try {
      setModalLoading(true);
      setActionMessage(null);
      const res = await getHackathonById(id);
      if (res.success) {
        setSelectedHackathon(res.hackathon);
      }
    } catch (err) {
      console.error('Failed to load hackathon details:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRegisterToggle = async (hackathonId) => {
    try {
      setActionLoading(true);
      setActionMessage(null);
      const res = await registerUserForHackathon(hackathonId);
      if (res.success) {
        setActionMessage(res.message);
        // Refresh local list
        setHackathons((prev) =>
          prev.map((h) => {
            if (h.id === hackathonId || h._id === hackathonId) {
              const currentRegs = h.registeredUserIds || [];
              const isCurrentlyReg = currentRegs.some((uid) => uid === user?.id || uid?._id === user?.id);
              const updatedRegs = isCurrentlyReg
                ? currentRegs.filter((uid) => uid !== user?.id && uid?._id !== user?.id)
                : [...currentRegs, user?.id];
              return { ...h, registeredUserIds: updatedRegs };
            }
            return h;
          })
        );
        if (selectedHackathon && (selectedHackathon.id === hackathonId || selectedHackathon._id === hackathonId)) {
          const isCurrentlyReg = (selectedHackathon.registeredUserIds || []).some(
            (uid) => uid === user?.id || uid?._id === user?.id
          );
          const updatedRegs = isCurrentlyReg
            ? (selectedHackathon.registeredUserIds || []).filter((uid) => uid !== user?.id && uid?._id !== user?.id)
            : [...(selectedHackathon.registeredUserIds || []), user?.id];
          setSelectedHackathon({ ...selectedHackathon, registeredUserIds: updatedRegs });
        }
      }
    } catch (err) {
      console.error('Registration toggle error:', err);
      setActionMessage(err.message || 'Registration failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const isUserRegistered = (h) => {
    if (!user || !h?.registeredUserIds) return false;
    return h.registeredUserIds.some((uid) => uid === user.id || uid?._id === user.id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Live':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LIVE NOW
          </span>
        );
      case 'Upcoming':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            UPCOMING
          </span>
        );
      case 'Ended':
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-zinc-700/50 text-zinc-400 border border-zinc-600/30 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" />
            ENDED
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-cyan-950/40 via-zinc-900/60 to-purple-950/40 border border-cyan-500/20 p-8 lg:p-12 overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,229,255,0.12),transparent_50%)]" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-medium tracking-wide">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            DEVFOLIO & UNSTOP STYLE MARKETPLACE
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            Hackathon Marketplace
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
            Discover, register, and compete in world-class AI, Web3, FinTech, and Data Science hackathons. Filter live sprints or view past winning benchmarks.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Search hackathons by name, technology, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter Toolbar (Block 2 Field Selector tie-in) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Live', 'Upcoming', 'Ended'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition flex items-center gap-2 ${
                  statusFilter === status
                    ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {status === 'Live' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                {status} Hackathons
              </button>
            ))}
          </div>

          <div className="text-sm text-zinc-500 font-medium">
            Showing <span className="text-cyan-400 font-bold">{hackathons.length}</span> events
          </div>
        </div>

        {/* Category Pills (Block 2 tie-in) */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> Track:
          </span>
          {FIELD_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setTrackFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                trackFilter === cat
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-zinc-900/40 hover:bg-zinc-800 text-zinc-400 border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Hackathons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse p-6 space-y-4"
            >
              <div className="h-40 rounded-xl bg-zinc-800/60" />
              <div className="h-6 w-3/4 bg-zinc-800/60 rounded" />
              <div className="h-4 w-1/2 bg-zinc-800/60 rounded" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center space-y-3">
          <p>{error}</p>
          <button
            onClick={fetchHackathons}
            className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm hover:bg-zinc-800"
          >
            Retry Loading
          </button>
        </div>
      ) : hackathons.length === 0 ? (
        <div className="p-12 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3">
          <Globe className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-xl font-bold text-zinc-300">No Hackathons Found</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            Try adjusting your search criteria or switching status and track filters to view other hackathons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((h) => {
            const registered = isUserRegistered(h);
            return (
              <motion.div
                key={h.id || h._id}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 hover:border-cyan-500/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300"
              >
                {/* Banner Image */}
                <div className="relative h-44 w-full overflow-hidden bg-zinc-800">
                  <img
                    src={h.bannerUrl || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80'}
                    alt={h.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    {getStatusBadge(h.status)}
                  </div>

                  {/* Featured Tag */}
                  {h.featured && (
                    <div className="absolute top-4 left-4 z-10 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-wider uppercase">
                      ⭐ FEATURED
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {h.title}
                    </h3>
                    <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                      {h.tagline || h.description}
                    </p>
                  </div>

                  {/* Metadata Chips */}
                  <div className="space-y-2 text-xs text-zinc-400 border-t border-b border-zinc-800/80 py-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-zinc-300">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold">{h.prizePool}</span>
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {h.location}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        {new Date(h.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(h.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {(h.registeredUserIds || []).length} registered
                      </span>
                    </div>
                  </div>

                  {/* Tracks */}
                  {h.tracks && h.tracks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {h.tracks.slice(0, 3).map((track) => (
                        <span
                          key={track}
                          className="px-2.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[11px]"
                        >
                          {track}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => handleOpenDetail(h.id || h._id)}
                      className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      {h.status === 'Ended' ? 'View Results' : 'View Details'}
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {h.status !== 'Ended' && (
                      <button
                        onClick={() => handleRegisterToggle(h.id || h._id)}
                        disabled={actionLoading}
                        className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg ${
                          registered
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                        }`}
                      >
                        {registered ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Registered
                          </>
                        ) : (
                          'Register'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedHackathon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-3xl bg-zinc-950 border border-cyan-500/30 shadow-2xl overflow-hidden my-8"
            >
              {/* Header Image */}
              <div className="relative h-56 w-full bg-zinc-900 overflow-hidden">
                <img
                  src={selectedHackathon.bannerUrl}
                  alt={selectedHackathon.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <button
                  onClick={() => setSelectedHackathon(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700 transition z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedHackathon.status)}
                    <span className="text-xs text-zinc-400 bg-black/50 px-3 py-1 rounded-full border border-zinc-800">
                      📍 {selectedHackathon.location}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {selectedHackathon.title}
                  </h2>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Action message */}
                {actionMessage && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm flex items-center justify-between">
                    <span>{actionMessage}</span>
                    <button onClick={() => setActionMessage(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Quick Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Prize Pool</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">{selectedHackathon.prizePool}</div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Start Date</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {new Date(selectedHackathon.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">End Date</div>
                    <div className="text-sm font-semibold text-white mt-1">
                      {new Date(selectedHackathon.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">Registered</div>
                    <div className="text-lg font-bold text-cyan-400 mt-1">
                      {(selectedHackathon.registeredUserIds || []).length}
                    </div>
                  </div>
                </div>

                {/* Overview & Tagline */}
                <div className="space-y-3">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" /> About Event
                  </h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {selectedHackathon.description || selectedHackathon.tagline}
                  </p>
                </div>

                {/* Tracks */}
                {selectedHackathon.tracks && selectedHackathon.tracks.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" /> Hacking Tracks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedHackathon.tracks.map((t) => (
                        <span
                          key={t}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Schedule Timeline */}
                {selectedHackathon.schedule && selectedHackathon.schedule.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" /> Event Schedule
                    </h4>
                    <div className="space-y-2">
                      {selectedHackathon.schedule.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 text-xs"
                        >
                          <span className="text-cyan-400 font-semibold">{item.time}</span>
                          <span className="text-zinc-300">{item.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prizes Breakdown */}
                {selectedHackathon.prizes && selectedHackathon.prizes.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" /> Prize Distribution
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedHackathon.prizes.map((p, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                          <div className="text-xs font-bold text-amber-400">{p.title}</div>
                          <div className="text-base font-extrabold text-white">{p.reward}</div>
                          {p.description && <div className="text-xs text-zinc-400">{p.description}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard / Results (If Ended) */}
                {selectedHackathon.status === 'Ended' && selectedHackathon.winningTeams && (
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-400" /> Final Winners & Leaderboard
                    </h4>
                    <div className="space-y-2">
                      {selectedHackathon.winningTeams.map((winner, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                              #{winner.rank}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white">{winner.teamName}</div>
                              <div className="text-xs text-zinc-400">{winner.projectTitle} • {winner.track}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            {winner.prize}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-zinc-900/80 border-t border-zinc-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedHackathon(null)}
                  className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition"
                >
                  Close
                </button>

                {selectedHackathon.status !== 'Ended' && (
                  <button
                    onClick={() => handleRegisterToggle(selectedHackathon.id || selectedHackathon._id)}
                    disabled={actionLoading}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-lg ${
                      isUserRegistered(selectedHackathon)
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20'
                    }`}
                  >
                    {isUserRegistered(selectedHackathon) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Registered
                      </>
                    ) : (
                      'Register for Hackathon'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
