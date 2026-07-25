import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AVAILABLE_FIELDS } from '../config/fieldConfig';
import { Sparkles, UserCheck, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

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
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-primary-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
          Join HackHub
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Create your participant account and set up your hackathon profile
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200/80 sm:rounded-2xl sm:px-10">
          {/* Public Signup Role Notice */}
          <div className="mb-6 p-3 bg-primary-50 border border-primary-200 rounded-xl text-xs text-primary-800 flex items-start space-x-2">
            <UserCheck className="w-4 h-4 flex-shrink-0 text-primary-600 mt-0.5" />
            <div>
              <span className="font-bold">Public Registration Role:</span> Student / Participant. (Staff accounts for organizers, judges, and mentors are provisioned via staff login).
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start space-x-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Account Basics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Alex Chen"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="alex@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password * (Min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            {/* Primary Field Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Field / Track Focus *
              </label>
              <select
                value={formData.primary_field}
                onChange={(e) => setFormData({ ...formData, primary_field: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-surface font-medium text-slate-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {AVAILABLE_FIELDS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-slate-400">
                Your dashboard layout, empty states, and suggested AI prompts will personalize to this field!
              </p>
            </div>

            {/* Experience Level & Timezone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
                <input
                  type="text"
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="UTC / EST / PST"
                />
              </div>
            </div>

            {/* Skills Multi-Select Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Skills (Select your core stack)
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-surface rounded-xl border border-slate-200">
                {COMMON_SKILLS.map((skill) => {
                  const isSelected = formData.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Goal / Hackathon Objective
              </label>
              <textarea
                rows={2}
                value={formData.project_goal_text}
                onChange={(e) => setFormData({ ...formData, project_goal_text: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                placeholder="Want to build an AI-assisted RAG app with vector search and sleek UX..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Participant Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
