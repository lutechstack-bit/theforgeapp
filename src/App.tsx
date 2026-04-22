import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminTestingProvider } from "@/contexts/AdminTestingContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { UserDataRecovery } from "@/components/shared/UserDataRecovery";
import { useEffect, useRef, useState, useCallback, lazy, Suspense } from "react";

// Pages — code-split. Auth is the only eager page because it's the
// unauthenticated gate and must paint without a Suspense fallback.
// Everything else loads on demand so the initial JS bundle doesn't
// include all 60 pages (including every admin screen) for every user.
import Auth from "./pages/Auth";
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Welcome = lazy(() => import("./pages/Welcome"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const Home = lazy(() => import("./pages/Home"));
const Community = lazy(() => import("./pages/Community"));
const Learn = lazy(() => import("./pages/Learn"));
const AllCourses = lazy(() => import("./pages/AllCourses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Events = lazy(() => import("./pages/Events"));
const RoadmapLayout = lazy(() => import("./components/roadmap/RoadmapLayout"));
// Roadmap sub-pages come from a barrel; keep them on one chunk since the
// user typically navigates between them within a single session.
const RoadmapJourney = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapJourney })));
const RoadmapTasks = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapTasks })));
const RoadmapPrep = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapPrep })));
const RoadmapEquipment = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapEquipment })));
const RoadmapRules = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapRules })));
const RoadmapGallery = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapGallery })));
const RoadmapFilms = lazy(() => import("./pages/roadmap").then(m => ({ default: m.RoadmapFilms })));
const Perks = lazy(() => import("./pages/Perks"));
const Updates = lazy(() => import("./pages/Updates"));
const Profile = lazy(() => import("./pages/Profile"));
const MyKYForm = lazy(() => import("./pages/MyKYForm"));
const KYSectionForm = lazy(() => import("./pages/KYSectionForm"));
const PublicPortfolio = lazy(() => import("./pages/PublicPortfolio"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages — nearly every student never visits these, so lazy
// loading is a huge bundle-size win.
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminEditions = lazy(() => import("./pages/admin/AdminEditions"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const AdminLearn = lazy(() => import("./pages/admin/AdminLearn"));
const AdminExplorePrograms = lazy(() => import("./pages/admin/AdminExplorePrograms"));
const AdminAlumniShowcase = lazy(() => import("./pages/admin/AdminAlumniShowcase"));
const AdminAutoUpdates = lazy(() => import("./pages/admin/AdminAutoUpdates"));
const AdminRoadmap = lazy(() => import("./pages/admin/AdminRoadmap"));
const AdminRoadmapSidebar = lazy(() => import("./pages/admin/AdminRoadmapSidebar"));
const AdminKYForms = lazy(() => import("./pages/admin/AdminKYForms"));
const AdminCommunityHighlights = lazy(() => import("./pages/admin/AdminCommunityHighlights"));
const AdminNightlyRituals = lazy(() => import("./pages/admin/AdminNightlyRituals"));
const AdminEquipment = lazy(() => import("./pages/admin/AdminEquipment"));
const AdminMentors = lazy(() => import("./pages/admin/AdminMentors"));
const AdminDocs = lazy(() => import("./pages/admin/AdminDocs"));
const AdminJourneyStages = lazy(() => import("./pages/admin/AdminJourneyStages"));
const AdminJourneyTasks = lazy(() => import("./pages/admin/AdminJourneyTasks"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminChangelog = lazy(() => import("./pages/admin/AdminChangelog"));
const AdminHomepage = lazy(() => import("./pages/admin/AdminHomepage"));
const AdminTodaysFocus = lazy(() => import("./pages/admin/AdminTodaysFocus"));
const AdminPerks = lazy(() => import("./pages/admin/AdminPerks"));
const AdminNetwork = lazy(() => import("./pages/admin/AdminNetwork"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminActivity = lazy(() => import("./pages/admin/AdminActivity"));

const EventDetail = lazy(() => import("./pages/EventDetail"));
const PerkDetail = lazy(() => import("./pages/PerkDetail"));
const LiveSession = lazy(() => import("./pages/LiveSession"));
const AdminLiveSessions = lazy(() => import("./pages/admin/AdminLiveSessions"));
const AdminEmailDashboard = lazy(() => import("./pages/admin/AdminEmailDashboard"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/AdminEmailTemplates"));
const AdminEmailTemplateEdit = lazy(() => import("./pages/admin/AdminEmailTemplateEdit"));
const AdminEmailSend = lazy(() => import("./pages/admin/AdminEmailSend"));
const AdminEmailHistory = lazy(() => import("./pages/admin/AdminEmailHistory"));
const AdminEmailSenders = lazy(() => import("./pages/admin/AdminEmailSenders"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

// Timeout for user data loading in route guards (10 seconds)
const USER_DATA_GUARD_TIMEOUT_MS = 10000;

// Protected Route wrapper - only checks session loading, not user data
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Only block on session initialization (fast)
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};



/**
 * ProfileSetupCheck - Ensures profile setup is completed first
 * Now with timeout-based recovery UI to prevent infinite loading
 */
const ProfileSetupCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, userDataLoading, userDataTimedOut, userDataError, retryUserData, clearCacheAndReload, signOut } = useAuth();
  const [guardTimedOut, setGuardTimedOut] = useState(false);
  
  // Start a timeout when entering loading state
  useEffect(() => {
    if (userDataLoading && !profile) {
      const timer = setTimeout(() => {
        setGuardTimedOut(true);
      }, USER_DATA_GUARD_TIMEOUT_MS);
      
      return () => clearTimeout(timer);
    } else {
      setGuardTimedOut(false);
    }
  }, [userDataLoading, profile]);
  
  // Show recovery UI if: guard timed out, or userDataTimedOut, or userDataError
  if ((guardTimedOut || userDataTimedOut || userDataError) && !profile) {
    return (
      <UserDataRecovery
        isRetrying={userDataLoading}
        onRetry={retryUserData}
        onClearCache={clearCacheAndReload}
        onSignOut={signOut}
        message={userDataError ? "We couldn't load your profile. Please try again." : "Loading is taking longer than expected."}
      />
    );
  }
  
  // If user data is still loading and we don't have profile yet, show loading briefly
  if (userDataLoading && !profile) {
    return <LoadingScreen />;
  }
  
  // If we have profile data and setup is not complete, redirect
  if (profile && !profile.profile_setup_completed) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  // Either profile is loaded with setup complete, or profile is null (let app handle gracefully)
  return <>{children}</>;
};


// Redirect away from profile setup if already completed
const ProfileSetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, userDataLoading, userDataTimedOut, userDataError, retryUserData, clearCacheAndReload, signOut } = useAuth();
  const [guardTimedOut, setGuardTimedOut] = useState(false);
  
  useEffect(() => {
    if (userDataLoading && !profile) {
      const timer = setTimeout(() => {
        setGuardTimedOut(true);
      }, USER_DATA_GUARD_TIMEOUT_MS);
      
      return () => clearTimeout(timer);
    } else {
      setGuardTimedOut(false);
    }
  }, [userDataLoading, profile]);
  
  // Show recovery UI on timeout/error
  if ((guardTimedOut || userDataTimedOut || userDataError) && !profile) {
    return (
      <UserDataRecovery
        isRetrying={userDataLoading}
        onRetry={retryUserData}
        onClearCache={clearCacheAndReload}
        onSignOut={signOut}
      />
    );
  }
  
  // If user data is still loading and we don't have profile yet, show loading briefly
  if (userDataLoading && !profile) {
    return <LoadingScreen />;
  }
  
  // If profile setup is already completed, redirect to home
  if (profile?.profile_setup_completed) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(false);
  const prevUserRef = useRef<typeof user>(undefined);

  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    if (prevUserRef.current === undefined && user && !sessionStorage.getItem('forge-splash-shown')) {
      setShowSplash(true);
      sessionStorage.setItem('forge-splash-shown', 'true');
    }
    prevUserRef.current = user;
  }, [user]);

  // Only block on session initialization
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
    {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
    <Suspense fallback={<LoadingScreen />}>
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/portfolio/:slug" element={<PublicPortfolio />} />
      <Route path="/welcome" element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <Welcome />
          </ProfileSetupCheck>
        </ProtectedRoute>
      } />
      <Route path="/ky-section/:sectionKey" element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <KYSectionForm />
          </ProfileSetupCheck>
        </ProtectedRoute>
      } />
      
      {/* Onboarding flow */}
      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetupRoute>
            <ProfileSetup />
          </ProfileSetupRoute>
        </ProtectedRoute>
      } />
      <Route path="/community-profile" element={<Navigate to="/ky-section/community_profile" replace />} />


      {/* App routes with layout */}
      <Route element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <AppLayout />
          </ProfileSetupCheck>
        </ProtectedRoute>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/all" element={<AllCourses />} />
        <Route path="/learn/:id" element={<CourseDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/roadmap" element={<RoadmapLayout />}>
          <Route index element={<RoadmapJourney />} />
          <Route path="tasks" element={<RoadmapTasks />} />
          <Route path="prep" element={<RoadmapPrep />} />
          <Route path="equipment" element={<RoadmapEquipment />} />
          <Route path="rules" element={<RoadmapRules />} />
          <Route path="gallery" element={<RoadmapGallery />} />
          <Route path="films" element={<RoadmapFilms />} />
        </Route>
        <Route path="/perks" element={<Perks />} />
        <Route path="/perks/:id" element={<PerkDetail />} />
        <Route path="/live-session/:id" element={<LiveSession />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-kyform" element={<MyKYForm />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="editions" element={<AdminEditions />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="learn" element={<AdminLearn />} />
        <Route path="explore-programs" element={<AdminExplorePrograms />} />
        <Route path="alumni-showcase" element={<AdminAlumniShowcase />} />
        <Route path="auto-updates" element={<AdminAutoUpdates />} />
        <Route path="roadmap" element={<AdminRoadmap />} />
        <Route path="roadmap-sidebar" element={<AdminRoadmapSidebar />} />
        <Route path="equipment" element={<AdminEquipment />} />
        <Route path="ky-forms" element={<AdminKYForms />} />
        <Route path="journey-stages" element={<AdminJourneyStages />} />
        <Route path="journey-tasks" element={<AdminJourneyTasks />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="community-highlights" element={<AdminCommunityHighlights />} />
        <Route path="nightly-rituals" element={<AdminNightlyRituals />} />
        <Route path="mentors" element={<AdminMentors />} />
        
        <Route path="docs" element={<AdminDocs />} />
        <Route path="changelog" element={<AdminChangelog />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="todays-focus" element={<AdminTodaysFocus />} />
        <Route path="perks" element={<AdminPerks />} />
        <Route path="network" element={<AdminNetwork />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="live-sessions" element={<AdminLiveSessions />} />

        {/* Email infrastructure (Phase 1 thin-slice) */}
        <Route path="email" element={<AdminEmailDashboard />} />
        <Route path="email/templates" element={<AdminEmailTemplates />} />
        <Route path="email/templates/:id" element={<AdminEmailTemplateEdit />} />
        <Route path="email/send" element={<AdminEmailSend />} />
        <Route path="email/history" element={<AdminEmailHistory />} />
        <Route path="email/senders" element={<AdminEmailSenders />} />
      </Route>
      
      {/* Legacy KY form redirects */}
      <Route path="/kyf-form" element={<Navigate to="/ky-section/filmmaker_profile" replace />} />
      <Route path="/kyc-form" element={<Navigate to="/ky-section/creator_profile" replace />} />
      <Route path="/kyw-form" element={<Navigate to="/ky-section/writer_profile" replace />} />
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AdminTestingProvider>
          <AuthProvider>
            <ThemeProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  
                  <AppRoutes />
                </BrowserRouter>
              </TooltipProvider>
            </ThemeProvider>
          </AuthProvider>
        </AdminTestingProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
