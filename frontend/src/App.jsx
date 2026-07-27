import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { RoleGuard } from './components/RoleGuard';
import { Navbar } from './components/Navbar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamMatchingPage } from './pages/TeamMatchingPage';
import { AIMentorPage } from './pages/AIMentorPage';
import { ProjectEvalPage } from './pages/ProjectEvalPage';
import { IdeaValidatorPage } from './pages/IdeaValidatorPage';
import { PlagiarismPage } from './pages/PlagiarismPage';
import { EngagementPage } from './pages/EngagementPage';
import { BrowseTeamsPage } from './pages/BrowseTeamsPage';
import { CreateTeamPage } from './pages/CreateTeamPage';
import { MyTeamPage } from './pages/MyTeamPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-surface text-slate-800 font-sans">
            <Navbar />
            <main className="flex-1">
              <Routes>
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
                path="/dashboard/team-matching"
                element={
                  <RoleGuard allowedRoles={['organizer', 'judge']}>
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
                  <RoleGuard allowedRoles={['organizer', 'judge', 'mentor']}>
                    <EngagementPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/teams/browse"
                element={
                  <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                    <BrowseTeamsPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/teams/create"
                element={
                  <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                    <CreateTeamPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/teams/my-team"
                element={
                  <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                    <MyTeamPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/profile"
                element={
                  <RoleGuard allowedRoles={['participant', 'organizer', 'judge', 'mentor', 'sponsor']}>
                    <ProfilePage />
                  </RoleGuard>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  </AuthProvider>
);
}
