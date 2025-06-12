import {
  Flex,
  Text,
  Spacer,
  IconButton,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Box,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { menuByRole } from "./menu"; // adjust path based on your project structure

export default function Navbar({ onToggleSidebar, sidebarWidth, role }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const location = useLocation();
  const menu = menuByRole[role] || [];
  const currentItem = menu.find(item => item.path === location.pathname);
  const pageTitle = currentItem?.label || "Dashboard";
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleProfile = () => {
    navigate(`/${user?.role}/profile`);
  };

  return (
    <Flex
      bg="white"
      px={4}
      py={3}
      shadow="md"
      align="center"
      position="fixed"
      top="0"
      left="0"
      right="0"
      zIndex="1000"
      ml={{ base: 0, md: sidebarWidth }}
      transition="margin-left 0.2s"
    >
      {isMobile && (
        <IconButton
          icon={<HamburgerIcon />}
          onClick={onToggleSidebar}
          variant="outline"
          mr={2}
          aria-label="Toggle Sidebar"
        />
      )}
      
      <Text fontWeight="bold">{pageTitle}</Text>

      <Spacer />

      <Menu>
        <MenuButton
          as={IconButton}
          icon={<Avatar size="sm" name={user?.nama}/>}
          variant="ghost"
          mr={2}
          aria-label="Profile Menu"
        />
        <MenuList>
          <Box px={3} py={1}>
            <Text fontSize="sm" color="gray.500">{user?.nama} {user.kelas ? ' - '+ user.kelas : ' - '+user.role}</Text>
            <Text fontSize="sm" color="gray.500">{user?.email}</Text>
          </Box>
          <hr />
          <MenuItem onClick={handleProfile}>Profile Management</MenuItem>
          <MenuItem onClick={handleLogout} color="red.500">
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
