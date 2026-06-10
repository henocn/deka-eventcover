import { Toaster } from 'sonner';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import { AuthProvider } from './contexts/AuthContext';
import { EventsProvider } from './contexts/EventsContext';
import useAuth from './hooks/useAuth';
import AlbumDetailsPage from './pages/AlbumDetailsPage';
import AlbumsPage from './pages/AlbumsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/events" replace /> : <Outlet />;
}

function AdminLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="grid min-h-svh grid-cols-[248px_minmax(0,1fr)] overflow-x-clip bg-neutral-100 text-neutral-950 max-[1180px]:grid-cols-[84px_minmax(0,1fr)] max-[760px]:block">
      <Sidebar onLogout={handleLogout} />
      <section className="min-w-0 overflow-x-clip bg-neutral-100">
        <Topbar user={user} />
        <Outlet />
      </section>
    </main>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          element={(
            <EventsProvider>
              <AdminLayout />
            </EventsProvider>
          )}
        >
          <Route index element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/event/:slug" element={<EventDetailsPage />} />
          <Route path="/albums" element={<AlbumsPage />} />
          <Route path="/albums/:slug" element={<AlbumDetailsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          classNames: {
            toast: 'border border-neutral-200 bg-white text-neutral-950 shadow-xl',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
