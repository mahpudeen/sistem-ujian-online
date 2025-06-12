import { Box, useBreakpointValue } from "@chakra-ui/react";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const { role } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false); // NEW
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const sidebarWidth = collapsed ? "20" : "60";

  return (
    <Box minH="100vh">
      <Sidebar
        isOpen={!isMobile || isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
        role={role}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <Navbar
        onToggleSidebar={toggleSidebar}
        role={role}
        collapsed={collapsed}
        sidebarWidth={sidebarWidth}
      />

      <Box
        ml={!isMobile ? sidebarWidth : "0"}
        mt="50px"
        p={isMobile ? 0:6}
        transition="margin-left 0.2s"
      >
        {children}
      </Box>
    </Box>
  );
}
