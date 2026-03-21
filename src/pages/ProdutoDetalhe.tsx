import { useEffect, useState } from 'react'
import { Box, Button, Container, Grid, GridItem, Spinner, Text, VStack } from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeFooter } from '../components/home/HomeFooter'
import { ProdutoBreadcrumb } from '../components/produto/ProdutoBreadcrumb'
import { ProdutoGaleria } from '../components/produto/ProdutoGaleria'
import { ProdutoInfo } from '../components/produto/ProdutoInfo'
import { ProdutoCaracteristicas } from '../components/produto/ProdutoCaracteristicas'
import { ProdutoAvaliacoes } from '../components/produto/ProdutoAvaliacoes'
import { produtoService, type ProdutoResponse, type AvaliacaoResponse } from '../services/produtoService'

export const ProdutoDetalhe = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [produto, setProduto] = useState<ProdutoResponse | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true
    const controller = new AbortController()

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const [p, avs] = await Promise.all([
          produtoService.buscarPorId(Number(id), null, controller.signal),
          produtoService.listarAvaliacoes(Number(id)),
        ])
        if (isMounted) {
          setProduto(p)
          setAvaliacoes(avs)
        }
      } catch (err) {
        if (isMounted && !(err instanceof DOMException && err.name === 'AbortError')) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar produto')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [id])

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      <HomeNavbar />

      {loading && (
        <VStack flex="1" py={20} gap={3}>
          <Spinner size="lg" color="gray.500" />
          <Text fontSize="sm" color="gray.500">Carregando produto...</Text>
        </VStack>
      )}

      {!loading && error && (
        <VStack flex="1" py={20} gap={4}>
          <Text fontSize="sm" color="red.500">{error}</Text>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Voltar ao início
          </Button>
        </VStack>
      )}

      {!loading && produto && (
        <>
          <ProdutoBreadcrumb nomeProduto={produto.nome} />

          <Container maxW="7xl" py={8} flex="1">
            <Grid
              templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 500px' }}
              gap={{ base: 8, lg: 8 }}
              mb={2}
              alignItems="start"
            >
              <GridItem>
                <Box>
                  <ProdutoGaleria imagens={produto.imagens} nomeProduto={produto.nome} />
                  <ProdutoCaracteristicas descricao={produto.descricao} />
                </Box>
              </GridItem>
              <GridItem>
                <ProdutoInfo produto={produto} />
              </GridItem>
            </Grid>

            <ProdutoAvaliacoes
              avaliacoes={avaliacoes}
              mediaAvaliacao={Number(produto.mediaAvaliacao ?? 0)}
            />
          </Container>
        </>
      )}

      <HomeFooter />
    </Box>
  )
}
