import React, { useState } from 'react';
import { Modal } from '../Modal';
import { Share2, Copy, Check, ExternalLink, Sparkles, Trophy, Flame } from 'lucide-react';

export function ShareProfileModal({ isOpen, onClose, user = {}, profile = {}, stats = {} }) {
  const [copied, setCopied] = useState(false);

  const name = user?.name || 'Devon Lee';
  const username = profile?.username || 'devon_lee';
  const rank = profile?.currentRank || 'Grandmaster III';
  const xpLevel = profile?.xpLevel || 14;

  const profileUrl = `${window.location.origin}/dashboard/profile?user=${user?.id || 'me'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share AI Developer Identity">
      <div className="space-y-6">
        {/* Preview Card */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/50 via-slate-900 to-black text-white relative overflow-hidden shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-[14px] bg-black flex items-center justify-center font-bold text-white text-lg">
                  {name.charAt(0)}
                </div>
              </div>
              <div>
                <h4 className="text-base font-black text-white tracking-tight">{name}</h4>
                <p className="text-xs font-mono text-cyan-300">@{username}</p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-bold text-cyan-200 uppercase tracking-wider">
              {rank}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-center border-t border-white/10 text-xs font-mono">
            <div className="glass-panel p-2 rounded-xl bg-white/5">
              <div className="text-[10px] text-slate-400">LVL</div>
              <div className="font-bold text-yellow-400">{xpLevel}</div>
            </div>
            <div className="glass-panel p-2 rounded-xl bg-white/5">
              <div className="text-[10px] text-slate-400 font-sans">Commits</div>
              <div className="font-bold text-emerald-400">{stats.commits || 184}</div>
            </div>
            <div className="glass-panel p-2 rounded-xl bg-white/5">
              <div className="text-[10px] text-slate-400 font-sans">AI Score</div>
              <div className="font-bold text-cyan-300">{stats.aiScore || 94.8}%</div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-mono text-center pt-1">
            HACKHUB AI DEVELOPER IDENTITY • VERIFIED IDENTITY
          </div>
        </div>

        {/* Copy Shareable Link Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-300">Direct Identity URL</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="flex-1 px-3.5 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-bold bg-white text-black hover:bg-slate-200 rounded-xl transition-all flex items-center space-x-1.5 shadow-lg active:scale-95 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
