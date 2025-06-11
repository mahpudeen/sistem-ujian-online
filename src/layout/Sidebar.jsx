import {
  Box, Drawer, DrawerOverlay, DrawerContent,
  DrawerCloseButton, DrawerHeader, DrawerBody,
  IconButton, Flex, Text
} from "@chakra-ui/react";
import { FiMenu, FiArrowLeft } from "react-icons/fi";
import SidebarContent from "./SidebarContent";

export default function Sidebar({ isOpen, onClose, isMobile, role, collapsed, setCollapsed }) {

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <SidebarContent role={role} onClose={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Box
      bg="gray.100"
      w={collapsed ? "20" : "60"}
      h="100vh"
      position="fixed"
      left="0"
      top="0"
      transition="width 0.2s"
      overflow="hidden"
      borderRight="1px solid #e2e8f0"
    >
      <Flex
        align="center"
        justify={collapsed ? "center" : "space-between"}
        px={4}
        h="12"
        borderBottom="1px solid #e2e8f0"
      >
        {!collapsed && <Text fontWeight="bold">Ujian Online</Text>}
        <IconButton
          aria-label="Toggle Sidebar"
          icon={collapsed ? <FiMenu /> : <FiArrowLeft />}
          size="sm"
          variant="ghost"
          onClick={() => setCollapsed(!collapsed)}
        />
      </Flex>

      <SidebarContent role={role} collapsed={collapsed} />
    </Box>
  );
}
