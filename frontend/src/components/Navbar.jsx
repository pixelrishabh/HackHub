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
  Briefcase,
  Settings,
  Globe,
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
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/60 border-b border-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5 group shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-xl shadow-white/10 group-hover:scale-105 group-hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                HACK<span className="text-cyan-400 font-light">HUB</span>
              </span>
              <span className="text-[8px] sm:text-[9px] uppercase font-semibold tracking-widest text-slate-400 -mt-1">
                AI Hackathon OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Responsive scaling & scroll for smaller desktops */}
          {isAuthenticated && (
            <nav className="hidden xl:flex items-center space-x-1 bg-white/5 border border-white/12 rounded-full p-1.5 backdrop-blur-xl shadow-2xl overflow-x-auto scrollbar-none">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-cyan-400/80'}`} />
                    <span className="whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Compact Nav for Large Laptop (1024px to 1280px) */}
          {isAuthenticated && (
            <nav className="hidden lg:flex xl:hidden items-center space-x-1 bg-white/5 border border-white/12 rounded-full p-1 backdrop-blur-xl max-w-[500px] overflow-x-auto scrollbar-none">
              {navLinks.slice(0, 5).map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 shrink-0 ${
                      isActive
                        ? 'bg-cyan-500 text-white font-bold shadow-md shadow-cyan-500/30'
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
          <div className="hidden lg:flex items-center space-x-2.5 shrink-0">
            {isAuthenticated ? (
              <>
                {/* Field Switcher Dropdown */}
                {!isStaff && (
                  <div className="relative" ref={fieldMenuRef}>
                    <button
                      onClick={() => setFieldMenuOpen(!fieldMenuOpen)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/5 text-slate-200 text-xs font-semibold rounded-full border border-white/15 hover:bg-white/10 hover:border-cyan-400/40 transition-all"
                      title="Switch Primary Track Field"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="truncate max-w-[90px]">Field: {primaryField}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${fieldMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {fieldMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/15 shadow-2xl shadow-cyan-500/10">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400">
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
                              primaryField === f.id ? 'font-bold text-white bg-cyan-500/20 border border-cyan-500/30' : 'text-slate-300 hover:bg-white/10'
                            }`}
                          >
                            <span>{f.name}</span>
                            {primaryField === f.id && <span className="text-cyan-400 font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Role Badge & Organizer Actions */}
                {isStaff && (
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase rounded-full flex items-center space-x-1.5 backdrop-blur-md">
                      <Shield className="w-3 h-3 text-cyan-400" />
                      <span>{role}</span>
                    </span>
                    {isOrganizer && (
                      <button
                        onClick={() => setStaffModalOpen(true)}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-white text-xs font-semibold rounded-full flex items-center space-x-1 border border-cyan-500/30 transition-all shadow-lg shadow-cyan-500/10"
                        title="Create Staff Account (Mentor/Judge/Sponsor)"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
                        <span>+ Staff</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Interactive Profile Dropdown Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/40 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border border-white/30 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {user?.name?.charAt(0) || <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-semibold text-white max-w-[90px] truncate">{user?.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 backdrop-blur-2xl rounded-2xl p-2.5 z-50 border border-white/15 shadow-2xl shadow-cyan-500/10 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                        <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                        <div className="inline-block mt-1 px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-semibold uppercase rounded-md">
                          Role: {role}
                        </div>
                      </div>

                      <Link
                        to="/dashboard/profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-cyan-400" />
                        <span>AI Developer Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center space-x-2 px-3 py-2 text-rose-400 text-xs hover:bg-rose-500/10 rounded-xl transition-colors mt-1 border-t border-white/10"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
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

          {/* Mobile & Tablet Hamburger Trigger (<= 1024px) */}
          <div className="lg:hidden flex items-center space-x-2">
            {isAuthenticated && (
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                {user?.name?.charAt(0) || <User className="w-4 h-4" />}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-cyan-400" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {isAuthenticated ? (
            <>
              <div className="py-2.5 border-b border-white/10 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-full capitalize">
                  {role}
                </span>
              </div>

              {!isStaff && (
                <div className="mb-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Primary Field Theme
                  </label>
                  <select
                    value={primaryField}
                    onChange={(e) => setPrimaryField(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-900 border border-white/15 text-white rounded-xl focus:border-cyan-400 focus:outline-none"
                  >
                    {AVAILABLE_FIELDS.map((f) => (
                      <option key={f.id} value={f.id}>
                        Field: {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 text-white font-bold border border-cyan-500/40'
                          : 'text-slate-200 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left flex items-center space-x-2 px-3.5 py-2.5 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
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
    </header>
  );
}
