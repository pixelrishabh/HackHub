import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles, Shield, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { Page3DCanvas } from '../components/Page3DCanvas';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('participant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.user) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#050505] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* 3D Background Identity element */}
      <div className="absolute top-10 right-10 w-96 h-96 opacity-30 pointer-events-none hidden md:block">
        <Page3DCanvas type="prism" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="w-14 h-14 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center text-white mx-auto shadow-2xl backdrop-blur-xl">
          <Sparkles className="w-7 h-7 text-accentCyan animate-pulse" />
        </div>
        <h2 className="mt-5 text-3xl font-black text-white tracking-tight uppercase">
          Welcome to <span className="text-glow">HackHub</span>
        </h2>
        <p className="mt-2 text-xs text-slate-400 font-medium uppercase tracking-wider">
          Sign in to access your hackathon workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel p-8 sm:p-10 rounded-[28px] border border-white/15 shadow-2xl backdrop-blur-2xl">
          {/* Tab Switcher: Participant vs Staff Path */}
          <div className="flex border-b border-white/10 mb-6">
            <button
              onClick={() => {
                setActiveTab('participant');
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'participant'
                  ? 'border-white text-white font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4 text-accentCyan" />
              <span>Student / Participant</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('staff');
                setError('');
              }}
              className={`flex-1 pb-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 flex items-center justify-center space-x-2 transition-all ${
                activeTab === 'staff'
                  ? 'border-accentCyan text-accentCyan font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 text-accentCyan" />
              <span>Staff / Organizer</span>
            </button>
          </div>

          {activeTab === 'staff' && (
            <div className="mb-5 p-3.5 bg-white/5 border border-white/15 rounded-xl text-xs text-slate-300">
              <span className="font-bold text-white">Organizer / Judge / Mentor Login:</span> Enter your authorized staff account credentials.
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl flex items-start space-x-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-slate-500"
                placeholder={activeTab === 'participant' ? 'student@university.edu' : 'organizer@hackhub.ai'}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder-slate-500"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl text-black font-extrabold text-sm bg-white hover:bg-slate-100 shadow-xl shadow-white/10 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have a participant account?{' '}
            <Link to="/register" className="font-bold text-white hover:text-accentCyan underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

