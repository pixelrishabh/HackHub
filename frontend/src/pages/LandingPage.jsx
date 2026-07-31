import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Users,
  Bot,
  CheckSquare,
  FileCode,
  ShieldCheck,
  BarChart2,
  ArrowRight,
  Compass,
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GlassCrystal3D } from '../components/GlassCrystal3D';
import { MagneticButton } from '../components/MagneticButton';
import { AnimatedCounter } from '../components/AnimatedCounter';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      title: 'AI Skill-Based Team Formation',
      description: 'Intelligently balance participant skills, experience levels, and track interests using Gemini AI models.',
      icon: Users,
      badge: 'Organizer Control',
    },
    {
      title: 'Realtime AI Mentor Assistant',
      description: 'Continuous technical support that inspects GitHub repository READMEs and hackathon rulebooks 24/7.',
      icon: Bot,
      badge: 'Participant Support',
    },
    {
      title: 'AI Project Evaluation & Scorecard',
      description: 'Automated multidimensional scoring (Originality, Technical Depth, Completeness, Clarity) paired with judge manual overrides.',
      icon: CheckSquare,
      badge: 'Fair Judging',
    },
    {
      title: 'Realtime Idea Validator',
      description: 'Test hackathon project scope feasibility given remaining hours, receiving instant MVP scope recommendations.',
      icon: FileCode,
      badge: 'Feasibility Check',
    },
    {
      title: 'Plagiarism & Code Similarity Scan',
      description: 'Automated submission comparison alerting organizers of duplicate codebase structures and threshold flags.',
      icon: ShieldCheck,
      badge: 'Integrity Defense',
    },
    {
      title: 'Live Engagement Leaderboard',
      description: 'Track team check-ins, mentor activity, and submission milestones with real-time score weighting.',
      icon: BarChart2,
      badge: 'Activity Pulse',
    },
  ];

  // Framer Motion Stagger Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white font-sans">
      {/* Hero Section with Ambient Breathing Motion */}
      <motion.section
        className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center pt-10 pb-24 lg:py-28 px-4 sm:px-6 lg:px-8"
        animate={{ scale: [1, 1.006, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT SIDE: Typography & Magnetic Actions */}
            <motion.div
              className="lg:col-span-7 text-left relative z-20"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Massive Outline Text Background Effect */}
              <div className="absolute -top-20 -left-10 select-none pointer-events-none opacity-15 hidden sm:block">
                <span className="text-[140px] sm:text-[180px] lg:text-[230px] font-black tracking-tighter text-outline leading-none uppercase">
                  HACKHUB
                </span>
              </div>

              {/* Tag Badge */}
              <motion.div variants={itemVariants} className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full glass-panel border border-white/15 text-xs font-semibold tracking-wide text-slate-200 mb-8 backdrop-blur-2xl shadow-xl">
                <Sparkles className="w-4 h-4 text-accentCyan animate-pulse" />
                <span className="text-glow">Next-Gen Autonomous AI Platform</span>
              </motion.div>

              {/* Large Title */}
              <motion.div variants={itemVariants} className="relative mb-6">
                <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-none uppercase">
                  HACK
                  <br />
                  <span className="text-white text-glow">HUB</span>
                </h1>
              </motion.div>

              {/* Subtitle */}
              <motion.p variants={itemVariants} className="text-xl sm:text-2xl lg:text-3xl font-bold text-accentCyan mb-4 tracking-tight">
                The Future of AI-Powered Hackathons
              </motion.p>

              {/* Description */}
              <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-10 font-normal">
                <span className="font-semibold text-white">Build. Collaborate. Innovate. Win.</span>
                <br />
                One intelligent platform connecting students, mentors, organizers and judges.
              </motion.p>

              {/* Magnetic Action CTA Buttons */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                {isAuthenticated ? (
                  <Link to="/dashboard">
                    <MagneticButton primary className="shimmer-effect">
                      <span>Launch HackHub</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </MagneticButton>
                  </Link>
                ) : (
                  <>
                    <Link to="/register">
                      <MagneticButton primary className="shimmer-effect">
                        <span>Launch HackHub</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </MagneticButton>
                    </Link>
                    <Link to="/login">
                      <MagneticButton>
                        <Compass className="w-5 h-5 text-accentCyan group-hover:rotate-45 transition-transform" />
                        <span>Explore Events</span>
                      </MagneticButton>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Quick Metrics Banner with Animated Count-Up */}
              <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
                <div className="p-4 rounded-2xl glass-panel border border-white/10 glass-panel-hover">
                  <div className="text-2xl font-black text-white">
                    <AnimatedCounter value="100" suffix="%" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">Real-Time AI</div>
                </div>
                <div className="p-4 rounded-2xl glass-panel border border-white/10 glass-panel-hover">
                  <div className="text-2xl font-black text-accentCyan">Gemini 3.6</div>
                  <div className="text-[11px] text-slate-400 font-medium">AI Engine</div>
                </div>
                <div className="p-4 rounded-2xl glass-panel border border-white/10 glass-panel-hover">
                  <div className="text-2xl font-black text-white">Role-Guarded</div>
                  <div className="text-[11px] text-slate-400 font-medium">Access Control</div>
                </div>
                <div className="p-4 rounded-2xl glass-panel border border-white/10 glass-panel-hover">
                  <div className="text-2xl font-black text-glow">Track UI</div>
                  <div className="text-[11px] text-slate-400 font-medium">Field-Themed</div>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT SIDE: Floating 3D Glass Crystal & Neural Orbit */}
            <motion.div
              className="lg:col-span-5 relative flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <GlassCrystal3D />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Grid Section */}
      <section className="relative z-10 py-28 px-4 sm:px-6 lg:px-8 bg-black/70 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
              Complete Hackathon <span className="text-glow text-accentCyan">OS</span>
            </h2>
            <p className="mt-4 text-slate-400 text-base sm:text-lg font-normal">
              Autonomous AI workflows powered by Express, Prisma & Gemini 3.6 model integrations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 35 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.1 }}
                  className="glass-panel glass-panel-hover p-8 rounded-[24px] border border-white/12 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center group-hover:scale-110 group-hover:border-white/40 transition-all duration-300 shadow-xl">
                        <Icon className="w-7 h-7 text-accentCyan group-hover:rotate-6 transition-transform" />
                      </div>
                      <span className="px-3.5 py-1 bg-white/5 border border-white/15 text-accentCyan text-xs font-semibold rounded-full backdrop-blur-md">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-accentCyan transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-[#050505] border-t border-white/10 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-widest text-sm">HACKHUB</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Futuristic AI Hackathon Engine</span>
          </div>
          <p>© 2026 HackHub. Designed for Organizers, Judges & Builders.</p>
        </div>
      </footer>
    </div>
  );
}
