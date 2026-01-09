import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { AdminRoute } from "@/components/admin/AdminRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

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
import CourseDetail from "./pages/CourseDetail";
import Events from "./pages/Events";
import RoadmapLayout from "./components/roadmap/RoadmapLayout";
import { RoadmapJourney, RoadmapPrep, RoadmapEquipment, RoadmapRules, RoadmapGallery, RoadmapFilms } from "./pages/roadmap";
import Perks from "./pages/Perks";
import Updates from "./pages/Updates";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEditions from "./pages/admin/AdminEditions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminContent from "./pages/admin/AdminContent";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminLearn from "./pages/admin/AdminLearn";
import AdminAutoUpdates from "./pages/admin/AdminAutoUpdates";
import AdminHeroBanners from "./pages/admin/AdminHeroBanners";
import AdminRoadmap from "./pages/admin/AdminRoadmap";
import AdminKYForms from "./pages/admin/AdminKYForms";
import AdminEventTypes from "./pages/admin/AdminEventTypes";
import AdminPastPrograms from "./pages/admin/AdminPastPrograms";
import AdminCommunityHighlights from "./pages/admin/AdminCommunityHighlights";
import AdminNightlyRituals from "./pages/admin/AdminNightlyRituals";
import AdminEquipment from "./pages/admin/AdminEquipment";
import DynamicKYForm from "./pages/DynamicKYForm";
import EventDetail from "./pages/EventDetail";

const queryClient = new QueryClient();

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, profile } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Profile Setup Check wrapper - ensures profile setup is completed first
const ProfileSetupCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  if (profile && !profile.profile_setup_completed) {
    return <Navigate to="/profile-setup" replace />;
  }
  
  return <>{children}</>;
};

// Redirect away from profile setup if already completed
const ProfileSetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  // If profile setup is already completed, redirect to home
  if (profile?.profile_setup_completed) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={user ? <Navigate to="/" replace /> : <Auth />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
            <AppLayout />
          </ProfileSetupCheck>
        </ProtectedRoute>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:id" element={<CourseDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/roadmap" element={<RoadmapLayout />}>
          <Route index element={<RoadmapJourney />} />
          <Route path="prep" element={<RoadmapPrep />} />
          <Route path="equipment" element={<RoadmapEquipment />} />
          <Route path="rules" element={<RoadmapRules />} />
          <Route path="gallery" element={<RoadmapGallery />} />
          <Route path="films" element={<RoadmapFilms />} />
        </Route>
        <Route path="/perks" element={<Perks />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="editions" element={<AdminEditions />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="event-types" element={<AdminEventTypes />} />
        <Route path="past-programs" element={<AdminPastPrograms />} />
        <Route path="learn" element={<AdminLearn />} />
        <Route path="auto-updates" element={<AdminAutoUpdates />} />
        <Route path="hero-banners" element={<AdminHeroBanners />} />
        <Route path="roadmap" element={<AdminRoadmap />} />
        <Route path="equipment" element={<AdminEquipment />} />
        <Route path="ky-forms" element={<AdminKYForms />} />
        <Route path="community-highlights" element={<AdminCommunityHighlights />} />
        <Route path="nightly-rituals" element={<AdminNightlyRituals />} />
      </Route>
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
