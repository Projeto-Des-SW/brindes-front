import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Box, Spinner, VStack } from '@chakra-ui/react'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowCliente?: boolean
  requireAdmin?: boolean
}

export const ProtectedRoute = ({
  children,
  allowCliente = false,
  requireAdmin = false
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth()

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

  if (!allowCliente && user?.tipoUsuario === 'CLIENTE') {
    return <Navigate to="/" replace />
  }

  if (requireAdmin) {
    const isAdmin = user?.perfis?.some(perfil =>
      perfil === 'ROLE_ADMIN' || perfil === 'ADMIN'
    ) ?? false

    if (!isAdmin) {
      return <Navigate to="/portal-interno" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}