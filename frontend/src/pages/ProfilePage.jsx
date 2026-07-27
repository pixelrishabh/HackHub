import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Calendar, Shield, Flame, Award, Globe, 
  LogOut, Edit3, CheckCircle2, Sparkles, Clock, Target, 
  Code, AlertCircle, X, ChevronRight 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { checkInUser, updateProfile } from '../api/auth';
import { Badge } from '../components/Badge';

export default function ProfilePage() {
  const { user, logout, updateUserSession } = useAuth();
  const { language, changeLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [loadingCheckIn, setLoadingCheckIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  // Edit form state
  const profile = user?.profile || {};
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    avatar_url: profile.avatar_url || '',
    skills: (() => {
      try {
        return Array.isArray(profile.skills) ? profile.skills.join(', ') : (JSON.parse(profile.skills || '[]').join(', '));
      } catch (e) {
        return '';
      }
    })(),
    experience_level: profile.experience_level || 'Intermediate',
    timezone: profile.timezone || 'UTC',
    project_goal_text: profile.project_goal_text || '',
  });

  const joinDate = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
    : 'July 2026';

  const checkInCount = profile.check_in_count || 0;
  const streakCount = profile.check_in_streak || 0;
  const isCheckedInToday = !!user?.is_checked_in_today;

  // Unlocked badges list
  let unlockedBadges = [];
  try {
    unlockedBadges = typeof profile.badges === 'string' ? JSON.parse(profile.badges || '[]') : (profile.badges || []);
  } catch (e) {
    unlockedBadges = [];
  }

  const allBadges = [
    { id: 'First Step', title: 'First Step', desc: 'Completed 1st Daily Check-in', icon: '🎖️' },
    { id: 'Streak Master', title: 'Streak Master', desc: 'Maintained 3+ Day Check-in Streak', icon: '🔥' },
    { id: 'Hackathon Veteran', title: 'Hackathon Veteran', desc: 'Completed 5+ Total Check-ins', icon: '🏆' },
    { id: 'Legendary', title: 'Legendary', desc: 'Achieved 7+ Day Check-in Streak', icon: '👑' },
  ];

  // Daily Check-in Handler
  const handleCheckIn = async () => {
    if (isCheckedInToday || loadingCheckIn) return;
    setLoadingCheckIn(true);
    setCheckInMessage(null);

    try {
      const res = await checkInUser();
      if (res.user) {
        updateUserSession(res.user);
        setCheckInMessage({
          type: res.already_checked_in ? 'warning' : 'success',
          text: res.message || t('profile_already_checked_in'),
        });
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setCheckInMessage({
        type: 'error',
        text: err.message || 'Check-in failed. Please try again.',
      });
    } finally {
      setLoadingCheckIn(false);
    }
  };

  // Profile Edit Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true);

    try {
      const skillsArray = editForm.skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await updateProfile({
        name: editForm.name,
        avatar_url: editForm.avatar_url,
        skills: skillsArray,
        experience_level: editForm.experience_level,
        timezone: editForm.timezone,
        project_goal_text: editForm.project_goal_text,
      });

      if (res.user) {
        updateUserSession(res.user);
        setShowEditModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'H';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner & User Summary */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-primary-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 text-center md:text-left">
          
          {/* Avatar / Profile Picture */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-primary-500 to-emerald-400 p-1 shadow-lg">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={user?.name} 
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : null}
              {(!profile.avatar_url) && (
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-3xl font-extrabold text-white tracking-wider">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="absolute -bottom-2 -right-2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-transform hover:scale-105"
              title={t('profile_edit_button')}
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 justify-center md:justify-start">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{user?.name}</h1>
              <Badge variant="primary" className="self-center md:self-auto capitalize px-3 py-1 text-xs">
                <Shield className="w-3.5 h-3.5 inline mr-1" />
                {user?.role}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs sm:text-sm text-slate-300">
              <span className="inline-flex items-center space-x-1.5">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>{user?.email}</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>{t('profile_member_since')}: {joinDate}</span>
              </span>
              <span className="inline-flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{profile.timezone || 'UTC'}</span>
              </span>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-colors inline-flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>{t('profile_edit_button')}</span>
              </button>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-colors inline-flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('profile_logout_button')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Check-in, Stats, Language, Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Column 1 & 2: Check-in & Badges */}
        <div className="md:col-span-2 space-y-6">

          {/* Daily Check-in Box */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  <span>Daily Hackathon Check-in</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check in once per calendar day to build your streak and earn engagement points (+5 pts).
                </p>
              </div>

              <button
                onClick={handleCheckIn}
                disabled={isCheckedInToday || loadingCheckIn}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isCheckedInToday
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                    : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-primary-500/20 active:scale-95'
                }`}
              >
                {isCheckedInToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{t('profile_checked_in_button')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin-slow" />
                    <span>{loadingCheckIn ? 'Checking in...' : t('profile_checkin_button')}</span>
                  </>
                )}
              </button>
            </div>

            {/* Notification alert */}
            {checkInMessage && (
              <div className={`mt-4 p-3 rounded-xl text-xs sm:text-sm font-medium flex items-center space-x-2 ${
                checkInMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                checkInMessage.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {checkInMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />}
                <span>{checkInMessage.text}</span>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-surface rounded-xl p-4 border border-slate-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 block leading-tight">{checkInCount}</span>
                  <span className="text-xs text-slate-500 font-medium">{t('profile_total_checkins')}</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl p-4 border border-slate-100 flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Flame className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-2xl font-extrabold text-slate-900 block leading-tight">
                    {streakCount} <span className="text-xs font-normal text-slate-500">{t('profile_days')}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{t('profile_streak')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Badges & Achievements Grid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>{t('profile_badges')}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allBadges.map((badge) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border transition-all flex items-center space-x-3.5 ${
                      isUnlocked 
                        ? 'bg-amber-50/60 border-amber-200 text-slate-900 shadow-sm' 
                        : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-60'
                    }`}
                  >
                    <div className="text-2xl p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                      {badge.icon}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{badge.title}</span>
                        {isUnlocked && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                            Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{badge.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Column 3: Language Selector & Settings */}
        <div className="space-y-6">

          {/* Language Switcher Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-primary-500" />
              <span>{t('profile_language')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              Select your preferred language. Changes take effect immediately.
            </p>

            <div className="space-y-2 pt-2">
              {[
                { code: 'en', label: 'English', flag: '🇺🇸' },
                { code: 'es', label: 'Español', flag: '🇪🇸' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${
                    language === lang.code
                      ? 'bg-primary-50 border-primary-300 text-primary-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center space-x-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {language === lang.code && <CheckCircle2 className="w-4 h-4 text-primary-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Profile Quick Info */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <span>Hackathon Profile</span>
            </h3>

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">{t('profile_experience')}</span>
                <span className="font-semibold text-slate-800">{profile.experience_level || 'Intermediate'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">{t('profile_skills')}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(() => {
                    try {
                      const parsed = typeof profile.skills === 'string' ? JSON.parse(profile.skills || '[]') : profile.skills;
                      return Array.isArray(parsed) && parsed.length > 0
                        ? parsed.map((s, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium">
                              {s}
                            </span>
                          ))
                        : <span className="text-slate-400 italic">None specified</span>;
                    } catch (e) {
                      return <span className="text-slate-400 italic">None specified</span>;
                    }
                  })()}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">{t('profile_goal')}</span>
                <p className="text-slate-700 font-medium italic mt-0.5">
                  "{profile.project_goal_text || 'Build a winning AI-powered application.'}"
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{t('profile_edit_button')}</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Avatar Image URL (Optional)</label>
                <input
                  type="url"
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Skills (comma separated)</label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="React, Node.js, Python, Tailwind"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    value={editForm.experience_level}
                    onChange={(e) => setEditForm({ ...editForm, experience_level: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
                    value={editForm.timezone}
                    onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Goal</label>
                <textarea
                  rows="2"
                  value={editForm.project_goal_text}
                  onChange={(e) => setEditForm({ ...editForm, project_goal_text: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2 text-xs font-bold bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-md transition-colors"
                >
                  {editLoading ? 'Saving...' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-slate-100">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{t('logout_confirm_title')}</h3>
            <p className="text-xs text-slate-500">{t('logout_confirm_message')}</p>
            
            <div className="pt-2 flex items-center space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md"
              >
                {t('nav_logout')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
