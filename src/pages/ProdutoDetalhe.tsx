import { Box, Container, Grid, GridItem } from '@chakra-ui/react'
import { useParams, Navigate } from 'react-router-dom'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeFooter } from '../components/home/HomeFooter'
import { ProdutoBreadcrumb } from '../components/produto/ProdutoBreadcrumb'
import { ProdutoGaleria } from '../components/produto/ProdutoGaleria'
import { ProdutoInfo } from '../components/produto/ProdutoInfo'
import { ProdutoCaracteristicas } from '../components/produto/ProdutoCaracteristicas'
import { ProdutoAvaliacoes } from '../components/produto/ProdutoAvaliacoes'
import { PRODUTOS_DETALHE } from '../components/produto/produtoData'

export const ProdutoDetalhe = () => {
  const { id } = useParams<{ id: string }>()
  const produto = PRODUTOS_DETALHE.find((p) => p.id === Number(id))

  if (!produto) return <Navigate to="/" replace />

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      <HomeNavbar />
      <ProdutoBreadcrumb nomeProduto={produto.nome} />

      <Container maxW="7xl" py={8} flex="1">
        {/* Coluna esquerda: galeria + detalhes | Coluna direita: informações */}
        <Grid
          templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 500px' }}
          gap={{ base: 8, lg: 8 }}
          mb={2}
          alignItems="start"
        >
          <GridItem>
            <Box>
              <ProdutoGaleria imagens={produto.imagens} nomeProduto={produto.nome} />
              <ProdutoCaracteristicas caracteristicas={produto.caracteristicas} />
            </Box>
          </GridItem>
          <GridItem>
            <ProdutoInfo produto={produto} />
          </GridItem>
        </Grid>

        <ProdutoAvaliacoes avaliacoes={produto.avaliacoes} />
      </Container>

      <HomeFooter />
    </Box>
  )
}
