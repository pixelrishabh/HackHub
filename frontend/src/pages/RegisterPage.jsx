import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AVAILABLE_FIELDS } from '../config/fieldConfig';
import { Sparkles, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

const COMMON_SKILLS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'TensorFlow', 'PyTorch',
  'Figma', 'UI/UX Design', 'PostgreSQL', 'MongoDB', 'Docker', 'GraphQL',
  'Flutter', 'React Native', 'Tailwind CSS', 'FastAPI', 'Next.js', 'AWS'
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'participant',
    inviteCode: '',
    primary_field: 'AI/ML',
    skills: ['React', 'Python'],
    experience_level: 'Intermediate',
    interests: [],
    timezone: 'UTC',
    project_goal_text: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill) => {
    setFormData((prev) => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await register(formData);
      if (res.user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#050505] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 3D Background Identity element */}
      <div className="absolute top-10 right-10 w-96 h-96 opacity-30 pointer-events-none hidden md:block">
        <Page3DCanvas type="quantum" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center relative z-10">
        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white mx-auto shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-7 h-7 text-accentCyan animate-pulse" />
        </div>
        <h2 className="mt-5 text-3xl font-black text-white tracking-tight uppercase">
          Join <span className="text-glow">HackHub</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
          Create your participant account and set up your hackathon profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-[28px] border border-white/15 shadow-2xl backdrop-blur-2xl">
          {/* Role Selection Grid */}
          <div className="mb-6 space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Your Registration Role *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'participant', label: 'Participant', icon: '👤', desc: 'Instant Signup' },
                { id: 'mentor', label: 'Mentor', icon: '🎓', desc: 'Invite Required' },
                { id: 'judge', label: 'Judge', icon: '⚖️', desc: 'Invite Required' },
                { id: 'organizer', label: 'Organizer', icon: '👑', desc: 'Invite Required' },
                { id: 'sponsor', label: 'Sponsor', icon: '💼', desc: 'Invite Required' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r.id })}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    formData.role === r.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">{r.icon}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {r.desc}
                    </span>
                  </div>
                  <div className="text-xs font-extrabold mt-2 text-white">{r.label}</div>
                </button>
              ))}
            </div>

            {/* Conditional Staff Invite Code Field */}
            {formData.role !== 'participant' && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  Staff Authorization Required for '{formData.role.toUpperCase()}' Role
                </div>
                <p className="text-slate-300 text-[11px]">
                  Public registration for staff roles is protected. Enter your official Staff Invite Code below (e.g., <code className="text-amber-200 font-mono">HACKHUB-STAFF-2026</code>).
                </p>
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Staff Invite Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.inviteCode || ''}
                    onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-amber-500/40 text-amber-200 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-400 placeholder-slate-600"
                    placeholder="e.g. HACKHUB-STAFF-2026"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Basics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-slate-500"
                  placeholder="Alex Rivera"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-slate-500"
                  placeholder="alex@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password *</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-slate-500"
                placeholder="Minimum 8 characters"
              />
            </div>

            {/* Profile Config */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Primary Track Theme *</label>
                <select
                  value={formData.primary_field}
                  onChange={(e) => setFormData({ ...formData, primary_field: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-black border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
                >
                  {AVAILABLE_FIELDS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Experience Level *</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  className="w-full px-4 py-3 text-sm bg-black border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
                >
                  <option value="Beginner">Beginner (1st Hackathon)</option>
                  <option value="Intermediate">Intermediate (1-3 Hackathons)</option>
                  <option value="Advanced">Advanced (Veteran)</option>
                </select>
              </div>
            </div>

            {/* Skills Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Select Your Technical Skills
              </label>
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 rounded-xl bg-white/5 border border-white/10">
                {COMMON_SKILLS.map((skill) => {
                  const selected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? 'bg-white text-black font-bold shadow-md'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {skill} {selected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Hackathon Project Goal
              </label>
              <textarea
                rows={2}
                value={formData.project_goal_text}
                onChange={(e) => setFormData({ ...formData, project_goal_text: e.target.value })}
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none placeholder-slate-500"
                placeholder="E.g. Building an autonomous agent to automate code reviews."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-xl text-black font-extrabold text-sm bg-white hover:bg-slate-100 shadow-xl shadow-white/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-white hover:text-accentCyan underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
