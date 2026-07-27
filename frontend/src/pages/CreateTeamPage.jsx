import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, PlusCircle, AlertCircle, ArrowLeft, Shield, Sparkles, Layers } from 'lucide-react';
import { createTeam } from '../api/teams';

export function CreateTeamPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    logo_url: '',
    category: 'Web Dev',
    max_members: 4,
    required_skills: '',
    tech_stack: '',
  });

  const categories = ['Web Dev', 'AI/ML', 'Fintech', 'Cybersecurity', 'Healthcare', 'Mobile Dev', 'General'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setLoading(true);
    setError('');

    try {
      const skillsArray = form.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      const techArray = form.tech_stack.split(',').map(t => t.trim()).filter(Boolean);

      const res = await createTeam({
        name: form.name.trim(),
        description: form.description.trim(),
        logo_url: form.logo_url.trim(),
        category: form.category,
        max_members: Number(form.max_members),
        required_skills: skillsArray,
        tech_stack: techArray,
      });

      if (res.team) {
        navigate('/teams/my-team', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to create team. You might already belong to an active team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back button */}
      <Link 
        to="/teams/browse" 
        className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Browse Teams</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full border border-primary-200 mb-2">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Team Creation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Create a Hackathon Team</h1>
          <p className="text-xs text-slate-500 mt-1">
            As creator, you will automatically become the Team Leader. You can manage join requests and invite members.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-2xl flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Team Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. CyberNova AI"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Project Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Maximum Capacity</span>
                <span className="font-extrabold text-primary-600">{form.max_members} Members</span>
              </label>
              <input
                type="range"
                min="2"
                max="6"
                step="1"
                value={form.max_members}
                onChange={(e) => setForm({ ...form, max_members: e.target.value })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500 mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>2 Members</span>
                <span>4 Members (Default)</span>
                <span>6 Members</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Team Description</label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe your hackathon project goal, core features, and member expectations..."
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Required Skills (comma separated)</label>
            <input
              type="text"
              value={form.required_skills}
              onChange={(e) => setForm({ ...form, required_skills: e.target.value })}
              placeholder="e.g. Python, React, UI/UX Design"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Tech Stack (comma separated)</label>
            <input
              type="text"
              value={form.tech_stack}
              onChange={(e) => setForm({ ...form, tech_stack: e.target.value })}
              placeholder="e.g. Node.js, PyTorch, Docker"
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <Link
              to="/teams/browse"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || !form.name.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Team...' : 'Create Team & Become Leader'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
