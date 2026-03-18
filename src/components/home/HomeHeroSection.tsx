import { Box, Button, Container, Grid, GridItem, Heading, HStack, Text } from '@chakra-ui/react'
import canecaHero from '../../assets/caneca-hero.png'

export const HomeHeroSection = () => (
  <Box bg="#fafafa" minH="280px">
    <Container maxW="7xl">
      <Grid templateColumns={{ base: '1fr', md: '55% 45%' }} minH="280px" alignItems="center">
        <GridItem py={{ base: 12, md: 14 }}>
          <Heading
            as="h1"
            color="#1a1616"
            fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
            fontWeight="700"
            lineHeight="1.15"
            mb={4}
          >
            Produtos<br />Personalizados
          </Heading>
          <Text color="gray.500" fontSize="sm" mb={8} maxW="400px" lineHeight="1.6">
            Transforme brindes em estratégia. Canetas, canecas, camisetas e muito
            mais com a identidade da sua empresa.
          </Text>
          <HStack gap={3} flexWrap="wrap">
            <Button
              bg="#000000"
              color="white"
              fontWeight="600"
              fontSize="sm"
              px={5}
              py={2}
              borderRadius="md"
              _hover={{ bg: '#111111' }}
              onClick={() => {
                const section = document.getElementById('produtos-destaque')
                if (section) {
                  section.scrollIntoView({ behavior: 'smooth' })
                }
              }}
            >
              Ver Catálogo Completo
            </Button>
            <Button
              bg="#f2f4f7"
              color="#1a1a1a"
              border="1px solid"
              borderColor="#d0d5dd"
              fontWeight="600"
              fontSize="sm"
              px={5}
              py={2}
              borderRadius="md"
              _hover={{ bg: '#eaecf0', borderColor: '#c6cbd2' }}
              onClick={() => {
                const phone = '558781440072'
                const message = 'Olá, acessei o site da Bahia Brindes e gostaria de solicitar um orçamento.'
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                window.open(url, '_blank')
              }}
            >
              Solicitar Orçamento
            </Button>
          </HStack>
        </GridItem>

        <GridItem display="flex" alignItems="center" justifyContent="center" py={8}>
          <img
            src={canecaHero}
            alt="Caneca personalizada — Sua arte Aqui"
            style={{ width: '300px', height: '300px', objectFit: 'contain' }}
          />
        </GridItem>
      </Grid>
    </Container>
  </Box>
)
