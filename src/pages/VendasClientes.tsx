import React, { useEffect, useMemo, useRef, useState } from 'react'
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
  Spinner,
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

import { toaster } from '../lib/toaster'; 
import { produtoService, type ProdutoResponse } from '../services/produtoService';


// ─── Tipos ────────────────────────────────────────────────────────────────────

// Mapeamento de status do back-end para rótulos legíveis
const STATUS_LABEL: Record<string, string> = {
  ORCAMENTO_SOLICITADO: 'ORÇAMENTO SOLICITADO',
  PAGAMENTO_APROVADO:   'PAGAMENTO APROVADO',
  ARTE_PENDENTE:        'ARTES COM APROVAÇÃO PENDENTE',
  ARTES_APROVADAS:      'ARTES APROVADAS',
  EM_PRODUCAO:          'EM PRODUÇÃO',
  CONCLUIDO:            'CONCLUÍDO',
  CANCELADO:            'CANCELADO',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const statusScheme: Record<string, { bg: string; color: string }> = {
  ORCAMENTO_SOLICITADO:  { bg: '#ffedd5', color: '#9a3412' },
  PAGAMENTO_APROVADO:    { bg: '#dbeafe', color: '#1e40af' },
  ARTE_PENDENTE:         { bg: '#fef3c7', color: '#92400e' },
  ARTES_APROVADAS:       { bg: '#d1fae5', color: '#065f46' },
  EM_PRODUCAO:           { bg: '#ede9fe', color: '#5b21b6' },
  CONCLUIDO:             { bg: '#d1fae5', color: '#065f46' },
  CANCELADO:             { bg: '#fee2e2', color: '#991b1b' },
}

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'Todos os status',              value: '' },
  { label: 'Orçamento Solicitado',         value: 'ORCAMENTO_SOLICITADO' },
  { label: 'Pagamento Aprovado',           value: 'PAGAMENTO_APROVADO' },
  { label: 'Artes com Aprovação Pendente', value: 'ARTE_PENDENTE' },
  { label: 'Artes Aprovadas',              value: 'ARTES_APROVADAS' },
  { label: 'Em Produção',                  value: 'EM_PRODUCAO' },
  { label: 'Concluído',                    value: 'CONCLUIDO' },
  { label: 'Cancelado',                    value: 'CANCELADO' },
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

const METODO_LABEL: Record<string, string> = {
  PIX: 'PIX',
  BOLETO: 'Boleto',
  CARTAO_CREDITO: 'Cartão de Crédito',
  CARTAO_DEBITO: 'Cartão de Débito',
  TRANSFERENCIA: 'Transferência',
}

// ─── Sub-componente: Fluxo de Status ─────────────────────────────────────────

const FluxoStatus = ({
  currentStatus,
  onSelect,
  disabled,
}: {
  currentStatus: string
  onSelect?: (status: string) => void
  disabled?: boolean
}) => {
  const currentIdx = STATUS_FLOW_ORDER.indexOf(currentStatus)
  return (
    <Flex gap={1} flexWrap="wrap">
      {STATUS_FLOW.map((step, idx) => {
        const isPast    = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isClickable = !isCurrent && !disabled && !!onSelect
        return (
          <Box
            key={step.key}
            as={isClickable ? 'button' : 'span'}
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
            cursor={isClickable ? 'pointer' : 'default'}
            opacity={disabled && !isCurrent ? 0.5 : 1}
            _hover={isClickable ? { bg: isPast ? 'gray.200' : 'gray.50', borderColor: 'gray.400' } : undefined}
            onClick={isClickable ? () => onSelect!(step.key) : undefined}
          >
            {step.label}
          </Box>
        )
      })}
    </Flex>
  )
}

// ─── Sub-componente: Seção com borda ─────────────────────────────────────────

const Section = ({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <Box display="flex" flexDirection="column" h="full">
    <Flex align="center" justify="space-between" mb={3}>
      <Text fontSize="sm" fontWeight="700" color="gray.900">{title}</Text>
      {action}
    </Flex>
    {children}
  </Box>
)

const InfoCard = ({ children }: { children: React.ReactNode }) => (
  <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={4} flex="1">
    {children}
  </Box>
)

const InfoRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box mb={2} _last={{ mb: 0 }}>
    <Text fontSize="11px" color="gray.400" mb="1px">{label}</Text>
    <Text fontSize="sm" fontWeight="600" color={valueColor ?? 'gray.900'}>{value}</Text>
  </Box>
)

// ─── Modal de Detalhes da Venda ───────────────────────────────────────────────

interface DetalheVendaModalProps {
  isOpen: boolean
  onClose: () => void
  vendaId: number | null
  token: string | null
  userName: string
  onVendaAtualizada?: () => void
}

