import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CustomCursor } from '@/components/CustomCursor';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { TextGeneratorPage } from '@/pages/dashboard/TextGeneratorPage';
import { ImageGeneratorPage } from '@/pages/dashboard/ImageGeneratorPage';
import { CodeGeneratorPage } from '@/pages/dashboard/CodeGeneratorPage';
import { PromptLibraryPage } from '@/pages/dashboard/PromptLibraryPage';
import { PromptLabPage } from '@/pages/dashboard/PromptLabPage';
import { HistoryPage } from '@/pages/dashboard/HistoryPage';
import { SavedContentPage } from '@/pages/dashboard/SavedContentPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { SettingsPage } from '@/pages/dashboard/SettingsPage';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 dark:bg-ink-950">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
      <Route path="/signup" element={<RedirectIfAuth><SignupPage /></RedirectIfAuth>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/app" element={<ProtectedRoute><DashboardLayout><div /></DashboardLayout></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
      </Route>
      <Route path="/app/dashboard" element={<ProtectedRoute><DashboardLayout><DashboardPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/text" element={<ProtectedRoute><DashboardLayout><TextGeneratorPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/image" element={<ProtectedRoute><DashboardLayout><ImageGeneratorPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/code" element={<ProtectedRoute><DashboardLayout><CodeGeneratorPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/prompts" element={<ProtectedRoute><DashboardLayout><PromptLibraryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/prompt-lab" element={<ProtectedRoute><DashboardLayout><PromptLabPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/history" element={<ProtectedRoute><DashboardLayout><HistoryPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/saved" element={<ProtectedRoute><DashboardLayout><SavedContentPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/profile" element={<ProtectedRoute><DashboardLayout><ProfilePage /></DashboardLayout></ProtectedRoute>} />
      <Route path="/app/settings" element={<ProtectedRoute><DashboardLayout><SettingsPage /></DashboardLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <CustomCursor />
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
