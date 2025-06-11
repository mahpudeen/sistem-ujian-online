// SidebarContent.jsx
import {
  VStack,
  Link as ChakraLink,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";

// Icons
import { 
  FiHome, FiUsers, FiUserCheck, FiFileText, 
  FiBook, FiCheckCircle, FiClipboard, FiLayers , FiClock
} from "react-icons/fi";

const menuByRole = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: FiHome },
    { label: "Manajemen Siswa", path: "/admin/siswa", icon: FiUsers },
    { label: "Manajemen Guru", path: "/admin/guru", icon: FiUserCheck },
    { label: "Manajemen Soal", path: "/admin/soal", icon: FiFileText },
    { label: "Manajemen Kelas", path: "/admin/kelas", icon: FiLayers },
    { label: "Manajemen Mapel", path: "/admin/mapel", icon: FiBook },
    { label: "Hasil Ujian", path: "/admin/nilai", icon: FiCheckCircle },
    { label: "Audit Log", path: "/admin/audit", icon: FiClipboard },
  ],
  guru: [
    { label: "Dashboard", path: "/guru", icon: FiHome },
    { label: "Soal", path: "/guru/soal", icon: FiFileText },
    { label: "Aktivasi Ujian", path: "/guru/aktivasi", icon: FiCheckCircle },
    { label: "Ujian Aktif", path: "/guru/ujian-aktif", icon: FiClock },
    { label: "Pantau Ujian", path: "/guru/pantau-ujian", icon: FiUsers },
    { label: "Hasil Ujian", path: "/guru/nilai", icon: FiClipboard },
  ],
  siswa: [
    { label: "Dashboard", path: "/siswa", icon: FiHome },
    { label: "Daftar Ujian", path: "/siswa/ujian", icon: FiFileText },
    { label: "Nilai", path: "/siswa/nilai", icon: FiCheckCircle },
  ],
};
// Tambahkan prop collapsed
export default function SidebarContent({ role, onClose, collapsed = false }) {
  const location = useLocation();
  const menu = menuByRole[role] || [];

  return (
    <VStack align="stretch" spacing={1} p={2}>
      {menu.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <ChakraLink
            as={Link}
            to={item.path}
            key={item.path}
            onClick={onClose}
            _hover={{ bg: "gray.200", color: "teal.600" }}
            bg={isActive ? "teal.100" : "transparent"}
            borderRadius="md"
            py={2}
            px={collapsed ? 3 : 4}
            color={isActive ? "teal.700" : "gray.700"}
            fontWeight={isActive ? "semibold" : "normal"}
            display="flex"
            alignItems="center"
            justifyContent={collapsed ? "center" : "flex-start"}
          >
            <HStack spacing={collapsed ? 0 : 3}>
              <Box as={Icon} size="18px" />
              {!collapsed && <Text fontSize="sm">{item.label}</Text>}
            </HStack>
          </ChakraLink>
        );
      })}
    </VStack>
  );
}
