import { Box, Container, Heading, Text } from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { AppBreadcrumbs } from '../components/AppBreadcrumbs'

export const Perfil = () => {
  const { user } = useAuth()

  return (
    <Box py={10}>
      <Container maxW="6xl">
        <AppBreadcrumbs />
        <Heading size="lg" color="gray.900">
          Meu perfil
        </Heading>
        <Text mt={2} color="gray.600">
          Página mockada por enquanto.
        </Text>

        <Box mt={6} bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" p={5}>
          <Text fontWeight="600" color="gray.900">
            {user?.nome ?? 'Nome do Usuário'}
          </Text>
          <Text color="gray.600" fontSize="sm">
            {user?.email ?? 'email@exemplo.com'}
          </Text>
        </Box>
      </Container>
    </Box>
  )
}

