import { useEffect, useMemo, useState } from 'react'
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
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { AppBreadcrumbs } from '../components/AppBreadcrumbs'
import { EyeIcon, SearchIcon } from '../components/icons'
import { useAuth } from '../context/useAuth'
import { orcamentoService } from '../services/orcamentoService'
import type {
  AdminOrcamentoListItemDTO,
  AtualizarPagamentoRequest,
  OrcamentoDetalheResponseDTO,
} from '../services/orcamentoService'
import { SectionCard, SimpleTable } from './estoque/components'

// ─── Tipos ────────────────────────────────────────────────────────────────────

// Mapeamento de status do back-end para rótulos legíveis
const STATUS_LABEL: Record<string, string> = {
  ORCAMENTO_SOLICITADO: 'ORÇAMENTO SOLICITADO',
  ARTE_PENDENTE: 'ARTES COM APROVAÇÃO PENDENTE',
  EM_PRODUCAO: 'EM PRODUÇÃO',
  CONCLUIDO: 'CONCLUÍDO',
  CANCELADO: 'CANCELADO',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusScheme: Record<string, { bg: string; color: string }> = {
  CONCLUIDO:             { bg: '#d1fae5', color: '#065f46' },
  ARTE_PENDENTE:         { bg: '#fef3c7', color: '#92400e' },
  ORCAMENTO_SOLICITADO:  { bg: '#ffedd5', color: '#9a3412' },
  EM_PRODUCAO:           { bg: '#dbeafe', color: '#1e40af' },
  CANCELADO:             { bg: '#fee2e2', color: '#991b1b' },
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Todos os status', value: '' },
  { label: 'Orçamento Solicitado', value: 'ORCAMENTO_SOLICITADO' },
  { label: 'Artes com Aprovação Pendente', value: 'ARTE_PENDENTE' },
  { label: 'Em Produção', value: 'EM_PRODUCAO' },
  { label: 'Concluído', value: 'CONCLUIDO' },
  { label: 'Cancelado', value: 'CANCELADO' },
]

// ─── Sub-componentes ──────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const scheme = statusScheme[status] ?? { bg: '#f3f4f6', color: '#374151' }
  const label = STATUS_LABEL[status] ?? status
  return (
    <Box
      display="inline-block"
      px={2}
      py="3px"
      borderRadius="4px"
      fontSize="10px"
      fontWeight="700"
      letterSpacing="0.3px"
      bg={scheme.bg}
      color={scheme.color}
      whiteSpace="nowrap"
    >
      {label}
    </Box>
  )
}

const StatCard = ({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) => (
  <Box
    bg="white"
    border="1px solid"
    borderColor="gray.200"
    borderRadius="lg"
    p={5}
    boxShadow="sm"
    position="relative"
  >
    <Text fontSize="xs" color="gray.500" fontWeight="600">
      {title}
    </Text>
    <Text mt={2} fontSize="2xl" fontWeight="700" color="gray.900" lineHeight="1.2">
      {value}
    </Text>
    <Text mt={1} fontSize="xs" color="gray.400">
      {subtitle}
    </Text>
  </Box>
)

// ─── Constantes de Status ─────────────────────────────────────────────────────

const STATUS_FLOW = [
  { key: 'ORCAMENTO_SOLICITADO', label: 'Orçamento Solicitado' },
  { key: 'PAGAMENTO_APROVADO',   label: 'Pagamento Aprovado' },
  { key: 'ARTE_PENDENTE',        label: 'Artes com Aprovação Pendente' },
  { key: 'ARTES_APROVADAS',      label: 'Artes Aprovadas' },
  { key: 'EM_PRODUCAO',          label: 'Em Produção' },
  { key: 'CONCLUIDO',            label: 'Concluído' },
]

const STATUS_FLOW_ORDER = STATUS_FLOW.map((s) => s.key)

const METODOS_PAGAMENTO = ['PIX', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'TRANSFERENCIA']
const METODO_LABEL: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  TRANSFERENCIA: 'Transferência',
}

// ─── Sub-componente: Fluxo de Status ─────────────────────────────────────────

