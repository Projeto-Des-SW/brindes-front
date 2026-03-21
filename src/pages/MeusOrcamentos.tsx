import { Badge, Box, Button, Container, Flex, HStack, Image, Spinner, Stack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeFooter } from '../components/home/HomeFooter'
import { useAuth } from '../context/useAuth'
import { orcamentoService, type MeusOrcamentosItemResponseDTO } from '../services/orcamentoService'
import type { PageResponse } from '../types/estoqueServiceTypes'

type OrcamentoStatus = 'ARTE_PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'ORCAMENTO_SOLICITADO'

const STATUS_LABEL: Record<OrcamentoStatus, string> = {
  ARTE_PENDENTE: 'Arte Pendente',
  EM_PRODUCAO: 'Em Produção',
  CONCLUIDO: 'Concluído',
  ORCAMENTO_SOLICITADO: 'Orçamento Solicitado',
}

const STATUS_COLOR: Record<OrcamentoStatus, { bg: string; color: string }> = {
  ARTE_PENDENTE: { bg: 'orange.100', color: 'orange.700' },
  EM_PRODUCAO: { bg: 'purple.100', color: 'purple.700' },
  CONCLUIDO: { bg: 'green.100', color: 'green.700' },
  ORCAMENTO_SOLICITADO: { bg: 'blue.100', color: 'blue.700' },
}

const formatPreco = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

const formatStatusBadge = (status: string) => {
  const knownStatus = status as OrcamentoStatus
  const { bg, color } = STATUS_COLOR[knownStatus] ?? { bg: 'gray.100', color: 'gray.700' }
  const label = STATUS_LABEL[knownStatus] ?? status
  return (
    <Badge
      px={3}
      py={1}
      borderRadius="full"
      bg={bg}
      color={color}
      fontSize="xs"
      fontWeight="600"
    >
      {label}
    </Badge>
  )
}

export const MeusOrcamentos = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState<PageResponse<MeusOrcamentosItemResponseDTO> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await orcamentoService.listarMeus(token, 1, 20)
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar orçamentos')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [token])

  const orcamentos = useMemo(() => data?.items ?? [], [data])

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <HomeNavbar />

      <Box as="main" py={10} flex="1">
        <Container maxW="6xl">
          {/* Breadcrumb simples: Início / Meus Orçamentos */}
          <HStack gap={2} fontSize="xs" color="gray.500" fontWeight="500">
            <Text as="span">Início</Text>
            <Text>›</Text>
            <Text as="span" color="blue.600" fontWeight="600">
              Meus Orçamentos
            </Text>
          </HStack>

          <VStack align="start" gap={2} mt={4} mb={6}>
            <Text as="h1" fontSize="2xl" fontWeight="700" color="gray.900">
              Meus Orçamentos
            </Text>
            <Text fontSize="sm" color="gray.600">
              Acompanhe o status dos seus pedidos
            </Text>
          </VStack>

          {loading ? (
            <VStack mt={10} align="center" gap={3}>
              <Spinner size="lg" color="gray.600" />
              <Text fontSize="sm" color="gray.600">
                Carregando seus orçamentos...
              </Text>
            </VStack>
          ) : error ? (
            <VStack mt={10} align="center" gap={3}>
              <Text fontSize="sm" color="red.500">
                {error}
              </Text>
            </VStack>
          ) : orcamentos.length === 0 ? (
            <VStack mt={10} align="center" gap={3}>
              <Text fontSize="sm" color="gray.600">
                Você ainda não possui orçamentos enviados.
              </Text>
            </VStack>
          ) : (
            <VStack align="stretch" gap={4}>
              {orcamentos.map((orcamento) => (
              <Box
                key={orcamento.id}
                bg="white"
                borderRadius="lg"
                border="1px solid"
                borderColor="gray.200"
                boxShadow="sm"
                px={6}
                py={4}
              >
                <Flex
                  direction={{ base: 'column', md: 'row' }}
                  justify="space-between"
                  align={{ base: 'flex-start', md: 'center' }}
                  gap={3}
                  mb={4}
                >
                  <VStack align="flex-start" gap={1}>
                    <HStack gap={3} align="center">
                      <Text fontSize="sm" fontWeight="600" color="gray.800">
                        Pedido {orcamento.codigo ?? `#${orcamento.id}`}
                      </Text>
                      {formatStatusBadge(orcamento.status as OrcamentoStatus)}
                    </HStack>
                    <HStack gap={4} fontSize="xs" color="gray.500">
                      <Text>
                        Criado em:{' '}
                        <Text as="span" fontWeight="600" color="gray.700">
                          {orcamento.dataCriacao}
                        </Text>
                      </Text>
                      {orcamento.dataPrevisaoEntrega && (
                        <Text>
                          Previsão:{' '}
                          <Text as="span" fontWeight="600" color="gray.700">
                            {orcamento.dataPrevisaoEntrega}
                          </Text>
                        </Text>
                      )}
                    </HStack>
                  </VStack>

                  <Button
                    size="sm"
                    bg="gray.900"
                    color="white"
                    fontSize="xs"
                    fontWeight="600"
                    borderRadius="md"
                    _hover={{ bg: 'gray.800' }}
                    onClick={() => navigate(`/meus-orcamentos/${orcamento.id}`)}
                  >
                    Ver Detalhes
                  </Button>
                </Flex>

                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  gap={4}
                  align="stretch"
                >
                  {orcamento.produtos.map((produto) => (
                    <Flex
                      key={produto.id}
                      flex="1"
                      gap={3}
                      align="center"
                      borderRadius="md"
                      bg="gray.50"
                      p={3}
                    >
                      <Box
                        w="80px"
                        h="80px"
                        borderRadius="md"
                        overflow="hidden"
                        flexShrink={0}
                        bg="gray.100"
                      >
                        <Image
                          src={produto.imagemUrl ?? ''}
                          alt={produto.nome}
                          w="100%"
                          h="100%"
                          objectFit="cover"
                        />
                      </Box>

                      <VStack align="flex-start" gap={1}>
                        <Text fontSize="sm" fontWeight="600" color="gray.900">
                          {produto.nome}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {produto.detalhesResumo}
                        </Text>
                      </VStack>
                    </Flex>
                  ))}

                  <VStack
                    w={{ base: 'full', md: '180px' }}
                    align={{ base: 'flex-start', md: 'flex-end' }}
                    justify="space-between"
                    gap={2}
                  >
                    <VStack align={{ base: 'flex-start', md: 'flex-end' }} gap={1}>
                      <Text fontSize="xs" color="gray.500">
                        Valor total
                      </Text>
                      <Text fontSize="lg" fontWeight="700" color="gray.900">
                        {formatPreco(Number(orcamento.valorTotal ?? 0))}
                      </Text>
                    </VStack>
                  </VStack>
                </Stack>
              </Box>
              ))}
            </VStack>
          )}
        </Container>
      </Box>

      <HomeFooter />
    </Box>
  )
}

