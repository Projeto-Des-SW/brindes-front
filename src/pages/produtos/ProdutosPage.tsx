import { useEffect, useState } from 'react'
import { Box, Button, Container, Flex, HStack, Heading, Stack, Text, SimpleGrid } from '@chakra-ui/react'
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@chakra-ui/react'
import { SectionCard, SearchInput, SelectLike } from '../estoque/components'
import { AppBreadcrumbs } from '../../components/AppBreadcrumbs'

import { useAuth } from '../../context/useAuth'
import { produtoService } from '../../services/produtoService'
import type { ProdutoResponse, ProdutoRequest } from '../../services/produtoService'
import { formatBRL, formatInt } from '../estoque/format'
import { PencilIcon } from '../../components/icons'
import ProdutoUpsertDialog, { ConfirmDeleteDialog } from './modals'

const StatusProdutoPill = ({ status }: { status: string }) => {
  const isAtivo = status === 'ATIVO'
  return (
    <Box
      px={3}
      py="3px"
      borderRadius="full"
      fontSize="xs"
      fontWeight="700"
      textAlign="center"
      minW="86px"
      bg={isAtivo ? 'green.100' : 'red.100'}
      color={isAtivo ? 'green.700' : 'red.600'}
    >
      {isAtivo ? 'Ativo' : 'Inativo'}
    </Box>
  )
}

const ProdutoCard = ({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) => (
  <Box
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    p={4}
    position="relative"
    boxShadow="sm"
  >
    <Flex align="center" justify="space-between">
      <Flex align="center" gap={1.5}>
        <Box color="gray.400" flexShrink={0}>{icon}</Box>
        <Text fontSize="xs" color="gray.500" fontWeight="600">{title}</Text>
      </Flex>
      <Box color="gray.400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17l9.2-9.2M17 17V8H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Box>
    </Flex>
    <Text mt={3} fontSize="2xl" fontWeight="800" color="gray.900" letterSpacing="-0.02em">
      {value}
    </Text>
  </Box>
)

const ProdutosResumoGrid = ({
  totalProdutos,
  totalAtivos,
  produtosBloqueados,
  produtosSemMovimentacao,
}: {
  totalProdutos: number
  totalAtivos: number
  produtosBloqueados: number
  produtosSemMovimentacao: number
}) => {
  const formatNum = (n: number) => n.toLocaleString('pt-BR')
  return (
    <SimpleGrid mt={5} columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
      <ProdutoCard
        title="Total de Produtos"
        value={formatNum(totalProdutos)}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      />
      <ProdutoCard
        title="Total de Produtos Ativos"
        value={formatNum(totalAtivos)}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" /></svg>}
      />
      <ProdutoCard
        title="Produtos Inativos"
        value={formatNum(produtosBloqueados)}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
      />
      <ProdutoCard
        title="Produtos sem movimentação"
        value={produtosSemMovimentacao ? formatNum(produtosSemMovimentacao) : '\u2014'}
        icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>}
      />
    </SimpleGrid>
  )
}


