// SidebarContent.jsx
import {
  VStack,
  Link as ChakraLink,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router-dom";
import { menuByRole } from "./menu"; // adjust path based on your project structure

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
