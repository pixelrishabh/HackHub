import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, updateProfile, getContributions, getStreak, getActivity } from '../api/profile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ContributionHeatmap } from '../components/profile/ContributionHeatmap';
import { StreakSection } from '../components/profile/StreakSection';
import { DeveloperJourneySection } from '../components/profile/DeveloperJourneySection';
import { ProfileStatsGrid } from '../components/profile/ProfileStatsGrid';
import { AchievementsShowcase } from '../components/profile/AchievementsShowcase';
import { SkillsSection } from '../components/profile/SkillsSection';
import { AIPerformanceSection } from '../components/profile/AIPerformanceSection';
import { RecentProjectsGrid } from '../components/profile/RecentProjectsGrid';
import { ActivityTimeline } from '../components/profile/ActivityTimeline';
import { SocialLinksSection } from '../components/profile/SocialLinksSection';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ShareProfileModal } from '../components/profile/ShareProfileModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

export function ProfilePage() {
  const { user: currentUser, updateUser } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [contributionsData, setContributionsData] = useState({});
  const [contributionsSummary, setContributionsSummary] = useState({});
  const [streakData, setStreakData] = useState({});
  const [activitiesData, setActivitiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const loadProfileDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [profRes, contribRes, streakRes, actRes] = await Promise.all([
        getProfile().catch((e) => ({ error: e.message })),
        getContributions().catch((e) => ({ contributions: {}, summary: {} })),
        getStreak().catch((e) => ({ streak: {} })),
        getActivity().catch((e) => ({ activities: [] })),
      ]);

      if (profRes.user) {
        setProfileData(profRes);
      }
      if (contribRes.contributions) {
        setContributionsData(contribRes.contributions);
        setContributionsSummary(contribRes.summary || {});
      }
      if (streakRes.streak) {
        setStreakData(streakRes.streak);
      }
      if (actRes.activities) {
        setActivitiesData(actRes.activities);
      }
    } catch (err) {
      console.error('[ProfilePage] Hydration Error:', err);
      setError('Could not load developer profile data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileDetails();
  }, [loadProfileDetails]);

  const handleSaveProfile = async (updatedFields) => {
    const res = await updateProfile(updatedFields);
    if (res.user && updateUser) {
      updateUser({ ...res.user, profile: res.profile || res.user.profile });
    }
    await loadProfileDetails();
    return res;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner />
        <p className="text-xs font-mono text-cyan-300 tracking-wider animate-pulse">
          HYDRATING AI DEVELOPER IDENTITY DASHBOARD...
        </p>
      </div>
    );
  }

  const targetUser = profileData?.user || currentUser;
  const profile = profileData?.profile || {};
  const stats = profileData?.stats || {};
  const badges = profileData?.badges || [];
  const projects = profileData?.projects || [];
  const streak = profileData?.streak || streakData || {};

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
      {/* Enterprise Subtle Moving Light Streaks & Ambient Fog */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-zinc-950/60 to-black pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-zinc-800/[0.03] rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 relative z-10">
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center space-x-3 backdrop-blur-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Header Hero Card */}
        <ProfileHeader
          user={targetUser}
          profile={profile}
          stats={stats}
          isOwnProfile={true}
          onOpenEdit={() => setEditModalOpen(true)}
          onOpenShare={() => setShareModalOpen(true)}
        />

        {/* 2. Streak & Goal Tracker */}
        <StreakSection streak={streak} />

        {/* 2.5. Developer Journey (Cinematic Milestone Tracker) */}
        <DeveloperJourneySection profile={profile} user={targetUser} stats={stats} />

        {/* 3. 365-Day Contribution Heatmap */}
        <ContributionHeatmap
          contributions={contributionsData}
          summary={contributionsSummary}
        />

        {/* 4. Profile Stats 9 Grid */}
        <ProfileStatsGrid stats={stats} />

        {/* 5. Verified Achievements & Badges */}
        <AchievementsShowcase badges={badges} />

        {/* 6. Technical Skills & Track Progress */}
        <SkillsSection skills={profile.skills} />

        {/* 7. AI Performance Radar & Hackathon History */}
        <AIPerformanceSection stats={stats} />

        {/* 8. Recent Glass Projects */}
        <RecentProjectsGrid projects={projects} />

        {/* 9. GitHub Style Activity Feed Timeline */}
        <ActivityTimeline activities={activitiesData} />

        {/* 10. Social Links & Verified Channels */}
        <SocialLinksSection profile={profile} user={targetUser} />

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={targetUser}
          profile={profile}
          onSave={handleSaveProfile}
        />

        {/* Share Profile Modal */}
        <ShareProfileModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          user={targetUser}
          profile={profile}
          stats={stats}
        />
      </div>
    </div>
  );
}
