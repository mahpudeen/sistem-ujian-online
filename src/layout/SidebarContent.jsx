import {
  VStack,
  Link as ChakraLink,
  HStack,
  Text,
  Box,
  Collapse,
  IconButton
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { menuByRole } from './menu'

export default function SidebarContent({ role, onClose, collapsed = false }) {
  const location = useLocation()
  const menu = menuByRole[role] || []
  const [openIndex, setOpenIndex] = useState(null)

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const renderMenuItem = (item) => {
    const Icon = item.icon
    const isActive = location.pathname === item.path

    return (
      <ChakraLink
        as={Link}
        to={item.path}
        key={item.path}
        onClick={onClose}
        _hover={{ bg: 'gray.200', color: 'teal.600' }}
        bg={isActive ? 'teal.100' : 'transparent'}
        borderRadius="md"
        py={2}
        px={collapsed ? 3 : 4}
        color={isActive ? 'teal.700' : 'gray.700'}
        fontWeight={isActive ? 'semibold' : 'normal'}
        display="flex"
        alignItems="center"
        justifyContent={collapsed ? 'center' : 'flex-start'}
      >
        <HStack spacing={collapsed ? 0 : 3}>
          <Box as={item.icon} boxSize="18px" />
          {!collapsed && <Text fontSize="sm">{item.label}</Text>}
        </HStack>
      </ChakraLink>
    )
  }

  return (
    <VStack align="stretch" spacing={1} p={2}>
      {menu.map((item, index) => {
        if (!item.children) return renderMenuItem(item)

        const isExpanded = openIndex === index
        const Icon = item.icon

        return (
          <Box key={item.label}>
            <Box
              onClick={() => toggleIndex(index)}
              cursor="pointer"
              px={collapsed ? 3 : 4}
              py={2}
              borderRadius="md"
              _hover={{ bg: 'gray.200', color: 'teal.600' }}
              bg={isExpanded ? 'teal.50' : 'transparent'}
              display="flex"
              alignItems="center"
              justifyContent={collapsed ? 'center' : 'space-between'}
            >
              <HStack spacing={collapsed ? 0 : 3} w="full" justify={collapsed ? 'center' : 'flex-start'}>
                <Box as={Icon} boxSize="18px" />
                {!collapsed && <Text fontSize="sm">{item.label}</Text>}
              </HStack>
              {!collapsed && (
                <Box>
                  {isExpanded ? <ChevronDownIcon boxSize="16px" /> : <ChevronRightIcon boxSize="16px" />}
                </Box>
              )}
            </Box>

            <Collapse in={isExpanded} animateOpacity>
              <Box pl={collapsed ? 0 : 6} pr={2} py={1}>
                <VStack spacing={1} align="stretch">
                  {item.children.map((child) => renderMenuItem(child))}
                </VStack>
              </Box>
            </Collapse>
          </Box>
        )
      })}
    </VStack>
  )
}
