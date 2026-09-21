import { useAuthStore } from "@/store/authStore";
import { useEffect, useRef } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { queryClient } from "./main";

// Layouts
import AppLayout from "@/layouts/AppLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Public pages
import Landing from "@/pages/Landing";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Login from "@/pages/auth/Login";
import ProfileSetup from "@/pages/auth/ProfileSetup";
import Register from "@/pages/auth/Register";

// App pages
import AIInsights from "@/pages/AIInsights";
import CareerRoadmap from "@/pages/CareerRoadmap";
import Dashboard from "@/pages/Dashboard";
import InterviewComplete from "@/pages/InterviewComplete";
import InterviewRoom from "@/pages/InterviewRoom";
import InterviewSetup from "@/pages/InterviewSetup";
import Interviews from "@/pages/Interviews";
import JobAnalyzer from "@/pages/JobAnalyzer";
import Practice from "@/pages/Practice";
import Profile from "@/pages/Profile";
import Progress from "@/pages/Progress";
import Reports from "@/pages/Reports";
import Resume from "@/pages/Resume";
import Settings from "@/pages/Settings";

/**
 * Protected route
 *
 * Allows access only to authenticated users.
 */
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/**
 * Public route
 *
 * Prevents authenticated users from opening
 * login/register pages again.
 */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
}

/**
 * Application root
 */
export default function App() {
  const { isAuthenticated } = useAuthStore();

  /**
   * Keep track of the previous authentication state.
   * Used to detect logout events.
   */
  const previousAuthRef = useRef(isAuthenticated);

  /**
   * Clear React Query cache after logout.
   *
   * This prevents previously authenticated user's
   * server data from remaining in memory.
   */
  useEffect(() => {
    if (previousAuthRef.current && !isAuthenticated) {
      queryClient.clear();
    }

    previousAuthRef.current = isAuthenticated;
  }, [isAuthenticated]);

  return (
    <>
      {/* Global notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#0D47A1",
            border: "1px solid #90CAF9",
            borderRadius: "12px",
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            boxShadow: "0 10px 30px rgba(13, 71, 161, 0.12)",
          },
        }}
      />

      <Routes>
        {/* =========================================================
            PUBLIC ROUTES
        ========================================================= */}

        <Route path="/" element={<Landing />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <Login />
              </AuthLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <Register />
              </AuthLayout>
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <AuthLayout>
              <ForgotPassword />
            </AuthLayout>
          }
        />

        {/* =========================================================
            PROFILE SETUP
        ========================================================= */}

        <Route
          path="/profile-setup"
          element={
            <PrivateRoute>
              <ProfileSetup />
            </PrivateRoute>
          }
        />

        {/* =========================================================
            MAIN APPLICATION
        ========================================================= */}

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/interviews"
          element={
            <PrivateRoute>
              <AppLayout>
                <Interviews />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* =========================================================
            PRACTICE
        ========================================================= */}

        <Route
          path="/practice"
          element={
            <PrivateRoute>
              <AppLayout>
                <Practice />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* =========================================================
            AI & CAREER
        ========================================================= */}

        <Route
          path="/ai-insights"
          element={
            <PrivateRoute>
              <AppLayout>
                <AIInsights />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/career-roadmap"
          element={
            <PrivateRoute>
              <AppLayout>
                <CareerRoadmap />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* =========================================================
            RESUME & JOBS
        ========================================================= */}

        <Route
          path="/resume"
          element={
            <PrivateRoute>
              <AppLayout>
                <Resume />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/job-analyzer"
          element={
            <PrivateRoute>
              <AppLayout>
                <JobAnalyzer />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* =========================================================
            PROGRESS & REPORTS
        ========================================================= */}

        <Route
          path="/analysis"
          element={
            <PrivateRoute>
              <AppLayout>
                <Progress />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <PrivateRoute>
              <AppLayout>
                <Progress />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <AppLayout>
                <Reports />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* =========================================================
            SETTINGS
        ========================================================= */}

        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </PrivateRoute>
          }
        />

        {/* =========================================================
            INTERVIEW FLOW
        ========================================================= */}

        <Route
          path="/interview/setup"
          element={
            <PrivateRoute>
              <AppLayout>
                <InterviewSetup />
              </AppLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/interview/room/:id"
          element={
            <PrivateRoute>
              <InterviewRoom />
            </PrivateRoute>
          }
        />

        <Route
          path="/interview/complete/:id"
          element={
            <PrivateRoute>
              <InterviewComplete />
            </PrivateRoute>
          }
        />

        {/* =========================================================
            FALLBACK
        ========================================================= */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
