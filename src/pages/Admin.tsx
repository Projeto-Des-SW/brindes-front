import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Container,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  Flex,
  HStack,
  Heading,
  Input,
  PopoverBody,
  PopoverContent,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { AppBreadcrumbs } from '../components/AppBreadcrumbs'
import { useAuth } from '../context/useAuth'
import { funcionarioService } from '../services/funcionarioService'
import type { FuncionarioResponse } from '../services/funcionarioService'
import { SearchInput } from './estoque/components'
import { PencilIcon } from '../components/icons'

// ─── helpers ─────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

const perfilLabel = (p: string) => (p === 'ROLE_ADMIN' ? 'Admin' : 'Funcionário')

// ─── sub-components ──────────────────────────────────────────────────────────

const ErrorAlert = ({ message }: { message: string }) => (
  <Box
    bg="red.50"
    border="1px solid"
    borderColor="red.300"
    borderRadius="md"
    px={4}
    py={3}
    mb={3}
    display="flex"
    alignItems="flex-start"
    gap={2}
  >
    <Text color="red.500" fontWeight="bold" fontSize="md" lineHeight="1.4" flexShrink={0}>
      ✕
    </Text>
    <Text fontSize="sm" color="red.700" fontWeight="600" lineHeight="1.5">
      {message}
    </Text>
  </Box>
)

const CardResumo = ({ title, value }: { title: string; value: string }) => (
  <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" p={4} boxShadow="sm">
    <Text fontSize="xs" color="gray.500" fontWeight="600">
      {title}
    </Text>
    <Text mt={2} fontSize="xl" fontWeight="700" color="gray.900">
      {value}
    </Text>
  </Box>
)

const PerfilBadge = ({ perfil }: { perfil: string }) => (
  <Box
    as="span"
    px={2}
    py="2px"
    borderRadius="md"
    fontSize="xs"
    fontWeight="600"
    bg={perfil === 'ROLE_ADMIN' ? 'purple.100' : 'blue.100'}
    color={perfil === 'ROLE_ADMIN' ? 'purple.700' : 'blue.700'}
  >
    {perfilLabel(perfil)}
  </Box>
)

const StatusPill = ({ ativo }: { ativo: boolean }) => (
  <Box
    px={3}
    py="3px"
    borderRadius="full"
    fontSize="xs"
    fontWeight="700"
    textAlign="center"
    minW="72px"
    bg={ativo ? 'green.100' : 'red.100'}
    color={ativo ? 'green.700' : 'red.600'}
  >
    {ativo ? 'Ativo' : 'Inativo'}
  </Box>
)

// ─── upsert dialog ────────────────────────────────────────────────────────────

const defaultForm = { nome: '', email: '', senha: '', perfis: ['ROLE_FUNCIONARIO'] }

