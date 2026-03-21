import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Flex, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { SearchInput, SelectLike } from '../components'
import { CategoriasTable, FornecedoresTable, LocaisEstoqueTable, MateriasPrimasTable, TabsHeader } from './components'
import { useAuth } from '../../../context/useAuth'
import { fornecedorService } from '../../../services/parametrizacoes/fornecedorService'
import { materiaPrimaService } from '../../../services/parametrizacoes/materiaPrimaService'
import { localEstoqueService } from '../../../services/parametrizacoes/localEstoqueService'
import { categoriaService } from '../../../services/parametrizacoes/categoriaService'
import { unidadeService } from '../../../services/parametrizacoes/unidadeService'
import type { ParamTabKey } from './types'
import type { CategoriaResponse } from '../../../types/estoqueServiceTypes'
import type { CategoriaRow, FornecedorRow, LocalEstoqueRow, MateriaPrimaRow, StatusAtivo } from './types'
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs'
import {
  CategoriaUpsertDialog,
  FornecedorUpsertDialog,
  LocalEstoqueUpsertDialog,
  MateriaPrimaUpsertDialog,
  type CategoriaFormValues,
  type FornecedorFormValues,
  type LocalEstoqueFormValues,
  type MateriaPrimaFormValues,
} from './modals'

const createButtonLabel: Record<ParamTabKey, string> = {
  fornecedores: 'Cadastrar Fornecedor',
  'materias-primas': 'Cadastrar Matéria-Prima',
  locais: 'Cadastrar Local de Estoque',
  categorias: 'Cadastrar Categoria',
}