const FluxoStatus = ({ currentStatus }: { currentStatus: string }) => {
  const currentIdx = STATUS_FLOW_ORDER.indexOf(currentStatus)
  return (
    <Box overflowX="auto" pb={1}>
      <HStack gap={0} minW="max-content">
        {STATUS_FLOW.map((step, idx) => {
          const isPast    = idx < currentIdx
          const isCurrent = idx === currentIdx
          return (
            <HStack key={step.key} gap={0}>
              <Box
                px={3}
                py="6px"
                borderRadius="full"
                fontSize="11px"
                fontWeight={isCurrent ? '700' : '500'}
                whiteSpace="nowrap"
                border="1px solid"
                borderColor={isCurrent ? '#f59e0b' : isPast ? 'gray.300' : 'gray.200'}
                bg={isCurrent ? '#fef3c7' : isPast ? 'gray.100' : 'white'}
                color={isCurrent ? '#92400e' : isPast ? 'gray.500' : 'gray.400'}
              >
                {step.label}
              </Box>
              {idx < STATUS_FLOW.length - 1 && (
                <Box color={isPast ? 'gray.400' : 'gray.200'} mx={1} fontSize="xs">›</Box>
              )}
            </HStack>
          )
        })}
      </HStack>
    </Box>
  )
}

// ─── Sub-componente: Seção com borda ─────────────────────────────────────────

const Section = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <Box>
    <Flex align="center" justify="space-between" mb={3}>
      <Text fontSize="sm" fontWeight="700" color="gray.900">{title}</Text>
      {action}
    </Flex>
    {children}
  </Box>
)

const InfoCard = ({ children }: { children: React.ReactNode }) => (
  <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4}>
    {children}
  </Box>
)

const InfoRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box mb={3} _last={{ mb: 0 }}>
    <Text fontSize="xs" color="gray.400" mb="2px">{label}</Text>
    <Text fontSize="sm" fontWeight="600" color={valueColor ?? 'gray.900'}>{value}</Text>
  </Box>
)

// ─── Modal de Detalhes da Venda ───────────────────────────────────────────────

interface DetalheVendaModalProps {
  isOpen: boolean
  onClose: () => void
  vendaId: number | null
  token: string | null
  onVendaAtualizada?: () => void
}

