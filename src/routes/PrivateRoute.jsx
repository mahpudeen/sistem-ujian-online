import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center } from "@chakra-ui/react";

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Center><Spinner size="lg" /></Center>;
  }
  if (!user || user.role !== role) {
    if (user.role === "admin") return <Navigate to="/admin" />;
    if (user.role === "guru") return <Navigate to="/guru" />;
    if (user.role === "siswa") return <Navigate to="/siswa" />;
    return <Navigate to="/" />
  };

  return children;
}
