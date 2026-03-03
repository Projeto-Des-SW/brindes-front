import { useEffect, useMemo, useState } from 'react'
import { Box, Button, Container, Flex, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { SearchInput, SelectLike } from '../components'
import { FornecedoresTable, LocaisEstoqueTable, MateriasPrimasTable, TabsHeader } from './components'
import { useAuth } from '../../../context/AuthContext'
import { fornecedorService } from '../../../services/parametrizacoes/fornecedorService'
import { materiaPrimaService } from '../../../services/parametrizacoes/materiaPrimaService'
import { localEstoqueService } from '../../../services/parametrizacoes/localEstoqueService'
import { categoriaService } from '../../../services/parametrizacoes/categoriaService'
import { unidadeService } from '../../../services/parametrizacoes/unidadeService'
import type { ParamTabKey } from './types'
import type { CategoriaResponse } from '../../../types/estoqueServiceTypes'
import type { FornecedorRow, LocalEstoqueRow, MateriaPrimaRow, StatusAtivo } from './types'
import { AppBreadcrumbs } from '../../../components/AppBreadcrumbs'
import {
  ConfirmDeleteDialog,
  FornecedorUpsertDialog,
  LocalEstoqueUpsertDialog,
  MateriaPrimaUpsertDialog,
  type FornecedorFormValues,
  type LocalEstoqueFormValues,
  type MateriaPrimaFormValues,
} from './modals'

const createButtonLabel: Record<ParamTabKey, string> = {
  fornecedores: 'Cadastrar Fornecedor',
  'materias-primas': 'Cadastrar Matéria-Prima',
  locais: 'Cadastrar Local de Estoque',
}

export const ParametrizacoesPage = () => {
  const { token } = useAuth()
  const [tab, setTab] = useState<ParamTabKey>('locais')

  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('')

  const [categorias, setCategorias] = useState<CategoriaResponse[]>([])
  const [unidades, setUnidades] = useState<string[]>([])

  const [fornecedores, setFornecedores] = useState<FornecedorRow[]>([])
  const [materias, setMaterias] = useState<MateriaPrimaRow[]>([])
  const [locais, setLocais] = useState<LocalEstoqueRow[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'fornecedor'; row: FornecedorRow }
    | { type: 'local'; row: LocalEstoqueRow }
    | { type: 'materia'; row: MateriaPrimaRow }
    | null
  >(null)

  const onlyDigits = (s: string) => (s ?? '').replace(/\D/g, '')

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
              estoqueAtual: Number(mp.estoqueAtual ?? 0),
              estoqueMinimo: Number(mp.estoqueMinimo ?? 0),
            }))
          )
          return
        }

        const page = await localEstoqueService.getLocaisEstoque({ search, page: 1, pageSize: 50 }, token, controller.signal)
        setLocais(
          (page.items ?? []).map((l) => ({
            id: l.id,
            nome: l.nome,
            descricao: l.descricao,
          }))
        )
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
  }, [categoriaFiltro, reloadKey, search, statusFiltro, tab, token])

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

    return <SearchInput value={search} placeholder="Buscar" onChange={setSearch} minW="220px" />
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
          onDelete={(row) => {
            setDeleteTarget({ type: 'fornecedor', row })
            setDeleteError(null)
            setDeleteDialogOpen(true)
          }}
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
          onDelete={(row) => {
            setDeleteTarget({ type: 'materia', row })
            setDeleteError(null)
            setDeleteDialogOpen(true)
          }}
        />
      )
    }
    return (
      <LocaisEstoqueTable
        rows={locais}
        onEdit={(row) => {
          setLocalEditing(row)
          setLocalDialogMode('edit')
          setLocalError(null)
          setLocalDialogOpen(true)
        }}
        onDelete={(row) => {
          setDeleteTarget({ type: 'local', row })
          setDeleteError(null)
          setDeleteDialogOpen(true)
        }}
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
    setLocalEditing(null)
    setLocalDialogMode('create')
    setLocalError(null)
    setLocalDialogOpen(true)
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
          onSubmit={(values: FornecedorFormValues) => {
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

            run
              .then(() => {
                setFornecedorDialogOpen(false)
                setReloadKey((k) => k + 1)
              })
              .catch((e) => setFornecedorError(e instanceof Error ? e.message : 'Erro ao salvar fornecedor'))
              .finally(() => setFornecedorSubmitting(false))
          }}
        />

        <LocalEstoqueUpsertDialog
          open={localDialogOpen}
          mode={localDialogMode}
          submitting={localSubmitting}
          error={localError}
          initialValues={localEditing ? { nome: localEditing.nome, descricao: localEditing.descricao } : undefined}
          onClose={() => setLocalDialogOpen(false)}
          onSubmit={(values: LocalEstoqueFormValues) => {
            setLocalSubmitting(true)
            setLocalError(null)

            const payload = { nome: values.nome, descricao: values.descricao }
            const run =
              localDialogMode === 'create'
                ? localEstoqueService.createLocalEstoque(payload, token)
                : localEstoqueService.updateLocalEstoque(localEditing?.id ?? 0, payload, token)

            run
              .then(() => {
                setLocalDialogOpen(false)
                setReloadKey((k) => k + 1)
              })
              .catch((e) => setLocalError(e instanceof Error ? e.message : 'Erro ao salvar local de estoque'))
              .finally(() => setLocalSubmitting(false))
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
                }
              : { estoqueMinimo: '0' }
          }
          onClose={() => setMateriaDialogOpen(false)}
          onSubmit={(values: MateriaPrimaFormValues, resolved) => {
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
              estoqueMinimo: Number.isFinite(estoqueMinimo) ? estoqueMinimo : 0,
            }

            const run =
              materiaDialogMode === 'create'
                ? materiaPrimaService.createMateriaPrima(payload, token)
                : materiaPrimaService.updateMateriaPrima(materiaEditing?.id ?? 0, payload, token)

            run
              .then(() => {
                setMateriaDialogOpen(false)
                setReloadKey((k) => k + 1)
              })
              .catch((e) => setMateriaError(e instanceof Error ? e.message : 'Erro ao salvar matéria-prima'))
              .finally(() => setMateriaSubmitting(false))
          }}
        />

        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          submitting={deleteSubmitting}
          error={deleteError}
          title={
            deleteTarget?.type === 'fornecedor'
              ? 'Excluir fornecedor'
              : deleteTarget?.type === 'local'
                ? 'Excluir local de estoque'
                : 'Excluir matéria-prima'
          }
          description={
            deleteTarget?.type === 'fornecedor'
              ? `Tem certeza que deseja excluir o fornecedor "${deleteTarget.row.nome}"?`
              : deleteTarget?.type === 'local'
                ? `Tem certeza que deseja excluir o local "${deleteTarget.row.nome}"?`
                : deleteTarget
                  ? `Tem certeza que deseja excluir a matéria-prima "${deleteTarget.row.descricao}"?`
                  : ''
          }
          onClose={() => {
            setDeleteDialogOpen(false)
            setDeleteTarget(null)
          }}
          onConfirm={() => {
            if (!deleteTarget) return
            setDeleteSubmitting(true)
            setDeleteError(null)

            const run =
              deleteTarget.type === 'fornecedor'
                ? fornecedorService.deleteFornecedor(deleteTarget.row.id, token)
                : deleteTarget.type === 'local'
                  ? localEstoqueService.deleteLocalEstoque(deleteTarget.row.id, token)
                  : materiaPrimaService.deleteMateriaPrima(deleteTarget.row.id, token)

            run
              .then(() => {
                setDeleteDialogOpen(false)
                setDeleteTarget(null)
                setReloadKey((k) => k + 1)
              })
              .catch((e) => setDeleteError(e instanceof Error ? e.message : 'Erro ao excluir'))
              .finally(() => setDeleteSubmitting(false))
          }}
        />
      </Container>
    </Box>
  )
}

