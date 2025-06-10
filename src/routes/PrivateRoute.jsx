import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Spinner, Center } from "@chakra-ui/react";

export default function PrivateRoute({ children, role }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return <Center><Spinner size="lg" /></Center>;
  }
  if (!user || user.role !== role) return <Navigate to="/" />;

  return children;
}
