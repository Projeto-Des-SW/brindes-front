import { Box } from '@chakra-ui/react'
import { HomeBeneficiosSection } from '../components/home/HomeBeneficiosSection'
import { HomeCategoriasSection } from '../components/home/HomeCategoriasSection'
import { HomeFooter } from '../components/home/HomeFooter'
import { HomeHeroSection } from '../components/home/HomeHeroSection'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeProdutosDestaque } from '../components/home/HomeProdutosDestaque'

// ─── Página principal ────────────────────────────────────────────────────────

export const Home = () => {
  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      <HomeNavbar />
      <Box flex="1">
        <HomeHeroSection />
        <HomeCategoriasSection />
        <HomeProdutosDestaque />
        <HomeBeneficiosSection />
      </Box>
      <HomeFooter />
    </Box>
  )
}
