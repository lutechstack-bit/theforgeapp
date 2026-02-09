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
import { MarkerProvider } from "@/components/feedback/MarkerProvider";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { UserDataRecovery } from "@/components/shared/UserDataRecovery";
import { useEffect, useState } from "react";

// Pages
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Welcome from "./pages/Welcome";
import ProfileSetup from "./pages/ProfileSetup";
import KYFForm from "./pages/KYFForm";
import KYCForm from "./pages/KYCForm";
import KYWForm from "./pages/KYWForm";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Learn from "./pages/Learn";
import AllCourses from "./pages/AllCourses";
import CourseDetail from "./pages/CourseDetail";
import Events from "./pages/Events";
import RoadmapLayout from "./components/roadmap/RoadmapLayout";
import { RoadmapJourney, RoadmapTasks, RoadmapPrep, RoadmapEquipment, RoadmapRules, RoadmapGallery, RoadmapFilms } from "./pages/roadmap";
import Perks from "./pages/Perks";
import Updates from "./pages/Updates";
import Profile from "./pages/Profile";
import MyKYForm from "./pages/MyKYForm";
import PublicPortfolio from "./pages/PublicPortfolio";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEditions from "./pages/admin/AdminEditions";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminLearn from "./pages/admin/AdminLearn";
import AdminAutoUpdates from "./pages/admin/AdminAutoUpdates";
import AdminRoadmap from "./pages/admin/AdminRoadmap";
import AdminRoadmapSidebar from "./pages/admin/AdminRoadmapSidebar";
import AdminKYForms from "./pages/admin/AdminKYForms";
import AdminCommunityHighlights from "./pages/admin/AdminCommunityHighlights";
import AdminNightlyRituals from "./pages/admin/AdminNightlyRituals";
import AdminEquipment from "./pages/admin/AdminEquipment";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminAlumniTestimonials from "./pages/admin/AdminAlumniTestimonials";
import AdminDocs from "./pages/admin/AdminDocs";
import AdminJourneyStages from "./pages/admin/AdminJourneyStages";
import AdminJourneyTasks from "./pages/admin/AdminJourneyTasks";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminChangelog from "./pages/admin/AdminChangelog";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminTodaysFocus from "./pages/admin/AdminTodaysFocus";
import DynamicKYForm from "./pages/DynamicKYForm";
import EventDetail from "./pages/EventDetail";

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

// KYF Route - Smart redirect based on cohort type
const KYFRedirect: React.FC = () => {
  const { profile, userDataLoading } = useAuth();
  
  // Show loading while fetching profile (but with a reasonable expectation it will complete)
  if (userDataLoading && !profile) {
    return <LoadingScreen />;
  }
  
  // Get cohort type from edition if available
  const cohortType = (profile as any)?.edition?.cohort_type;
  
  switch (cohortType) {
    case 'FORGE_WRITING':
      return <Navigate to="/kyw-form" replace />;
    case 'FORGE_CREATORS':
      return <Navigate to="/kyc-form" replace />;
    default:
      return <Navigate to="/kyf-form" replace />;
  }
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

/**
 * KYFormCheck - Ensures KY form is completed before accessing main app
 * Now with timeout-based recovery UI
 */
const KYFormCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  // If profile setup is done but KY form is NOT complete, redirect to form
  if (profile?.profile_setup_completed && !profile?.ky_form_completed) {
    return <Navigate to="/kyf" replace />;
  }
  
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

  // Only block on session initialization
  if (loading) {
    return <LoadingScreen />;
  }

  return (
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
      
      {/* Onboarding flow */}
      <Route path="/profile-setup" element={
        <ProtectedRoute>
          <ProfileSetupRoute>
            <ProfileSetup />
          </ProfileSetupRoute>
        </ProtectedRoute>
      } />
      <Route path="/kyf" element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <KYFRedirect />
          </ProfileSetupCheck>
        </ProtectedRoute>
      } />
      <Route path="/kyf-form" element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <KYFForm />
          </ProfileSetupCheck>
        </ProtectedRoute>
      } />
      <Route path="/kyc-form" element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <KYCForm />
          </ProfileSetupCheck>
        </ProtectedRoute>
      } />
      <Route path="/kyw-form" element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <KYWForm />
          </ProfileSetupCheck>
        </ProtectedRoute>
      } />
      
      {/* App routes with layout */}
      <Route element={
        <ProtectedRoute>
          <ProfileSetupCheck>
            <KYFormCheck>
              <AppLayout />
            </KYFormCheck>
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
        <Route path="alumni-testimonials" element={<AdminAlumniTestimonials />} />
        <Route path="docs" element={<AdminDocs />} />
        <Route path="changelog" element={<AdminChangelog />} />
        <Route path="homepage" element={<AdminHomepage />} />
        <Route path="todays-focus" element={<AdminTodaysFocus />} />
      </Route>
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
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
                  <MarkerProvider />
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