const FuncionarioDialog = ({
  open,
  initialData,
  onClose,
  onSubmit,
}: {
  open: boolean
  initialData?: FuncionarioResponse | null
  onClose: () => void
  onSubmit: (data: { nome: string; email: string; senha: string; perfis: string[] }) => Promise<void>
}) => {
  const isEdit = Boolean(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(defaultForm)

  const initialDataRef = useRef(initialData)
  initialDataRef.current = initialData

  useEffect(() => {
    if (!open) return
    setError(null)
    const data = initialDataRef.current
    if (data) {
      setForm({
        nome: data.nome ?? '',
        email: data.email ?? '',
        senha: '',
        perfis: data.perfis?.length ? [...data.perfis] : ['ROLE_FUNCIONARIO'],
      })
    } else {
      setForm(defaultForm)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const togglePerfil = (p: string) => {
    setForm((s) => ({
      ...s,
      perfis: s.perfis.includes(p) ? s.perfis.filter((x) => x !== p) : [...s.perfis, p],
    }))
  }

  const handleSubmit = async () => {
    if (submitting) return
    if (!form.nome.trim() || !form.email.trim()) {
      setError('Nome e email são obrigatórios.')
      return
    }
    if (!isEdit && !form.senha.trim()) {
      setError('Senha é obrigatória.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await onSubmit(form)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar funcionário')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) onClose() }}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="480px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar Funcionário' : 'Cadastrar Funcionário'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {error ? <ErrorAlert message={error} /> : null}
            <Stack gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="700" mb={1}>Nome *</Text>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
                  placeholder="Nome completo"
                  h="38px"
                  bg="white"
                  borderColor="gray.200"
                  fontSize="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="700" mb={1}>Email *</Text>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  h="38px"
                  bg="white"
                  borderColor="gray.200"
                  fontSize="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="700" mb={1}>
                  Senha {isEdit ? '(deixe em branco para manter)' : '*'}
                </Text>
                <Input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm((s) => ({ ...s, senha: e.target.value }))}
                  placeholder={isEdit ? 'Nova senha (opcional)' : 'Senha inicial'}
                  h="38px"
                  bg="white"
                  borderColor="gray.200"
                  fontSize="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="700" mb={2}>Perfis</Text>
                <HStack gap={3}>
                  {['ROLE_FUNCIONARIO', 'ROLE_ADMIN'].map((p) => (
                    <Box
                      key={p}
                      as="button"
                      type="button"
                      onClick={() => togglePerfil(p)}
                      px={3}
                      py={2}
                      borderRadius="md"
                      border="1px solid"
                      fontSize="sm"
                      fontWeight="600"
                      cursor="pointer"
                      borderColor={form.perfis.includes(p) ? (p === 'ROLE_ADMIN' ? 'purple.400' : 'blue.400') : 'gray.200'}
                      bg={form.perfis.includes(p) ? (p === 'ROLE_ADMIN' ? 'purple.50' : 'blue.50') : 'white'}
                      color={form.perfis.includes(p) ? (p === 'ROLE_ADMIN' ? 'purple.700' : 'blue.700') : 'gray.500'}
                    >
                      {perfilLabel(p)}
                    </Box>
                  ))}
                </HStack>
              </Box>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack gap={3}>
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
              <Button bg="gray.900" color="white" _hover={{ bg: 'gray.800' }} onClick={handleSubmit} disabled={submitting}>
                {submitting
                  ? <HStack gap={2}><Spinner size="sm" /><span>Salvando...</span></HStack>
                  : isEdit ? 'Salvar' : 'Cadastrar'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

// ─── view dialog ──────────────────────────────────────────────────────────────

const ViewDialog = ({
  open,
  funcionario,
  isSelf,
  onClose,
  onEdit,
  onDelete,
}: {
  open: boolean
  funcionario: FuncionarioResponse | null
  isSelf: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) => (
  <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) onClose() }}>
    <DialogBackdrop />
    <DialogPositioner>
      <DialogContent maxW="440px">
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Detalhes do Funcionário</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {funcionario ? (
            <Stack gap={2} fontSize="sm" color="gray.700">
              <HStack justify="space-between">
                <Text fontWeight="700">Nome</Text>
                <Text>{funcionario.nome || '—'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="700">Email</Text>
                <Text>{funcionario.email || '—'}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="700">Status</Text>
                <StatusPill ativo={funcionario.ativo} />
              </HStack>
              <HStack justify="space-between" align="flex-start">
                <Text fontWeight="700">Perfis</Text>
                <HStack gap={1} flexWrap="wrap" justify="flex-end">
                  {(funcionario.perfis ?? []).map((p) => (
                    <PerfilBadge key={p} perfil={p} />
                  ))}
                </HStack>
              </HStack>
              <HStack justify="space-between">
                <Text fontWeight="700">Cadastrado em</Text>
                <Text>{formatDate(funcionario.dtCriacao)}</Text>
              </HStack>
            </Stack>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <HStack gap={3} justify="space-between" w="full">
            {!isSelf && (
              <Button variant="outline" colorPalette="red" onClick={onDelete}>Excluir</Button>
            )}
            <HStack gap={3} ml="auto">
              <Button variant="outline" onClick={onClose}>Fechar</Button>
              <Button bg="gray.900" color="white" _hover={{ bg: 'gray.800' }} onClick={onEdit}>Editar</Button>
            </HStack>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogPositioner>
  </DialogRoot>
)

// ─── delete confirmation dialog ───────────────────────────────────────────────

const DeleteDialog = ({
  open,
  funcionario,
  onClose,
  onConfirm,
}: {
  open: boolean
  funcionario: FuncionarioResponse | null
  onClose: () => void
  onConfirm: () => Promise<void>
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (!open) { setError(null); setSubmitting(false) } }, [open])

  const handleConfirm = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await onConfirm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => { if (!e.open) onClose() }}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="440px">
          <DialogCloseTrigger />
          <DialogHeader><DialogTitle>Excluir Funcionário</DialogTitle></DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="gray.700">
              Tem certeza que deseja excluir <strong>{funcionario?.nome}</strong>? Esta ação não pode ser desfeita.
            </Text>
            {error ? <Box mt={3}><ErrorAlert message={error} /></Box> : null}
          </DialogBody>
          <DialogFooter>
            <HStack gap={3}>
              <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
              <Button bg="red.600" color="white" _hover={{ bg: 'red.700' }} onClick={handleConfirm} disabled={submitting}>
                {submitting ? <HStack gap={2}><Spinner size="sm" /><span>Excluindo...</span></HStack> : 'Excluir'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

// ─── row actions popover ──────────────────────────────────────────────────────

const RowActions = ({
  onView,
  onEdit,
  onDelete,
  canDelete,
}: {
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  canDelete: boolean
}) => (
  <PopoverRoot positioning={{ placement: 'bottom-end' }}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" h="28px" w="28px" p={0}>
        <PencilIcon size={16} />
      </Button>
    </PopoverTrigger>
    <PopoverPositioner>
      <PopoverContent w="140px" p={0} boxShadow="md" borderRadius="md" border="1px solid" borderColor="gray.200">
        <PopoverBody p={1}>
          <Stack gap={0}>
            <Button variant="ghost" size="sm" justifyContent="flex-start" fontWeight="500" fontSize="sm" h="34px" px={3} borderRadius="sm" onClick={onView}>
              Visualizar
            </Button>
            <Button variant="ghost" size="sm" justifyContent="flex-start" fontWeight="500" fontSize="sm" h="34px" px={3} borderRadius="sm" onClick={onEdit}>
              Editar
            </Button>
            {canDelete && (
              <Button variant="ghost" size="sm" justifyContent="flex-start" fontWeight="500" fontSize="sm" h="34px" px={3} borderRadius="sm" color="red.600" _hover={{ bg: 'red.50' }} onClick={onDelete}>
                Excluir
              </Button>
            )}
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </PopoverPositioner>
  </PopoverRoot>
)

// ─── main page ────────────────────────────────────────────────────────────────

const columns = [
  { label: 'Nome', w: '200px' },
  { label: 'Email', w: '220px' },
  { label: 'Perfis', w: '160px' },
  { label: 'Status', w: '100px', align: 'center' as const },
  { label: 'Cadastrado em', w: '130px' },
  { label: 'Ações', w: '80px', align: 'center' as const },
]

export const Admin = () => {
  const { token, user } = useAuth()
  const [busca, setBusca] = useState('')
  const [funcionarios, setFuncionarios] = useState<FuncionarioResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)

  const [upsertOpen, setUpsertOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FuncionarioResponse | null>(null)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewTarget, setViewTarget] = useState<FuncionarioResponse | null>(null)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FuncionarioResponse | null>(null)

  const reload = async (signal?: AbortSignal) => {
    const page = await funcionarioService.listar({ page: 1, pageSize: 100 }, token, signal)
    setFuncionarios(page.items)
  }

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setLoadingError(null)
    reload(controller.signal)
      .catch((e) => { if (controller.signal.aborted) return; setLoadingError(e instanceof Error ? e.message : 'Erro ao carregar') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const filtrados = funcionarios.filter((f) => {
    if (!busca.trim()) return true
    const q = busca.toLowerCase()
    return f.nome.toLowerCase().includes(q) || f.email.toLowerCase().includes(q)
  })

  const totalAtivos = funcionarios.filter((f) => f.ativo).length
  const totalAdmins = funcionarios.filter((f) => f.perfis?.includes('ROLE_ADMIN')).length

  const openCreate = () => { setEditTarget(null); setUpsertOpen(true) }
  const openEdit = (f: FuncionarioResponse) => { setEditTarget(f); setUpsertOpen(true) }
  const openView = (f: FuncionarioResponse) => { setViewTarget(f); setViewOpen(true) }
  const openDelete = (f: FuncionarioResponse) => { setDeleteTarget(f); setDeleteOpen(true) }

  const handleUpsert = async (data: { nome: string; email: string; senha: string; perfis: string[] }) => {
    if (editTarget) {
      await funcionarioService.atualizar(editTarget.id, {
        nome: data.nome,
        email: data.email,
        senha: data.senha.trim() || undefined,
        perfis: data.perfis,
      }, token)
    } else {
      await funcionarioService.criar({
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        perfis: data.perfis,
      }, token)
    }
    await reload()
    setUpsertOpen(false)
    setEditTarget(null)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await funcionarioService.remover(deleteTarget.id, token)
    await reload()
    setDeleteOpen(false)
    setDeleteTarget(null)
  }

  return (
    <Box py={6}>
      <Container maxW="7xl">
        <AppBreadcrumbs />

        <Flex mt={3} align="flex-start" justify="space-between" gap={4} wrap="wrap">
          <Box>
            <Heading as="h1" size="md" color="gray.900">
              Gestão de Funcionários
            </Heading>
            <Text mt={1} fontSize="sm" color="gray.500">
              Cadastre e gerencie os funcionários do sistema
            </Text>
          </Box>
        </Flex>

        <SimpleGrid mt={5} columns={{ base: 1, md: 3 }} gap={4}>
          <CardResumo title="Total de Funcionários" value={loading ? '—' : String(funcionarios.length)} />
          <CardResumo title="Funcionários Ativos" value={loading ? '—' : String(totalAtivos)} />
          <CardResumo title="Administradores" value={loading ? '—' : String(totalAdmins)} />
        </SimpleGrid>

        <Box mt={6} bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Flex px={5} py={4} align="center" justify="space-between">
            <Text fontWeight="700" color="gray.900">Funcionários</Text>
            <HStack gap={3}>
              <SearchInput value={busca} placeholder="Buscar por nome ou email..." onChange={setBusca} minW="260px" />
              <Button bg="gray.900" color="white" size="sm" h="34px" px={4} fontWeight="600" _hover={{ bg: 'gray.800' }} onClick={openCreate}>
                Cadastrar Funcionário
              </Button>
            </HStack>
          </Flex>
          <Box h="1px" bg="gray.100" />
          <Box p={5}>
            {loadingError ? <ErrorAlert message={loadingError} /> : null}
            {loading ? (
              <Text fontSize="sm" color="gray.500">Carregando...</Text>
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
                  <Box as="tbody">
                    {filtrados.length === 0 ? (
                      <Box as="tr">
                        <Box as="td" colSpan={columns.length} px={3} py={6} textAlign="center" fontSize="sm" color="gray.400">
                          Nenhum funcionário encontrado.
                        </Box>
                      </Box>
                    ) : filtrados.map((f) => (
                      <Box as="tr" key={f.id}>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                          <Box maxW="190px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={f.nome}>
                            {f.nome}
                          </Box>
                        </Box>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                          <Box maxW="210px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={f.email}>
                            {f.email}
                          </Box>
                        </Box>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100">
                          <HStack gap={1} flexWrap="wrap">
                            {(f.perfis ?? []).map((p) => <PerfilBadge key={p} perfil={p} />)}
                          </HStack>
                        </Box>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                          <StatusPill ativo={f.ativo} />
                        </Box>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                          {formatDate(f.dtCriacao)}
                        </Box>
                        <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                          <RowActions
                            onView={() => openView(f)}
                            onEdit={() => openEdit(f)}
                            onDelete={() => openDelete(f)}
                            canDelete={f.id !== user?.id}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      <FuncionarioDialog
        open={upsertOpen}
        initialData={editTarget}
        onClose={() => { setUpsertOpen(false); setEditTarget(null) }}
        onSubmit={handleUpsert}
      />

      <ViewDialog
        open={viewOpen}
        funcionario={viewTarget}
        isSelf={viewTarget?.id === user?.id}
        onClose={() => { setViewOpen(false); setViewTarget(null) }}
        onEdit={() => { setViewOpen(false); if (viewTarget) openEdit(viewTarget) }}
        onDelete={() => { setViewOpen(false); if (viewTarget) openDelete(viewTarget) }}
      />

      <DeleteDialog
        open={deleteOpen}
        funcionario={deleteTarget}
        onClose={() => { setDeleteOpen(false); setDeleteTarget(null) }}
        onConfirm={handleDelete}
      />
    </Box>
  )
}
