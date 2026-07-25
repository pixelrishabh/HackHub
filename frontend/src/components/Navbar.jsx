import React, { useState } from 'react';
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
  UserPlus
} from 'lucide-react';
import { Modal } from './Modal';

export function Navbar() {
  const { user, role, isAuthenticated, isStaff, isOrganizer, primaryField, setPrimaryField, logout, createStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [fieldMenuOpen, setFieldMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);

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
        ...(isStaff ? [{ path: '/dashboard/team-matching', label: 'AI Team Matcher', icon: Users }] : []),
        { path: '/dashboard/mentor', label: 'AI Mentor', icon: Bot },
        { path: '/dashboard/evaluation', label: isStaff ? 'Evaluations' : 'My Submission', icon: CheckSquare },
        { path: '/dashboard/idea-validator', label: 'Idea Validator', icon: FileCode },
        ...(isStaff ? [{ path: '/dashboard/plagiarism', label: 'Plagiarism Radar', icon: ShieldCheck }] : []),
        ...(isStaff ? [{ path: '/dashboard/engagement', label: 'Engagement', icon: BarChart2 }] : []),
      ]
    : [];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-primary-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Hack<span className="text-primary-500">Hub</span>
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                Hackathon Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
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
                  <div className="relative">
                    <button
                      onClick={() => setFieldMenuOpen(!fieldMenuOpen)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg border border-primary-200 hover:bg-primary-100/70 transition-colors"
                      title="Switch Primary Field Theme"
                    >
                      <span className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse"></span>
                      <span>Field: {primaryField}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>

                    {fieldMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-fade-in">
                        <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Primary Track Theme
                        </div>
                        {AVAILABLE_FIELDS.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => {
                              setPrimaryField(f.id);
                              setFieldMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-primary-50 hover:text-primary-700 ${
                              primaryField === f.id ? 'font-bold text-primary-600 bg-primary-50/50' : 'text-slate-700'
                            }`}
                          >
                            <span>{f.name}</span>
                            {primaryField === f.id && <span className="text-secondary-500 font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Staff Role Badge & Organizer Actions */}
                {isStaff && (
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase rounded-md flex items-center space-x-1">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>{role}</span>
                    </span>
                    {isOrganizer && (
                      <button
                        onClick={() => setStaffModalOpen(true)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                        title="Create Staff Account (Mentor/Judge/Sponsor)"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>+ Add Staff</span>
                      </button>
                    )}
                  </div>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
                  <div className="flex items-center space-x-2 text-slate-700">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                      {user?.name?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</span>
                      <span className="text-[10px] text-slate-400 leading-tight">{user?.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg shadow-sm transition-colors"
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
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="py-2 border-b border-slate-100 mb-2 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800">{user?.name}</div>
                  <div className="text-xs text-slate-400">{user?.email}</div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-primary-50 text-primary-700 rounded capitalize">
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
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icon className="w-4 h-4 text-primary-500" />
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
                className="w-full text-left flex items-center space-x-2 px-3 py-2 text-rose-600 text-sm hover:bg-rose-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium bg-primary-500 text-white rounded-lg"
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
          <p className="text-xs text-slate-500">
            Create an official organizer, judge, mentor, or sponsor account.
          </p>

          {staffError && <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{staffError}</div>}
          {staffSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg">{staffSuccess}</div>}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Dr. Sarah Connor"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="judge@hackhub.ai"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Role</label>
            <select
              value={staffForm.role}
              onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={staffLoading}
              className="px-4 py-2 text-xs font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg disabled:opacity-50"
            >
              {staffLoading ? 'Creating...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
}
