import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Container, DialogBackdrop, DialogBody, DialogCloseTrigger, DialogContent, DialogFooter, DialogHeader, DialogPositioner,
   DialogRoot, DialogTitle, Flex, HStack, Heading, Input, Stack, Text, Textarea } from '@chakra-ui/react'
import { CardsResumoGrid, MovimentacoesTable, ProdutosTable, SearchInput, SectionCard, SelectLike } from './components'
import { useAuth } from '../../context/useAuth'
import { estoqueService } from '../../services/estoqueService'
import type {
  CriarMovimentacaoRequest,
  EstoqueResumoResponse,
  FornecedorResponse,
  LocalEstoqueResponse,
  MateriaPrimaResponse,
  MovimentacaoResponse,
} from '../../types/estoqueServiceTypes'
import { materiaPrimaService } from '../../services/parametrizacoes/materiaPrimaService'
import { fornecedorService } from '../../services/parametrizacoes/fornecedorService'
import { localEstoqueService } from '../../services/parametrizacoes/localEstoqueService'
import { formatInt } from './format'
import type { MovimentacaoRow, ProdutoEstoqueRow, TipoMovimentacao } from './types'
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

  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoRow[]>([])
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(true)
  const [errorMovimentacoes, setErrorMovimentacoes] = useState<string | null>(null)

  const [detalheOpen, setDetalheOpen] = useState(false)
  const [detalheId, setDetalheId] = useState<number | null>(null)
  const [detalheMp, setDetalheMp] = useState<MateriaPrimaResponse | null>(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)
  const [errorDetalhe, setErrorDetalhe] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  const [viewMovOpen, setViewMovOpen] = useState(false)
  const [viewingMov, setViewingMov] = useState<MovimentacaoRow | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deletingMov, setDeletingMov] = useState(false)
  const [errorDeleteMov, setErrorDeleteMov] = useState<string | null>(null)

  const [movDialogOpen, setMovDialogOpen] = useState(false)
  const [editingMov, setEditingMov] = useState<MovimentacaoRow | null>(null)
  const [savingMov, setSavingMov] = useState(false)
  const [errorSalvarMov, setErrorSalvarMov] = useState<string | null>(null)

  const [materiasPrimasOpt, setMateriasPrimasOpt] = useState<MateriaPrimaResponse[]>([])
  const [fornecedoresOpt, setFornecedoresOpt] = useState<FornecedorResponse[]>([])
  const [locaisOpt, setLocaisOpt] = useState<LocalEstoqueResponse[]>([])
  const [loadingOpts, setLoadingOpts] = useState(false)

  const [movForm, setMovForm] = useState<{
    tipo: TipoMovimentacao
    materiaPrimaId: number | ''
    quantidade: string
    fornecedorId: number | ''
    destinoId: number | ''
    valorUnitario: string
    data: string
    motivo: string
  }>({
    tipo: 'Entrada',
    materiaPrimaId: '',
    quantidade: '',
    fornecedorId: '',
    destinoId: '',
    valorUnitario: '',
    data: '',
    motivo: '',
  })

  const formatDateBR = (iso: string | null | undefined) => {
    const s = (iso ?? '').trim()
    if (!s) return ''
    if (s.includes('/')) return s
    const d = s.slice(0, 10) // yyyy-mm-dd
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return s
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const toDateTimeLocalValue = (iso: string | null | undefined) => {
    const s = (iso ?? '').trim()
    if (!s) return ''
    // yyyy-mm-ddTHH:mm:ss -> yyyy-mm-ddTHH:mm
    if (s.length >= 16 && s.includes('T')) return s.slice(0, 16)
    return s
  }

  const mapMovResponseToRow = (m: MovimentacaoResponse): MovimentacaoRow => {
    const tipo = (m.tipo === 'Saída' ? 'Saída' : 'Entrada') as TipoMovimentacao
    return {
      id: Number(m.id),
      data: formatDateBR(m.data),
      dataIso: m.data ?? null,
      tipo,
      materiaPrimaId: Number(m.materiaPrimaId),
      materiaPrima: m.materiaPrima ?? '',
      quantidade: Number(m.quantidade ?? 0),
      fornecedorId: m.fornecedorId == null ? null : Number(m.fornecedorId),
      fornecedor: m.fornecedor ?? '',
      responsavel: m.responsavel ?? '',
      destinoId: m.destinoId == null ? null : Number(m.destinoId),
      destino: m.destino ?? '',
      valorUnitario: m.valorUnitario == null ? null : Number(m.valorUnitario),
      motivo: (m.motivo ?? '') || null,
      valorTotal: Number(m.valorTotal ?? 0),
    }
  }

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
  }, [token, refreshKey])

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
  }, [buscaProduto, statusFiltro, token, refreshKey])

  useEffect(() => {
    const controller = new AbortController()
    const handle = window.setTimeout(() => {
      setLoadingMovimentacoes(true)
      setErrorMovimentacoes(null)
      estoqueService
        .getMovimentacoes({ search: buscaMov, tipo: tipoMovFiltro, page: 1, pageSize: 50 }, token, controller.signal)
        .then((page) => setMovimentacoes((page.items ?? []).map(mapMovResponseToRow)))
        .catch((e) => {
          if (controller.signal.aborted) return
          setErrorMovimentacoes(e instanceof Error ? e.message : 'Erro ao carregar movimentações')
        })
        .finally(() => {
          if (controller.signal.aborted) return
          setLoadingMovimentacoes(false)
        })
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(handle)
    }
  }, [buscaMov, tipoMovFiltro, token, refreshKey])

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

  const openCreateMov = () => {
    setEditingMov(null)
    setErrorSalvarMov(null)
    setMovForm({
      tipo: 'Entrada',
      materiaPrimaId: '',
      quantidade: '',
      fornecedorId: '',
      destinoId: '',
      valorUnitario: '',
      data: '',
      motivo: '',
    })
    setMovDialogOpen(true)
  }

  const openEditMov = (row: MovimentacaoRow) => {
    setEditingMov(row)
    setErrorSalvarMov(null)
    setMovForm({
      tipo: row.tipo,
      materiaPrimaId: row.materiaPrimaId,
      quantidade: String(row.quantidade ?? ''),
      fornecedorId: row.fornecedorId == null ? '' : Number(row.fornecedorId),
      destinoId: row.destinoId == null ? '' : Number(row.destinoId),
      valorUnitario: row.valorUnitario == null ? '' : String(row.valorUnitario),
      data: toDateTimeLocalValue(row.dataIso),
      motivo: row.motivo ?? '',
    })
    setMovDialogOpen(true)
  }

  const ensureOptsLoaded = () => {
    if (loadingOpts) return
    if (materiasPrimasOpt.length && fornecedoresOpt.length && locaisOpt.length) return
    const controller = new AbortController()
    setLoadingOpts(true)
    Promise.all([
      materiaPrimaService.getMateriasPrimas({ page: 1, pageSize: 200 }, token, controller.signal).then((p) => p.items ?? []),
      fornecedorService.getFornecedores({ page: 1, pageSize: 200 }, token, controller.signal).then((p) => p.items ?? []),
      localEstoqueService.getLocaisEstoque({ page: 1, pageSize: 200 }, token, controller.signal).then((p) => p.items ?? []),
    ])
      .then(([mps, forn, locs]) => {
        setMateriasPrimasOpt(mps)
        setFornecedoresOpt(forn)
        setLocaisOpt(locs)
      })
      .finally(() => setLoadingOpts(false))
    return () => controller.abort()
  }

  const onViewMov = (row: MovimentacaoRow) => {
    setViewingMov(row)
    setViewMovOpen(true)
    setConfirmingDelete(false)
    setErrorDeleteMov(null)
  }

  const onDeleteMov = async () => {
    if (!viewingMov?.id) return
    try {
      setDeletingMov(true)
      setErrorDeleteMov(null)
      await estoqueService.excluirMovimentacao(viewingMov.id, token)
      setViewMovOpen(false)
      setViewingMov(null)
      setConfirmingDelete(false)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setErrorDeleteMov(e instanceof Error ? e.message : 'Erro ao excluir movimentação')
    } finally {
      setDeletingMov(false)
    }
  }

  const onSubmitMov = async () => {
    setErrorSalvarMov(null)
    const mpId = movForm.materiaPrimaId === '' ? null : Number(movForm.materiaPrimaId)
    const qtd = Number(movForm.quantidade)
    if (!mpId) return setErrorSalvarMov('Selecione a matéria-prima.')
    if (!Number.isFinite(qtd) || qtd <= 0) return setErrorSalvarMov('Informe uma quantidade válida (> 0).')

    const payload: CriarMovimentacaoRequest = {
      tipo: movForm.tipo,
      materiaPrimaId: mpId,
      quantidade: qtd,
      fornecedorId: movForm.fornecedorId === '' ? null : Number(movForm.fornecedorId),
      destinoId: movForm.destinoId === '' ? null : Number(movForm.destinoId),
      valorUnitario: movForm.valorUnitario.trim() ? Number(movForm.valorUnitario) : null,
      data: movForm.data.trim() ? movForm.data : null,
      motivo: movForm.motivo.trim() ? movForm.motivo : null,
    }

    try {
      setSavingMov(true)
      if (editingMov) {
        await estoqueService.atualizarMovimentacao(editingMov.id, payload, token)
      } else {
        await estoqueService.criarMovimentacao(payload, token)
      }
      setMovDialogOpen(false)
      setEditingMov(null)
      setRefreshKey((k) => k + 1)
    } catch (e) {
      setErrorSalvarMov(e instanceof Error ? e.message : 'Erro ao salvar movimentação')
    } finally {
      setSavingMov(false)
    }
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
            title="Estoque Atual por Matéria-Prima"
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
            title="Movimentações de Estoque"
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
                  onClick={() => {
                    ensureOptsLoaded()
                    openCreateMov()
                  }}
                >
                  Cadastrar Movimentações
                </Button>
              </HStack>
            }
          >
            {errorMovimentacoes ? (
              <Text mb={3} fontSize="sm" color="red.500">
                {errorMovimentacoes}
              </Text>
            ) : null}
            {loadingMovimentacoes ? (
              <Text fontSize="sm" color="gray.500">
                Carregando...
              </Text>
            ) : (
              <MovimentacoesTable
                rows={movimentacoes}
                onView={onViewMov}
              />
            )}
          </SectionCard>
        </Stack>

        <DialogRoot
          open={viewMovOpen}
          onOpenChange={(e) => {
            setViewMovOpen(e.open)
            if (!e.open) {
              setViewingMov(null)
              setConfirmingDelete(false)
              setErrorDeleteMov(null)
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <DialogCloseTrigger />
              <DialogHeader>
                <DialogTitle>Detalhes da Movimentação</DialogTitle>
              </DialogHeader>
              <DialogBody>
                {viewingMov ? (
                  <Stack gap={2} fontSize="sm" color="gray.700">
                    <HStack justify="space-between">
                      <Text fontWeight="700">Tipo</Text>
                      <Text>{viewingMov.tipo}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Data</Text>
                      <Text>{viewingMov.data || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Matéria-Prima</Text>
                      <Text>{viewingMov.materiaPrima || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Quantidade</Text>
                      <Text>{viewingMov.quantidade}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Fornecedor</Text>
                      <Text>{viewingMov.fornecedor || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Responsável</Text>
                      <Text>{viewingMov.responsavel || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Destino</Text>
                      <Text>{viewingMov.destino || '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Valor Unitário</Text>
                      <Text>{viewingMov.valorUnitario != null ? `R$ ${viewingMov.valorUnitario.toFixed(2)}` : '—'}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontWeight="700">Valor Total</Text>
                      <Text>{viewingMov.valorTotal != null ? `R$ ${viewingMov.valorTotal.toFixed(2)}` : '—'}</Text>
                    </HStack>
                    {viewingMov.motivo ? (
                      <Box>
                        <Text fontWeight="700" mb={1}>Motivo</Text>
                        <Text color="gray.600">{viewingMov.motivo}</Text>
                      </Box>
                    ) : null}
                  </Stack>
                ) : null}
              </DialogBody>
              <DialogFooter>
                <Stack gap={3} w="full">
                  {confirmingDelete ? (
                    <Box
                      bg="red.50"
                      border="1px solid"
                      borderColor="red.200"
                      borderRadius="md"
                      px={4}
                      py={3}
                    >
                      <Text fontSize="xs" color="red.700" fontWeight="600" mb={2}>
                        Isso irá reverter o estoque. Confirma a exclusão?
                      </Text>
                      {errorDeleteMov ? (
                        <Text fontSize="xs" color="red.600" mb={2}>{errorDeleteMov}</Text>
                      ) : null}
                      <HStack gap={2}>
                        <Button
                          size="sm"
                          bg="red.600"
                          color="white"
                          _hover={{ bg: 'red.700' }}
                          onClick={onDeleteMov}
                          disabled={deletingMov}
                        >
                          {deletingMov ? 'Excluindo...' : 'Confirmar exclusão'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => { setConfirmingDelete(false); setErrorDeleteMov(null) }}
                          disabled={deletingMov}
                        >
                          Cancelar
                        </Button>
                      </HStack>
                    </Box>
                  ) : null}
                  <HStack gap={3} justify="space-between">
                    <Button
                      variant="outline"
                      colorPalette="red"
                      onClick={() => setConfirmingDelete(true)}
                      disabled={confirmingDelete}
                    >
                      Excluir
                    </Button>
                    <HStack gap={3}>
                      <Button variant="outline" onClick={() => setViewMovOpen(false)}>
                        Fechar
                      </Button>
                      <Button
                        bg="gray.900"
                        color="white"
                        _hover={{ bg: 'gray.800' }}
                        onClick={() => {
                          if (!viewingMov) return
                          setViewMovOpen(false)
                          setConfirmingDelete(false)
                          ensureOptsLoaded()
                          openEditMov(viewingMov)
                        }}
                      >
                        Editar
                      </Button>
                    </HStack>
                  </HStack>
                </Stack>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>

        <DialogRoot
          open={movDialogOpen}
          onOpenChange={(e) => {
            setMovDialogOpen(e.open)
            if (!e.open) {
              setEditingMov(null)
              setErrorSalvarMov(null)
              setSavingMov(false)
            }
          }}
        >
          <DialogBackdrop />
          <DialogPositioner>
            <DialogContent>
              <DialogCloseTrigger />
              <DialogHeader>
                <DialogTitle>{editingMov ? 'Editar Movimentação' : 'Cadastrar Movimentação'}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                {errorSalvarMov ? (
                  <Text mb={3} fontSize="sm" color="red.500">
                    {errorSalvarMov}
                  </Text>
                ) : null}

                <Stack gap={3}>
                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Tipo
                    </Text>
                    <select
                      value={movForm.tipo}
                      onChange={(e) => setMovForm((s) => ({ ...s, tipo: e.target.value as TipoMovimentacao }))}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        background: 'white',
                        fontSize: '14px',
                        color: '#374151',
                        outline: 'none',
                      }}
                    >
                      <option value="Entrada">Entrada</option>
                      <option value="Saída">Saída</option>
                    </select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Matéria-prima
                    </Text>
                    <select
                      value={movForm.materiaPrimaId}
                      onChange={(e) =>
                        setMovForm((s) => ({ ...s, materiaPrimaId: e.target.value ? Number(e.target.value) : '' }))
                      }
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        background: 'white',
                        fontSize: '14px',
                        color: '#374151',
                        outline: 'none',
                      }}
                    >
                      <option value="">{loadingOpts ? 'Carregando...' : 'Selecione'}</option>
                      {materiasPrimasOpt.map((mp) => (
                        <option key={mp.id} value={mp.id}>
                          {mp.descricao || mp.codigo}
                        </option>
                      ))}
                    </select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Quantidade
                    </Text>
                    <Input
                      value={movForm.quantidade}
                      onChange={(e) => setMovForm((s) => ({ ...s, quantidade: e.target.value }))}
                      placeholder="Ex: 10"
                      h="38px"
                      bg="white"
                      borderColor="gray.200"
                      fontSize="sm"
                      inputMode="decimal"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Fornecedor (opcional)
                    </Text>
                    <select
                      value={movForm.fornecedorId}
                      onChange={(e) =>
                        setMovForm((s) => ({ ...s, fornecedorId: e.target.value ? Number(e.target.value) : '' }))
                      }
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        background: 'white',
                        fontSize: '14px',
                        color: '#374151',
                        outline: 'none',
                      }}
                    >
                      <option value="">{loadingOpts ? 'Carregando...' : '—'}</option>
                      {fornecedoresOpt.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.nome}
                        </option>
                      ))}
                    </select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Destino (local de estoque) (opcional)
                    </Text>
                    <select
                      value={movForm.destinoId}
                      onChange={(e) => setMovForm((s) => ({ ...s, destinoId: e.target.value ? Number(e.target.value) : '' }))}
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        background: 'white',
                        fontSize: '14px',
                        color: '#374151',
                        outline: 'none',
                      }}
                    >
                      <option value="">{loadingOpts ? 'Carregando...' : '—'}</option>
                      {locaisOpt.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nome}
                        </option>
                      ))}
                    </select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Valor unitário (opcional)
                    </Text>
                    <Input
                      value={movForm.valorUnitario}
                      onChange={(e) => setMovForm((s) => ({ ...s, valorUnitario: e.target.value }))}
                      placeholder="Ex: 9.99"
                      h="38px"
                      bg="white"
                      borderColor="gray.200"
                      fontSize="sm"
                      inputMode="decimal"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Data (opcional)
                    </Text>
                    <Input
                      type="datetime-local"
                      value={movForm.data}
                      onChange={(e) => setMovForm((s) => ({ ...s, data: e.target.value }))}
                      h="38px"
                      bg="white"
                      borderColor="gray.200"
                      fontSize="sm"
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>
                      Motivo (opcional)
                    </Text>
                    <Textarea
                      value={movForm.motivo}
                      onChange={(e) => setMovForm((s) => ({ ...s, motivo: e.target.value }))}
                      placeholder="Descreva o motivo da movimentação"
                      bg="white"
                      borderColor="gray.200"
                      fontSize="sm"
                      minH="90px"
                      resize="vertical"
                    />
                  </Box>
                </Stack>
              </DialogBody>
              <DialogFooter>
                <HStack gap={3}>
                  <Button variant="outline" onClick={() => setMovDialogOpen(false)} disabled={savingMov}>
                    Cancelar
                  </Button>
                  <Button
                    bg="gray.900"
                    color="white"
                    _hover={{ bg: 'gray.800' }}
                    onClick={onSubmitMov}
                    disabled={savingMov}
                  >
                    {savingMov ? 'Salvando...' : 'Salvar'}
                  </Button>
                </HStack>
              </DialogFooter>
            </DialogContent>
          </DialogPositioner>
        </DialogRoot>

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

