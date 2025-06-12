import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import RoleLayout from './layout/RoleLayout';

import Login from './pages/auth/Login';
import RegisterSiswa from './pages/auth/RegisterSiswa';
import RegisterGuru from './pages/auth/RegisterGuru';
import ForgotPassword from "./pages/auth/ForgotPassword";
import ProfilePage from "./pages/general/ProfilePage";

// Halaman admin
import AdminDashboard from './pages/admin/Dashboard';
import ManajemenGuru from './pages/admin/ManajemenGuru';
import ManajemenSiswa from './pages/admin/ManajemenSiswa';
import ManajemenKelas from './pages/admin/ManajemenKelas';
import ManajemenMapel from './pages/admin/ManajemenMapel';
import ManajemenSoal from './pages/admin/ManajemenSoal';
import ManajemenBankSoal from './pages/admin/ManajemenBankSoal';
import SoalDetail from './pages/admin/SoalDetail';

// Halaman guru
import GuruDashboard from './pages/guru/Dashboard';
import AktivasiUjian from './pages/guru/AktivasiUjian';
import UjianAktifGuru from './pages/guru/UjianAktifGuru';
import PantauUjian from './pages/guru/PantauUjian';
import RekapNilai from './pages/guru/RekapNilai';
import ReviewJawabanSiswa from './pages/guru/ReviewJawabanSiswa';

// Halaman siswa
import SiswaDashboard from './pages/siswa/Dashboard';
import UjianPage from './pages/siswa/UjianPage';
import NilaiPage from './pages/siswa/NilaiPage';
import ReviewUjianSiswa from './pages/siswa/ReviewUjianSiswa';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/siswa" element={<RegisterSiswa />} />
        <Route path="/register/guru" element={<RegisterGuru />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ADMIN */}
        <Route path="/admin" element={
          <PrivateRoute role="admin">
            <RoleLayout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="guru" element={<ManajemenGuru />} />
          <Route path="siswa" element={<ManajemenSiswa />} />
          <Route path="kelas" element={<ManajemenKelas />} />
          <Route path="mapel" element={<ManajemenMapel />} />
          <Route path="soal" element={<ManajemenSoal />} />
          <Route path="soal/:id/detail" element={<SoalDetail />} />
          <Route path="bank-soal" element={<ManajemenBankSoal />} />
          <Route path="nilai" element={<RekapNilai />} />
          
        </Route>

        {/* GURU */}
        <Route path="/guru" element={
          <PrivateRoute role="guru">
            <RoleLayout />
          </PrivateRoute>
        }>
          <Route index element={<GuruDashboard />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="soal" element={<ManajemenSoal />} />
          <Route path="soal/:id/detail" element={<SoalDetail />} />
          <Route path="bank-soal" element={<ManajemenBankSoal />} />
          <Route path="aktivasi" element={<AktivasiUjian />} />
          <Route path="ujian-aktif" element={<UjianAktifGuru />} />
          <Route path="pantau-ujian" element={<PantauUjian />} />
          <Route path="nilai" element={<RekapNilai />} />
          <Route path="review/:ujianId/:userId" element={<ReviewJawabanSiswa />} />

        </Route>

        {/* SISWA */}
        <Route path="/siswa" element={
          <PrivateRoute role="siswa">
            <RoleLayout />
          </PrivateRoute>
        }>
          <Route index element={<SiswaDashboard />} />
          <Route path="nilai" element={<NilaiPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="review/:ujianId" element={<ReviewUjianSiswa />} />

        </Route>
        <Route path="/siswa/ujian/:id" element={
          <PrivateRoute role="siswa">
            <UjianPage />
          </PrivateRoute>
        }>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
