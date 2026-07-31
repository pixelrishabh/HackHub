import React, { useState, useEffect } from 'react';
import { THEMES_CATALOG } from '../../config/themeData';
import { AVATAR_CATEGORIES, AVATARS_CATALOG } from '../../config/avatarData';
import { BANNER_PRESETS } from '../../config/bannerData';
import { FloatingGlassInput } from './FloatingGlassInput';
import { ImageCropModal } from './ImageCropModal';
import { ToastNotification } from './ToastNotification';
import { updateProfile } from '../../api/profile';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Briefcase,
  Globe,
  Code2,
  Palette,
  Camera,
  Image as ImageIcon,
  Lock,
  Bell,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Trophy,
  Zap,
  Check,
  X,
  Search,
  Heart,
  RotateCcw,
  LogOut,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export function EditProfileModal({
  isOpen,
  onClose,
  profileData = {},
  user: userProp,
  profile: profileProp,
  onSave,
  onProfileUpdated,
}) {
  const [activeSection, setActiveSection] = useState('personal');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    avatar: '',
    banner: '',
    location: '',
    university: '',
    phone: '',
    degree: '',
    branch: '',
    graduationYear: '',
    experience_level: 'Advanced',
    project_goal_text: '',
    theme: 'deep-black-diamond',
    accentColor: '#00E5FF',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    portfolioUrl: '',
    websiteUrl: '',
    skills: [],
    interests: [],
    techStack: [],
    languages: [],
    privacySettings: { visibility: 'public', showEmail: true, showPhone: false, showCollege: true, showSocials: true },
    notificationSettings: { email: true, push: true, hackathonAlerts: true, judgeUpdates: true, mentorNotifs: true },
    preferencesSettings: { language: 'English', timezone: 'UTC', dateFormat: 'MM/DD/YYYY', timeFormat: '12h', reducedMotion: false, highContrast: false },
    timezone: 'UTC',
  });

  const [initialData, setInitialData] = useState({});
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newTechInput, setNewTechInput] = useState('');

  // Avatar Search & Filter states
  const [avatarCategory, setAvatarCategory] = useState('All');
  const [avatarSearch, setAvatarSearch] = useState('');

  // Modals & UI States
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [toast, setToast] = useState(null);

  // Hydrate Profile Data
  useEffect(() => {
    if (isOpen) {
      const activeUser = profileData?.user || userProp || {};
      const activeProfile = profileData?.profile || profileProp || (profileData?.name || profileData?.bio ? profileData : {});

      const parsedSkills = Array.isArray(activeProfile.skills)
        ? activeProfile.skills
        : typeof activeProfile.skills === 'string'
        ? JSON.parse(activeProfile.skills || '[]')
        : ['React', 'Python', 'PyTorch', 'Node.js', 'TailwindCSS', 'TypeScript', 'Docker', 'LLMs'];

      const parsedTech = Array.isArray(activeProfile.techStack)
        ? activeProfile.techStack
        : typeof activeProfile.techStack === 'string'
        ? JSON.parse(activeProfile.techStack || '[]')
        : ['React', 'PyTorch', 'Node.js', 'FastAPI', 'Python'];

      const parsedLangs = Array.isArray(activeProfile.languages)
        ? activeProfile.languages
        : typeof activeProfile.languages === 'string'
        ? JSON.parse(activeProfile.languages || '[]')
        : ['English', 'Spanish'];

      const parsedPrivacy = typeof activeProfile.privacySettings === 'object'
        ? activeProfile.privacySettings
        : typeof activeProfile.privacySettings === 'string'
        ? JSON.parse(activeProfile.privacySettings || '{}')
        : { visibility: 'public', showEmail: true, showPhone: false, showCollege: true, showSocials: true };

      const parsedNotifs = typeof activeProfile.notificationSettings === 'object'
        ? activeProfile.notificationSettings
        : typeof activeProfile.notificationSettings === 'string'
        ? JSON.parse(activeProfile.notificationSettings || '{}')
        : { email: true, push: true, hackathonAlerts: true, judgeUpdates: true, mentorNotifs: true };

      const loaded = {
        name: activeUser.name !== undefined ? activeUser.name : '',
        username: activeProfile.username !== undefined ? activeProfile.username : (activeUser.name ? activeUser.name.toLowerCase().replace(/\s+/g, '_') : ''),
        bio: activeProfile.bio !== undefined ? activeProfile.bio : '',
        avatar: activeProfile.avatar !== undefined ? activeProfile.avatar : '',
        banner: activeProfile.banner !== undefined ? activeProfile.banner : '',
        location: activeProfile.location !== undefined ? activeProfile.location : '',
        university: activeProfile.university !== undefined ? activeProfile.university : '',
        phone: activeProfile.phone !== undefined ? activeProfile.phone : '',
        degree: activeProfile.degree !== undefined ? activeProfile.degree : '',
        branch: activeProfile.branch !== undefined ? activeProfile.branch : '',
        graduationYear: activeProfile.graduationYear !== undefined ? activeProfile.graduationYear : '',
        experience_level: activeProfile.experience_level !== undefined ? activeProfile.experience_level : 'Advanced',
        project_goal_text: activeProfile.project_goal_text !== undefined ? activeProfile.project_goal_text : '',
        theme: activeProfile.theme || 'deep-black-diamond',
        accentColor: activeProfile.accentColor || '#00E5FF',
        githubUrl: activeProfile.githubUrl !== undefined ? activeProfile.githubUrl : '',
        linkedinUrl: activeProfile.linkedinUrl !== undefined ? activeProfile.linkedinUrl : '',
        twitterUrl: activeProfile.twitterUrl !== undefined ? activeProfile.twitterUrl : '',
        portfolioUrl: activeProfile.portfolioUrl !== undefined ? activeProfile.portfolioUrl : '',
        websiteUrl: activeProfile.websiteUrl !== undefined ? activeProfile.websiteUrl : '',
        skills: parsedSkills,
        techStack: parsedTech,
        languages: parsedLangs,
        privacySettings: parsedPrivacy,
        notificationSettings: parsedNotifs,
        timezone: activeProfile.timezone || 'UTC',
      };

      setFormData(loaded);
      setInitialData(loaded);
      setValidationError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, child, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [child]: value },
    }));
  };

  const handleAddTag = (field, value, setInputFn) => {
    if (!value.trim()) return;
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
    setInputFn('');
  };

  const handleRemoveTag = (field, index) => {
    setFormData((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCropImageSrc(event.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCustomBannerUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({ ...prev, banner: event.target.result }));
        setToast({ type: 'info', title: 'Banner Uploaded', message: 'Custom cover banner set successfully.' });
        setTimeout(() => setToast(null), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const isValidUrl = (urlStr) => {
    if (!urlStr || !urlStr.trim()) return true;
    try {
      new URL(urlStr);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setValidationError('');
    onClose();
  };

  const handleReset = () => {
    setFormData(initialData);
    setValidationError('');
    setToast({ type: 'info', title: 'Profile Reset', message: 'Restored profile to last saved version.' });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDeleteAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: '',
    }));
    setToast({ type: 'info', title: 'Avatar Removed', message: 'Reset avatar identity.' });
    setTimeout(() => setToast(null), 2000);
  };

  const handleDeleteBanner = () => {
    setFormData((prev) => ({
      ...prev,
      banner: '',
    }));
    setToast({ type: 'info', title: 'Banner Removed', message: 'Reset cover banner.' });
    setTimeout(() => setToast(null), 2000);
  };

  const handleSaveProfile = async () => {
    setValidationError('');

    // Input Validation
    if (!formData.name.trim()) {
      setValidationError('Full Name cannot be empty.');
      return;
    }

    if (!formData.username.trim()) {
      setValidationError('Username cannot be empty.');
      return;
    }

    const invalidUrls = [];
    if (!isValidUrl(formData.githubUrl)) invalidUrls.push('GitHub URL');
    if (!isValidUrl(formData.linkedinUrl)) invalidUrls.push('LinkedIn URL');
    if (!isValidUrl(formData.twitterUrl)) invalidUrls.push('Twitter / X URL');
    if (!isValidUrl(formData.portfolioUrl)) invalidUrls.push('Portfolio URL');
    if (!isValidUrl(formData.websiteUrl)) invalidUrls.push('Website URL');

    if (invalidUrls.length > 0) {
      setValidationError(`Invalid URL format: ${invalidUrls.join(', ')}. Please include http:// or https://`);
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      let res;
      if (onSave) {
        res = await onSave(formData);
      } else {
        res = await updateProfile(formData);
      }

      const updatedProfileObj = res?.profile || formData;

      setSaveSuccess(true);
      setInitialData(formData);
      setToast({ type: 'success', title: 'AI OS Settings Saved!', message: 'Your identity and theme configuration updated instantly.' });

      if (onProfileUpdated) {
        onProfileUpdated(updatedProfileObj);
      }

      setTimeout(() => {
        setSaveSuccess(false);
        setToast(null);
        onClose();
      }, 1200);
    } catch (err) {
      setToast({ type: 'error', title: 'Save Failed', message: err.message || 'Could not update profile settings.' });
    } finally {
      setSaving(false);
    }
  };

  const currentTheme = THEMES_CATALOG.find((t) => t.id === formData.theme) || THEMES_CATALOG[0];

  const filteredAvatars = AVATARS_CATALOG.filter((av) => {
    const matchesCat = avatarCategory === 'All' || av.category === avatarCategory;
    const matchesQuery = av.name.toLowerCase().includes(avatarSearch.toLowerCase()) || av.category.toLowerCase().includes(avatarSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const sections = [
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'academic', label: 'Academic Information', icon: GraduationCap },
    { id: 'professional', label: 'Professional Info', icon: Briefcase },
    { id: 'social', label: 'Social & Web Links', icon: Globe },
    { id: 'skills', label: 'Skills & Tech Stack', icon: Code2 },
    { id: 'theme_center', label: 'Theme Center', icon: Palette, badge: 'Live Preview' },
    { id: 'avatar_center', label: 'Avatar Center', icon: Camera, badge: '80+ Avatars' },
    { id: 'banner_center', label: 'Banner Center', icon: ImageIcon },
    { id: 'privacy', label: 'Privacy Controls', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Sessions', icon: ShieldCheck },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="max-w-6xl w-full h-[88vh] rounded-[32px] bg-[#050505]/95 border border-white/20 backdrop-blur-3xl shadow-[0_0_80px_rgba(0,229,255,0.15)] flex flex-col md:flex-row overflow-hidden relative text-white"
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all shadow-lg backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= LEFT SIDEBAR (320px) ================= */}
        <div className="w-full md:w-80 flex-shrink-0 bg-black/60 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between overflow-y-auto scrollbar-none p-6 space-y-6">
          {/* Live Identity Header Card */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-xl">
              {/* Cover Banner Preview */}
              <div className="h-20 w-full overflow-hidden relative">
                <img src={formData.banner} alt="Banner" className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Avatar & Info Header */}
              <div className="p-4 pt-0 -mt-8 flex items-end space-x-3">
                <div className="relative">
                  <img src={formData.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-xl" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-white truncate">{formData.name}</h3>
                  <p className="text-[11px] text-cyan-300 font-mono font-medium truncate">@{formData.username}</p>
                </div>
              </div>

              {/* XP Level & Rank Badge */}
              <div className="p-3 border-t border-white/10 bg-white/5 space-y-2 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Grandmaster IV</span>
                  </span>
                  <span className="text-cyan-300 font-mono">LVL 14</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 w-[75%]" />
                </div>
              </div>
            </div>

            {/* Current Theme Live Mini Preview */}
            <div className="p-3.5 rounded-2xl border border-white/15 bg-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono uppercase text-[10px] font-bold">Active Theme</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-cyan-300 bg-cyan-500/20">
                  {currentTheme.name}
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <span className="w-4 h-4 rounded-full border border-white/40" style={{ backgroundColor: currentTheme.accentColor }} />
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ backgroundColor: currentTheme.accentColor, width: '80%' }} />
                </div>
              </div>
            </div>

            {/* Section Navigation Items */}
            <nav className="space-y-1">
              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30 scale-[1.02] font-black'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-cyan-300'}`} />
                      <span className="truncate">{sec.label}</span>
                    </div>

                    {sec.badge && (
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-black text-white' : 'bg-white/10 text-cyan-300'}`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Save & Cancel Action Bar */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            {validationError && (
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold rounded-xl flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full py-3 px-4 rounded-2xl bg-white text-black font-extrabold text-xs shadow-xl shadow-white/20 hover:scale-[1.02] transition-transform flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin text-black" />
                  <span>Saving Changes...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>Saved Successfully!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 text-[11px] font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANEL (SCROLLABLE CONTENT) ================= */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto space-y-8 scrollbar-thin scrollbar-thumb-white/20">
          {/* Header Section Title */}
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight capitalize text-glow">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize identity, live theme tokens, developer credentials, and security permissions.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/15 text-xs font-mono text-cyan-300 font-bold">
              AI OS Panel v2.4
            </span>
          </div>

          {/* SECTION 1: Personal Information */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatingGlassInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  icon={User}
                />
                <FloatingGlassInput
                  label="Username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  isMono
                />
              </div>

              <FloatingGlassInput
                label="Developer Bio & Vision"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                isTextArea
                rows={3}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <FloatingGlassInput
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  isMono
                />
                <FloatingGlassInput
                  label="Location"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
                <FloatingGlassInput
                  label="Timezone"
                  value={formData.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  isMono
                />
              </div>
            </div>
          )}

          {/* SECTION 2: Academic Information */}
          {activeSection === 'academic' && (
            <div className="space-y-6">
              <FloatingGlassInput
                label="University / Institution Name"
                value={formData.university}
                onChange={(e) => handleChange('university', e.target.value)}
                icon={GraduationCap}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <FloatingGlassInput
                  label="Degree (e.g. B.S., M.S.)"
                  value={formData.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                />
                <FloatingGlassInput
                  label="Branch / Major"
                  value={formData.branch}
                  onChange={(e) => handleChange('branch', e.target.value)}
                />
                <FloatingGlassInput
                  label="Graduation Year"
                  value={formData.graduationYear}
                  onChange={(e) => handleChange('graduationYear', e.target.value)}
                  isMono
                />
              </div>
            </div>
          )}

          {/* SECTION 3: Professional Information */}
          {activeSection === 'professional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatingGlassInput
                  label="Role / Title"
                  value={formData.experience_level}
                  onChange={(e) => handleChange('experience_level', e.target.value)}
                  icon={Briefcase}
                />
                <FloatingGlassInput
                  label="Primary Project Goal"
                  value={formData.project_goal_text}
                  onChange={(e) => handleChange('project_goal_text', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* SECTION 4: Social Links */}
          {activeSection === 'social' && (
            <div className="space-y-5">
              <FloatingGlassInput
                label="GitHub Profile URL"
                value={formData.githubUrl}
                onChange={(e) => handleChange('githubUrl', e.target.value)}
                isMono
                icon={Globe}
              />
              <FloatingGlassInput
                label="LinkedIn Profile URL"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                isMono
              />
              <FloatingGlassInput
                label="Twitter / X Profile URL"
                value={formData.twitterUrl}
                onChange={(e) => handleChange('twitterUrl', e.target.value)}
                isMono
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FloatingGlassInput
                  label="Portfolio URL"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                  isMono
                />
                <FloatingGlassInput
                  label="Website URL"
                  value={formData.websiteUrl}
                  onChange={(e) => handleChange('websiteUrl', e.target.value)}
                  isMono
                />
              </div>
            </div>
          )}

          {/* SECTION 5: Skills & Tech Stack */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="glass-panel p-5 rounded-2xl border border-white/15 bg-white/5 space-y-3">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">Technical Skills Tags</label>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold flex items-center space-x-1.5">
                      <span>{skill}</span>
                      <button onClick={() => handleRemoveTag('skills', sIdx)} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('skills', newSkillInput, setNewSkillInput))}
                    placeholder="Add skill tag..."
                    className="flex-1 px-3.5 py-2 bg-black/50 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none"
                  />
                  <button onClick={() => handleAddTag('skills', newSkillInput, setNewSkillInput)} className="px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-xl">
                    Add Tag
                  </button>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-white/15 bg-white/5 space-y-3">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">Preferred Tech Stack</label>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech, tIdx) => (
                    <span key={tIdx} className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-semibold flex items-center space-x-1.5">
                      <span>{tech}</span>
                      <button onClick={() => handleRemoveTag('techStack', tIdx)} className="hover:text-white"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={newTechInput}
                    onChange={(e) => setNewTechInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag('techStack', newTechInput, setNewTechInput))}
                    placeholder="Add tech stack..."
                    className="flex-1 px-3.5 py-2 bg-black/50 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none"
                  />
                  <button onClick={() => handleAddTag('techStack', newTechInput, setNewTechInput)} className="px-4 py-2 bg-white/10 text-white font-bold text-xs rounded-xl">
                    Add Stack
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: Theme Center (Interactive Live Gallery) */}
          {activeSection === 'theme_center' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Click any theme card below to instantly preview accent colors, button styles, cards, and graph chart tokens across the UI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEMES_CATALOG.map((theme) => {
                  const isSelected = formData.theme === theme.id;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => {
                        handleChange('theme', theme.id);
                        handleChange('accentColor', theme.accentColor);
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 space-y-3 group ${
                        isSelected
                          ? `${theme.border} shadow-2xl ${theme.glow} scale-[1.02] bg-white/10`
                          : 'border-white/10 hover:border-white/30 bg-black/40 hover:scale-101'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white tracking-tight">{theme.name}</span>
                        <span className="w-4 h-4 rounded-full border border-white/40 shadow" style={{ backgroundColor: theme.accentColor }} />
                      </div>

                      {/* Mini Live Preview Visualizer Card */}
                      <div className={`p-3 rounded-xl border ${theme.cardBg} space-y-2 text-[10px]`}>
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-300">Live Preview</span>
                          <span className={theme.textAccent}>Active Token</span>
                        </div>

                        {/* Chart Preview Bars */}
                        <div className="flex items-end space-x-1.5 h-8 pt-1">
                          {theme.chartBarHeights.map((h, bIdx) => (
                            <div
                              key={bIdx}
                              className="flex-1 rounded-t"
                              style={{ height: `${h}%`, backgroundColor: theme.chartColor }}
                            />
                          ))}
                        </div>

                        {/* Button Preview */}
                        <div className={`w-full py-1 text-center rounded font-bold text-[10px] ${theme.btnClass}`}>
                          Sample CTA Button
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 7: Avatar Center */}
          {activeSection === 'avatar_center' && (
            <div className="space-y-6">
              {/* Category Pills & Search */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={avatarSearch}
                    onChange={(e) => setAvatarSearch(e.target.value)}
                    placeholder="Search 80+ avatars by keyword..."
                    className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {AVATAR_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAvatarCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        avatarCategory === cat
                          ? 'bg-cyan-400 text-black font-bold shadow-md'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Avatars Catalog */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
                {filteredAvatars.map((av) => {
                  const isSelected = formData.avatar === av.url;

                  return (
                    <div
                      key={av.id}
                      onClick={() => handleChange('avatar', av.url)}
                      className={`relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all aspect-square ${
                        isSelected
                          ? 'border-cyan-400 shadow-xl shadow-cyan-500/40 scale-105'
                          : 'border-white/10 hover:border-white/40 hover:scale-102'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-1 bg-black/80 text-[8px] font-bold text-center text-white truncate">
                        {av.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Upload Trigger */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors">
                  Upload Custom Image
                  <input type="file" accept="image/*" onChange={handleCustomAvatarUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* SECTION 8: Banner Center */}
          {activeSection === 'banner_center' && (
            <div className="space-y-6">
              <FloatingGlassInput
                label="Custom Banner Image URL"
                value={formData.banner}
                onChange={(e) => handleChange('banner', e.target.value)}
                isMono
                icon={ImageIcon}
              />

              <div className="grid grid-cols-2 gap-4">
                {BANNER_PRESETS.map((b) => {
                  const isSelected = formData.banner === b.url;

                  return (
                    <div
                      key={b.id}
                      onClick={() => handleChange('banner', b.url)}
                      className={`relative h-28 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isSelected ? 'border-cyan-400 shadow-xl scale-[1.02]' : 'border-white/10 hover:border-white/40'
                      }`}
                    >
                      <img src={b.url} alt={b.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black via-black/70 to-transparent text-xs font-bold text-white flex items-center justify-between">
                        <span>{b.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Banner Upload Trigger */}
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <label className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <span>Upload Custom Banner Image</span>
                  <input type="file" accept="image/*" onChange={handleCustomBannerUpload} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* SECTION 9: Privacy Controls */}
          {activeSection === 'privacy' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Profile Visibility Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {['public', 'friends', 'private'].map((vis) => (
                    <button
                      key={vis}
                      onClick={() => handleNestedChange('privacySettings', 'visibility', vis)}
                      className={`py-3 px-4 rounded-xl text-xs font-bold capitalize transition-all ${
                        formData.privacySettings?.visibility === vis
                          ? 'bg-cyan-400 text-black shadow-lg'
                          : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/15'
                      }`}
                    >
                      {vis}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: Notifications */}
          {activeSection === 'notifications' && (
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications & Daily Digest' },
                { key: 'push', label: 'Browser Push Notifications' },
                { key: 'hackathonAlerts', label: 'Hackathon Deadline Alerts' },
                { key: 'judgeUpdates', label: 'Judge Scorecard Updates' },
                { key: 'mentorNotifs', label: 'AI Mentor Teammate Messages' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 text-xs">
                  <span className="text-slate-200 font-semibold">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={!!formData.notificationSettings?.[item.key]}
                    onChange={(e) => handleNestedChange('notificationSettings', item.key, e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* SECTION 11: Security */}
          {activeSection === 'security' && (
            <div className="space-y-4">
              <div className="glass-panel p-5 rounded-2xl border border-white/15 bg-white/5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Two-Factor Authentication (2FA)</span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 12: Danger Zone */}
          {activeSection === 'danger' && (
            <div className="p-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 space-y-4 text-xs">
              <h4 className="text-sm font-bold text-rose-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Account Safeguards & Danger Zone</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Deactivating your profile will hide your team applications and badges from public leaderboards.
              </p>
              <button
                type="button"
                onClick={() => setToast({ type: 'warning', title: 'Account Deactivation', message: 'Deactivation request submitted for review.' })}
                className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-200 font-bold transition-colors"
              >
                Deactivate Profile
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Sub-Modals */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={() => setCropModalOpen(false)}
        imageSrc={cropImageSrc}
        onCropComplete={(croppedUrl) => handleChange('avatar', croppedUrl)}
      />

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
