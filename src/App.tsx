import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import KYF from "./pages/KYF";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Learn from "./pages/Learn";
import Events from "./pages/Events";
import Roadmap from "./pages/Roadmap";
import Perks from "./pages/Perks";
import Updates from "./pages/Updates";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

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

// KYF Check wrapper
const KYFCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  if (profile && !profile.kyf_completed) {
    return <Navigate to="/welcome" replace />;
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
      <Route path="/auth" element={user ? <Navigate to="/welcome" replace /> : <Auth />} />
      
      {/* Post-login flow */}
      <Route path="/welcome" element={
        <ProtectedRoute>
          <Welcome />
        </ProtectedRoute>
      } />
      <Route path="/kyf" element={
        <ProtectedRoute>
          <KYF />
        </ProtectedRoute>
      } />
      
      {/* App routes with layout */}
      <Route element={
        <ProtectedRoute>
          <KYFCheck>
            <AppLayout />
          </KYFCheck>
        </ProtectedRoute>
      }>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Community />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/events" element={<Events />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/perks" element={<Perks />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