const DetalheVendaModal = ({ isOpen, onClose, vendaId, token, onVendaAtualizada }: DetalheVendaModalProps) => {
  const [detalhe, setDetalhe] = useState<OrcamentoDetalheResponseDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Edição de pagamento
  const [editandoPagamento, setEditandoPagamento] = useState(false)
  const [editMetodo, setEditMetodo] = useState('')
  const [editValorPago, setEditValorPago] = useState('')
  const [salvandoPagamento, setSalvandoPagamento] = useState(false)

  // Atualização de status
  const [atualizandoStatus, setAtualizandoStatus] = useState(false)

  useEffect(() => {
    if (!isOpen || vendaId == null) return
    let cancelled = false
    setLoading(true)
    setErro(null)
    setDetalhe(null)
    setEditandoPagamento(false)

    orcamentoService
      .obterDetalheAdmin(token, vendaId)
      .then((d) => { if (!cancelled) setDetalhe(d) })
      .catch((e) => { if (!cancelled) setErro(e instanceof Error ? e.message : 'Erro ao carregar detalhes') })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [isOpen, vendaId, token])

  const handleAbrirEdicaoPagamento = () => {
    if (!detalhe) return
    setEditMetodo(detalhe.metodoPagamento ?? '')
    setEditValorPago(detalhe.valorPago != null ? String(detalhe.valorPago) : '0')
    setEditandoPagamento(true)
  }

  const handleSalvarPagamento = () => {
    if (!detalhe || !vendaId) return
    setSalvandoPagamento(true)
    const payload: AtualizarPagamentoRequest = {
      metodoPagamento: editMetodo || undefined,
      valorPago: editValorPago !== '' ? Number(editValorPago) : undefined,
    }
    orcamentoService
      .atualizarPagamento(token, vendaId, payload)
      .then((d) => {
        setDetalhe(d)
        setEditandoPagamento(false)
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao salvar pagamento'))
      .finally(() => setSalvandoPagamento(false))
  }

  const handleAtualizarStatus = (novoStatus: string) => {
    if (!vendaId) return
    setAtualizandoStatus(true)
    orcamentoService
      .atualizarStatus(token, vendaId, novoStatus)
      .then((d) => {
        setDetalhe(d)
        onVendaAtualizada?.()
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao atualizar status'))
      .finally(() => setAtualizandoStatus(false))
  }

  const valorRestante = detalhe
    ? Math.max(0, (detalhe.valorTotal ?? 0) - (detalhe.valorPago ?? 0))
    : 0

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={(e) => { if (!e.open) { onClose(); setDetalhe(null); setErro(null) } }}
    >
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent borderRadius="lg" maxW="700px" maxH="90vh" overflow="hidden" display="flex" flexDirection="column">
          <DialogCloseTrigger />
          <DialogHeader borderBottom="1px solid" borderColor="gray.100" pb={3}>
            <Box>
              <DialogTitle fontSize="md" fontWeight="700" color="gray.900">
                Detalhes da Venda {detalhe ? `#${detalhe.codigo}` : ''}
              </DialogTitle>
              {detalhe?.dataCriacao && (
                <Text fontSize="xs" color="gray.400" mt="2px">
                  Criado em {detalhe.dataCriacao}
                </Text>
              )}
            </Box>
          </DialogHeader>

          <DialogBody overflowY="auto" py={5} flex="1">
            {loading ? (
              <Box py={10} textAlign="center">
                <Text fontSize="sm" color="gray.400">Carregando...</Text>
              </Box>
            ) : erro ? (
              <Box py={6}>
                <Text fontSize="sm" color="red.500">{erro}</Text>
              </Box>
            ) : detalhe ? (
              <Stack gap={6}>

                {/* ── Fluxo de Status ── */}
                <Section title="Fluxo de Status">
                  <FluxoStatus currentStatus={detalhe.status} />
                  {/* Seletor rápido de novo status */}
                  <HStack mt={3} gap={2} flexWrap="wrap">
                    {STATUS_FLOW.filter((s) => s.key !== detalhe.status).map((s) => (
                      <Button
                        key={s.key}
                        size="xs"
                        variant="outline"
                        h="26px"
                        fontSize="11px"
                        px={3}
                        disabled={atualizandoStatus}
                        onClick={() => handleAtualizarStatus(s.key)}
                        _hover={{ bg: 'gray.100' }}
                      >
                        → {s.label}
                      </Button>
                    ))}
                  </HStack>
                </Section>

                {/* ── Informações do Cliente + Pagamento ── */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Section title="Informações do Cliente">
                    <InfoCard>
                      <InfoRow label="Nome" value={detalhe.nomeCliente ?? '—'} />
                      <InfoRow label="Telefone" value={detalhe.telefoneCliente ?? '—'} />
                      <InfoRow label="E-mail" value={detalhe.emailCliente ?? '—'} />
                    </InfoCard>
                  </Section>

                  <Section
                    title="Informações de Pagamento"
                    action={
                      !editandoPagamento ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          h="24px"
                          fontSize="11px"
                          px={2}
                          color="gray.500"
                          _hover={{ color: 'gray.900' }}
                          onClick={handleAbrirEdicaoPagamento}
                        >
                          ✏ Editar
                        </Button>
                      ) : null
                    }
                  >
                    <InfoCard>
                      {editandoPagamento ? (
                        <Stack gap={3}>
                          <Box>
                            <Text fontSize="xs" color="gray.400" mb={1}>Método de Pagamento</Text>
                            <select
                              value={editMetodo}
                              onChange={(e) => setEditMetodo(e.target.value)}
                              style={{
                                width: '100%', height: '32px', padding: '0 8px',
                                border: '1px solid #E2E8F0', borderRadius: '6px',
                                fontSize: '13px', background: 'white',
                              }}
                            >
                              <option value="">Selecione</option>
                              {METODOS_PAGAMENTO.map((m) => (
                                <option key={m} value={m}>{METODO_LABEL[m]}</option>
                              ))}
                            </select>
                          </Box>
                          <Box>
                            <Text fontSize="xs" color="gray.400" mb={1}>Valor Pago (R$)</Text>
                            <Input
                              size="sm"
                              type="number"
                              min={0}
                              step="0.01"
                              value={editValorPago}
                              onChange={(e) => setEditValorPago(e.target.value)}
                            />
                          </Box>
                          <HStack justify="flex-end" gap={2}>
                            <Button size="xs" variant="outline" h="26px" onClick={() => setEditandoPagamento(false)}>
                              Cancelar
                            </Button>
                            <Button
                              size="xs"
                              bg="gray.900"
                              color="white"
                              h="26px"
                              _hover={{ bg: 'gray.800' }}
                              disabled={salvandoPagamento}
                              onClick={handleSalvarPagamento}
                            >
                              {salvandoPagamento ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </HStack>
                        </Stack>
                      ) : (
                        <>
                          <InfoRow
                            label="Método de Pagamento"
                            value={detalhe.metodoPagamento ? (METODO_LABEL[detalhe.metodoPagamento] ?? detalhe.metodoPagamento) : '—'}
                          />
                          <InfoRow label="Valor Total" value={formatBRL(detalhe.valorTotal ?? 0)} />
                          <InfoRow
                            label="Valor Pago"
                            value={formatBRL(detalhe.valorPago ?? 0)}
                            valueColor="green.600"
                          />
                          <InfoRow
                            label="Valor Restante"
                            value={formatBRL(valorRestante)}
                            valueColor={valorRestante > 0 ? 'red.500' : 'green.600'}
                          />
                        </>
                      )}
                    </InfoCard>
                  </Section>
                </SimpleGrid>

                {/* ── Produtos e Artes ── */}
                <Section title="Produtos e Artes">
                  <Stack gap={3}>
                    {detalhe.produtos.map((prod) => {
                      const arte = detalhe.artes.find((a) => a.produtoNome === prod.nome)
                      return (
                        <Box
                          key={prod.id}
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          overflow="hidden"
                        >
                          {/* Cabeçalho do produto */}
                          <Flex px={4} py={3} justify="space-between" align="center" bg="white">
                            <Box>
                              <Text fontSize="sm" fontWeight="700" color="gray.900">{prod.nome}</Text>
                              <Text fontSize="xs" color="gray.500" mt="2px">
                                Quantidade: {prod.quantidade} • Preço Unit.: {formatBRL(prod.precoUnitario ?? 0)} • Total: {formatBRL(prod.precoTotal ?? 0)}
                              </Text>
                            </Box>
                            <Button
                              size="xs"
                              variant="outline"
                              h="28px"
                              fontSize="11px"
                              px={3}
                              gap={1}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
                                <polyline points="17 8 12 3 7 8"/>
                                <line x1="12" y1="3" x2="12" y2="15"/>
                              </svg>
                              Atualizar Arte
                            </Button>
                          </Flex>

                          {/* Arte do produto (se existir) */}
                          {arte ? (
                            <Box px={4} py={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                              <HStack gap={3}>
                                {/* Thumbnail */}
                                <Box
                                  w="52px"
                                  h="44px"
                                  borderRadius="md"
                                  overflow="hidden"
                                  flexShrink={0}
                                  border="1px solid"
                                  borderColor="gray.200"
                                  bg="gray.200"
                                >
                                  {arte.imagemUrl ? (
                                    <img src={arte.imagemUrl} alt="arte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                    <Flex w="full" h="full" align="center" justify="center">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                                        <path d="m9 9 3 3-3 3M15 9l-3 3 3 3" strokeLinecap="round"/>
                                      </svg>
                                    </Flex>
                                  )}
                                </Box>
                                <Box>
                                  <HStack gap={1} mb="2px">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                                      <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    <Text fontSize="xs" fontWeight="600" color="gray.700">
                                      {arte.imagemUrl ? arte.imagemUrl.split('/').pop() : 'arte.jpg'}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="11px" color="gray.400">Arte enviada</Text>
                                </Box>
                              </HStack>
                            </Box>
                          ) : (
                            <Box px={4} py={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                              <Text fontSize="xs" color="gray.400">Nenhuma arte enviada ainda.</Text>
                            </Box>
                          )}
                        </Box>
                      )
                    })}
                    {detalhe.produtos.length === 0 && (
                      <Text fontSize="sm" color="gray.400">Nenhum produto registrado.</Text>
                    )}
                  </Stack>
                </Section>

                {/* ── Comentários do Cliente ── */}
                <Section title="💬 Comentários do Cliente">
                  <Stack gap={2}>
                    {detalhe.comentarios && detalhe.comentarios.length > 0 ? (
                      detalhe.comentarios.map((c) => (
                        <Box
                          key={c.id}
                          border="1px solid"
                          borderColor="blue.100"
                          borderRadius="lg"
                          p={3}
                          bg="blue.50"
                        >
                          <Flex justify="space-between" mb={1}>
                            <Text fontSize="xs" fontWeight="700" color="blue.600">{c.autor}</Text>
                            <Text fontSize="11px" color="gray.400">{c.criadoEm}</Text>
                          </Flex>
                          <Text fontSize="xs" color="gray.700">{c.mensagem}</Text>
                        </Box>
                      ))
                    ) : (
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={4}
                        textAlign="center"
                      >
                        <Text fontSize="xs" color="gray.400">Nenhum comentário ainda.</Text>
                      </Box>
                    )}
                  </Stack>
                </Section>

              </Stack>
            ) : null}
          </DialogBody>

          <DialogFooter borderTop="1px solid" borderColor="gray.100" justifyContent="flex-end">
            <Button
              bg="gray.900"
              color="white"
              size="sm"
              h="36px"
              px={6}
              _hover={{ bg: 'gray.800' }}
              onClick={() => { onClose(); setDetalhe(null) }}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

// ─── Modal de Nova Venda (layout baseado no Figma) ─────────────────────────────

interface NovaVendaModalProps {
  isOpen: boolean
  onClose: () => void
}

const NovaVendaModal = ({ isOpen, onClose }: NovaVendaModalProps) => {
  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent borderRadius="lg" maxW="720px">
          <DialogCloseTrigger />
          <DialogHeader borderBottom="1px solid" borderColor="gray.100">
            <DialogTitle fontSize="sm" fontWeight="700">
              Nova Venda
            </DialogTitle>
          </DialogHeader>

          <DialogBody py={6}>
            <VStack align="stretch" gap={4}>
            {/* Informações do Cliente */}
            <Box>
              <Text fontSize="xs" fontWeight="700" color="gray.500" mb={2}>
                Informações do Cliente
              </Text>
              <VStack align="stretch" gap={3}>
                <Box>
                  <Text as="label" fontSize="xs" mb={1} display="block">
                    Nome Completo *
                  </Text>
                  <Input size="sm" placeholder="Digite o nome do cliente" />
                </Box>
                <HStack gap={3}>
                  <Box flex="1">
                    <Text as="label" fontSize="xs" mb={1} display="block">
                      Telefone *
                    </Text>
                    <Input size="sm" placeholder="(00) 00000-0000" />
                  </Box>
                  <Box flex="1">
                    <Text as="label" fontSize="xs" mb={1} display="block">
                      E-mail *
                    </Text>
                    <Input size="sm" type="email" placeholder="email@exemplo.com" />
                  </Box>
                </HStack>
              </VStack>
            </Box>

            {/* Produtos */}
            <Box mt={4}>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="xs" fontWeight="700" color="gray.500">
                  Produtos
                </Text>
                <Button
                  variant="ghost"
                  size="xs"
                  height="24px"
                  fontSize="11px"
                  fontWeight="600"
                  color="gray.700"
                  px={2}
                >
                  + Adicionar Produto
                </Button>
              </HStack>

              <HStack gap={3} align="flex-end">
                <Box flex="2">
                  <Text as="label" fontSize="xs" mb={1} display="block">
                    Nome do Produto *
                  </Text>
                  <select
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 8px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      background: 'white',
                    }}
                  >
                    <option value="">Selecione o Produto</option>
                    {/* TODO: integrar com lista de produtos */}
                  </select>
                </Box>
                <Box flex="1">
                  <Text as="label" fontSize="xs" mb={1} display="block">
                    Quantidade *
                  </Text>
                  <Input size="sm" type="number" min={1} defaultValue={1} />
                </Box>
                <Box flex="1">
                  <Text as="label" fontSize="xs" mb={1} display="block">
                    Preço Unit.
                  </Text>
                  <Input size="sm" type="number" min={0} step="0.01" defaultValue={0} />
                </Box>
              </HStack>
            </Box>

            {/* Informações de Pagamento */}
            <Box mt={4}>
              <Text fontSize="xs" fontWeight="700" color="gray.500" mb={2}>
                Informações de Pagamento
              </Text>
              <HStack gap={3}>
                <Box flex="1">
                  <Text as="label" fontSize="xs" mb={1} display="block">
                    Método de Pagamento *
                  </Text>
                  <select
                    style={{
                      width: '100%',
                      height: '32px',
                      padding: '0 8px',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      background: 'white',
                    }}
                  >
                    <option value="">Selecione o método</option>
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto</option>
                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  </select>
                </Box>
                <Box flex="1">
                  <Text as="label" fontSize="xs" mb={1} display="block">
                    Valor Pago
                  </Text>
                  <Input size="sm" type="number" min={0} step="0.01" defaultValue={0} />
                </Box>
              </HStack>
            </Box>
            </VStack>
          </DialogBody>

          <Box h="1px" bg="gray.100" />

          <DialogFooter justifyContent="space-between">
            <Box>
              <Text fontSize="xs" color="gray.500">
                Valor Total:
              </Text>
              <Text fontSize="lg" fontWeight="700" color="gray.900">
                R$ 0,00
              </Text>
            </Box>

            <HStack gap={3}>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Cancelar
              </Button>
              <Button size="sm" bg="gray.900" color="white" _hover={{ bg: 'gray.800' }}>
                Criar Venda
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

// ─── Página principal ──────────────────────────────────────────────────────────

export const VendasClientes = () => {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [isNovaVendaOpen, setIsNovaVendaOpen] = useState(false)
  const [detalheVendaId, setDetalheVendaId] = useState<number | null>(null)
  const [vendas, setVendas] = useState<AdminOrcamentoListItemDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Busca todos os orçamentos do back-end (admin)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErro(null)
    orcamentoService
      .listarTodos(token, 1, 200, statusFiltro || undefined)
      .then((page) => {
        if (!cancelled) setVendas(page.items ?? [])
      })
      .catch((e) => {
        if (!cancelled) setErro(e instanceof Error ? e.message : 'Erro ao carregar orçamentos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token, statusFiltro, reloadKey])

  const vendaFiltradas = useMemo(() => {
    return vendas.filter((v) => {
      const nome = v.nomeCliente ?? ''
      const codigo = v.codigo ?? ''
      return (
        search === '' ||
        nome.toLowerCase().includes(search.toLowerCase()) ||
        codigo.toLowerCase().includes(search.toLowerCase())
      )
    })
  }, [vendas, search])

  // Cálculos do resumo
  const totalVendas = vendas.length
  const emAndamento = vendas.filter(
    (v) => !['CONCLUIDO', 'CANCELADO'].includes(v.status ?? '')
  ).length
  const concluidas = vendas.filter((v) => v.status === 'CONCLUIDO').length
  const valorFaturado = vendas
    .filter((v) => v.status === 'CONCLUIDO')
    .reduce((acc, v) => acc + (v.valorTotal ?? 0), 0)

  const columns = [
    { label: 'ID',          w: '130px' },
    { label: 'Cliente',     w: '160px' },
    { label: 'Telefone',    w: '150px' },
    { label: 'Produtos',    w: '90px' },
    { label: 'Valor Total', w: '120px' },
    { label: 'Data',        w: '100px' },
    { label: 'Status',      w: '220px' },
    { label: 'Ações',       w: '60px', align: 'center' as const },
  ]

  return (
    <Box py={6}>
      <Container maxW="7xl">
        <AppBreadcrumbs />

        {/* Cabeçalho */}
        <Flex mt={3} align="flex-start" justify="space-between" gap={4} wrap="wrap">
          <Box>
            <Heading as="h1" size="md" color="gray.900">
              Gestão de Vendas
            </Heading>
            <Text mt={1} fontSize="sm" color="gray.500">
              Acompanhe pedidos, status e pagamentos
            </Text>
          </Box>

          <Button
            bg="gray.900"
            color="white"
            size="sm"
            h="36px"
            px={4}
            fontWeight="600"
            _hover={{ bg: 'gray.700' }}
            onClick={() => setIsNovaVendaOpen(true)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ marginRight: '6px' }}
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Nova Venda
          </Button>
        </Flex>

        {/* Cards de resumo */}
        <SimpleGrid mt={5} columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
          <StatCard
            title="Total de Vendas"
            value={String(totalVendas)}
            subtitle="Total de vendas registradas"
          />
          <StatCard
            title="Em Andamento"
            value={String(emAndamento)}
            subtitle="Pedidos ativos"
          />
          <StatCard
            title="Concluídas"
            value={String(concluidas)}
            subtitle="Pedidos concluídos"
          />
          <StatCard
            title="Valor Faturado"
            value={formatBRL(valorFaturado)}
            subtitle="Valor total faturado"
          />
        </SimpleGrid>

        {/* Tabela */}
        <Box mt={6}>
          <SectionCard
            title=""
            actions={
              <HStack gap={3} w="full">
                {/* Search */}
                <Box position="relative" flex="1" minW="220px" maxW="320px">
                  <Box
                    position="absolute"
                    left={3}
                    top="50%"
                    transform="translateY(-50%)"
                    color="gray.400"
                    zIndex={1}
                    pointerEvents="none"
                  >
                    <SearchIcon size={16} />
                  </Box>
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por cliente ou ID"
                    h="38px"
                    pl="38px"
                    borderColor="gray.200"
                    bg="white"
                    fontSize="sm"
                  />
                </Box>

                {/* Filtro status */}
                <Box minW="200px">
                  <select
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
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
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Box>
              </HStack>
            }
          >
            <SimpleTable columns={columns}>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px', color: '#9CA3AF' }}>
                    Carregando...
                  </td>
                </tr>
              ) : erro ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px', color: '#EF4444' }}>
                    {erro}
                  </td>
                </tr>
              ) : vendaFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px', color: '#9CA3AF' }}>
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              ) : (
                vendaFiltradas.map((row) => (
                  <Box as="tr" key={row.id} _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700" fontWeight="600">
                      {row.codigo ?? `#${row.id}`}
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                      {row.nomeCliente ?? '—'}
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.500">
                      {row.telefoneCliente ?? '—'}
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                      {row.numProdutos} {row.numProdutos === 1 ? 'item' : 'itens'}
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
                      {formatBRL(row.valorTotal ?? 0)}
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.500">
                      {row.dataCriacao ?? '—'}
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100">
                      <StatusBadge status={row.status ?? ''} />
                    </Box>
                    <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        h="28px"
                        w="28px"
                        p={0}
                        color="gray.500"
                        _hover={{ color: 'gray.900', bg: 'gray.100' }}
                        aria-label={`Ver detalhes de ${row.codigo ?? row.id}`}
                        onClick={() => setDetalheVendaId(row.id)}
                      >
                        <EyeIcon size={16} />
                      </Button>
                    </Box>
                  </Box>
                ))
              )}
            </SimpleTable>
          </SectionCard>
        </Box>

        <NovaVendaModal isOpen={isNovaVendaOpen} onClose={() => setIsNovaVendaOpen(false)} />

        <DetalheVendaModal
          isOpen={detalheVendaId != null}
          onClose={() => setDetalheVendaId(null)}
          vendaId={detalheVendaId}
          token={token}
          onVendaAtualizada={() => setReloadKey((k) => k + 1)}
        />
      </Container>
    </Box>
  )
}
