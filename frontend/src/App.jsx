import { lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';

// Lazy load components
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const EmployeeDashboard = lazy(() => import('./components/EmployeeDashboard'));

function AppRoutes() {
  const { isAuthenticated, isAdmin, user, loading } = useAuth();

  console.log('AppRoutes - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'user:', user, 'loading:', loading);

  const getDashboardComponent = () => {
    console.log('getDashboardComponent - user role:', user?.role, 'has employee:', !!user?.employee);
    if (isAdmin) {
      console.log('Rendering AdminDashboard');
      return (
        <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>}>
          <AdminDashboard />
        </Suspense>
      );
    } else {
      console.log('Rendering EmployeeDashboard');
      return (
        <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>}>
          <EmployeeDashboard />
        </Suspense>
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : (
          <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>}>
            <Login />
          </Suspense>
        )}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : (
          <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>}>
            <Register />
          </Suspense>
        )}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {getDashboardComponent()}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <Suspense fallback={<div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
