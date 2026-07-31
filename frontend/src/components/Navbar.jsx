import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AVAILABLE_FIELDS } from '../config/fieldConfig';
import {
  Sparkles,
  Bot,
  Users,
  ShieldCheck,
  CheckSquare,
  BarChart2,
  FileCode,
  LogOut,
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  UserPlus,
  MessageSquare,
  Award,
  Briefcase
} from 'lucide-react';
import { Modal } from './Modal';

export function Navbar() {
  const { user, role, isAuthenticated, isStaff, isOrganizer, primaryField, setPrimaryField, logout, createStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [fieldMenuOpen, setFieldMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  const fieldMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (fieldMenuRef.current && !fieldMenuRef.current.contains(event.target)) {
        setFieldMenuOpen(false);
      }
    }
    if (fieldMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [fieldMenuOpen]);

  // Staff creation form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'judge',
    skills: '[]',
  });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState('');
  const [staffSuccess, setStaffSuccess] = useState('');

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError('');
    setStaffSuccess('');

    try {
      await createStaff(staffForm);
      setStaffSuccess(`Staff account (${staffForm.role}) created successfully!`);
      setStaffForm({ name: '', email: '', password: '', role: 'judge', skills: '[]' });
    } catch (err) {
      setStaffError(err.message || 'Failed to create staff account.');
    } finally {
      setStaffLoading(false);
    }
  };

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Overview', icon: Sparkles },
        { path: '/dashboard/profile', label: 'AI Profile', icon: User },
        { path: '/dashboard/chat', label: 'Team Chat', icon: MessageSquare },
        { path: '/dashboard/mentor', label: 'AI Mentor', icon: Bot },
        { path: '/dashboard/evaluation', label: isStaff ? 'Evaluations' : 'My Submission', icon: CheckSquare },
        { path: '/dashboard/idea-validator', label: 'Idea Validator', icon: FileCode },
        { path: '/dashboard/engagement', label: 'Live Leaderboard', icon: BarChart2 },
        { path: '/dashboard/analytics', label: 'Analytics & Certs', icon: Award },
        ...(role === 'sponsor' || isStaff ? [{ path: '/dashboard/sponsor', label: 'Sponsors', icon: Briefcase }] : []),
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/50 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl shadow-white/10 group-hover:scale-105 group-hover:border-white/40 transition-all duration-300 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-glow transition-all">
                HACK<span className="text-accentCyan font-light">HUB</span>
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-widest text-slate-400 -mt-1">
                AI Hackathon OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/5 border border-white/12 rounded-full px-3.5 py-1.5 backdrop-blur-xl shadow-2xl">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-black font-bold shadow-lg shadow-white/25'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Controls & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Participant Field Switcher Dropdown */}
                {!isStaff && (
                  <div className="relative" ref={fieldMenuRef}>
                    <button
                      onClick={() => setFieldMenuOpen(!fieldMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 text-slate-200 text-xs font-semibold rounded-full border border-white/15 hover:bg-white/10 hover:border-white/30 transition-all"
                      title="Switch Primary Field Theme"
                    >
                      <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse"></span>
                      <span>Field: {primaryField}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {fieldMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl py-2 z-50 animate-fade-in border border-white/15">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Primary Track Theme
                        </div>
                        {AVAILABLE_FIELDS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => {
                              setPrimaryField(f.id);
                              setFieldMenuOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-white/10 ${
                              primaryField === f.id ? 'font-bold text-white bg-white/10' : 'text-slate-300'
                            }`}
                          >
                            <span>{f.name}</span>
                            {primaryField === f.id && <span className="text-accentCyan font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Role Badge & Organizer Actions */}
                {isStaff && (
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-white/10 border border-white/20 text-accentCyan text-xs font-bold uppercase rounded-full flex items-center space-x-1.5 backdrop-blur-md">
                      <Shield className="w-3 h-3 text-accentCyan" />
                      <span>{role}</span>
                    </span>
                    {isOrganizer && (
                      <button
                        onClick={() => setStaffModalOpen(true)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-full flex items-center space-x-1.5 border border-white/15 transition-all"
                        title="Create Staff Account (Mentor/Judge/Sponsor)"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Staff</span>
                      </button>
                    )}
                  </div>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3 border-l border-white/10 pl-3">
                  <Link to="/dashboard/profile" className="flex items-center space-x-2 text-slate-200 hover:text-white group">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-semibold text-xs group-hover:scale-105 transition-transform">
                      {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white group-hover:text-cyan-300 transition-colors leading-tight">{user?.name}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-full transition-all"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-xs font-semibold text-slate-200 hover:text-white glass-button rounded-full transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-xs font-semibold glass-button-primary rounded-full transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          {isAuthenticated ? (
            <>
              <div className="py-2 border-b border-white/10 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-white/10 border border-white/20 text-accentCyan rounded-full capitalize">
                  {role}
                </span>
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2.5 px-3 py-2 rounded-xl text-sm text-slate-200 hover:bg-white/10"
                  >
                    <Icon className="w-4 h-4 text-accentCyan" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 text-rose-400 text-sm hover:bg-white/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold text-white glass-button rounded-full"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-xs font-semibold glass-button-primary rounded-full"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Staff Account Creation Modal for Organizers */}
      <Modal isOpen={staffModalOpen} onClose={() => setStaffModalOpen(false)} title="Create Staff Account">
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Create an official organizer, judge, mentor, or sponsor account.
          </p>

          {staffError && <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl">{staffError}</div>}
          {staffSuccess && <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl">{staffSuccess}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
              placeholder="Dr. Sarah Connor"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
              placeholder="judge@hackhub.ai"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Role</label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-black border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
            >
              <option value="judge">Judge</option>
              <option value="mentor">Mentor</option>
              <option value="organizer">Organizer</option>
              <option value="sponsor">Sponsor</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setStaffModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={staffLoading}
              className="px-5 py-2 text-xs font-semibold glass-button-primary rounded-xl disabled:opacity-50"
            >
              {staffLoading ? 'Creating...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
}

