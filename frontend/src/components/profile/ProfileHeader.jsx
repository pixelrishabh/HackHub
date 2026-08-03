import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  GraduationCap,
  Edit3,
  Share2,
  Trophy,
  Zap,
  CheckCircle2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export function ProfileHeader({
  user,
  profile,
  stats,
  isOwnProfile,
  onOpenEdit,
  onOpenShare,
}) {
  const name = user?.name || 'Devon Lee';
  const username = profile?.username || user?.email?.split('@')[0] || 'devon_lee';
  const role = user?.role || 'Participant';
  const university = profile?.university || 'Stanford University';
  const location = profile?.location || 'San Francisco, CA';
  const bio = profile?.bio || 'AI Developer & Autonomous Agent Specialist. Building next-generation developer tooling.';
  const xpLevel = profile?.xpLevel || 14;
  const xpPoints = profile?.xpPoints || 4250;
  const currentRank = profile?.currentRank || 'Grandmaster III';
  const avatar = profile?.avatarUrl || profile?.avatar_url || profile?.avatar;
  const banner = profile?.banner;
  const aiScore = profile?.aiScore || 85;
  const aiRationale = profile?.aiRationale || 'Calculated from connected GitHub & LinkedIn developer profiles.';

  const nextLevelXp = xpLevel * 350;
  const xpProgress = Math.min(100, Math.round(((xpPoints % 350) / 350) * 100));

  let parsedSkills = [];
  try {
    parsedSkills = typeof profile?.skills === 'string' ? JSON.parse(profile.skills) : (profile?.skills || []);
  } catch (e) {
    parsedSkills = ['React', 'Python', 'PyTorch', 'Node.js', 'TailwindCSS'];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl overflow-hidden bg-[#0B0B0B]/90 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-2xl mb-8 text-white"
    >
      {/* Background Banner with Minimal Ambient Streaks */}
      <div className="relative h-56 sm:h-72 w-full overflow-hidden bg-[#070707]">
        {banner ? (
          <img
            src={banner}
            alt="Cover Banner"
            className="w-full h-full object-cover opacity-40 grayscale"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-zinc-900/40 to-black" />
        )}

        {/* Ambient Grid Lines & Subtle Light Streaks */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Rank & Level & AI Score Badges Floating Top Right */}
        <div className="absolute top-5 right-5 flex items-center space-x-2.5 flex-wrap gap-y-2">
          <div className="px-4 py-1.5 rounded-full border border-cyan-500/40 bg-slate-950/80 backdrop-blur-xl flex items-center space-x-2 shadow-xl shadow-cyan-500/10" title={aiRationale}>
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-black tracking-wider text-cyan-300">AI CREDIBILITY: {aiScore}/100</span>
          </div>
          <div className="px-4 py-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-xl flex items-center space-x-2 shadow-xl">
            <Trophy className="w-4 h-4 text-white" />
            <span className="text-xs font-mono font-bold tracking-wider text-white uppercase">{currentRank}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-white/15 bg-black/60 backdrop-blur-xl flex items-center space-x-2 text-xs font-mono font-bold text-zinc-300">
            <Zap className="w-3.5 h-3.5 text-white" />
            <span>LVL {xpLevel}</span>
          </div>
        </div>
      </div>

      {/* Main Profile Info Section */}
      <div className="relative px-6 sm:px-10 pb-8 pt-0 -mt-20 sm:-mt-24 z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        {/* Left Column: Avatar + Basic Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 w-full md:w-auto">
          {/* Glass Avatar Container */}
          <div className="relative group">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl p-1 bg-gradient-to-b from-white/20 via-white/5 to-black backdrop-blur-2xl border border-white/20 shadow-2xl overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover rounded-[22px]" />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-zinc-900 flex items-center justify-center text-white font-black text-4xl sm:text-5xl border border-white/10">
                  {name.charAt(0)}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
            </div>

            {/* Live Online Status Badge */}
            <div className="absolute bottom-2 right-2 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/80 border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase">Online</span>
            </div>
          </div>

          {/* Name & Title */}
          <div className="space-y-1.5 pt-2 sm:pt-0">
            <div className="flex items-center space-x-3 flex-wrap gap-y-2">
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {name}
              </h1>
              <span className="px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
                <span>{role}</span>
              </span>
            </div>

            <p className="text-sm font-medium text-zinc-400 tracking-wide flex items-center space-x-2">
              <span className="font-mono">@{username}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-300 font-medium">Verified AI Engineer</span>
            </p>

            <div className="flex items-center space-x-4 text-xs font-medium text-zinc-400 pt-1 flex-wrap gap-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-300">
                <GraduationCap className="w-4 h-4 text-white" />
                <span>{university} {profile?.degree ? `• ${profile.degree}` : ''} {profile?.graduationYear ? `'${profile.graduationYear.slice(-2)}` : ''}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-300">
                <MapPin className="w-4 h-4 text-white" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CTA Buttons */}
        <div className="flex items-center space-x-3 w-full sm:w-auto pt-2 md:pt-0 justify-start sm:justify-end">
          {isOwnProfile && (
            <button
              onClick={onOpenEdit}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-all duration-200 flex items-center justify-center space-x-2 shadow-xl active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
          <button
            onClick={onOpenShare}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg active:scale-95"
          >
            <Share2 className="w-4 h-4 text-white" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Bio & Skills Preview Row */}
      <div className="px-6 sm:px-10 pb-8 pt-2 border-t border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-sm text-zinc-300 leading-relaxed font-normal italic">
            "{bio}"
          </p>
        </div>

        {/* XP Level Progress Bar */}
        <div className="w-full lg:w-72 p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-zinc-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>XP Progress</span>
            </span>
            <span className="text-white font-mono font-bold">{xpPoints} XP</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-zinc-400 via-slate-200 to-white rounded-full shadow-sm"
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>LVL {xpLevel}</span>
            <span>LVL {xpLevel + 1} ({nextLevelXp} XP)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
