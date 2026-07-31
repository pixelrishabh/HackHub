import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Globe, Mail, Link as LinkIcon, Copy, Check, ExternalLink } from 'lucide-react';

export function SocialLinksSection({ profile = {}, user = {} }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const githubUrl = profile?.githubUrl || 'https://github.com';
  const linkedinUrl = profile?.linkedinUrl || 'https://linkedin.com';
  const twitterUrl = profile?.twitterUrl || 'https://x.com';
  const portfolioUrl = profile?.portfolioUrl || 'https://hackhub.ai';
  const websiteUrl = profile?.websiteUrl || 'https://hackhub.ai';
  const email = user?.email || 'devon@hackops.test';

  const socialLinks = [
    { key: 'github', label: 'GitHub Profile', url: githubUrl, icon: Github },
    { key: 'linkedin', label: 'LinkedIn', url: linkedinUrl, icon: Linkedin },
    { key: 'twitter', label: 'Twitter / X', url: twitterUrl, icon: LinkIcon },
    { key: 'portfolio', label: 'Portfolio Dev', url: portfolioUrl, icon: Globe },
    { key: 'email', label: 'Email Contact', url: `mailto:${email}`, display: email, icon: Mail },
  ];

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="p-6 sm:p-8 rounded-3xl border border-white/[0.08] bg-[#0B0B0B]/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] mb-8 relative text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white tracking-tight">Social Links & Verified Channels</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Connect with this developer across external code repositories and professional platforms.
          </p>
        </div>

        <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-semibold">
          5 Verified Links
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {socialLinks.map((item) => {
          const Icon = item.icon;
          const displayUrl = item.display || item.url.replace(/^https?:\/\//, '');

          return (
            <div
              key={item.key}
              className="p-4 rounded-2xl border border-white/[0.08] bg-white/5 backdrop-blur-xl flex flex-col justify-between space-y-3 transition-all duration-200 hover:border-white/30 text-white group shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 text-white">
                  <Icon className="w-4 h-4" />
                </div>

                <button
                  onClick={() => handleCopy(item.url, item.key)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="Copy link"
                >
                  {copiedKey === item.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div>
                <div className="text-xs font-bold text-white tracking-tight">{item.label}</div>
                <div className="text-[11px] font-mono text-zinc-400 line-clamp-1 mt-0.5">{displayUrl}</div>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-3 h-3 text-white" />
              </a>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
