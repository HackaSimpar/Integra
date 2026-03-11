import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Admin from './components/Admin';

const ProtectedRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute roles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SettingsProvider>
    </AuthProvider>
  );
}
