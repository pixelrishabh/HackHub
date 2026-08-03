import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { RoleGuard } from './components/RoleGuard';
import { Navbar } from './components/Navbar';
import { CustomSpotlight } from './components/CustomSpotlight';
import { HeroBackground } from './components/HeroBackground';
import { FloatingChatWidget } from './components/FloatingChatWidget';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { TeamMatchingPage } from './pages/TeamMatchingPage';
import { AIMentorPage } from './pages/AIMentorPage';
import { ProjectEvalPage } from './pages/ProjectEvalPage';
import { IdeaValidatorPage } from './pages/IdeaValidatorPage';
import { PlagiarismPage } from './pages/PlagiarismPage';
import { EngagementPage } from './pages/EngagementPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChatPage } from './pages/ChatPage';
import { SponsorDashboardPage } from './pages/SponsorDashboardPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { MarketplacePage } from './pages/MarketplacePage';

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
