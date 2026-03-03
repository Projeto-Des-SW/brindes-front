import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Container, DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogPositioner,
   DialogRoot, DialogTitle, Flex, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { CardsResumoGrid, MovimentacoesTable, ProdutosTable, SearchInput, SectionCard, SelectLike } from './components'
import { useAuth } from '../../context/AuthContext'
import { estoqueService } from '../../services/estoqueService'
import type { EstoqueResumoResponse, MateriaPrimaResponse } from '../../types/estoqueServiceTypes'
import { materiaPrimaService } from '../../services/parametrizacoes/materiaPrimaService'
import { buildMockMovimentacoes } from './mock'
import { filterMovimentacoes } from './filters'
import { formatInt } from './format'
import type { ProdutoEstoqueRow } from './types'
import { AppBreadcrumbs } from '../../components/AppBreadcrumbs'

export const EstoquePage = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [buscaProduto, setBuscaProduto] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [buscaMov, setBuscaMov] = useState('')
  const [tipoMovFiltro, setTipoMovFiltro] = useState('')

  const [resumo, setResumo] = useState<EstoqueResumoResponse | null>(null)
  const [loadingResumo, setLoadingResumo] = useState(true)
  const [errorResumo, setErrorResumo] = useState<string | null>(null)

  const [produtos, setProdutos] = useState<ProdutoEstoqueRow[]>([])
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [errorProdutos, setErrorProdutos] = useState<string | null>(null)

  const [detalheOpen, setDetalheOpen] = useState(false)
  const [detalheId, setDetalheId] = useState<number | null>(null)
  const [detalheMp, setDetalheMp] = useState<MateriaPrimaResponse | null>(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)
  const [errorDetalhe, setErrorDetalhe] = useState<string | null>(null)

  const movimentacoes = useMemo(() => buildMockMovimentacoes(), [])
  const movimentacoesFiltradas = useMemo(() => {
    return filterMovimentacoes(movimentacoes, buscaMov, tipoMovFiltro)
  }, [buscaMov, movimentacoes, tipoMovFiltro])

  useEffect(() => {
    const controller = new AbortController()
    setLoadingResumo(true)
    setErrorResumo(null)
    estoqueService
      .getResumo(token, controller.signal)
      .then(setResumo)
      .catch((e) => {
        if (controller.signal.aborted) return
        setErrorResumo(e instanceof Error ? e.message : 'Erro ao carregar resumo')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoadingResumo(false)
      })
    return () => controller.abort()
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    const handle = window.setTimeout(() => {
      setLoadingProdutos(true)
      setErrorProdutos(null)
      estoqueService
        .getItens({ search: buscaProduto, status: statusFiltro, page: 1, pageSize: 20 }, token, controller.signal)
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
  }, [buscaProduto, statusFiltro, token])

  useEffect(() => {
    if (!detalheOpen || detalheId == null) return
    const controller = new AbortController()
    setLoadingDetalhe(true)
    setErrorDetalhe(null)
    setDetalheMp(null)

    materiaPrimaService
      .getMateriaPrimaById(token, detalheId, controller.signal)
      .then(setDetalheMp)
      .catch((e) => {
        if (controller.signal.aborted) return
        setErrorDetalhe(e instanceof Error ? e.message : 'Erro ao carregar detalhes')
      })
      .finally(() => {
        if (controller.signal.aborted) return
        setLoadingDetalhe(false)
      })

    return () => controller.abort()
  }, [detalheId, detalheOpen, token])

  const onViewProduto = (row: ProdutoEstoqueRow) => {
    if (row.id == null) return
    setDetalheId(row.id)
    setDetalheOpen(true)
  }

  return (
    <Box py={6}>
      <Container maxW="7xl">
        <AppBreadcrumbs />

        <Flex mt={3} align="flex-start" justify="space-between" gap={4} wrap="wrap">
          <Box>
            <Heading as="h1" size="md" color="gray.900">
              Gestão de Matéria Prima
            </Heading>
            <Text mt={1} fontSize="sm" color="gray.500">
              Acompanhe movimentações e estoque de matérias primas
            </Text>
          </Box>

          <Button
            bg="gray.900"
            color="white"
            size="sm"
            h="34px"
            px={4}
            fontWeight="600"
            _hover={{ bg: 'gray.800' }}
            onClick={() => navigate('/estoque/parametrizacoes')}
          >
            Parametrizações
          </Button>
        </Flex>

        {errorResumo ? (
          <Text mt={3} fontSize="sm" color="red.500">
            {errorResumo}
          </Text>
        ) : null}
        <CardsResumoGrid resumo={resumo} loading={loadingResumo} />

        <Stack mt={6} gap={6}>
          <SectionCard
            title="Estoque Atual por Produto"
            actions={
              <HStack gap={3}>
                <SearchInput value={buscaProduto} placeholder="Buscar" onChange={setBuscaProduto} minW="220px" />
                <SelectLike
                  value={statusFiltro}
                  placeholder="Selecione o Status"
                  minW="220px"
                  options={[
                    { label: 'NORMAL', value: 'NORMAL' },
                    { label: 'ABAIXO', value: 'ABAIXO' },
                  ]}
                  onChange={setStatusFiltro}
                />
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
              <ProdutosTable rows={produtos} onView={onViewProduto} />
            )}
          </SectionCard>

          <SectionCard
            title="Movimentações de Estoque (Mock)"
            actions={
              <HStack gap={3}>
                <SearchInput value={buscaMov} placeholder="Buscar" onChange={setBuscaMov} minW="220px" />
                <SelectLike
                  value={tipoMovFiltro}
                  placeholder="Selecione o Tipo de Movimentação"
                  minW="260px"
                  options={[
                    { label: 'Entrada', value: 'Entrada' },
                    { label: 'Saída', value: 'Saída' },
                  ]}
                  onChange={setTipoMovFiltro}
                />
                <Button
                  bg="gray.900"
                  color="white"
                  size="sm"
                  h="34px"
                  px={4}
                  fontWeight="600"
                  _hover={{ bg: 'gray.800' }}
                >
                  Cadastrar Movimentações
                </Button>
              </HStack>
            }
          >
            <MovimentacoesTable rows={movimentacoesFiltradas} />
          </SectionCard>
        </Stack>

        <DialogRoot
          open={detalheOpen}
          onOpenChange={(e) => {
            setDetalheOpen(e.open)
            if (!e.open) {
              setDetalheId(null)
              setDetalheMp(null)
              setErrorDetalhe(null)
              setLoadingDetalhe(false)
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <DialogCloseTrigger />
              <DialogHeader>
                <DialogTitle>Detalhes da Matéria-Prima</DialogTitle>
              </DialogHeader>
              <DialogBody>
                {errorDetalhe ? (
                  <Text mb={3} fontSize="sm" color="red.500">
                    {errorDetalhe}
                  </Text>
                ) : null}

                {loadingDetalhe ? (
                  <Text fontSize="sm" color="gray.500">
                    Carregando...
                  </Text>
                ) : detalheMp ? (
                  <Stack gap={2} fontSize="sm" color="gray.700">
                    <HStack justify="space-between">
                      <Text fontWeight="700">Código</Text>
                      <Text>{detalheMp.codigo || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Descrição</Text>
                      <Text>{detalheMp.descricao || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Unidade</Text>
                      <Text>{detalheMp.unidade || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Categoria</Text>
                      <Text>{detalheMp.categoria || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Fornecedor Principal</Text>
                      <Text>{detalheMp.fornecedorPrincipal || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Estoque Atual</Text>
                      <Text>{formatInt(Number(detalheMp.estoqueAtual ?? 0))}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Estoque Mínimo</Text>
                      <Text>{formatInt(Number(detalheMp.estoqueMinimo ?? 0))}</Text>
                    </HStack>
                  </Stack>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    Nenhum dado para exibir.
                  </Text>
                )}
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetalheOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>
      </Container>
    </Box>
  )
}

