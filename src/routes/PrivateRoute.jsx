import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Center } from "@chakra-ui/react";

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Center><Spinner size="lg" /></Center>;
  }
  if (!user || user.role !== role) return <Navigate to="/" />;

  return children;
}
