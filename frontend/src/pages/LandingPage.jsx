import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Bot,
  CheckSquare,
  FileCode,
  ShieldCheck,
  BarChart2,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

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

  return (
    <div className="bg-surface min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-slate-200/60 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-primary-50 text-primary-700 rounded-full border border-primary-200 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span>Autonomous AI Hackathon Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Supercharge Your Hackathon with <span className="text-primary-500">Autonomous AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal">
            From skill-balanced team matchmaking to automated submission evaluation and similarity detection. Designed for hackathon organizers, judges, mentors, and participants.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white text-base font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-primary-500 hover:bg-primary-600 text-white text-base font-semibold rounded-xl shadow-md shadow-primary-500/20 transition-colors"
                >
                  <span>Register as Student</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-base font-semibold rounded-xl transition-colors"
                >
                  <span>Log In (Student or Staff)</span>
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-surface border border-slate-200/80">
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-xs text-slate-500 font-medium">Real-Time Evaluation</div>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-slate-200/80">
              <div className="text-2xl font-bold text-secondary-600">AI Powered</div>
              <div className="text-xs text-slate-500 font-medium">Gemini 3.6 Engine</div>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-slate-200/80">
              <div className="text-2xl font-bold text-slate-900">Role-Guarded</div>
              <div className="text-xs text-slate-500 font-medium">Strict Access Control</div>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-slate-200/80">
              <div className="text-2xl font-bold text-primary-600">Field-Themed</div>
              <div className="text-xs text-slate-500 font-medium">Personalized Track UI</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-16 md:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Complete Hackathon Operating System
            </h2>
            <p className="mt-3 text-slate-600 text-base">
              Every feature connects directly to real Express + Prisma backend services for a seamless hackathon workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-secondary-50 text-secondary-700 text-xs font-semibold rounded-md border border-secondary-200">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 HackHub — Powered by Express, Prisma & Gemini AI Engine.</p>
        </div>
      </footer>
    </div>
  );
}