const DetalheVendaModal = ({ isOpen, onClose, vendaId, token, userName, onVendaAtualizada }: DetalheVendaModalProps) => {
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

  // Upload / Download de arte
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadForProduto = useRef<string>('')
  const [uploadingArte, setUploadingArte] = useState(false)
  const [downloadingArteId, setDownloadingArteId] = useState<number | null>(null)
  const [erroArte, setErroArte] = useState<string | null>(null)

  // Status de arte (admin)
  const [atualizandoArteId, setAtualizandoArteId] = useState<number | null>(null)

  // Comentários
  const [comentarioTexto, setComentarioTexto] = useState<Record<string, string>>({}) // key: produtoNome ou 'geral'
  const [enviandoComentario, setEnviandoComentario] = useState<string | null>(null) // key sendo enviada

  // Desconto por item
  const [editandoDescontoItemId, setEditandoDescontoItemId] = useState<number | null>(null)
  const [editDescontoValor, setEditDescontoValor] = useState('')
  const [salvandoDesconto, setSalvandoDesconto] = useState(false)

  // Notificação
  const [notificando, setNotificando] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifMsg, setNotifMsg] = useState<string | null>(null)

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
      .atualizarStatus(token, vendaId, novoStatus, userName)
      .then((d) => {
        setDetalhe(d)
        onVendaAtualizada?.()
      })
      .catch((e) => setErro(e instanceof Error ? e.message : 'Erro ao atualizar status'))
      .finally(() => setAtualizandoStatus(false))
  }

  const handleArteClick = (produtoNome: string) => {
    uploadForProduto.current = produtoNome
    fileInputRef.current?.click()
  }

  const handleDownloadArte = async (arteId: number) => {
    setDownloadingArteId(arteId)
    try {
      await orcamentoService.downloadArte(token, arteId)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao baixar arte')
    } finally {
      setDownloadingArteId(null)
    }
  }

  const handleArteFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !vendaId) return
    e.target.value = ''
    setUploadingArte(true)
    setErroArte(null)
    try {
      await orcamentoService.uploadArte(token, vendaId, uploadForProduto.current, file)
      const updated = await orcamentoService.obterDetalheAdmin(token, vendaId)
      setDetalhe(updated)
    } catch (err) {
      setErroArte(err instanceof Error ? err.message : 'Erro ao enviar arte')
    } finally {
      setUploadingArte(false)
    }
  }

  const handleNotificar = async (tipo: 'status' | 'arte') => {
    if (!vendaId) return
    setNotifOpen(false)
    setNotificando(true)
    setNotifMsg(null)
    try {
      await orcamentoService.notificar(token, vendaId, tipo)
      setNotifMsg(tipo === 'status' ? 'Cliente notificado sobre o status.' : 'Cliente notificado sobre a arte.')
      setTimeout(() => setNotifMsg(null), 4000)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao notificar')
    } finally {
      setNotificando(false)
    }
  }

  const handleAvaliarArteAdmin = async (arteId: number, novoStatus: string) => {
    if (!vendaId) return
    setAtualizandoArteId(arteId)
    try {
      const updated = await orcamentoService.avaliarArteAdmin(token, vendaId, arteId, novoStatus)
      setDetalhe(updated)
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar arte')
    } finally {
      setAtualizandoArteId(null)
    }
  }

  const handleEnviarComentario = async (key: string, produtoNome?: string) => {
    const mensagem = comentarioTexto[key]?.trim()
    if (!mensagem || !vendaId) return
    setEnviandoComentario(key)
    try {
      const updated = await orcamentoService.adicionarComentario(token, vendaId, mensagem, produtoNome)
      setDetalhe(updated)
      setComentarioTexto((prev) => ({ ...prev, [key]: '' }))
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao enviar comentário')
    } finally {
      setEnviandoComentario(null)
    }
  }

  const handleSalvarDesconto = async (itemId: number) => {
    if (!vendaId) return
    const valor = parseFloat(editDescontoValor.replace(',', '.'))
    if (isNaN(valor) || valor < 0) return
    setSalvandoDesconto(true)
    try {
      const updated = await orcamentoService.atualizarDescontoItem(token, vendaId, itemId, valor)
      setDetalhe(updated)
      setEditandoDescontoItemId(null)
      setEditDescontoValor('')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar desconto')
    } finally {
      setSalvandoDesconto(false)
    }
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
        <DialogContent borderRadius="lg" maxW="850px" maxH="90vh" overflow="hidden" display="flex" flexDirection="column">
          {/* Input oculto para upload de arte */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleArteFileSelected}
          />

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

            {/* Feedback de notificação / arte */}
            {notifMsg && (
              <Box mt={2} px={3} py={2} bg="green.50" borderRadius="md" border="1px solid" borderColor="green.200">
                <Text fontSize="xs" color="green.700" fontWeight="600">{notifMsg}</Text>
              </Box>
            )}
            {erroArte && (
              <Box mt={2} px={3} py={2} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
                <Text fontSize="xs" color="red.700">{erroArte}</Text>
              </Box>
            )}
            {uploadingArte && (
              <Box mt={2} px={3} py={2} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="xs" color="blue.700">Enviando arte...</Text>
              </Box>
            )}
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
                  <FluxoStatus
                    currentStatus={detalhe.status}
                    onSelect={handleAtualizarStatus}
                    disabled={atualizandoStatus}
                  />
                </Section>

                {/* ── Informações do Cliente + Pagamento ── */}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} alignItems="stretch">
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
                            <ComboBox
                              value={editMetodo}
                              onChange={setEditMetodo}
                              placeholder="PIX, Boleto, ou outro..."
                              options={['PIX', 'Boleto', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Dinheiro']}
                            />
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
                            <Button size="xs" variant="outline" h="28px" fontSize="12px" onClick={() => setEditandoPagamento(false)}>
                              Cancelar
                            </Button>
                            <Button
                              size="xs"
                              bg="gray.900"
                              color="white"
                              h="28px"
                              fontSize="12px"
                              _hover={{ bg: 'gray.800' }}
                              disabled={salvandoPagamento}
                              onClick={handleSalvarPagamento}
                            >
                              {salvandoPagamento ? 'Salvando...' : 'Salvar'}
                            </Button>
                          </HStack>
                        </Stack>
                      ) : (
                        <Stack gap={0}>
                          {/* Método */}
                          <Flex align="center" gap={2} mb={3}>
                            <Box
                              px={2} py="3px" borderRadius="md" fontSize="11px" fontWeight="700"
                              bg="gray.100" color="gray.600" whiteSpace="nowrap"
                            >
                              {detalhe.metodoPagamento
                                ? (METODO_LABEL[detalhe.metodoPagamento] ?? detalhe.metodoPagamento)
                                : '—'}
                            </Box>
                          </Flex>

                          {/* Breakdown de valores */}
                          <Stack gap={0} borderTop="1px solid" borderColor="gray.100" pt={3}>
                            <Flex justify="space-between" mb={2}>
                              <Text fontSize="xs" color="gray.400">Subtotal</Text>
                              <Text fontSize="xs" color="gray.600">{formatBRL(detalhe.subtotal ?? 0)}</Text>
                            </Flex>
                            {(detalhe.descontoTotal ?? 0) > 0 && (
                              <Flex justify="space-between" mb={2}>
                                <Text fontSize="xs" color="orange.500">Desconto</Text>
                                <Text fontSize="xs" color="orange.500" fontWeight="600">− {formatBRL(detalhe.descontoTotal ?? 0)}</Text>
                              </Flex>
                            )}
                            <Flex justify="space-between" borderTop="1px dashed" borderColor="gray.200" pt={2} mt={1}>
                              <Text fontSize="xs" fontWeight="700" color="gray.800">Total</Text>
                              <Text fontSize="sm" fontWeight="800" color="gray.900">{formatBRL(detalhe.valorTotal ?? 0)}</Text>
                            </Flex>
                          </Stack>

                          {/* Pago / Restante */}
                          <Stack gap={0} borderTop="1px solid" borderColor="gray.100" pt={3} mt={3}>
                            <Flex justify="space-between" mb={2}>
                              <Text fontSize="xs" color="gray.400">Valor Pago</Text>
                              <Text fontSize="xs" fontWeight="600" color="green.600">{formatBRL(detalhe.valorPago ?? 0)}</Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text fontSize="xs" color="gray.400">Restante</Text>
                              <Text
                                fontSize="xs" fontWeight="700"
                                color={valorRestante > 0 ? 'red.500' : 'green.600'}
                              >
                                {formatBRL(valorRestante)}
                              </Text>
                            </Flex>
                          </Stack>
                        </Stack>
                      )}
                    </InfoCard>
                  </Section>
                </SimpleGrid>

                {/* ── Produtos, Artes e Comentários ── */}
                {(() => {
                  const statusIdx = STATUS_FLOW_ORDER.indexOf(detalhe.status)
                  const artesAprovIdx = STATUS_FLOW_ORDER.indexOf('ARTES_APROVADAS')
                  const canUpload = statusIdx < artesAprovIdx
                  const comentariosGerais = (detalhe.comentarios ?? []).filter(c => !c.produtoNome)

                  return (
                    <Section title="Produtos e Artes">
                      <Stack gap={3}>
                        {detalhe.produtos.map((prod) => {
                          const arte = detalhe.artes.find((a) => a.produtoNome === prod.nome)
                          const comentariosProd = (detalhe.comentarios ?? []).filter(c => c.produtoNome === prod.nome)
                          return (
                            <Box
                              key={prod.id}
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="lg"
                              overflow="hidden"
                            >
                              {/* Cabeçalho do produto */}
                              <Flex px={4} py={3} justify="space-between" align="flex-start" bg="white" gap={3}>
                                <Box flex="1" minW={0}>
                                  <Text fontSize="sm" fontWeight="700" color="gray.900">{prod.nome}</Text>
                                  <Text fontSize="xs" color="gray.500" mt="2px">
                                    Qtd.: {prod.quantidade} • Unit.: {formatBRL(prod.precoUnitario ?? 0)} • Total: {formatBRL(prod.precoTotal ?? 0)}
                                  </Text>

                                  {/* Desconto inline */}
                                  {editandoDescontoItemId === prod.id ? (
                                    <HStack gap={1} mt={2}>
                                      <Box
                                        as="span"
                                        fontSize="11px"
                                        fontWeight="600"
                                        color="gray.500"
                                        whiteSpace="nowrap"
                                      >
                                        Desconto R$
                                      </Box>
                                      <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editDescontoValor}
                                        onChange={(e) => setEditDescontoValor(e.target.value)}
                                        style={{
                                          width: '90px',
                                          fontSize: '12px',
                                          border: '1px solid #CBD5E0',
                                          borderRadius: '4px',
                                          padding: '2px 6px',
                                          outline: 'none',
                                        }}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSalvarDesconto(prod.id)
                                          if (e.key === 'Escape') { setEditandoDescontoItemId(null); setEditDescontoValor('') }
                                        }}
                                        autoFocus
                                      />
                                      <Button
                                        size="xs" h="22px" px={2} fontSize="11px"
                                        bg="gray.900" color="white" _hover={{ bg: 'gray.700' }}
                                        loading={salvandoDesconto}
                                        onClick={() => handleSalvarDesconto(prod.id)}
                                      >
                                        Salvar
                                      </Button>
                                      <Button
                                        size="xs" h="22px" px={2} fontSize="11px"
                                        variant="ghost" color="gray.500"
                                        disabled={salvandoDesconto}
                                        onClick={() => { setEditandoDescontoItemId(null); setEditDescontoValor('') }}
                                      >
                                        Cancelar
                                      </Button>
                                    </HStack>
                                  ) : (
                                    <HStack gap={1} mt="4px">
                                      {(prod.desconto ?? 0) > 0 && (
                                        <Text fontSize="xs" color="orange.500" fontWeight="600">
                                          − {formatBRL(prod.desconto ?? 0)} de desconto
                                        </Text>
                                      )}
                                      <Box
                                        as="button"
                                        fontSize="11px"
                                        color="gray.400"
                                        _hover={{ color: 'gray.700' }}
                                        onClick={() => {
                                          setEditandoDescontoItemId(prod.id)
                                          setEditDescontoValor(String(prod.desconto ?? 0))
                                        }}
                                      >
                                        {(prod.desconto ?? 0) > 0 ? 'Editar desconto' : '+ Adicionar desconto'}
                                      </Box>
                                    </HStack>
                                  )}
                                </Box>
                                {canUpload && (
                                  <Button
                                    size="xs" variant="outline" h="28px" fontSize="11px" px={3} gap={1}
                                    disabled={uploadingArte}
                                    onClick={() => handleArteClick(prod.nome)}
                                  >
                                    {uploadingArte && uploadForProduto.current === prod.nome ? (
                                      <HStack gap={1}><Spinner size="xs" /><span>Enviando...</span></HStack>
                                    ) : (
                                      <HStack gap={1}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
                                          <polyline points="17 8 12 3 7 8"/>
                                          <line x1="12" y1="3" x2="12" y2="15"/>
                                        </svg>
                                        <span>Atualizar Arte</span>
                                      </HStack>
                                    )}
                                  </Button>
                                )}
                              </Flex>

                              {/* Arte */}
                              {arte ? (
                                <Box px={4} py={3} bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                                  <Flex align="center" justify="space-between" gap={3}>
                                    <Flex align="center" gap={3} flex="1">
                                      <Box w="52px" h="52px" borderRadius="md" overflow="hidden" flexShrink={0} border="1px solid" borderColor="gray.300" bg="gray.200">
                                        {arte.imagemData ? (
                                          <img src={arte.imagemData} alt="arte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : arte.imagemUrl ? (
                                          <img src={arte.imagemUrl} alt="arte" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                          <Flex w="full" h="full" align="center" justify="center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                                              <circle cx="8.5" cy="8.5" r="1.5"/>
                                              <path d="m21 15-5-5L5 21"/>
                                            </svg>
                                          </Flex>
                                        )}
                                      </Box>
                                      <Box flex="1" minW={0}>
                                        <Text fontSize="xs" fontWeight="600" color="gray.700">
                                          {arte.nomeArquivo ?? 'arte.jpg'}
                                        </Text>
                                        <HStack gap={1} mt="4px" flexWrap="wrap">
                                          {(['PENDENTE', 'APROVADA', 'AJUSTE_SOLICITADO'] as const).map((s) => {
                                            const isActive = arte.status === s
                                            const label = s === 'APROVADA' ? 'Aprovada' : s === 'AJUSTE_SOLICITADO' ? 'Ajuste' : 'Pendente'
                                            const activeBg = s === 'APROVADA' ? '#d1fae5' : s === 'AJUSTE_SOLICITADO' ? '#fee2e2' : '#fef3c7'
                                            const activeColor = s === 'APROVADA' ? '#065f46' : s === 'AJUSTE_SOLICITADO' ? '#991b1b' : '#92400e'
                                            return (
                                              <Box
                                                key={s}
                                                as="button"
                                                px="6px" py="1px" borderRadius="full" fontSize="10px" fontWeight="700"
                                                border="1px solid"
                                                bg={isActive ? activeBg : 'white'}
                                                color={isActive ? activeColor : 'gray.400'}
                                                borderColor={isActive ? activeColor : 'gray.200'}
                                                opacity={atualizandoArteId === arte.id ? 0.5 : 1}
                                                cursor={isActive || atualizandoArteId === arte.id ? 'default' : 'pointer'}
                                                _hover={!isActive && !atualizandoArteId ? { bg: 'gray.50', borderColor: 'gray.400', color: 'gray.600' } : undefined}
                                                onClick={!isActive && !atualizandoArteId ? () => handleAvaliarArteAdmin(arte.id, s) : undefined}
                                              >
                                                {label}
                                              </Box>
                                            )
                                          })}
                                        </HStack>
                                      </Box>
                                    </Flex>
                                    <Button
                                      size="xs" variant="outline" h="28px" fontSize="11px" px={3} gap={1} flexShrink={0}
                                      disabled={downloadingArteId === arte.id || uploadingArte}
                                      onClick={() => handleDownloadArte(arte.id)}
                                    >
                                      {downloadingArteId === arte.id ? (
                                        <HStack gap={1}><Spinner size="xs" /><span>Baixando...</span></HStack>
                                      ) : (
                                        <HStack gap={1}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round"/>
                                            <polyline points="7 10 12 15 17 10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                          </svg>
                                          <span>Baixar</span>
                                        </HStack>
                                      )}
                                    </Button>
                                  </Flex>
                                </Box>
                              ) : (
                                <Box px={4} py="8px" bg="gray.50" borderTop="1px solid" borderColor="gray.100">
                                  <Text fontSize="xs" color="gray.400">Nenhuma arte enviada ainda.</Text>
                                </Box>
                              )}

                              {/* Comentários do produto + input */}
                              <Stack gap={2} px={4} py={3} borderTop="1px solid" borderColor="gray.100">
                                {comentariosProd.map((c) => (
                                  <Box key={c.id} bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="md" px={3} py={2}>
                                    <Flex justify="space-between" mb="2px">
                                      <Text fontSize="xs" fontWeight="700" color="blue.600">{c.autor}</Text>
                                      <Text fontSize="11px" color="gray.400">{c.criadoEm}</Text>
                                    </Flex>
                                    <Text fontSize="xs" color="gray.700">{c.mensagem}</Text>
                                  </Box>
                                ))}
                                {/* Input para novo comentário do produto */}
                                <HStack gap={2}>
                                  <input
                                    value={comentarioTexto[prod.nome] ?? ''}
                                    onChange={(e) => setComentarioTexto((prev) => ({ ...prev, [prod.nome]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarComentario(prod.nome, prod.nome) }}}
                                    placeholder="Adicionar comentário..."
                                    style={{
                                      flex: 1, border: '1px solid #e5e7eb', borderRadius: '6px',
                                      padding: '5px 10px', fontSize: '12px', outline: 'none',
                                      color: '#111827', background: 'white',
                                    }}
                                  />
                                  <Button
                                    size="xs" h="28px" fontSize="11px" px={3}
                                    bg="gray.800" color="white" _hover={{ bg: 'gray.700' }}
                                    disabled={!comentarioTexto[prod.nome]?.trim() || enviandoComentario === prod.nome}
                                    onClick={() => handleEnviarComentario(prod.nome, prod.nome)}
                                  >
                                    {enviandoComentario === prod.nome ? '...' : 'Enviar'}
                                  </Button>
                                </HStack>
                              </Stack>
                            </Box>
                          )
                        })}
                        {detalhe.produtos.length === 0 && (
                          <Text fontSize="sm" color="gray.400">Nenhum produto registrado.</Text>
                        )}

                        {/* Comentários gerais (sem produto) */}
                        <Box>
                          <Text fontSize="11px" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={2}>
                            Comentários Gerais
                          </Text>
                          <Stack gap={2}>
                            {comentariosGerais.map((c) => (
                              <Box key={c.id} bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="md" px={3} py={2}>
                                <Flex justify="space-between" mb="2px">
                                  <Text fontSize="xs" fontWeight="700" color="blue.600">{c.autor}</Text>
                                  <Text fontSize="11px" color="gray.400">{c.criadoEm}</Text>
                                </Flex>
                                <Text fontSize="xs" color="gray.700">{c.mensagem}</Text>
                              </Box>
                            ))}
                            {/* Input para comentário geral */}
                            <HStack gap={2}>
                              <input
                                value={comentarioTexto['geral'] ?? ''}
                                onChange={(e) => setComentarioTexto((prev) => ({ ...prev, geral: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEnviarComentario('geral') }}}
                                placeholder="Comentário geral (visível apenas para funcionários)..."
                                style={{
                                  flex: 1, border: '1px solid #e5e7eb', borderRadius: '6px',
                                  padding: '5px 10px', fontSize: '12px', outline: 'none',
                                  color: '#111827', background: 'white',
                                }}
                              />
                              <Button
                                size="xs" h="28px" fontSize="11px" px={3}
                                bg="gray.800" color="white" _hover={{ bg: 'gray.700' }}
                                disabled={!comentarioTexto['geral']?.trim() || enviandoComentario === 'geral'}
                                onClick={() => handleEnviarComentario('geral')}
                              >
                                {enviandoComentario === 'geral' ? '...' : 'Enviar'}
                              </Button>
                            </HStack>
                          </Stack>
                        </Box>
                      </Stack>
                    </Section>
                  )
                })()}

              </Stack>
            ) : null}
          </DialogBody>

          <DialogFooter borderTop="1px solid" borderColor="gray.100" justifyContent="space-between">
            {/* Botão Notificar Cliente */}
            {detalhe && (
              <Box position="relative">
                <Button
                  size="xs"
                  variant="outline"
                  h="36px"
                  fontSize="12px"
                  px={3}
                  gap={1}
                  disabled={notificando}
                  onClick={() => setNotifOpen((o) => !o)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  {notificando ? 'Enviando...' : 'Notificar Cliente'}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </Button>

                {notifOpen && (
                  <Box
                    position="absolute" bottom="calc(100% + 8px)" left={0} zIndex={50}
                    bg="white" border="1px solid" borderColor="gray.200" borderRadius="md"
                    boxShadow="0 4px 12px rgba(0,0,0,0.10)" overflow="hidden" minW="200px"
                  >
                    <Box
                      px={3} py="9px" fontSize="12px" color="gray.700" cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onMouseDown={() => handleNotificar('status')}
                    >
                      <Text fontWeight="600">Notificar status atual</Text>
                      <Text fontSize="11px" color="gray.400">Informa o cliente sobre o status do pedido</Text>
                    </Box>
                    <Box h="1px" bg="gray.100" />
                    <Box
                      px={3} py="9px" fontSize="12px" color="gray.700" cursor="pointer"
                      _hover={{ bg: 'gray.50' }}
                      onMouseDown={() => handleNotificar('arte')}
                    >
                      <Text fontWeight="600">Notificar alteração na arte</Text>
                      <Text fontSize="11px" color="gray.400">Solicita que o cliente aprove a arte</Text>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
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

// ─── ComboBox: input livre + sugestões estilizadas ────────────────────────────

const ComboBox = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const filtered = options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <Box ref={ref} position="relative">
      <Box
        display="flex"
        alignItems="center"
        h="32px"
        border="1px solid"
        borderColor={open ? 'gray.400' : 'gray.200'}
        borderRadius="md"
        bg="white"
        px={2}
        gap={1}
        cursor="text"
        onClick={() => setOpen(true)}
        transition="border-color 0.15s"
      >
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: '13px',
            background: 'transparent', color: '#111827', minWidth: 0,
          }}
        />
        <Box
          as="button"
          color="gray.400"
          flexShrink={0}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setOpen((o) => !o) }}
          _hover={{ color: 'gray.600' }}
          lineHeight="1"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </Box>
      </Box>

      {open && filtered.length > 0 && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={50}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="0 4px 12px rgba(0,0,0,0.10)"
          overflow="hidden"
        >
          {filtered.map((opt) => (
            <Box
              key={opt}
              px={3}
              py="7px"
              fontSize="13px"
              color="gray.800"
              cursor="pointer"
              bg={value === opt ? 'gray.50' : 'white'}
              fontWeight={value === opt ? '600' : '400'}
              _hover={{ bg: 'gray.50' }}
              onMouseDown={(e: React.MouseEvent) => { e.preventDefault(); onChange(opt); setOpen(false) }}
            >
              {opt}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  )
}

// ─── Modal de Nova Venda (layout baseado no Figma) ─────────────────────────────

interface NovaVendaModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const NovaVendaModal = ({ isOpen, onClose, onSuccess }: NovaVendaModalProps) => {
  const { token } = useAuth();
  
  // ─── ESTADOS ──────────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(false);
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<ProdutoResponse[]>([]);
  
  // Estado do Cliente
  const [cliente, setCliente] = useState({ nome: '', telefone: '', email: '' });
  
  // Estado dos Produtos (Começa com 1 linha vazia)
  const [itens, setItens] = useState([{ produtoId: '', quantidade: 1, precoUnit: 0, desconto: 0 }]);
  
  // Estado do Pagamento
  const [pagamento, setPagamento] = useState({ metodo: '', valor: 0 });

  // ─── CARREGAR PRODUTOS ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      produtoService.listar({ page: 1, pageSize: 100 }, token)
        .then((res) => setProdutosDisponiveis(res.items))
        .catch((err) => console.error("Erro ao carregar produtos", err));
    } else {
      // Limpa o formulário ao fechar
      setCliente({ nome: '', telefone: '', email: '' });
      setItens([{ produtoId: '', quantidade: 1, precoUnit: 0, desconto: 0 }]);
      setPagamento({ metodo: '', valor: 0});
    }
  }, [isOpen, token]);

  // ─── LÓGICA DO CARRINHO (PRODUTOS) ────────────────────────────────────
  const handleAddProduto = () => {
    setItens([...itens, { produtoId: '', quantidade: 1, precoUnit: 0, desconto: 0 }]);
  };

  const handleRemoveProduto = (index: number) => {
    if (itens.length === 1) return;
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [field]: value };

    // Se o utilizador selecionar um produto, auto-preencher o preço unitário
    if (field === 'produtoId') {
      const prodSelecionado = produtosDisponiveis.find(p => p.id === Number(value));
      if (prodSelecionado && prodSelecionado.precoVenda) {
        novosItens[index].precoUnit = prodSelecionado.precoVenda;
      }
    }
    setItens(novosItens);
  };

  // Cálculo Dinâmico do Total
  const valorTotalCalculado = itens.reduce(
    (acc, item) => acc + Math.max(0, item.quantidade * item.precoUnit - item.desconto),
    0,
  );

  // ─── SUBMETER VENDA ───────────────────────────────────────────────────
