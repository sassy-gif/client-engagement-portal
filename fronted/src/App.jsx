import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ClientDashboard from './pages/ClientDashboard';
import AdminHome from './pages/AdminHome';
import ProjectDetail from './pages/ProjectDetail';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
function RoleBasedHome() {
  const { user } = useAuth();
  if (user.role === 'admin' || user.role === 'team_member') {
    return <AdminHome />;
  }
  return <ClientDashboard />;
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
     path="/dashboard"
      element={
        <ProtectedRoute>
         <RoleBasedHome />
       </ProtectedRoute>
     }
      />
      <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}