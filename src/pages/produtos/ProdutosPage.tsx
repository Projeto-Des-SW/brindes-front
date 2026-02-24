import { useEffect, useState } from 'react'
// useNavigate removed (não utilizado após alteração para modal)
import { Box, Button, Container, Flex, HStack, Heading, Stack, Text, SimpleGrid } from '@chakra-ui/react'
import { SectionCard, SearchInput, SelectLike, StatusPill, CardResumo } from '../estoque/components'
import { AppBreadcrumbs } from '../../components/AppBreadcrumbs'
import { useAuth } from '../../context/AuthContext'
import { estoqueService } from '../../services/estoqueService'
import type { ProdutoEstoqueRow } from '../estoque/types'
import { formatBRL, formatInt } from '../estoque/format'
import { EyeIcon } from '../../components/icons'
import ProdutoUpsertDialog from './modals'
import type { ProdutoFormValues } from './modals'

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
  const dash = '\u2014'
  return (
    <SimpleGrid mt={5} columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
      <CardResumo title="Total de Produtos" value={String(totalProdutos)} subtitle="" />
      <CardResumo title="Produtos Ativos" value={String(totalAtivos)} subtitle="" />
      <CardResumo title="Produtos Bloqueados" value={String(produtosBloqueados)} subtitle="" />
      <CardResumo title="Produtos sem movimentação" value={String(produtosSemMovimentacao || dash)} subtitle="" />
    </SimpleGrid>
  )
}

export const ProdutosPage = () => {
  const { token } = useAuth()

  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')

  const [produtos, setProdutos] = useState<ProdutoEstoqueRow[]>([])
  const [openCadastro, setOpenCadastro] = useState(false)
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [errorProdutos, setErrorProdutos] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const handle = window.setTimeout(() => {
      setLoadingProdutos(true)
      setErrorProdutos(null)
      estoqueService
        .getItens({ search: busca, status: statusFiltro, page: 1, pageSize: 20 }, token, controller.signal)
        .then((page) => setProdutos(page.items))
        .catch((e) => {
          if (controller.signal.aborted) return
          setErrorProdutos(e instanceof Error ? e.message : 'Erro ao carregar itens')
        })
        .finally(() => {
          if (controller.signal.aborted) return
          setLoadingProdutos(false)
        })
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(handle)
    }
  }, [busca, statusFiltro, token])

  const columns = [
    { label: 'Produto', w: '320px' },
    { label: 'Status', w: '120px', align: 'center' as const },
    { label: 'Valor', w: '120px', align: 'right' as const },
    { label: 'Quantidade Disponível', w: '140px', align: 'right' as const },
    { label: 'Responsável', w: '160px' },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  const totalProdutos = produtos.length
  const totalAtivos = produtos.filter((p) => p.status === 'NORMAL').length
  const produtosBloqueados = produtos.filter((p) => p.status === 'ABAIXO').length
  const produtosSemMovimentacao = 0

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
                  <SearchInput value={busca} placeholder="Buscar" onChange={setBusca} minW="220px" />
                  <SelectLike
                    value={statusFiltro}
                    placeholder="Selecione o Status"
                    minW="220px"
                    options={[{ label: 'NORMAL', value: 'NORMAL' }, { label: 'ABAIXO', value: 'ABAIXO' }]}
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
                  <Box as="tbody">{produtos.map((p) => {
                    return (
                      <Box as="tr" key={`${p.id ?? p.codigo}-${p.materiaPrima}`}>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                          <Box maxW="300px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={p.materiaPrima}>
                            {p.materiaPrima}
                          </Box>
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                          <StatusPill status={p.status} />
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700" textAlign="right">
                          {formatBRL(p.valorUnitario)}
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700" textAlign="right">
                          {formatInt(p.quantidadeAtual)}
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                          {'\u2014'}
                        </Box>

                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                          <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ver detalhes" onClick={() => {}}>
                            <EyeIcon size={16} />
                          </Button>
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
      <ProdutoUpsertDialog
        open={openCadastro}
        onClose={() => setOpenCadastro(false)}
        onSubmit={(values: ProdutoFormValues) => {
          // Por enquanto apenas log e adicionar item mock no estado para visualização
          console.log('Cadastrar produto:', values)
          const novo = {
            id: Math.floor(Math.random() * 1000000),
            codigo: '',
            materiaPrima: values.nome,
            quantidadeAtual: Number(values.quantidade) || 0,
            estoqueMinimo: 0,
            valorUnitario: Number(values.preco) || 0,
            status: values.status === 'ABAIXO' ? ('ABAIXO' as const) : ('NORMAL' as const),
          }
          setProdutos((s) => [novo as ProdutoEstoqueRow, ...s])
          setOpenCadastro(false)
        }}
      />
    </Box>
  )
}

export default ProdutosPage
