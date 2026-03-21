import { useState } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeFooter } from '../components/home/HomeFooter'
import { useCart } from '../context/useCart'
import { useAuth } from '../context/useAuth'
import { orcamentoService } from '../services/orcamentoService'
import { toaster } from '../lib/toaster'

// ─── Ícone de lixeira ────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
)

// ─── Ícone de documento (orçamento) ──────────────────────────────────────────
const DocumentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

// ─── Ícone de check/aprovação ─────────────────────────────────────────────────
const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

// ─── Ícone de relógio (entrega) ───────────────────────────────────────────────
const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

// ─── Ícone de sacola vazia ────────────────────────────────────────────────────
const EmptyCartIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)

// ─── Formatador de preço ──────────────────────────────────────────────────────
const formatPreco = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

// ─── Benefícios do carrinho ───────────────────────────────────────────────────
const CART_BENEFICIOS = [
  {
    icon: <DocumentIcon />,
    label: 'Orçamento sem Compromisso',
    desc: 'Receba seu orçamento detalhado sem nenhuma obrigação de compra',
  },
  {
    icon: <CheckCircleIcon />,
    label: 'Aprovação de Arte',
    desc: 'Aprove o design antes da produção começar',
  },
  {
    icon: <ClockIcon />,
    label: 'Entrega Garantida',
    desc: 'Receba seus produtos no prazo ou seu dinheiro de volta',
  },
]

