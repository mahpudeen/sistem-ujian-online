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

  const getCurrentItemLabel = (menu, pathname) => {
    for (const item of menu) {
      if (item.path === pathname) return item
      if (item.children) {
        const found = item.children.find(child => child.path === pathname)
        if (found) return found
      }
    }
    return null
  }

  const currentItem = getCurrentItemLabel(menu, location.pathname)
  const pageTitle = currentItem?.label || 'Dashboard'
  
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
      shadow="sm"
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
          <Flex w="100%" mb="0px">
            <Text
              ps="20px"
              pt="16px"
              pb="10px"
              w="100%"
              borderBottom="1px solid"
              borderColor="#E6ECFA"
              fontSize="sm"
              fontWeight="700"
              color="secondaryGray.900"
            >
              <Text
                as="span"
                fontSize="sm"
                color="gray.500"
              >
                {user?.nama} {user.kelas ? ' - '+ user.kelas : ' - '+ user.role}
              </Text>
              <br />
              <Text as="span" fontSize="sm" color="gray.500">{user?.email}</Text>
            </Text>
          </Flex>
          <Flex flexDirection="column" p="10px">
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              borderRadius="8px"
              px="14px"
              onClick={handleProfile}
            >
              <Text fontSize="sm">Profile Settings</Text>
            </MenuItem>
            <MenuItem
              _hover={{ bg: 'none' }}
              _focus={{ bg: 'none' }}
              color="red.400"
              borderRadius="8px"
              px="14px"
              onClick={handleLogout} 
            >
              <Text fontSize="sm">Log out</Text>
            </MenuItem>
          </Flex>
        </MenuList>
      </Menu>
    </Flex>
  );
}
