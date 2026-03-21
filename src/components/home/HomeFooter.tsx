import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react'

export const HomeFooter = () => (
  <Box bg="#101828" color="white" pt={12} pb={6}>
    <Container maxW="7xl">
      <HStack align="start" justify="space-between" mb={10} flexWrap="wrap" gap={8}>
        <Box maxW="25%">
          <Text
            fontFamily="'Dancing Script', 'Brush Script MT', cursive"
            fontSize="xl"
            fontWeight="700"
            mb={3}
          >
            Bahia Brindes
          </Text>
          <Text fontSize="xs" color="gray.400" lineHeight="1.8">
            Transformando brindes em estratégia de marca desde 2010. Qualidade e personalização que fazem a diferença.
          </Text>
        </Box>

        <Box maxW="25%">
          <Text fontWeight="600" fontSize="sm" mb={4}>
            Contato
          </Text>
          <VStack align="start" gap={2}>
            <HStack gap={2} align="start">
              <Box mt="2px" flexShrink={0} color="gray.400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </Box>
              <Text fontSize="xs" color="gray.400" lineHeight="1.6">
                Garanhuns, Pernambuco<br />Brasil
              </Text>
            </HStack>
            <HStack gap={2}>
              <Box color="gray.400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 013 1.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.09a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.01z" />
                </svg>
              </Box>
              <Text fontSize="xs" color="gray.400">(96) 5103-4444</Text>
            </HStack>
            <HStack gap={2}>
              <Box color="gray.400">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </Box>
              <Text fontSize="xs" color="gray.400">contato@bahiabrindes.com.br</Text>
            </HStack>
          </VStack>
        </Box>
      </HStack>

      <Box borderTop="1px solid" borderColor="gray.700" pt={5} textAlign="center">
        <Text fontSize="xs" color="gray.500">
          © 2026 Bahia Brindes. Todos os direitos reservados.
        </Text>
      </Box>
    </Container>
  </Box>
)
