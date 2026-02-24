import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useAuth } from '../../context/AuthContext'
import { materiaPrimaService } from '../../services/parametrizacoes/materiaPrimaService'

const FieldLabel = ({ children }: { children: string }) => (
  <Text as="label" fontSize="sm" color="gray.700" fontWeight="600">
    {children}
  </Text>
)

export type ProdutoFormValues = {
  nome: string
  descricao: string
  preco: string
  quantidade: string
  status: string
  materias: { id: number; descricao: string; quantidade: string }[]
  condicoesPagamento: string
  prazoProducao: string
  observacoes: string
}

export const ProdutoUpsertDialog = ({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (values: ProdutoFormValues) => void
}) => {
  const { token } = useAuth()
  const [values, setValues] = useState<ProdutoFormValues>({
    nome: '',
    descricao: '',
    preco: '',
  quantidade: '',
    status: 'NORMAL',
    materias: [],
    condicoesPagamento: '',
    prazoProducao: '',
    observacoes: '',
  })

  const [materiasOptions, setMateriasOptions] = useState<{ id: number; descricao: string }[]>([])
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('')
  const [loadingMaterias, setLoadingMaterias] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    // envolver setState em microtask para evitar setState síncrono no efeito
    const t = setTimeout(() => {
      setLoadingMaterias(true)
      setError(null)
      const controller = new AbortController()
      materiaPrimaService
        .getMateriasPrimas({ page: 1, pageSize: 100 }, token, controller.signal)
        .then((page) => setMateriasOptions((page.items ?? []).map((m) => ({ id: m.id, descricao: m.descricao }))))
        .catch((e) => setError(e instanceof Error ? e.message : 'Erro ao carregar matérias-primas'))
        .finally(() => setLoadingMaterias(false))

      return () => controller.abort()
    }, 0)

    return () => clearTimeout(t)
  }, [open, token])

  useEffect(() => {
    if (!open) return
    // reiniciar formulário em microtask para evitar setState síncrono
    const t = setTimeout(() => {
      setValues({
        nome: '',
        descricao: '',
        preco: '',
        quantidade: '',
        status: 'NORMAL',
        materias: [],
        condicoesPagamento: '',
        prazoProducao: '',
        observacoes: '',
      })
      setSelectedMateriaId('')
    }, 0)

    return () => clearTimeout(t)
  }, [open])

  const addMateria = () => {
    const id = Number(selectedMateriaId)
    if (!id) return
    const opt = materiasOptions.find((m) => m.id === id)
    if (!opt) return
    if (values.materias.some((m) => m.id === id)) return
    setValues((s) => ({ ...s, materias: [...s.materias, { id: opt.id, descricao: opt.descricao, quantidade: '1' }] }))
    setSelectedMateriaId('')
  }

  const updateMateriaQuantidade = (id: number, quantidade: string) => {
    setValues((s) => ({ ...s, materias: s.materias.map((m) => (m.id === id ? { ...m, quantidade } : m)) }))
  }

  const removeMateria = (id: number) => {
    setValues((s) => ({ ...s, materias: s.materias.filter((m) => m.id !== id) }))
  }

  const canSubmit =
    values.nome.trim() &&
    values.descricao.trim() &&
    values.preco.trim() &&
    values.status.trim() &&
    values.prazoProducao.trim() &&
    values.materias.length > 0 &&
    values.materias.every((m) => m.quantidade && Number(m.quantidade) > 0)

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="980px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>Cadastrar produto</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {error ? (
              <Text mb={3} fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : null}

            <Stack gap={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Nome *</FieldLabel>
                  <Input value={values.nome} onChange={(e) => setValues((s) => ({ ...s, nome: e.target.value }))} bg="white" />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>Preço *</FieldLabel>
                  <Input
                    value={values.preco}
                    onChange={(e) => setValues((s) => ({ ...s, preco: e.target.value }))}
                    placeholder="Ex: 10.50"
                    bg="white"
                  />
                </Stack>
              </SimpleGrid>

              <Stack gap={2}>
                <FieldLabel>Descrição *</FieldLabel>
                <Textarea value={values.descricao} onChange={(e) => setValues((s) => ({ ...s, descricao: e.target.value }))} bg="white" minH="80px" />
              </Stack>

              <Stack gap={2}>
                <FieldLabel>Status *</FieldLabel>
                <select
                  value={values.status}
                  onChange={(e) => setValues((s) => ({ ...s, status: e.target.value }))}
                  style={{ width: '220px', height: '40px', padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                >
                  <option value="">Selecione o status</option>
                  <option value="NORMAL">NORMAL</option>
                  <option value="ABAIXO">ABAIXO</option>
                </select>
              </Stack>

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Matérias Primas
              </Text>

              <Stack gap={2}>
                <HStack gap={2} align="start">
                  <select
                    value={selectedMateriaId}
                    onChange={(e) => setSelectedMateriaId(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                    disabled={loadingMaterias}
                  >
                    <option value="">{loadingMaterias ? 'Carregando...' : 'Selecione uma matéria-prima'}</option>
                    {materiasOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.descricao}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={addMateria} disabled={!selectedMateriaId} h="34px">
                    Adicionar
                  </Button>
                </HStack>

                <Stack gap={2}>
                  {values.materias.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      Nenhuma matéria-prima adicionada
                    </Text>
                  ) : (
                    values.materias.map((m) => (
                      <HStack key={m.id} gap={2}>
                        <Box flex="1">{m.descricao}</Box>
                        <Input
                          w="120px"
                          value={m.quantidade}
                          onChange={(e) => updateMateriaQuantidade(m.id, e.target.value)}
                          placeholder="Quantidade"
                          bg="white"
                        />
                        <Button size="sm" variant="outline" onClick={() => removeMateria(m.id)}>
                          Remover
                        </Button>
                      </HStack>
                    ))
                  )}
                </Stack>
              </Stack>

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Informações Comerciais
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Condições do Pagamento</FieldLabel>
                  <Input value={values.condicoesPagamento} onChange={(e) => setValues((s) => ({ ...s, condicoesPagamento: e.target.value }))} bg="white" />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Prazo de Produção padrão *</FieldLabel>
                  <Input value={values.prazoProducao} onChange={(e) => setValues((s) => ({ ...s, prazoProducao: e.target.value }))} bg="white" />
                </Stack>
              </SimpleGrid>

              <Stack gap={2}>
                <FieldLabel>Observações</FieldLabel>
                <Textarea value={values.observacoes} onChange={(e) => setValues((s) => ({ ...s, observacoes: e.target.value }))} bg="white" minH="80px" />
              </Stack>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button bg="blue.600" color="white" _hover={{ bg: 'blue.700' }} onClick={() => onSubmit(values)} disabled={!canSubmit}>
                Cadastrar Produto
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

export default ProdutoUpsertDialog