const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validação básica de produtos
      const produtosValidos = itens.filter(i => i.produtoId !== '' && i.quantidade > 0);
      if (produtosValidos.length === 0) {
        toaster.error({ title: "Adicione pelo menos um produto válido." });
        setIsLoading(false);
        return;
      }

      // Validação básica do Cliente 
      if (!cliente.email.trim()) {
        toaster.error({ title: "O e-mail do cliente é obrigatório." });
        setIsLoading(false);
        return;
      }

      // Criar a Venda 
      const payloadOrcamento = {
        itens: produtosValidos.map(i => ({
          produtoId: Number(i.produtoId),
          quantidade: Number(i.quantidade),
          precoUnitario: Number(i.precoUnit),
          desconto: Number(i.desconto) || 0,
        })),
        observacoes: "Venda registada via painel administrativo",
        nomeCliente: cliente.nome,         
        emailCliente: cliente.email,       
        telefoneCliente: cliente.telefone  
      };

      const orcamentoCriado = await orcamentoService.criarAdmin(token, payloadOrcamento);

      // 3. Registar o Pagamento
      if (pagamento.metodo) {
        await orcamentoService.atualizarPagamento(token, orcamentoCriado.id, {
          metodoPagamento: pagamento.metodo,
          valorPago: pagamento.valor > 0 ? pagamento.valor : valorTotalCalculado
        });
      }

      toaster.success({ title: 'Venda registada com sucesso!' });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao registar a venda.';
      toaster.error({ title: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent borderRadius="lg" maxW="720px">
          <DialogCloseTrigger />
          <DialogHeader borderBottom="1px solid" borderColor="gray.100">
            <DialogTitle fontSize="sm" fontWeight="700">Nova Venda</DialogTitle>
          </DialogHeader>

          <DialogBody py={6}>
            <VStack align="stretch" gap={4}>
              {/* ─── Informações do Cliente ─── */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={3}>
                  Informações do Cliente
                </Text>
                <VStack align="stretch" gap={3}>
                  <Box>
                    <Text as="label" fontSize="xs" mb={1} display="block">Nome Completo *</Text>
                    <Input size="sm" placeholder="Digite o nome do cliente" 
                      value={cliente.nome} onChange={(e) => setCliente({ ...cliente, nome: e.target.value })} 
                    />
                  </Box>
                  <HStack gap={3}>
                    <Box flex="1">
                      <Text as="label" fontSize="xs" mb={1} display="block">Telefone *</Text>
                      <Input size="sm" placeholder="(00) 00000-0000" 
                        value={cliente.telefone} onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                      />
                    </Box>
                    <Box flex="1">
                      <Text as="label" fontSize="xs" mb={1} display="block">E-mail *</Text>
                      <Input size="sm" type="email" placeholder="email@exemplo.com" 
                        value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })}
                      />
                    </Box>
                  </HStack>
                </VStack>
              </Box>

              {/* ─── Produtos ─── */}
              <Box>
                <HStack justify="space-between" mb={3}>
                  <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px">
                    Produtos
                  </Text>
                  <Button
                    variant="ghost" size="xs" height="26px" fontSize="11px" fontWeight="600"
                    color="gray.600" px={2} gap={1} onClick={handleAddProduto}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Adicionar Produto
                  </Button>
                </HStack>

                <VStack align="stretch" gap={2}>
                  {itens.map((item, index) => {
                    const subtotal = Math.max(0, item.quantidade * item.precoUnit - item.desconto)
                    return (
                      <Box
                        key={index}
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        p={3}
                        bg="gray.50"
                      >
                        {/* Linha 1: seletor + botão remover */}
                        <HStack gap={2} mb={3}>
                          <Box flex="1">
                            <Text as="label" fontSize="11px" fontWeight="600" color="gray.500" mb={1} display="block">
                              Produto
                            </Text>
                            <select
                              value={item.produtoId}
                              onChange={(e) => handleItemChange(index, 'produtoId', e.target.value)}
                              style={{
                                width: '100%', height: '32px', padding: '0 8px',
                                border: '1px solid #E2E8F0', borderRadius: '6px',
                                fontSize: '13px', background: 'white', outline: 'none',
                              }}
                            >
                              <option value="">Selecione o produto</option>
                              {produtosDisponiveis.map(prod => (
                                <option key={prod.id} value={prod.id}>{prod.nome}</option>
                              ))}
                            </select>
                          </Box>
                          {itens.length > 1 && (
                            <Box pt="18px">
                              <Box
                                as="button"
                                w="28px" h="28px"
                                display="flex" alignItems="center" justifyContent="center"
                                borderRadius="md"
                                color="red.400"
                                _hover={{ bg: 'red.50', color: 'red.600' }}
                                onClick={() => handleRemoveProduto(index)}
                                title="Remover produto"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6"/>
                                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                  <path d="M10 11v6M14 11v6"/>
                                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                </svg>
                              </Box>
                            </Box>
                          )}
                        </HStack>

                        {/* Linha 2: qtd | preço unit | desconto | subtotal */}
                        <HStack gap={2} align="flex-end">
                          <Box flex="1">
                            <Text as="label" fontSize="11px" fontWeight="600" color="gray.500" mb={1} display="block">
                              Qtd.
                            </Text>
                            <Input
                              size="sm" type="number" min={1} bg="white"
                              value={item.quantidade}
                              onChange={(e) => handleItemChange(index, 'quantidade', Number(e.target.value))}
                            />
                          </Box>
                          <Box flex="1.5">
                            <Text as="label" fontSize="11px" fontWeight="600" color="gray.500" mb={1} display="block">
                              Preço Unit. (R$)
                            </Text>
                            <Input
                              size="sm" type="number" min={0} step="0.01" bg="white"
                              value={item.precoUnit}
                              onChange={(e) => handleItemChange(index, 'precoUnit', Number(e.target.value))}
                            />
                          </Box>
                          <Box flex="1.5">
                            <Text as="label" fontSize="11px" fontWeight="600" color="gray.500" mb={1} display="block">
                              Desconto (R$)
                            </Text>
                            <Input
                              size="sm" type="number" min={0} step="0.01" bg="white"
                              value={item.desconto}
                              onChange={(e) => handleItemChange(index, 'desconto', Number(e.target.value))}
                            />
                          </Box>
                          <Box flex="1.5" pb="1px">
                            <Text fontSize="11px" fontWeight="600" color="gray.500" mb={1}>Subtotal</Text>
                            <Box
                              h="32px" px={3}
                              border="1px solid" borderColor="gray.200"
                              borderRadius="md" bg="white"
                              display="flex" alignItems="center"
                            >
                              <Text fontSize="sm" fontWeight="700" color="gray.800">
                                {formatBRL(subtotal)}
                              </Text>
                            </Box>
                          </Box>
                        </HStack>
                      </Box>
                    )
                  })}
                </VStack>
              </Box>

              {/* ─── Informações de Pagamento ─── */}
              <Box>
                <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="0.5px" mb={3}>
                  Pagamento
                </Text>
                <HStack gap={3}>
                  <Box flex="1">
                    <Text fontSize="xs" mb={1} display="block">Método de Pagamento</Text>
                    <ComboBox
                      value={pagamento.metodo}
                      onChange={(v) => setPagamento({ ...pagamento, metodo: v })}
                      placeholder="PIX, Boleto, ou outro..."
                      options={['PIX', 'Boleto', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência', 'Dinheiro']}
                    />
                  </Box>
                  <Box flex="1">
                    <Text as="label" fontSize="xs" mb={1} display="block">Valor Pago</Text>
                    <Input size="sm" type="number" min={0} step="0.01" 
                      value={pagamento.valor} 
                      onChange={(e) => setPagamento({ ...pagamento, valor: Number(e.target.value) })}
                    />
                  </Box>
                </HStack>
              </Box>
            </VStack>
          </DialogBody>

          <Box h="1px" bg="gray.100" />

          <DialogFooter justifyContent="space-between">
            <Box>
              <Text fontSize="xs" color="gray.500">Valor Total:</Text>
              <Text fontSize="lg" fontWeight="700" color="gray.900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalCalculado)}
              </Text>
            </Box>

            <HStack gap={3}>
              <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>Cancelar</Button>
              <Button size="sm" bg="gray.900" color="white" _hover={{ bg: 'gray.800' }} 
                onClick={handleSubmit} loading={isLoading} disabled={isLoading}
              >
                Criar Venda
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
};

// ─── Página principal ──────────────────────────────────────────────────────────

export const VendasClientes = () => {
  const { token, user } = useAuth()
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

        <NovaVendaModal
          isOpen={isNovaVendaOpen}
          onClose={() => setIsNovaVendaOpen(false)}
          onSuccess={() => setReloadKey((k) => k + 1)}
        />

        <DetalheVendaModal
          isOpen={detalheVendaId != null}
          onClose={() => setDetalheVendaId(null)}
          vendaId={detalheVendaId}
          token={token}
          userName={user?.nome ?? user?.email ?? 'Sistema'}
          onVendaAtualizada={() => setReloadKey((k) => k + 1)}
        />
      </Container>
    </Box>
  )
}
