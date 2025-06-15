// menu.js
import { 
  FiHome, FiUsers, FiUserCheck, FiFileText, FiFolder,
  FiBook, FiCheckCircle, FiClipboard, FiLayers, FiClock, 
  FiArchive, FiSettings, FiEdit3, FiFile
} from "react-icons/fi";
import { FaRegCalendarPlus } from "react-icons/fa"

export const menuByRole = {
  admin: [
    { label: 'Dashboard', path: '/admin', icon: FiHome },
  
    {
      label: 'Manajemen Soal',
      icon: FiFolder,
      children: [
        { label: 'List Soal', path: '/admin/soal', icon: FiFileText },
        { label: 'Bank Soal', path: '/admin/bank-soal', icon: FiArchive },
      ]
    },
  
    {
      label: 'Manajemen Data',
      icon: FiSettings,
      children: [
        { label: 'Guru', path: '/admin/guru', icon: FiUserCheck },
        { label: 'Mapel', path: '/admin/mapel', icon: FiBook },
        { label: 'Siswa', path: '/admin/siswa', icon: FiUsers },
        { label: 'Kelas', path: '/admin/kelas', icon: FiLayers },
      ]
    },
  
    {
      label: 'Ujian',
      icon: FiEdit3,
      children: [
        { label: 'Jadwalkan Ujian', path: '/admin/aktivasi', icon: FaRegCalendarPlus },
        { label: 'Ujian Aktif', path: '/admin/ujian-aktif', icon: FiClock },
        { label: 'Pantau Ujian', path: '/admin/pantau-ujian', icon: FiUsers },
      ]
    },
  
    {
      label: 'Hasil & Arsip',
      icon: FiFile,
      children: [
        { label: 'Hasil Ujian', path: '/admin/nilai', icon: FiCheckCircle },
        { label: 'Arsip Hasil Ujian', path: '/admin/nilai-arsip', icon: FiArchive },
      ]
    },
  
    { label: 'Audit Log', path: '/admin/audit', icon: FiClipboard }
  ],
  
  guru: [
    { label: "Dashboard", path: "/guru", icon: FiHome },
    { label: "Soal", path: "/guru/soal", icon: FiFileText },
    { label: "Bank Soal", path: "/guru/bank-soal", icon: FiFolder },
    { label: "Aktivasi Ujian", path: "/guru/aktivasi", icon: FiCheckCircle },
    { label: "Ujian Aktif", path: "/guru/ujian-aktif", icon: FiClock },
    { label: "Pantau Ujian", path: "/guru/pantau-ujian", icon: FiUsers },
    { label: "Hasil Ujian", path: "/guru/nilai", icon: FiClipboard },
    { label: "Arsip Hasil Ujian", path: "/guru/nilai-arsip", icon: FiArchive },
  ],
  siswa: [
    { label: "Dashboard", path: "/siswa", icon: FiHome },
    { label: "Nilai", path: "/siswa/nilai", icon: FiCheckCircle },
  ],
};
