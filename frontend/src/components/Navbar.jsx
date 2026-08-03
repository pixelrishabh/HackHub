import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { AVAILABLE_FIELDS } from '../config/fieldConfig';
import {
  Sparkles,
  Bot,
  User,
  MessageSquare,
  CheckSquare,
  FileCode,
  BarChart2,
  Award,
  Briefcase,
  Globe,
  LogOut,
  ChevronDown,
  Menu,
  X,
  UserPlus,
  Shield,
  Settings,
} from 'lucide-react';
import { Modal } from './Modal';

export function Navbar() {
  const { user, role, isAuthenticated, isStaff, isOrganizer, primaryField, setPrimaryField, logout, createStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [fieldMenuOpen, setFieldMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);

  const fieldMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Click outside listeners
  useEffect(() => {
    function handleClickOutside(event) {
      if (fieldMenuRef.current && !fieldMenuRef.current.contains(event.target)) {
        setFieldMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Staff creation form state
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'judge',
  });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [staffSuccess, setStaffSuccess] = useState(null);

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError(null);
    setStaffSuccess(null);
    try {
      await createStaff(staffForm);
      setStaffSuccess(`Successfully created ${staffForm.role} account!`);
      setStaffForm({ name: '', email: '', password: '', role: 'judge' });
    } catch (err) {
      setStaffError(err.message || 'Failed to create staff account.');
    } finally {
      setStaffLoading(false);
    }
  };

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Overview', icon: Sparkles },
        { path: '/dashboard/marketplace', label: 'Marketplace', icon: Globe },
        { path: '/dashboard/profile', label: 'AI Profile', icon: User },
        { path: '/dashboard/chat', label: 'Team Chat', icon: MessageSquare },
        { path: '/dashboard/mentor', label: 'AI Mentor', icon: Bot },
        { path: '/dashboard/evaluation', label: isStaff ? 'Evaluations' : 'Submission', icon: CheckSquare },
        { path: '/dashboard/idea-validator', label: 'Idea Validator', icon: FileCode },
        { path: '/dashboard/engagement', label: 'Leaderboard', icon: BarChart2 },
        { path: '/dashboard/certificates', label: 'Certs', icon: Award },
        ...(role === 'sponsor' || isStaff ? [{ path: '/dashboard/sponsor', label: 'Sponsors', icon: Briefcase }] : []),
      ]
    : [];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#000002]/80 backdrop-blur-2xl border-b border-[#5044D4]/30 shadow-[0_4px_30px_rgba(13,8,86,0.5)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-2">
            {/* Brand Logo */}
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group shrink-0">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#0D0856] via-[#221297] to-[#5044D4] border border-[#AAACF3]/40 flex items-center justify-center text-[#F5F8FE] shadow-lg shadow-[#5044D4]/30 group-hover:scale-105 transition-all duration-300">
                <Sparkles className="w-5 h-5 text-[#AAACF3] animate-pulse" />
                <div className="absolute inset-0 bg-[#5044D4]/30 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#F5F8FE] group-hover:text-[#AAACF3] transition-colors">
                  HACK<span className="text-[#5044D4] font-light">HUB</span>
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-widest text-[#AAACF3]/70 -mt-1">
                  AI Hackathon OS
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links - Futuristic Layout & Active Underline Glow */}
            {isAuthenticated && (
              <nav className="hidden xl:flex items-center space-x-1 bg-[#0D0856]/40 border border-[#5044D4]/40 rounded-full p-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(34,18,151,0.4)] overflow-x-auto scrollbar-none">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 shrink-0 ${
                        isActive
                          ? 'text-[#F5F8FE] font-bold'
                          : 'text-[#AAACF3]/70 hover:text-[#F5F8FE] hover:scale-105'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="navbarActiveTab"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-[#221297] via-[#5044D4] to-[#221297] border border-[#AAACF3]/60 shadow-[0_0_15px_rgba(80,68,212,0.6)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#F5F8FE]' : 'text-[#AAACF3]/80'}`} />
                        <span className="whitespace-nowrap">{link.label}</span>
                      </span>
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Compact Nav for Laptop (1024px to 1280px) */}
            {isAuthenticated && (
              <nav className="hidden lg:flex xl:hidden items-center space-x-1 bg-[#0D0856]/40 border border-[#5044D4]/40 rounded-full p-1 backdrop-blur-xl max-w-[520px] overflow-x-auto scrollbar-none">
                {navLinks.slice(0, 5).map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 shrink-0 ${
                        isActive
                          ? 'bg-[#5044D4] text-[#F5F8FE] font-bold shadow-md shadow-[#5044D4]/40'
                          : 'text-[#AAACF3]/80 hover:text-[#F5F8FE] hover:bg-[#221297]/40'
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
            <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Track Theme Switcher */}
                  {!isStaff && (
                    <div className="relative" ref={fieldMenuRef}>
                      <button
                        onClick={() => setFieldMenuOpen(!fieldMenuOpen)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0D0856]/50 text-[#F5F8FE] text-xs font-semibold rounded-full border border-[#5044D4]/40 hover:border-[#AAACF3] transition-all"
                        title="Switch Track Theme"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#AAACF3] animate-pulse" />
                        <span className="truncate max-w-[90px]">Field: {primaryField}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#AAACF3] transition-transform duration-200 ${fieldMenuOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {fieldMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#000002]/95 backdrop-blur-2xl rounded-2xl p-2 z-50 border border-[#5044D4]/40 shadow-2xl shadow-[#221297]/50">
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#AAACF3]">
                            Primary Track Theme
                          </div>
                          {AVAILABLE_FIELDS.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => {
                                setPrimaryField(f.id);
                                setFieldMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                                primaryField === f.id
                                  ? 'font-bold text-[#F5F8FE] bg-[#5044D4]/30 border border-[#AAACF3]/40'
                                  : 'text-[#AAACF3]/80 hover:bg-[#221297]/30'
                              }`}
                            >
                              <span>{f.name}</span>
                              {primaryField === f.id && <span className="text-[#AAACF3]">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Organizer Add Staff Button */}
                  {isOrganizer && (
                    <button
                      onClick={() => setStaffModalOpen(true)}
                      className="px-3 py-1.5 bg-[#221297]/60 hover:bg-[#5044D4] border border-[#AAACF3]/40 text-[#F5F8FE] text-xs font-semibold rounded-full transition-all flex items-center space-x-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#AAACF3]" />
                      <span>+ Staff</span>
                    </button>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center space-x-2 p-1 pl-2.5 rounded-full bg-[#0D0856]/40 border border-[#5044D4]/40 hover:border-[#AAACF3] transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#5044D4] text-[#F5F8FE] text-xs font-bold flex items-center justify-center">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="text-xs font-semibold text-[#F5F8FE] max-w-[80px] truncate">
                        {user?.name ? user.name.split(' ')[0] : 'Account'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#AAACF3]" />
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#000002]/95 backdrop-blur-2xl rounded-2xl p-2 z-50 border border-[#5044D4]/40 shadow-2xl shadow-[#221297]/50 space-y-1">
                        <div className="px-3 py-2 border-b border-[#5044D4]/30">
                          <div className="text-xs font-bold text-[#F5F8FE] truncate">{user?.name}</div>
                          <div className="text-[10px] text-[#AAACF3]/70 truncate">{user?.email}</div>
                          <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#5044D4]/30 border border-[#AAACF3]/30 text-[10px] font-bold text-[#AAACF3] uppercase">
                            {role}
                          </div>
                        </div>

                        <Link
                          to="/dashboard/profile"
                          onClick={() => setProfileMenuOpen(false)}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-[#F5F8FE] hover:bg-[#221297]/40 flex items-center space-x-2"
                        >
                          <User className="w-3.5 h-3.5 text-[#AAACF3]" />
                          <span>View AI Profile</span>
                        </Link>

                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-semibold text-[#F5F8FE] hover:text-[#AAACF3] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-[#221297] to-[#5044D4] border border-[#AAACF3]/40 text-[#F5F8FE] text-xs font-bold shadow-lg shadow-[#5044D4]/30 hover:scale-105 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className="flex xl:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-[#0D0856]/50 border border-[#5044D4]/40 text-[#F5F8FE] hover:text-[#AAACF3]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* BLOCK B BUG FIX: Slide-Over Mobile Drawer Overlay sitting safely above navbar with Backdrop Scrim */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end xl:hidden">
            {/* Backdrop Scrim */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Slide-in Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] h-full bg-[#000002] border-l border-[#5044D4]/40 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#5044D4]/30 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-[#5044D4] flex items-center justify-center text-[#F5F8FE] font-bold">
                      H
                    </div>
                    <span className="font-extrabold text-[#F5F8FE]">HackHub Navigation</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-[#0D0856] text-[#AAACF3] hover:text-[#F5F8FE]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {isAuthenticated ? (
                  <>
                    <div className="p-3.5 rounded-2xl bg-[#0D0856]/40 border border-[#5044D4]/30 space-y-1">
                      <div className="text-xs font-bold text-[#F5F8FE]">{user?.name}</div>
                      <div className="text-[10px] text-[#AAACF3]/80">{user?.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#5044D4]/40 text-[#AAACF3] text-[10px] font-bold uppercase">
                        {role}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = location.pathname === link.path;
                        return (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-[#5044D4] text-[#F5F8FE] font-bold shadow-lg shadow-[#5044D4]/30'
                                : 'text-[#AAACF3]/80 hover:bg-[#221297]/30 hover:text-[#F5F8FE]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{link.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center text-xs font-bold text-[#F5F8FE] bg-[#0D0856] border border-[#5044D4]/40 rounded-xl"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center text-xs font-bold text-[#F5F8FE] bg-[#5044D4] rounded-xl shadow-lg"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {isAuthenticated && (
                <div className="pt-6 border-t border-[#5044D4]/30">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Staff Modal */}
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
              className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
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
              className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
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
              className="w-full px-3.5 py-2 text-sm bg-white/5 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Role</label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
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
    </>
  );
}
