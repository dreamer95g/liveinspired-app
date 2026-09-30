import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Loader from '@/components/Loading'; // <-- Importar

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen text="Iniciando sesión..." />;
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}