export const ProdutosPage = () => {
  const { token } = useAuth()

  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')

  const [produtos, setProdutos] = useState<ProdutoResponse[]>([])
  const [openCadastro, setOpenCadastro] = useState(false)
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [errorProdutos, setErrorProdutos] = useState<string | null>(null)

  // Edição
  const [produtoEditando, setProdutoEditando] = useState<ProdutoResponse | null>(null)
  const [openEdicao, setOpenEdicao] = useState(false)

  // Exclusão
  const [produtoExcluindo, setProdutoExcluindo] = useState<ProdutoResponse | null>(null)
  const [openDelete, setOpenDelete] = useState(false)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchProdutos = () => {
    const controller = new AbortController()
    setLoadingProdutos(true)
    setErrorProdutos(null)
    produtoService
      .listar({ page: 1, pageSize: 50 }, token, controller.signal)
      .then((page) => setProdutos(page.items))
      .catch((e) => {
        if (controller.signal.aborted) return
        setErrorProdutos(e instanceof Error ? e.message : 'Erro ao carregar produtos')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoadingProdutos(false)
      })
    return controller
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const controller = fetchProdutos()
      return () => controller.abort()
    }, 300)

    return () => {
      window.clearTimeout(handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, statusFiltro, token])

  // Filtro local
  const produtosFiltrados = produtos.filter((p) => {
    const matchBusca = !busca.trim() ||
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(busca.toLowerCase()))

    const matchStatus = !statusFiltro || p.status === statusFiltro

    return matchBusca && matchStatus
  })

  const columns = [
    { label: 'Produto', w: '320px' },
    { label: 'Status', w: '120px', align: 'center' as const },
    { label: 'Valor Total', w: '120px', align: 'right' as const },
    { label: 'Quantidade Disponível', w: '140px', align: 'right' as const },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  const totalProdutos = produtos.length
  const totalAtivos = produtos.filter((p) => p.status === 'ATIVO').length
  const produtosBloqueados = produtos.filter((p) => p.status === 'INATIVO').length
  const produtosSemMovimentacao = 0

  const handleCriarProduto = async (data: ProdutoRequest) => {
    try {
      await produtoService.criar(data, token)
      setOpenCadastro(false)
      fetchProdutos()
    } catch (e) {
      console.error('Erro ao cadastrar produto:', e)
      setErrorProdutos(e instanceof Error ? e.message : 'Erro ao cadastrar produto')
    }
  }

  const handleAbrirEdicao = (produto: ProdutoResponse) => {
    setProdutoEditando(produto)
    setOpenEdicao(true)
  }

  const handleEditarProduto = async (data: ProdutoRequest) => {
    if (!produtoEditando) return
    try {
      await produtoService.atualizar(produtoEditando.id, data, token)
      setOpenEdicao(false)
      setProdutoEditando(null)
      fetchProdutos()
    } catch (e) {
      console.error('Erro ao editar produto:', e)
      setErrorProdutos(e instanceof Error ? e.message : 'Erro ao editar produto')
    }
  }

  const handleAbrirDelete = (produto: ProdutoResponse) => {
    setProdutoExcluindo(produto)
    setDeleteError(null)
    setOpenDelete(true)
  }

  const handleConfirmarDelete = async () => {
    if (!produtoExcluindo) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await produtoService.remover(produtoExcluindo.id, token)
      setOpenDelete(false)
      setProdutoExcluindo(null)
      fetchProdutos()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Erro ao excluir produto')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <Box py={6}>
      <Container maxW="7xl">
        <AppBreadcrumbs />

        <Flex mt={3} align="flex-start" justify="space-between" gap={4} wrap="wrap">
          <Box>
            <Heading as="h1" size="md" color="gray.900">
              Gestão de Produtos
            </Heading>
            <Text mt={1} fontSize="sm" color="gray.500">
              Acompanhe produtos, estoque e movimentações relacionadas
            </Text>
          </Box>
        </Flex>

        <ProdutosResumoGrid
          totalProdutos={totalProdutos}
          totalAtivos={totalAtivos}
          produtosBloqueados={produtosBloqueados}
          produtosSemMovimentacao={produtosSemMovimentacao}
        />

        <Stack mt={6} gap={6}>
          <SectionCard
            title="Produtos"
            actions={
              <HStack gap={3}>
                <SearchInput value={busca} placeholder="Buscar produto..." onChange={setBusca} minW="220px" />
                <SelectLike
                  value={statusFiltro}
                  placeholder="Selecione o Status"
                  minW="180px"
                  options={[{ label: 'Ativo', value: 'ATIVO' }, { label: 'Inativo', value: 'INATIVO' }]}
                  onChange={setStatusFiltro}
                />
                <Button
                  bg="gray.900"
                  color="white"
                  size="sm"
                  h="34px"
                  px={4}
                  fontWeight="600"
                  _hover={{ bg: 'gray.800' }}
                  onClick={() => setOpenCadastro(true)}
                >
                  Cadastrar Produto
                </Button>
              </HStack>
            }
          >
            {errorProdutos ? (
              <Text mb={3} fontSize="sm" color="red.500">
                {errorProdutos}
              </Text>
            ) : null}

            {loadingProdutos ? (
              <Text fontSize="sm" color="gray.500">
                Carregando...
              </Text>
            ) : (
              <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="md">
                <Box as="table" w="full" borderCollapse="collapse" tableLayout="fixed">
                  <Box as="thead" bg="gray.50">
                    <Box as="tr">
                      {columns.map((col) => (
                        <Box
                          as="th"
                          key={col.label}
                          textAlign={col.align ?? 'left'}
                          fontSize="xs"
                          color="gray.500"
                          fontWeight="700"
                          px={3}
                          py={3}
                          borderBottom="1px solid"
                          borderColor="gray.200"
                          w={col.w}
                        >
                          {col.label}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">{produtosFiltrados.map((p) => {
                    const valor = (p.estoqueAtual ?? 0) * (p.precoVenda != null ? Number(p.precoVenda) : 0)
                    return (
                      <Box as="tr" key={p.id}>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                          <Box maxW="300px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={p.nome}>
                            {p.nome}
                          </Box>
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                          <StatusProdutoPill status={p.status} />
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700" textAlign="right">
                          {formatBRL(valor)}
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700" textAlign="right">
                          {formatInt(p.estoqueAtual ?? 0)}
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                          <MenuRoot positioning={{ placement: 'bottom-end' }}>
                            <MenuTrigger asChild>
                              <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ações do produto">
                                <PencilIcon size={16} />
                              </Button>
                            </MenuTrigger>
                            <MenuContent>
                              <MenuItem value="edit" onClick={() => handleAbrirEdicao(p)}>
                                Editar
                              </MenuItem>
                              <MenuItem value="delete" onClick={() => handleAbrirDelete(p)} color="red.600">
                                Excluir
                              </MenuItem>
                            </MenuContent>
                          </MenuRoot>
                        </Box>
                      </Box>
                    )
                  })}</Box>
                </Box>
              </Box>
            )}
          </SectionCard>
        </Stack>
      </Container>

      {/* Modal de Cadastro */}
      <ProdutoUpsertDialog
        open={openCadastro}
        onClose={() => setOpenCadastro(false)}
        onSubmit={handleCriarProduto}
      />

      {/* Modal de Edição */}
      <ProdutoUpsertDialog
        open={openEdicao}
        initialData={produtoEditando}
        onClose={() => {
          setOpenEdicao(false)
          setProdutoEditando(null)
        }}
        onSubmit={handleEditarProduto}
      />

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDeleteDialog
        open={openDelete}
        title="Excluir produto"
        description={produtoExcluindo ? `Tem certeza que deseja excluir o produto "${produtoExcluindo.nome}"? Esta ação não pode ser desfeita.` : ''}
        submitting={deleteSubmitting}
        error={deleteError}
        onClose={() => {
          setOpenDelete(false)
          setProdutoExcluindo(null)
          setDeleteError(null)
        }}
        onConfirm={handleConfirmarDelete}
      />
    </Box>
  )
}

export default ProdutosPage