// ─── Componente principal ─────────────────────────────────────────────────────
export const CarrinhoPage = () => {
  const { items, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const { token, isAuthenticated, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <Box minH="100vh" bg="white" display="flex" flexDirection="column">
      <HomeNavbar />

      <Container maxW="7xl" py={8} flex="1">
        {/* Breadcrumb voltar */}
        <HStack
          mb={6}
          gap={1}
          color="gray.500"
          fontSize="sm"
          cursor="pointer"
          _hover={{ color: '#1a1616' }}
          onClick={() => navigate(-1)}
          w="fit-content"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <Text>Continuar Comprando</Text>
        </HStack>

        <Text fontSize="2xl" fontWeight="700" color="#1a1616" mb={8}>
          Carrinho de Orçamento
        </Text>

        {items.length === 0 ? (
          /* Estado vazio */
          <VStack gap={5} py={20} color="gray.400" textAlign="center">
            <EmptyCartIcon />
            <Text fontSize="lg" fontWeight="600" color="gray.600">
              Seu carrinho está vazio
            </Text>
            <Text fontSize="sm" color="gray.500">
              Adicione produtos para solicitar um orçamento
            </Text>
            <Button
              mt={2}
              bg="#1a1616"
              color="white"
              fontWeight="600"
              fontSize="sm"
              px={8}
              py={5}
              borderRadius="md"
              _hover={{ bg: '#111111' }}
              onClick={() => navigate('/')}
            >
              Ver Produtos
            </Button>
          </VStack>
        ) : (
          <Grid templateColumns={{ base: '1fr', lg: '1fr 360px' }} gap={6} alignItems="start">
            {/* ── Coluna esquerda: lista de itens ── */}
            <GridItem>
              <VStack gap={4} align="stretch">
                {items.map((item) => {
                  const itemTotal = item.preco * item.quantidade

                  return (
                    <Box
                      key={item.cartItemId}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="lg"
                      p={5}
                      bg="white"
                    >
                      <HStack gap={4} align="start">
                        {/* Imagem do produto */}
                        <Box
                          w="90px"
                          h="90px"
                          borderRadius="md"
                          overflow="hidden"
                          flexShrink={0}
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <Image
                            src={item.imagem}
                            alt={item.nome}
                            w="full"
                            h="full"
                            objectFit="cover"
                          />
                        </Box>

                        {/* Informações do item */}
                        <VStack align="start" gap={1} flex={1} minW={0}>
                          <HStack justify="space-between" w="full">
                            <VStack align="start" gap={0}>
                              <Text fontWeight="700" fontSize="sm" color="#1a1616" lineClamp={1}>
                                {item.nome}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {item.categoria}
                              </Text>
                            </VStack>
                            {/* Botão remover */}
                            <Box
                              as="button"
                              color="gray.400"
                              _hover={{ color: 'red.500' }}
                              transition="color 0.15s"
                              onClick={() => removeFromCart(item.cartItemId)}
                              flexShrink={0}
                            >
                              <TrashIcon />
                            </Box>
                          </HStack>

                          <HStack gap={4} flexWrap="wrap">
                            <Text fontSize="xs" color="gray.600">
                              Cor:{' '}
                              <Text as="span" fontWeight="500" color="#1a1616">
                                {item.cor}
                              </Text>
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              Impressão:{' '}
                              <Text as="span" fontWeight="500" color="#1a1616">
                                {item.impressao}
                              </Text>
                            </Text>
                          </HStack>

                          {/* Controles de quantidade e preço */}
                          <HStack justify="space-between" w="full" mt={2} flexWrap="wrap" gap={3}>
                            {/* Seletor de quantidade */}
                            <HStack
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="md"
                              overflow="hidden"
                              h="34px"
                            >
                              <Box
                                as="button"
                                px={3}
                                h="full"
                                fontSize="lg"
                                color="gray.600"
                                _hover={{ bg: 'gray.50' }}
                                onClick={() => {
                                  if (item.quantidade > item.minimoUnidades) {
                                    updateQuantity(item.cartItemId, item.quantidade - 1)
                                  }
                                }}
                              >
                                −
                              </Box>
                              <Text
                                px={3}
                                fontWeight="600"
                                fontSize="sm"
                                minW="40px"
                                textAlign="center"
                              >
                                {item.quantidade}
                              </Text>
                              <Box
                                as="button"
                                px={3}
                                h="full"
                                fontSize="lg"
                                color="gray.600"
                                _hover={{ bg: 'gray.50' }}
                                onClick={() =>
                                  updateQuantity(item.cartItemId, item.quantidade + 1)
                                }
                              >
                                +
                              </Box>
                            </HStack>

                            {/* Preços */}
                            <VStack align="end" gap={0}>
                              <Text fontSize="xs" color="gray.500">
                                {formatPreco(item.preco)} / un
                              </Text>
                              <Text fontSize="sm" fontWeight="700" color="#1a1616">
                                {formatPreco(itemTotal)}
                              </Text>
                            </VStack>
                          </HStack>
                        </VStack>
                      </HStack>
                    </Box>
                  )
                })}
              </VStack>
            </GridItem>

            {/* ── Coluna direita: resumo ── */}
            <GridItem>
              <Box
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                p={6}
                bg="white"
                position={{ base: 'static', lg: 'sticky' }}
                top="90px"
              >
                <Text fontSize="lg" fontWeight="700" color="#1a1616" mb={5}>
                  Resumo do Orçamento
                </Text>

                {/* Subtotal */}
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="sm" color="gray.600">
                    Subtotal
                  </Text>
                  <Text fontSize="sm" fontWeight="600" color="#1a1616">
                    {formatPreco(cartTotal)}
                  </Text>
                </HStack>

                <Box h="1px" bg="gray.100" mb={4} />

                {/* Total */}
                <HStack justify="space-between" mb={6}>
                  <Text fontSize="sm" fontWeight="700" color="#1a1616">
                    Total
                  </Text>
                  <Text fontSize="lg" fontWeight="700" color="#1a1616">
                    {formatPreco(cartTotal)}
                  </Text>
                </HStack>

                {/* Botão finalizar */}
                <Button
                  w="full"
                  bg="#1a1616"
                  color="white"
                  fontWeight="600"
                  fontSize="sm"
                  py={6}
                  borderRadius="md"
                  _hover={{ bg: '#111111' }}
                  disabled={items.length === 0 || isSubmitting}
                  loading={isSubmitting}
                  onClick={async () => {
                    if (!isAuthenticated || !user || user.tipoUsuario !== 'CLIENTE') {
                      navigate('/login')
                      return
                    }

                    if (items.length === 0) return

                    try {
                      setIsSubmitting(true)
                      const payload = {
                        itens: items.map((item) => ({
                          produtoId: item.produtoId,
                          quantidade: item.quantidade,
                          cor: item.cor,
                          impressao: item.impressao,
                        })),
                      }

                      await orcamentoService.criar(token, payload)

                      clearCart()

                      toaster.create({
                        title: 'Orçamento enviado com sucesso!',
                        type: 'success',
                        duration: 4000,
                      })

                      navigate('/meus-orcamentos')
                    } catch (err) {
                      toaster.create({
                        title: 'Erro ao finalizar orçamento',
                        description: err instanceof Error ? err.message : 'Tente novamente mais tarde.',
                        type: 'error',
                        duration: 5000,
                      })
                    } finally {
                      setIsSubmitting(false)
                    }
                  }}
                >
                  <HStack gap={2}>
                    <Text>Finalizar Orçamento</Text>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </HStack>
                </Button>

                {/* Informações importantes */}
                <Box
                  mt={5}
                  p={4}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="gray.50"
                >
                  <Text fontSize="xs" fontWeight="700" color="#1a1616" mb={3}>
                    Informações Importantes
                  </Text>
                  <VStack align="start" gap={1.5}>
                    {[
                      'Valores sujeitos a alteração após análise',
                      'Prazo de entrega: 15-20 dias úteis',
                      'Pedido mínimo respeitado por produto',
                      'Mockup digital incluso no orçamento',
                    ].map((info) => (
                      <HStack key={info} gap={2} align="start">
                        <Text fontSize="xs" color="gray.500" lineHeight="1">
                          •
                        </Text>
                        <Text fontSize="xs" color="gray.500" lineHeight="1.5">
                          {info}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </GridItem>
          </Grid>
        )}

        {/* ── Benefícios ── */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mt={12}>
          {CART_BENEFICIOS.map((b) => (
            <VStack
              key={b.label}
              gap={3}
              align="center"
              textAlign="center"
              p={6}
              border="1px solid"
              borderColor="gray.100"
              borderRadius="lg"
              bg="white"
            >
              <Box color="#1a1616">{b.icon}</Box>
              <Text fontWeight="700" fontSize="sm" color="#1a1616">
                {b.label}
              </Text>
              <Text fontSize="xs" color="gray.500" lineHeight="1.6">
                {b.desc}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>

      <HomeFooter />
    </Box>
  )
}
