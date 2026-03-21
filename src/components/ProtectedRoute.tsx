import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Box, Spinner, VStack } from '@chakra-ui/react'

const isFuncionario = (user: { tipoUsuario: string } | null) =>
  user?.tipoUsuario === 'FUNCIONARIO' || user?.tipoUsuario === 'ADMIN'

const LoadingSpinner = () => (
  <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
    <VStack gap={4}>
      <Spinner borderWidth="4px" animationDuration="0.65s" colorPalette="gray" size="xl" />
    </VStack>
  </Box>
)

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

  if (loading) return <LoadingSpinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Rotas exclusivas de cliente: redireciona funcionário/admin para o portal interno
  if (allowCliente && isFuncionario(user)) {
    return <Navigate to="/portal-interno" replace />
  }

  // Rotas internas: bloqueia cliente
  if (!allowCliente && user?.tipoUsuario === 'CLIENTE') {
    return <Navigate to="/" replace />
  }

  if (requireAdmin) {
    const isAdmin = user?.perfis?.some(p => p === 'ROLE_ADMIN' || p === 'ADMIN') ?? false
    if (!isAdmin) {
      return <Navigate to="/portal-interno" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}

/** Rotas públicas: redireciona funcionário/admin autenticado para o portal interno */
export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) return <LoadingSpinner />

  if (isAuthenticated && isFuncionario(user)) {
    return <Navigate to="/portal-interno" replace />
  }

  return <>{children}</>
}