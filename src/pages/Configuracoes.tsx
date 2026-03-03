import { Box, Container, Heading, Text } from '@chakra-ui/react'
import { AppBreadcrumbs } from '../components/AppBreadcrumbs'

export const Configuracoes = () => {
  return (
    <Box py={10}>
      <Container maxW="6xl">
        <AppBreadcrumbs />
        <Heading size="lg" color="gray.900">
          Configurações
        </Heading>
        <Text mt={2} color="gray.600">
          Página mockada por enquanto.
        </Text>
      </Container>
    </Box>
  )
}

