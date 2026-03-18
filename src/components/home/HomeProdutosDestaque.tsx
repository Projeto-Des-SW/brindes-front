import { Box, Button, Container, Heading, SimpleGrid, Text, VStack, Spinner, Center } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { produtoService, type ProdutoResponse } from '../../services/produtoService'

const ProdutoCard = ({ produto }: { produto: ProdutoResponse }) => {
  const navigate = useNavigate()
  const imgSrc =
    produto.imagens && produto.imagens.length > 0
      ? produto.imagens[0].url
      : 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=80'
  const precoFormatado = produto.precoVenda
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(produto.precoVenda)
    : 'Preço sob consulta'
  return (
    <Box
      bg="white"
      borderRadius="md"
      overflow="hidden"
      border="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <Box h="180px" overflow="hidden">
        <img
          src={imgSrc}
          alt={produto.nome}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Box>
      <Box p={4}>
        <Text fontWeight="600" fontSize="sm" color="#1a1616" mb={1} lineClamp={1}>
          {produto.nome}
        </Text>
        <Text fontWeight="700" fontSize="lg" color="#1a1616" mb={1}>
          {precoFormatado}
        </Text>
        <Text fontSize="xs" color="gray.500" mb={4}>
          Pedido mínimo: {produto.estoqueMinimo || 1}
        </Text>
        <Button
          w="full"
          bg="#000000"
          color="white"
          fontSize="xs"
          fontWeight="600"
          py={2}
          borderRadius="sm"
          _hover={{ bg: '#222' }}
          onClick={() => navigate(`/produto/${produto.id}`)}
        >
          🛒 Solicitar Orçamento
        </Button>
      </Box>
    </Box>
  )
}

export const HomeProdutosDestaque = () => {
  const [produtos, setProdutos] = useState<ProdutoResponse[]>([])
  const [totalProdutos, setTotalProdutos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true)
        const response = await produtoService.listar({ page: 1, pageSize: 4 })
        setProdutos(response.items)
        setTotalProdutos(response.total)
      } catch (err) {
        setError('Não foi possível carregar os produtos em destaque.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProdutos()
  }, [])

  return (
    <Box bg="gray.50" py={14}>
      <Container maxW="7xl">
        <VStack gap={2} mb={10}>
          <Heading as="h2" fontSize="2xl" fontWeight="700" color="#1a1616" textAlign="center">
            Produtos em Destaque
          </Heading>
          <Text fontSize="sm" color="gray.500" textAlign="center" maxW="400px">
            Explore nossa seleção de produtos personalizados premium para fortalecer a identidade
            da sua marca.
          </Text>
        </VStack>

        {loading ? (
          <Center py={10}>
            <Spinner size="xl" color="gray.400" />
          </Center>
        ) : error ? (
          <Center py={10}>
            <Text color="red.500" fontWeight="500">{error}</Text>
          </Center>
        ) : (
          <>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
              {produtos.map((produto) => (
                <ProdutoCard key={produto.id} produto={produto} />
              ))}
            </SimpleGrid>

            {totalProdutos > 4 && (
              <Box textAlign="center">
                <Button
                  variant="outline"
                  borderColor="#1a1616"
                  color="#1a1616"
                  fontWeight="600"
                  fontSize="sm"
                  px={8}
                  borderRadius="sm"
                  _hover={{ bg: '#1a1616', color: 'white' }}
                >
                  Ver Todos os Produtos
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  )
}