import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
} from '@chakra-ui/react'

export const Home = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="4xl">
        <Box boxShadow="lg" borderRadius="lg" bg="white" p={8}>
            <VStack gap={6} align="start" w="full">
              <Heading as="h1" size="2xl" color="slate.900">
                Bem-vindo, {user?.nome}
              </Heading>

              <Box w="full" h="1px" bg="gray.200" />

              <VStack gap={4} w="full">
                <HStack justify="space-between" w="full" pb={3} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontWeight="medium" color="gray.600">
                    Email:
                  </Text>
                  <Text color="slate.900" fontWeight="500">
                    {user?.email}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full" pb={3} borderBottom="1px solid" borderColor="gray.200">
                  <Text fontWeight="medium" color="gray.600">
                    ID:
                  </Text>
                  <Text color="slate.900" fontWeight="500">
                    {user?.id}
                  </Text>
                </HStack>

                <HStack justify="space-between" w="full">
                  <Text fontWeight="medium" color="gray.600">
                    Perfis:
                  </Text>
                  <HStack gap={2}>
                    {user?.perfis?.map((perfil, index) => (
                      <Badge key={index} colorScheme="blue" variant="solid">
                        {perfil}
                      </Badge>
                    ))}
                  </HStack>
                </HStack>
              </VStack>

              <Box w="full" h="1px" bg="gray.200" />

              <Button
                onClick={handleLogout}
                colorScheme="red"
                size="lg"
                w="full"
                fontWeight="600"
              >
                Sair
              </Button>
            </VStack>
        </Box>
      </Container>
    </Box>
  )
}
