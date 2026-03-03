import { Flex, Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'

export const AppLayout = () => {
  return (
    <Flex minH="100vh" direction="column" bg="gray.100">
      <AppHeader />
      <Box flex="1" bg="gray.100">
        <Outlet />
      </Box>
    </Flex>
  )
}

