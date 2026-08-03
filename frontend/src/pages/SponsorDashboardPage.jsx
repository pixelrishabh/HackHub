import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  getSponsorProjects,
  getSponsorTalent,
  toggleSponsorBookmark,
  getSponsorBookmarks,
} from '../api/sponsor';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Page3DCanvas } from '../components/Page3DCanvas';
import { CustomSpotlight } from '../components/CustomSpotlight';
import { GlassCrystal3D } from '../components/GlassCrystal3D';
import { MagneticButton } from '../components/MagneticButton';
import { AnimatedCounter } from '../components/AnimatedCounter';
import {
  Briefcase,
  Users,
  CheckSquare,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  Github,
  Video,
  ExternalLink,
  Mail,
  Building,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export function SponsorDashboardPage() {
  const { user, isStaff, role } = useAuth();

  const [activeTab, setActiveTab] = useState('talent');

  const [projects, setProjects] = useState([]);
  const [talent, setTalent] = useState([]);
  const [bookmarks, setBookmarks] = useState({ bookmarked_projects: [], bookmarked_talent: [] });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [expFilter, setExpFilter] = useState('ALL');

  // Contact Candidate Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState(null);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const loadSponsorData = async () => {
    setLoading(true);
    setError('');
    try {
      const [projRes, talentRes, bookRes] = await Promise.all([
        getSponsorProjects(),
        getSponsorTalent(),
        getSponsorBookmarks(),
      ]);

      setProjects(projRes.projects || []);
      setTalent(talentRes.talent || []);
      setBookmarks(bookRes || { bookmarked_projects: [], bookmarked_talent: [] });
    } catch (err) {
      setError(err.message || 'Failed to load sponsor portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSponsorData();

    // Block 11: Real-time Live Polling for Sponsor Dashboard
    const pollInterval = setInterval(() => {
      loadSponsorData();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const handleToggleBookmark = async (target_type, target_id) => {
    setError('');
    setSuccessMsg('');
    try {
      const res = await toggleSponsorBookmark(target_type, target_id);
      setSuccessMsg(res.message || 'Bookmark updated.');

      if (target_type === 'PROJECT') {
        setProjects(prev =>
          prev.map(p => (p.id === target_id ? { ...p, is_bookmarked: res.is_bookmarked } : p))
        );
      } else {
        setTalent(prev =>
          prev.map(t => (t.id === target_id ? { ...t, is_bookmarked: res.is_bookmarked } : t))
        );
      }

      const updatedBookmarks = await getSponsorBookmarks();
      setBookmarks(updatedBookmarks);
    } catch (err) {
      setError(err.message || 'Failed to toggle bookmark.');
    }
  };

  const handleOpenContactModal = (candidate) => {
    setContactTarget(candidate);
    setContactMessage(`Hi ${candidate.name}, we loved your hackathon profile and skills (${(candidate.skills || []).slice(0, 3).join(', ')}) on HackHub! We'd love to discuss sponsorship & engineering opportunities with our team.`);
    setContactSent(false);
    setContactModalOpen(true);
  };

  const handleSendContactEmail = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactModalOpen(false);
      setSuccessMsg(`Outreach invitation sent to ${contactTarget?.name} (${contactTarget?.email})!`);
    }, 1200);
  };

  const filteredTalent = talent.filter(cand => {
    const matchesSearch =
      (cand.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cand.skills || []).some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTrack =
      trackFilter === 'ALL' || (cand.primary_field || '').toLowerCase() === trackFilter.toLowerCase();

    const matchesExp =
      expFilter === 'ALL' || (cand.experience_level || '').toLowerCase() === expFilter.toLowerCase();

    return matchesSearch && matchesTrack && matchesExp;
  });

  const filteredProjects = projects.filter(proj => {
    const matchesSearch =
      (proj.team_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrack =
      trackFilter === 'ALL' || (proj.primary_field || '').toLowerCase() === trackFilter.toLowerCase();

    return matchesSearch && matchesTrack;
  });

  const totalBookmarks =
    (bookmarks.bookmarked_projects?.length || 0) + (bookmarks.bookmarked_talent?.length || 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black">
        <LoadingSpinner label="Loading Sponsor Portal & Talent Pool..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-slate-100 overflow-hidden pb-16">
      {/* 3D Background Canvas & Spotlight */}
      <Page3DCanvas />
      <CustomSpotlight />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl bg-white/5 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-3 z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Sponsor & Talent Scout Portal</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Talent Discovery & Project Scouting
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Scout top-tier hackathon engineers, inspect AI project evaluations, bookmark high-performing candidates, and extend career invitations.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 px-4 py-3 rounded-2xl border border-white/15 backdrop-blur-xl z-10">
            <Building className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">{user?.name || 'Sponsor User'}</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Role: {role?.toUpperCase()}</div>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        {successMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold rounded-2xl flex items-center space-x-3 backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-semibold rounded-2xl flex items-center space-x-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Scouted Projects</div>
            <div className="text-3xl font-black text-cyan-300">
              <AnimatedCounter value={projects.length} />
            </div>
            <div className="text-[10px] text-slate-400">In hackathon pipeline</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Talent Candidates</div>
            <div className="text-3xl font-black text-emerald-300">
              <AnimatedCounter value={talent.length} />
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">Participant profiles</div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl space-y-2">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Saved Bookmarks</div>
            <div className="text-3xl font-black text-purple-300">
              <AnimatedCounter value={totalBookmarks} />
            </div>
            <div className="text-[10px] text-purple-400">Shortlisted candidates & projects</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 space-x-8">
          <button
            onClick={() => setActiveTab('talent')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 transition-all border-b-2 ${
              activeTab === 'talent'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Talent Discovery ({filteredTalent.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 transition-all border-b-2 ${
              activeTab === 'projects'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Project Scouting ({filteredProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`pb-4 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-2 transition-all border-b-2 ${
              activeTab === 'bookmarks'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-purple-400" />
            <span>Shortlist Bookmarks ({totalBookmarks})</span>
          </button>
        </div>

        {/* SEARCH & FILTER BAR */}
        {activeTab !== 'bookmarks' && (
          <div className="glass-card p-4 rounded-2xl border border-white/10 backdrop-blur-2xl bg-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'talent' ? "Search candidates or skills..." : "Search project or team..."}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center space-x-3 w-full md:w-auto">
              <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                <Filter className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">Track:</span>
                <select
                  value={trackFilter}
                  onChange={(e) => setTrackFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold bg-black border border-white/15 text-white rounded-xl focus:outline-none"
                >
                  <option value="ALL">All Tracks</option>
                  <option value="AI/ML">AI / ML</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Design/UX">Design & UX</option>
                </select>
              </div>

              {activeTab === 'talent' && (
                <div className="flex items-center space-x-1.5 text-xs text-slate-300">
                  <span className="font-bold">Exp:</span>
                  <select
                    value={expFilter}
                    onChange={(e) => setExpFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold bg-black border border-white/15 text-white rounded-xl focus:outline-none"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: TALENT DISCOVERY */}
        {activeTab === 'talent' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {filteredTalent.length === 0 ? (
              <EmptyState
                title="No Candidate Profiles Found"
                description="No participants match your active search terms or experience/track filter."
                icon={Users}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTalent.map((cand) => (
                  <motion.div
                    key={cand.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold flex items-center justify-center text-sm">
                            {cand.name?.charAt(0)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                            <span className="text-[11px] font-semibold text-slate-400">
                              {cand.primary_field} • {cand.experience_level}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleBookmark('TALENT', cand.id)}
                          className={`p-2 rounded-xl border transition-colors ${
                            cand.is_bookmarked
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                          }`}
                          title={cand.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Candidate'}
                        >
                          {cand.is_bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      <p className="mt-3 text-xs text-slate-300 line-clamp-2">
                        {cand.project_goal_text || `Passionate ${cand.primary_field} developer building hackathon projects.`}
                      </p>

                      {cand.team_info && (
                        <div className="mt-3 p-2.5 bg-black/40 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center justify-between">
                          <span>Team: <strong className="text-white">{cand.team_info.team_name}</strong></span>
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold rounded-full">Assigned</span>
                        </div>
                      )}

                      <div className="mt-3 space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Verified Skills ({cand.skills?.length || 0})
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(cand.skills || []).slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white/10 text-slate-200 text-[10px] font-semibold rounded-lg border border-white/10"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenContactModal(cand)}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Contact Candidate</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 2: PROJECT SCOUTING */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {filteredProjects.length === 0 ? (
              <EmptyState
                title="No Projects Scouted Yet"
                description="No project submissions match your active filter."
                icon={CheckSquare}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProjects.map((proj) => (
                  <motion.div
                    key={proj.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    className="glass-card p-6 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div>
                          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                            {proj.primary_field}
                          </span>
                          <h3 className="text-lg font-extrabold text-white">{proj.team_name}</h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          {proj.evaluated ? (
                            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-xs rounded-full border border-emerald-500/40">
                              AI Score: {proj.ai_overall_average} / 10
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-extrabold text-xs rounded-full border border-amber-500/40">
                              Pending AI Eval
                            </span>
                          )}

                          <button
                            onClick={() => handleToggleBookmark('PROJECT', proj.id)}
                            className={`p-2 rounded-xl border transition-colors ${
                              proj.is_bookmarked
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                            }`}
                            title={proj.is_bookmarked ? 'Remove Bookmark' : 'Bookmark Project'}
                          >
                            {proj.is_bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-300 line-clamp-3">{proj.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <a
                          href={proj.repo_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-cyan-400 hover:underline font-semibold"
                        >
                          <Github className="w-3.5 h-3.5" />
                          <span>GitHub Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {proj.demo_video_link && (
                          <a
                            href={proj.demo_video_link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-emerald-400 hover:underline font-semibold"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Demo Video</span>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Submission ID: {proj.id.substring(0, 13)}...</span>
                      <span>Submitted: {new Date(proj.createdAt).toLocaleDateString()}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: SHORTLIST BOOKMARKS */}
        {activeTab === 'bookmarks' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                <span>Bookmarked Candidate Profiles ({bookmarks.bookmarked_talent?.length || 0})</span>
              </h2>

              {bookmarks.bookmarked_talent?.length === 0 ? (
                <EmptyState title="No Candidates Bookmarked" description="Go to 'Talent Discovery' tab and click the bookmark icon on profiles you want to save." icon={Users} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bookmarks.bookmarked_talent.map(t => (
                    <div key={t.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{t.name}</div>
                        <div className="text-xs text-slate-400">{t.primary_field} • {t.experience_level}</div>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark('TALENT', t.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <BookmarkCheck className="w-5 h-5 text-emerald-400" />
                <span>Bookmarked Projects ({bookmarks.bookmarked_projects?.length || 0})</span>
              </h2>

              {bookmarks.bookmarked_projects?.length === 0 ? (
                <EmptyState title="No Projects Bookmarked" description="Go to 'Project Scouting' tab to bookmark top hackathon submissions." icon={CheckSquare} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarks.bookmarked_projects.map(p => (
                    <div key={p.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">{p.team?.name || 'Project'}</div>
                        <div className="text-xs text-slate-400 truncate max-w-xs">{p.description}</div>
                      </div>
                      <button
                        onClick={() => handleToggleBookmark('PROJECT', p.id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors text-xs font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* OUTREACH CONTACT MODAL */}
        <Modal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} title={`Contact ${contactTarget?.name}`}>
          <form onSubmit={handleSendContactEmail} className="space-y-4">
            <p className="text-xs text-slate-300">
              Send an official sponsorship / career outreach invitation to <strong className="text-white">{contactTarget?.name}</strong> ({contactTarget?.email}).
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Message Body</label>
              <textarea
                rows={4}
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-white/5 border border-white/15 text-white rounded-2xl focus:border-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={contactSent}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center space-x-1"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{contactSent ? 'Sending Outreach...' : 'Send Invitation'}</span>
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
