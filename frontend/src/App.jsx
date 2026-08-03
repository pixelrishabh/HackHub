import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard } from './components/RoleGuard';
import { Navbar } from './components/Navbar';
import { CustomSpotlight } from './components/CustomSpotlight';
import { HeroBackground } from './components/HeroBackground';
import { FloatingChatWidget } from './components/FloatingChatWidget';
import { LoadingSpinner } from './components/LoadingSpinner';

// Block C WPO: Route-level Code Splitting with React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const TeamMatchingPage = lazy(() => import('./pages/TeamMatchingPage').then(m => ({ default: m.TeamMatchingPage })));
const AIMentorPage = lazy(() => import('./pages/AIMentorPage').then(m => ({ default: m.AIMentorPage })));
const ProjectEvalPage = lazy(() => import('./pages/ProjectEvalPage').then(m => ({ default: m.ProjectEvalPage })));
const IdeaValidatorPage = lazy(() => import('./pages/IdeaValidatorPage').then(m => ({ default: m.IdeaValidatorPage })));
const PlagiarismPage = lazy(() => import('./pages/PlagiarismPage').then(m => ({ default: m.PlagiarismPage })));
const EngagementPage = lazy(() => import('./pages/EngagementPage').then(m => ({ default: m.EngagementPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then(m => ({ default: m.ChatPage })));
const SponsorDashboardPage = lazy(() => import('./pages/SponsorDashboardPage').then(m => ({ default: m.SponsorDashboardPage })));
const CertificatesPage = lazy(() => import('./pages/CertificatesPage').then(m => ({ default: m.CertificatesPage })));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage').then(m => ({ default: m.MarketplacePage })));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full flex-1 flex flex-col"
      >
        <Suspense fallback={<LoadingSpinner label="Loading page module..." size="lg" />}>
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <DashboardPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/marketplace"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <MarketplacePage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/profile"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <ProfilePage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/chat"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <ChatPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/team-matching"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <TeamMatchingPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/mentor"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <AIMentorPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/evaluation"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <ProjectEvalPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/idea-validator"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <IdeaValidatorPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/plagiarism"
              element={
                <RoleGuard allowedRoles={['organizer', 'judge']}>
                  <PlagiarismPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/engagement"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <EngagementPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/analytics"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <AnalyticsPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/sponsor"
              element={
                <RoleGuard allowedRoles={['sponsor', 'organizer', 'judge', 'mentor']}>
                  <SponsorDashboardPage />
                </RoleGuard>
              }
            />

            <Route
              path="/dashboard/certificates"
              element={
                <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                  <CertificatesPage />
                </RoleGuard>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="relative min-h-screen flex flex-col bg-[#050505] text-white font-sans overflow-x-hidden">
          <HeroBackground />
          <CustomSpotlight>
            <Navbar />
            <main className="flex-1 flex flex-col relative z-10">
              <AnimatedRoutes />
            </main>
          </CustomSpotlight>
          <FloatingChatWidget />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
