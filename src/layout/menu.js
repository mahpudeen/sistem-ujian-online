// menu.js
import { 
  FiHome, FiUsers, FiUserCheck, FiFileText, FiFolder,
  FiBook, FiCheckCircle, FiClipboard, FiLayers, FiClock 
} from "react-icons/fi";

export const menuByRole = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: FiHome },
    { label: "Manajemen Soal", path: "/admin/soal", icon: FiFileText },
    { label: "Manajemen Bank Soal", path: "/admin/bank-soal", icon: FiFolder },
    { label: "Manajemen Guru", path: "/admin/guru", icon: FiUserCheck },
    { label: "Manajemen Mapel", path: "/admin/mapel", icon: FiBook },
    { label: "Manajemen Siswa", path: "/admin/siswa", icon: FiUsers },
    { label: "Manajemen Kelas", path: "/admin/kelas", icon: FiLayers },
    { label: "Hasil Ujian", path: "/admin/nilai", icon: FiCheckCircle },
    { label: "Audit Log", path: "/admin/audit", icon: FiClipboard },
  ],
  guru: [
    { label: "Dashboard", path: "/guru", icon: FiHome },
    { label: "Soal", path: "/guru/soal", icon: FiFileText },
    { label: "Bank Soal", path: "/guru/bank-soal", icon: FiFolder },
    { label: "Aktivasi Ujian", path: "/guru/aktivasi", icon: FiCheckCircle },
    { label: "Ujian Aktif", path: "/guru/ujian-aktif", icon: FiClock },
    { label: "Pantau Ujian", path: "/guru/pantau-ujian", icon: FiUsers },
    { label: "Hasil Ujian", path: "/guru/nilai", icon: FiClipboard },
  ],
  siswa: [
    { label: "Dashboard", path: "/siswa", icon: FiHome },
    { label: "Nilai", path: "/siswa/nilai", icon: FiCheckCircle },
  ],
};
