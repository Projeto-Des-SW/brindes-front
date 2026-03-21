import { useEffect, useRef, useState } from 'react'
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
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useAuth } from '../../context/useAuth'
import { materiaPrimaService } from '../../services/parametrizacoes/materiaPrimaService'
import type { ProdutoImagemRequest, ProdutoRequest, ProdutoResponse } from '../../services/produtoService'

const FieldLabel = ({ children }: { children: string }) => (
  <Text as="label" fontSize="sm" color="gray.700" fontWeight="600">
    {children}
  </Text>
)

interface MateriaLocal {
  id: number
  descricao: string
  quantidade: string
}

const ErrorAlert = ({ message }: { message: string }) => (
  <Box bg="red.50" border="1px solid" borderColor="red.300" borderRadius="md" px={4} py={3} mb={3} display="flex" alignItems="flex-start" gap={2}>
    <Text color="red.500" fontWeight="bold" fontSize="md" lineHeight="1.4" flexShrink={0}>✕</Text>
    <Text fontSize="sm" color="red.700" fontWeight="600" lineHeight="1.5">{message}</Text>
  </Box>
)

export const ProdutoUpsertDialog = ({
  open,
  initialData,
  onClose,
  onSubmit,
}: {
  open: boolean
  initialData?: ProdutoResponse | null
  onClose: () => void
  onSubmit: (data: ProdutoRequest) => Promise<void>
}) => {
  const { token } = useAuth()
  const isEditing = Boolean(initialData)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [estoqueAtual, setEstoqueAtual] = useState('')
  const [status, setStatus] = useState('ATIVO')
  const [materias, setMaterias] = useState<MateriaLocal[]>([])
  const [condicoesPagamento, setCondicoesPagamento] = useState('')
  const [prazoProducao, setPrazoProducao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  // Imagens: até 4 URLs; a primeira (índice 0) é a capa
  const [imagens, setImagens] = useState<string[]>(['', '', '', ''])

  const [materiasOptions, setMateriasOptions] = useState<{ id: number; descricao: string }[]>([])
  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('')
  const [loadingMaterias, setLoadingMaterias] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
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

  const initialDataRef = useRef(initialData)
  initialDataRef.current = initialData

  // Preenche os campos quando abre em modo de edição
  useEffect(() => {
    if (!open) return
    setSubmitError(null)
    const t = setTimeout(() => {
      const data = initialDataRef.current
      if (data) {
        setNome(data.nome ?? '')
        setDescricao(data.descricao ?? '')
        setPreco(data.precoVenda != null ? String(data.precoVenda) : '')
        setEstoqueAtual(data.estoqueAtual != null ? String(data.estoqueAtual) : '')
        setStatus(data.status ?? 'ATIVO')
        setCondicoesPagamento(data.condicoesPagamento ?? '')
        setPrazoProducao(data.prazoProducao ?? '')
        setObservacoes(data.observacoes ?? '')
        setMaterias(
          (data.itensFichaTecnica ?? []).map((item) => ({
            id: item.materiaPrimaId,
            descricao: item.materiaPrimaNome,
            quantidade: String(item.quantidadeNecessaria),
          }))
        )
        const urls = (data.imagens ?? [])
          .sort((a, b) => a.ordem - b.ordem)
          .map((img) => img.url)
        const padded = [...urls, '', '', '', ''].slice(0, 4)
        setImagens(padded)
      } else {
        setNome('')
        setDescricao('')
        setPreco('')
        setEstoqueAtual('')
        setStatus('ATIVO')
        setMaterias([])
        setCondicoesPagamento('')
        setPrazoProducao('')
        setObservacoes('')
        setImagens(['', '', '', ''])
      }
      setSelectedMateriaId('')
    }, 0)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const addMateria = () => {
    const id = Number(selectedMateriaId)
    if (!id) return
    const opt = materiasOptions.find((m) => m.id === id)
    if (!opt) return
    if (materias.some((m) => m.id === id)) return
    setMaterias((s) => [...s, { id: opt.id, descricao: opt.descricao, quantidade: '1' }])
    setSelectedMateriaId('')
  }

  const updateMateriaQuantidade = (id: number, quantidade: string) => {
    setMaterias((s) => s.map((m) => (m.id === id ? { ...m, quantidade } : m)))
  }

  const removeMateria = (id: number) => {
    setMaterias((s) => s.filter((m) => m.id !== id))
  }

  const imagensValidas = imagens.filter((url) => url.trim() !== '')

  const canSubmit =
    nome.trim() &&
    descricao.trim() &&
    preco.trim() &&
    status.trim() &&
    prazoProducao.trim() &&
    materias.length > 0 &&
    materias.every((m) => m.quantidade && Number(m.quantidade) > 0) &&
    imagensValidas.length >= 1

  const handleSubmit = async () => {
    if (submitting) return
    const imagensPayload: ProdutoImagemRequest[] = imagensValidas.map((url, idx) => ({
      url: url.trim(),
      ordem: idx + 1,
    }))

    const data: ProdutoRequest = {
      nome: nome.trim(),
      descricao: descricao.trim(),
      precoVenda: preco ? Number(preco) : null,
      estoqueAtual: estoqueAtual ? Number(estoqueAtual) : null,
      status: status,
      condicoesPagamento: condicoesPagamento.trim() || undefined,
      prazoProducao: prazoProducao.trim(),
      observacoes: observacoes.trim() || undefined,
      itensFichaTecnica: materias.map((m) => ({
        materiaPrimaId: m.id,
        quantidadeNecessaria: Number(m.quantidade),
      })),
      imagens: imagensPayload,
    }
    setSubmitError(null)
    setSubmitting(true)
    try {
      await onSubmit(data)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erro ao salvar produto')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="980px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar produto' : 'Cadastrar produto'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {submitError ? <ErrorAlert message={submitError} /> : null}
            {error ? <ErrorAlert message={error} /> : null}

            <Stack gap={4}>
              {/* Nome */}
              <Stack gap={2}>
                <FieldLabel>Nome *</FieldLabel>
                <Input value={nome} onChange={(e) => setNome(e.target.value)} bg="white" />
              </Stack>

              {/* Descrição */}
              <Stack gap={2}>
                <FieldLabel>Descrição *</FieldLabel>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} bg="white" minH="80px" />
              </Stack>

              {/* Preço + Quantidade + Status */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Preço *</FieldLabel>
                  <Input
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="Ex: 10.50"
                    bg="white"
                  />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>Quantidade Disponível</FieldLabel>
                  <Input
                    value={estoqueAtual}
                    onChange={(e) => setEstoqueAtual(e.target.value)}
                    placeholder="Ex: 100"
                    type="number"
                    min={0}
                    bg="white"
                  />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>Status *</FieldLabel>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                  >
                    <option value="">Selecione o status</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </select>
                </Stack>
              </SimpleGrid>

              <Box h="1px" bg="gray.100" />

              {/* Matérias Primas */}
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Matérias Primas
              </Text>

              <Stack gap={2}>
                <FieldLabel>Matérias Primas *</FieldLabel>
                <HStack gap={2} align="start">
                  <select
                    value={selectedMateriaId}
                    onChange={(e) => setSelectedMateriaId(e.target.value)}
                    style={{ width: '100%', height: '40px', padding: '0 12px', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                    disabled={loadingMaterias}
                  >
                    <option value="">{loadingMaterias ? 'Carregando...' : 'Selecione as Matérias Primas necessárias'}</option>
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
                  {materias.length === 0 ? (
                    <Text fontSize="sm" color="gray.500">
                      Nenhuma matéria-prima adicionada
                    </Text>
                  ) : (
                    materias.map((m) => (
                      <HStack key={m.id} gap={2} align="center">
                        <SimpleGrid columns={2} gap={4} flex="1">
                          <Stack gap={1}>
                            <Text fontSize="xs" color="gray.500" fontWeight="600">Matéria Prima *</Text>
                            <Box bg="gray.100" px={3} py={2} borderRadius="md" fontSize="sm">
                              {m.descricao}
                            </Box>
                          </Stack>
                          <Stack gap={1}>
                            <Text fontSize="xs" color="gray.500" fontWeight="600">Quantidade *</Text>
                            <Input
                              value={m.quantidade}
                              onChange={(e) => updateMateriaQuantidade(m.id, e.target.value)}
                              placeholder="Quantidade"
                              bg="white"
                              size="sm"
                            />
                          </Stack>
                        </SimpleGrid>
                        <Button
                          size="sm"
                          variant="outline"
                          colorScheme="red"
                          borderColor="red.300"
                          color="red.500"
                          onClick={() => removeMateria(m.id)}
                          h="32px"
                          w="32px"
                          p={0}
                          mt={5}
                        >
                          X
                        </Button>
                      </HStack>
                    ))
                  )}
                </Stack>
              </Stack>

              <Box h="1px" bg="gray.100" />

              {/* Imagens */}
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Imagens do Produto
              </Text>
              <Text fontSize="xs" color="gray.500">
                Informe as URLs das imagens (mínimo 1, máximo 4). A primeira será usada como capa.
              </Text>

              <Stack gap={3}>
                {imagens.map((url, idx) => (
                  <Stack key={idx} gap={1}>
                    <HStack gap={2} align="center">
                      <Box
                        w="28px"
                        h="28px"
                        borderRadius="full"
                        bg={idx === 0 ? 'gray.900' : 'gray.200'}
                        color={idx === 0 ? 'white' : 'gray.600'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="700"
                        flexShrink={0}
                      >
                        {idx + 1}
                      </Box>
                      <Input
                        value={url}
                        onChange={(e) => {
                          const next = [...imagens]
                          next[idx] = e.target.value
                          setImagens(next)
                        }}
                        placeholder={
                          idx === 0
                            ? 'URL da imagem capa (obrigatória)'
                            : `URL da imagem ${idx + 1} (opcional)`
                        }
                        bg="white"
                        size="sm"
                      />
                    </HStack>
                    {url.trim() && (
                      <Box pl="36px">
                        <img
                          src={url.trim()}
                          alt={`Prévia ${idx + 1}`}
                          style={{
                            width: '80px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                          }}
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </Box>
                    )}
                  </Stack>
                ))}
              </Stack>

              <Box h="1px" bg="gray.100" />

              {/* Informações Comerciais */}
              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Informações Comerciais
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Condições de Pagamento</FieldLabel>
                  <Input
                    value={condicoesPagamento}
                    onChange={(e) => setCondicoesPagamento(e.target.value)}
                    placeholder="Ex: 30/60 dias"
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Prazo de Produção Padrão *</FieldLabel>
                  <Input
                    value={prazoProducao}
                    onChange={(e) => setPrazoProducao(e.target.value)}
                    placeholder="Ex: 5 dias úteis"
                    bg="white"
                  />
                </Stack>
              </SimpleGrid>

              <Stack gap={2}>
                <FieldLabel>Observações</FieldLabel>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  bg="white"
                  minH="80px"
                />
              </Stack>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button bg="blue.600" color="white" _hover={{ bg: 'blue.700' }} onClick={handleSubmit} disabled={!canSubmit || submitting}>
                {submitting ? <HStack gap={2}><Spinner size="sm" /><span>Salvando...</span></HStack> : isEditing ? 'Salvar alterações' : 'Cadastrar'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

export const ConfirmDeleteDialog = ({
  open,
  title,
  description,
  submitting,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  submitting?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}) => {
  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="520px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="gray.700">
              {description}
            </Text>
            {error ? <ErrorAlert message={error} /> : null}
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose} disabled={Boolean(submitting)}>
                Cancelar
              </Button>
              <Button bg="red.600" color="white" _hover={{ bg: 'red.700' }} onClick={onConfirm} disabled={Boolean(submitting)}>
                {submitting ? <HStack gap={2}><Spinner size="sm" /><span>Excluindo...</span></HStack> : 'Excluir'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

export default ProdutoUpsertDialog
