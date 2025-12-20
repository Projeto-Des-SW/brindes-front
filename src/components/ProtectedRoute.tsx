import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Box, Spinner, VStack } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4}>
          <Spinner
            borderWidth="4px"
            animationDuration="0.65s"
            colorPalette="gray"
            size="xl"
          />
        </VStack>
      </Box>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
