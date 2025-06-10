import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import Login from './pages/auth/Login';
import RegisterSiswa from './pages/auth/RegisterSiswa';
import RegisterGuru from './pages/auth/RegisterGuru';
import AdminDashboard from './pages/admin/Dashboard';
import GuruDashboard from './pages/guru/Dashboard';
import SiswaDashboard from './pages/siswa/Dashboard';
import ForgotPassword from "./pages/auth/ForgotPassword";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/siswa" element={<RegisterSiswa />} />
        <Route path="/register/guru" element={<RegisterGuru />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/admin/*" element={
          <PrivateRoute role="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/guru/*" element={
          <PrivateRoute role="guru">
            <GuruDashboard />
          </PrivateRoute>
        } />
        <Route path="/siswa/*" element={
          <PrivateRoute role="siswa">
            <SiswaDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
