import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoginPage from '@/pages/LoginPage';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardPage from '@/pages/DashboardPage';
import MillsPage from '@/pages/MillsPage';
import MillDetailPage from '@/pages/MillDetailPage';
import SilosPage from '@/pages/SilosPage';
import SiloDetailPage from '@/pages/SiloDetailPage';
import PackagingPage from '@/pages/PackagingPage';
import ReportsPage from '@/pages/ReportsPage';
import AdminPage from '@/pages/AdminPage';
import SettingsPage from '@/pages/SettingsPage';
import FlowDesignerPage from '@/pages/FlowDesignerPage';
import LoadingScreen from '@/components/LoadingScreen';
import OfflineIndicator from '@/components/OfflineIndicator';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuthStore();

  if (!initialized || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize, initialized, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return <LoadingScreen />;
  }

  return (
    <>
      <OfflineIndicator />
      <PWAInstallPrompt />

      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />

        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="mills" element={<MillsPage />} />
          <Route path="mills/:id" element={<MillDetailPage />} />
          <Route path="silos" element={<SilosPage />} />
          <Route path="silos/:id" element={<SiloDetailPage />} />
          <Route path="packaging" element={<PackagingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="flow-designer" element={<FlowDesignerPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
