import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import ProfilePage from './pages/ProfilePage';
import ResumePage from './pages/ResumePage';

// Auth Components
import AccountActivationForm from './components/AccountActivationForm';
import PasswordResetForm from './components/PasswordResetForm';

function App() {
  const { user } = useAuth();

  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/activate-account" element={user ? <Navigate to="/" /> : <AccountActivationForm />} />
        <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <PasswordResetForm />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />}
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