export const ParametrizacoesPage = () => {
  const { token } = useAuth()
  const [tab, setTab] = useState<ParamTabKey>('materias-primas')

  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  const [categorias, setCategorias] = useState<CategoriaResponse[]>([])
  const [unidades, setUnidades] = useState<string[]>([])

  const [fornecedores, setFornecedores] = useState<FornecedorRow[]>([])
  const [materias, setMaterias] = useState<MateriaPrimaRow[]>([])
  const [locais, setLocais] = useState<LocalEstoqueRow[]>([])
  const [categoriasRows, setCategoriasRows] = useState<CategoriaRow[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialogs
  const [fornecedorDialogOpen, setFornecedorDialogOpen] = useState(false)
  const [fornecedorDialogMode, setFornecedorDialogMode] = useState<'create' | 'edit'>('create')
  const [fornecedorEditing, setFornecedorEditing] = useState<FornecedorRow | null>(null)
  const [fornecedorSubmitting, setFornecedorSubmitting] = useState(false)
  const [fornecedorError, setFornecedorError] = useState<string | null>(null)

  const [localDialogOpen, setLocalDialogOpen] = useState(false)
  const [localDialogMode, setLocalDialogMode] = useState<'create' | 'edit'>('create')
  const [localEditing, setLocalEditing] = useState<LocalEstoqueRow | null>(null)
  const [localSubmitting, setLocalSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const [materiaDialogOpen, setMateriaDialogOpen] = useState(false)
  const [materiaDialogMode, setMateriaDialogMode] = useState<'create' | 'edit'>('create')
  const [materiaEditing, setMateriaEditing] = useState<MateriaPrimaRow | null>(null)
  const [materiaSubmitting, setMateriaSubmitting] = useState(false)
  const [materiaError, setMateriaError] = useState<string | null>(null)

  const [fornecedoresAtivos, setFornecedoresAtivos] = useState<{ id: number; nome: string }[]>([])
  const [locaisEstoqueOptions, setLocaisEstoqueOptions] = useState<{ id: number; nome: string }[]>([])

  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false)
  const [categoriaDialogMode, setCategoriaDialogMode] = useState<'create' | 'edit'>('create')
  const [categoriaEditing, setCategoriaEditing] = useState<CategoriaRow | null>(null)
  const [categoriaSubmitting, setCategoriaSubmitting] = useState(false)
  const [categoriaError, setCategoriaError] = useState<string | null>(null)

  const onlyDigits = (s: string) => (s ?? '').replace(/\D/g, '')

  const reloadAll = async (signal?: AbortSignal) => {
    const [forns, mats, locs, cats] = await Promise.all([
      fornecedorService.getFornecedores({ search: '', page: 1, pageSize: 50 }, token, signal),
      materiaPrimaService.getMateriasPrimas({ search: '', page: 1, pageSize: 50 }, token, signal),
      localEstoqueService.getLocaisEstoque({ search: '', page: 1, pageSize: 50 }, token, signal),
      categoriaService.getCategorias(token, signal),
    ])
    setFornecedores(
      (forns.items ?? []).map((f) => ({
        id: f.id,
        nome: f.nome,
        cnpj: f.cnpj,
        telefone: f.telefone,
        email: f.email,
        prazoEntrega: f.prazoEntrega,
        status: (f.status === 'INATIVO' ? 'INATIVO' : 'ATIVO') as StatusAtivo,
        condicoesPagamento: (f as any).condicoesPagamento ?? '',
        observacoes: (f as any).observacoes ?? '',
        endereco: (f as any).endereco ?? null,
      }))
    )
    setMaterias(
      (mats.items ?? []).map((mp) => ({
        id: mp.id,
        codigo: mp.codigo,
        descricao: mp.descricao,
        unidade: mp.unidade,
        categoria: mp.categoria,
        fornecedorPrincipal: mp.fornecedorPrincipal,
        fornecedorSecundarioId: (mp as any).fornecedorSecundarioId ?? null,
        localEstoqueId: (mp as any).localEstoqueId ?? null,
        estoqueAtual: Number(mp.estoqueAtual ?? 0),
        estoqueMinimo: Number(mp.estoqueMinimo ?? 0),
      }))
    )
    setLocais((locs.items ?? []).map((l) => ({ id: l.id, nome: l.nome, descricao: l.descricao })))
    setCategoriasRows(cats.map((c) => ({ id: c.id, nome: c.nome })))
    setCategorias(cats)
  }

  const categoriaOptions = useMemo(() => {
    return categorias.map((c) => ({ label: c.nome, value: c.nome }))
  }, [categorias])

  useEffect(() => {
    const controller = new AbortController()
    categoriaService
      .getCategorias(token, controller.signal)
      .then(setCategorias)
      .catch(() => {})
    unidadeService
      .getUnidades(token, controller.signal)
      .then(setUnidades)
      .catch(() => {})
    return () => controller.abort()
  }, [token])

  useEffect(() => {
    const controller = new AbortController()
    const handle = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      const run = async () => {
        if (tab === 'fornecedores') {
          const page = await fornecedorService.getFornecedores(
            { search, status: statusFiltro, page: 1, pageSize: 50 },
            token,
            controller.signal
          )
          setFornecedores(
            (page.items ?? []).map((f) => ({
              id: f.id,
              nome: f.nome,
              cnpj: f.cnpj,
              telefone: f.telefone,
              email: f.email,
              prazoEntrega: f.prazoEntrega,
              status: (f.status === 'INATIVO' ? 'INATIVO' : 'ATIVO') as StatusAtivo,
              condicoesPagamento: (f as any).condicoesPagamento ?? '',
              observacoes: (f as any).observacoes ?? '',
              endereco: (f as any).endereco ?? null,
            }))
          )
          return
        }

        if (tab === 'materias-primas') {
          const page = await materiaPrimaService.getMateriasPrimas(
            { search, categoria: categoriaFiltro, page: 1, pageSize: 50 },
            token,
            controller.signal
          )
          setMaterias(
            (page.items ?? []).map((mp) => ({
              id: mp.id,
              codigo: mp.codigo,
              descricao: mp.descricao,
              unidade: mp.unidade,
              categoria: mp.categoria,
              fornecedorPrincipal: mp.fornecedorPrincipal,
              fornecedorSecundarioId: (mp as any).fornecedorSecundarioId ?? null,
              localEstoqueId: (mp as any).localEstoqueId ?? null,
              estoqueAtual: Number(mp.estoqueAtual ?? 0),
              estoqueMinimo: Number(mp.estoqueMinimo ?? 0),
            }))
          )
          return
        }

        if (tab === 'locais') {
          const page = await localEstoqueService.getLocaisEstoque({ search, page: 1, pageSize: 50 }, token, controller.signal)
          setLocais(
            (page.items ?? []).map((l) => ({
              id: l.id,
              nome: l.nome,
              descricao: l.descricao,
            }))
          )
          return
        }

        // tab === 'categorias'
        const cats = await categoriaService.getCategorias(token, controller.signal)
        setCategoriasRows(cats.map((c) => ({ id: c.id, nome: c.nome })))
      }

      run()
        .catch((e) => {
          if (controller.signal.aborted) return
          setError(e instanceof Error ? e.message : 'Erro ao carregar parametrizações')
        })
        .finally(() => {
          if (controller.signal.aborted) return
          setLoading(false)
        })
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(handle)
    }
  }, [categoriaFiltro, search, statusFiltro, tab, token])

  useEffect(() => {
    if (!materiaDialogOpen) return
    const controller = new AbortController()
    fornecedorService
      .getFornecedores({ status: 'ATIVO', page: 1, pageSize: 200 }, token, controller.signal)
      .then((page) => setFornecedoresAtivos((page.items ?? []).map((f) => ({ id: f.id, nome: f.nome }))))
      .catch(() => {})

    localEstoqueService
      .getLocaisEstoque({ page: 1, pageSize: 200 }, token, controller.signal)
      .then((page) => setLocaisEstoqueOptions((page.items ?? []).map((l) => ({ id: l.id, nome: l.nome }))))
      .catch(() => {})

    return () => controller.abort()
  }, [materiaDialogOpen, token])

  const renderFiltros = () => {
    if (tab === 'fornecedores') {
      return (
        <HStack gap={3}>
          <SearchInput value={search} placeholder="Buscar" onChange={setSearch} minW="220px" />
          <SelectLike
            value={statusFiltro}
            placeholder="Selecione o Status"
            minW="220px"
            options={[
              { label: 'ATIVO', value: 'ATIVO' },
              { label: 'INATIVO', value: 'INATIVO' },
            ]}
            onChange={setStatusFiltro}
          />
        </HStack>
      )
    }

    if (tab === 'materias-primas') {
      return (
        <HStack gap={3}>
          <SearchInput value={search} placeholder="Buscar" onChange={setSearch} minW="220px" />
          <SelectLike
            value={categoriaFiltro}
            placeholder="Selecione a Categoria"
            minW="220px"
            options={categoriaOptions}
            onChange={setCategoriaFiltro}
          />
        </HStack>
      )
    }

    // tab === 'categorias' ou 'locais'
    return <SearchInput value={search} placeholder="Buscar" onChange={setSearch} minW="220px" />
  }

  const handleToggle = async (type: 'fornecedor' | 'materia' | 'local' | 'categoria', id: number) => {
    try {
      if (type === 'fornecedor') await fornecedorService.toggleStatus(id, token)
      else if (type === 'materia') await materiaPrimaService.toggleStatus(id, token)
      else if (type === 'local') await localEstoqueService.toggleStatus(id, token)
      else await categoriaService.toggleStatus(id, token)
      await reloadAll()
    } catch {
      // ignore
    }
  }

  const renderTabela = () => {
    if (tab === 'fornecedores') {
      return (
        <FornecedoresTable
          rows={fornecedores}
          onEdit={(row) => {
            setFornecedorEditing(row)
            setFornecedorDialogMode('edit')
            setFornecedorError(null)
            setFornecedorDialogOpen(true)
          }}
          onToggle={(row) => handleToggle('fornecedor', row.id)}
        />
      )
    }
    if (tab === 'materias-primas') {
      return (
        <MateriasPrimasTable
          rows={materias}
          onEdit={(row) => {
            setMateriaEditing(row)
            setMateriaDialogMode('edit')
            setMateriaError(null)
            setMateriaDialogOpen(true)
          }}
          onToggle={(row) => handleToggle('materia', row.id)}
        />
      )
    }
    if (tab === 'locais') {
      return (
        <LocaisEstoqueTable
          rows={locais}
          onEdit={(row) => {
            setLocalEditing(row)
            setLocalDialogMode('edit')
            setLocalError(null)
            setLocalDialogOpen(true)
          }}
          onToggle={(row) => handleToggle('local', row.id)}
        />
      )
    }
    return (
      <CategoriasTable
        rows={categoriasRows}
        onEdit={(row) => {
          setCategoriaEditing(row)
          setCategoriaDialogMode('edit')
          setCategoriaError(null)
          setCategoriaDialogOpen(true)
        }}
        onToggle={(row) => handleToggle('categoria', row.id)}
      />
    )
  }

  const openCreate = () => {
    if (tab === 'fornecedores') {
      setFornecedorEditing(null)
      setFornecedorDialogMode('create')
      setFornecedorError(null)
      setFornecedorDialogOpen(true)
      return
    }
    if (tab === 'materias-primas') {
      setMateriaEditing(null)
      setMateriaDialogMode('create')
      setMateriaError(null)
      setMateriaDialogOpen(true)
      return
    }
    if (tab === 'locais') {
      setLocalEditing(null)
      setLocalDialogMode('create')
      setLocalError(null)
      setLocalDialogOpen(true)
      return
    }
    setCategoriaEditing(null)
    setCategoriaDialogMode('create')
    setCategoriaError(null)
    setCategoriaDialogOpen(true)
  }

  return (
    <Box py={6}>
      <Container maxW="7xl">
        <AppBreadcrumbs />

        <Box mt={3}>
          <Heading as="h1" size="md" color="gray.900">
            Parametrizações Gerais
          </Heading>
          <Text mt={1} fontSize="sm" color="gray.500">
            Gerencie as configurações principais da gestão de matérias primas
          </Text>
        </Box>

        <TabsHeader value={tab} onChange={setTab} />

        <Stack mt={4} gap={4}>
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            {renderFiltros()}
            <Button
              bg="gray.900"
              color="white"
              size="sm"
              h="34px"
              px={4}
              fontWeight="600"
              _hover={{ bg: 'gray.800' }}
              onClick={openCreate}
            >
              {createButtonLabel[tab]}
            </Button>
          </Flex>

          {error ? (
            <Text fontSize="sm" color="red.500">
              {error}
            </Text>
          ) : null}
          {loading ? (
            <Text fontSize="sm" color="gray.500">
              Carregando...
            </Text>
          ) : null}

          {renderTabela()}
        </Stack>

        <FornecedorUpsertDialog
          open={fornecedorDialogOpen}
          mode={fornecedorDialogMode}
          submitting={fornecedorSubmitting}
          error={fornecedorError}
          initialValues={
            fornecedorEditing
              ? {
                  nome: fornecedorEditing.nome,
                  cnpj: fornecedorEditing.cnpj,
                  telefone: fornecedorEditing.telefone,
                  email: fornecedorEditing.email,
                  status: fornecedorEditing.status,
                  prazoEntrega: fornecedorEditing.prazoEntrega,
                  condicoesPagamento: fornecedorEditing.condicoesPagamento ?? '',
                  observacoes: fornecedorEditing.observacoes ?? '',
                  rua: fornecedorEditing.endereco?.rua ?? '',
                  numero: fornecedorEditing.endereco?.numero ?? '',
                  cep: fornecedorEditing.endereco?.cep ?? '',
                  cidade: fornecedorEditing.endereco?.cidade ?? '',
                  estado: fornecedorEditing.endereco?.estado ?? '',
                }
              : { status: 'ATIVO' }
          }
          onClose={() => setFornecedorDialogOpen(false)}
          onSubmit={async (values: FornecedorFormValues) => {
            setFornecedorSubmitting(true)
            setFornecedorError(null)

            const payload = {
              nome: values.nome,
              cnpj: onlyDigits(values.cnpj),
              telefone: values.telefone,
              email: values.email,
              prazoEntrega: values.prazoEntrega,
              status: values.status || 'ATIVO',
              condicoesPagamento: values.condicoesPagamento,
              observacoes: values.observacoes,
              endereco: {
                rua: values.rua,
                numero: values.numero,
                cep: values.cep,
                cidade: values.cidade,
                estado: values.estado,
              },
            }

            const run =
              fornecedorDialogMode === 'create'
                ? fornecedorService.createFornecedor(payload, token)
                : fornecedorService.updateFornecedor(fornecedorEditing?.id ?? 0, payload, token)

            try {
              await run
              await reloadAll()
              setFornecedorDialogOpen(false)
            } catch (e) {
              setFornecedorError(e instanceof Error ? e.message : 'Erro ao salvar fornecedor')
            } finally {
              setFornecedorSubmitting(false)
            }
          }}
        />

        <LocalEstoqueUpsertDialog
          open={localDialogOpen}
          mode={localDialogMode}
          submitting={localSubmitting}
          error={localError}
          initialValues={localEditing ? { nome: localEditing.nome, descricao: localEditing.descricao } : undefined}
          onClose={() => setLocalDialogOpen(false)}
          onSubmit={async (values: LocalEstoqueFormValues) => {
            setLocalSubmitting(true)
            setLocalError(null)

            const payload = { nome: values.nome, descricao: values.descricao }
            const run =
              localDialogMode === 'create'
                ? localEstoqueService.createLocalEstoque(payload, token)
                : localEstoqueService.updateLocalEstoque(localEditing?.id ?? 0, payload, token)

            try {
              await run
              await reloadAll()
              setLocalDialogOpen(false)
            } catch (e) {
              setLocalError(e instanceof Error ? e.message : 'Erro ao salvar local de estoque')
            } finally {
              setLocalSubmitting(false)
            }
          }}
        />

        <MateriaPrimaUpsertDialog
          open={materiaDialogOpen}
          mode={materiaDialogMode}
          categorias={categorias.map((c) => ({ id: c.id, nome: c.nome }))}
          unidades={unidades}
          fornecedores={fornecedoresAtivos}
          locaisEstoque={locaisEstoqueOptions}
          submitting={materiaSubmitting}
          error={materiaError}
          initialValues={
            materiaEditing
              ? {
                  codigo: materiaEditing.codigo,
                  descricao: materiaEditing.descricao,
                  unidade: materiaEditing.unidade,
                  categoria: materiaEditing.categoria,
                  estoqueMinimo: String(materiaEditing.estoqueMinimo ?? 0),
                  fornecedorPrincipalId: fornecedoresAtivos.find((f) => f.nome === materiaEditing.fornecedorPrincipal)?.id
                    ? String(fornecedoresAtivos.find((f) => f.nome === materiaEditing.fornecedorPrincipal)?.id)
                    : '',
                  fornecedoresSecundarios: materiaEditing.fornecedorSecundarioId
                    ? String(materiaEditing.fornecedorSecundarioId)
                    : '',
                  localizacaoEstoque: materiaEditing.localEstoqueId
                    ? String(materiaEditing.localEstoqueId)
                    : '',
                }
              : { estoqueMinimo: '0' }
          }
          onClose={() => setMateriaDialogOpen(false)}
          onSubmit={async (values: MateriaPrimaFormValues, resolved) => {
            setMateriaSubmitting(true)
            setMateriaError(null)

            const estoqueMinimo = Number(values.estoqueMinimo || 0)
            const payload = {
              codigo: values.codigo,
              descricao: values.descricao,
              unidade: values.unidade,
              categoria: values.categoria,
              categoriaId: resolved.categoriaId,
              fornecedorPrincipalId: resolved.fornecedorPrincipalId,
              fornecedorSecundarioId: values.fornecedoresSecundarios ? Number(values.fornecedoresSecundarios) : null,
              localEstoqueId: values.localizacaoEstoque ? Number(values.localizacaoEstoque) : null,
              estoqueMinimo: Number.isFinite(estoqueMinimo) ? estoqueMinimo : 0,
            }

            const run =
              materiaDialogMode === 'create'
                ? materiaPrimaService.createMateriaPrima(payload, token)
                : materiaPrimaService.updateMateriaPrima(materiaEditing?.id ?? 0, payload, token)

            try {
              await run
              await reloadAll()
              setMateriaDialogOpen(false)
            } catch (e) {
              setMateriaError(e instanceof Error ? e.message : 'Erro ao salvar matéria-prima')
            } finally {
              setMateriaSubmitting(false)
            }
          }}
        />

        <CategoriaUpsertDialog
          open={categoriaDialogOpen}
          mode={categoriaDialogMode}
          submitting={categoriaSubmitting}
          error={categoriaError}
          initialValues={categoriaEditing ? { nome: categoriaEditing.nome } : undefined}
          onClose={() => setCategoriaDialogOpen(false)}
          onSubmit={async (values: CategoriaFormValues) => {
            setCategoriaSubmitting(true)
            setCategoriaError(null)

            const run =
              categoriaDialogMode === 'create'
                ? categoriaService.createCategoria({ nome: values.nome }, token)
                : categoriaService.updateCategoria(categoriaEditing?.id ?? 0, { nome: values.nome }, token)

            try {
              await run
              await reloadAll()
              setCategoriaDialogOpen(false)
            } catch (e) {
              setCategoriaError(e instanceof Error ? e.message : 'Erro ao salvar categoria')
            } finally {
              setCategoriaSubmitting(false)
            }
          }}
        />

      </Container>
    </Box>
  )
}

