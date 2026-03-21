import { useEffect, useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Badge,
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Image,
  Spinner,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useNavigate, useParams } from 'react-router-dom'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeFooter } from '../components/home/HomeFooter'
import { useAuth } from '../context/useAuth'
import {
  orcamentoService,
  type ArteDTO,
  type OrcamentoDetalheResponseDTO,
} from '../services/orcamentoService'

// ─── Helpers de status ────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  ORCAMENTO_SOLICITADO: 'Orçamento Solicitado',
  PAGAMENTO_APROVADO:   'Pagamento Aprovado',
  ARTE_PENDENTE:        'Artes com Aprovação Pendente',
  ARTES_APROVADAS:      'Artes Aprovadas',
  EM_PRODUCAO:          'Em Produção',
  CONCLUIDO:            'Concluído',
  CANCELADO:            'Cancelado',
}

const STATUS_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  ORCAMENTO_SOLICITADO: { bg: '#ffedd5', color: '#9a3412' },
  PAGAMENTO_APROVADO:   { bg: '#dbeafe', color: '#1e40af' },
  ARTE_PENDENTE:        { bg: '#fef3c7', color: '#92400e' },
  ARTES_APROVADAS:      { bg: '#d1fae5', color: '#065f46' },
  EM_PRODUCAO:          { bg: '#ede9fe', color: '#5b21b6' },
  CONCLUIDO:            { bg: '#d1fae5', color: '#065f46' },
  CANCELADO:            { bg: '#fee2e2', color: '#991b1b' },
}

const ARTE_STATUS_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  AJUSTE_SOLICITADO: 'Ajuste Solicitado',
}

const ARTE_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDENTE: { bg: '#fef3c7', color: '#92400e' },
  APROVADA: { bg: '#d1fae5', color: '#065f46' },
  AJUSTE_SOLICITADO: { bg: '#fee2e2', color: '#991b1b' },
}

const formatPreco = (value: number) =>
  `R$ ${value.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`

// ─── Ícones ───────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

const DownloadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const ClockHistoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
)

const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
)

// ─── Sub-componente: Timeline de status ──────────────────────────────────────

interface HistoricoProps {
  historico: OrcamentoDetalheResponseDTO['historico']
  statusAtual: string
}

const HistoricoStatus = ({ historico, statusAtual }: HistoricoProps) => {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={6}>
      <HStack gap={2} mb={5}>
        <Box color="gray.600"><ClockHistoryIcon /></Box>
        <Text fontWeight="700" fontSize="sm" color="#1a1616">
          Histórico de Status
        </Text>
      </HStack>

      <VStack align="stretch" gap={0}>
        {historico.map((item, idx) => {
          const isLast = idx === historico.length - 1
          const isCurrent = (item.status ?? '') === statusAtual || (isLast && !statusAtual)
          return (
            <HStack key={item.id} align="start" gap={4}>
              {/* Linha vertical + ícone */}
              <VStack gap={0} align="center" flexShrink={0} w="24px">
                <Box
                  w="22px"
                  h="22px"
                  borderRadius="full"
                  bg={isCurrent ? '#1a1616' : 'white'}
                  border="2px solid"
                  borderColor={isCurrent ? '#1a1616' : 'gray.300'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  mt="2px"
                >
                  {!isCurrent && (
                    <Box color="gray.400" w="10px" h="10px">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </Box>
                  )}
                </Box>
                {!isLast && (
                  <Box w="2px" bg="gray.200" flex="1" minH="32px" />
                )}
              </VStack>

              {/* Conteúdo */}
              <Box pb={isLast ? 0 : 5} flex={1}>
                <HStack justify="space-between" align="start" mb={0.5}>
                  <Text fontSize="sm" fontWeight="700" color="#1a1616">
                    {item.titulo}
                  </Text>
                  <Text fontSize="xs" color="gray.500" flexShrink={0} ml={4}>
                    {item.data}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  {item.descricao}
                </Text>
                {item.responsavel && (
                  <Text fontSize="xs" color="gray.400">
                    Por: {item.responsavel}
                  </Text>
                )}
              </Box>
            </HStack>
          )
        })}
      </VStack>
    </Box>
  )
}

// ─── Sub-componente: Arte para Aprovação ─────────────────────────────────────

interface ArteCardProps {
  arte: ArteDTO
  orcamentoId: number
  token: string | null
  comentariosDoProduto: OrcamentoDetalheResponseDTO['comentarios']
  onAtualizado: (data: OrcamentoDetalheResponseDTO) => void
}

const ArteCard = ({ arte, orcamentoId, token, comentariosDoProduto, onAtualizado }: ArteCardProps) => {
  const [comentario, setComentario] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const arteStyle = ARTE_STATUS_STYLE[arte.status] ?? { bg: 'gray.100', color: 'gray.700' }
  const arteLabel = ARTE_STATUS_LABEL[arte.status] ?? arte.status

  const handleAvaliar = async (acao: 'APROVAR' | 'SOLICITAR_AJUSTE') => {
    if (acao === 'SOLICITAR_AJUSTE' && !comentario.trim()) {
      setErro('Informe o que precisa ser ajustado.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const updated = await orcamentoService.avaliarArte(token, orcamentoId, arte.id, acao, comentario)
      setComentario('')
      onAtualizado(updated)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar avaliação')
    } finally {
      setSalvando(false)
    }
  }

  const imagemSrc = arte.imagemData ?? arte.imagemUrl ?? undefined

  return (
    <Box border="1px solid" borderColor="gray.200" borderRadius="md" overflow="hidden">
      {/* Imagem */}
      {imagemSrc ? (
        <Box bg="gray.100" maxH="280px" overflow="hidden">
          <Image src={imagemSrc} alt={arte.produtoNome} w="full" maxH="280px" objectFit="cover" />
        </Box>
      ) : (
        <Box bg="gray.100" h="120px" display="flex" alignItems="center" justifyContent="center">
          <Text fontSize="xs" color="gray.400">Sem imagem</Text>
        </Box>
      )}

      {/* Info e ações */}
      <Box p={4}>
        <HStack justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="600" color="#1a1616">{arte.produtoNome}</Text>
          <Badge px={2} py={0.5} borderRadius="full" bg={arteStyle.bg} color={arteStyle.color} fontSize="xs" fontWeight="600">
            {arteLabel}
          </Badge>
        </HStack>
        <HStack gap={1.5} mb={comentariosDoProduto.length > 0 ? 3 : arte.status === 'PENDENTE' ? 3 : 0}>
          <Box color="gray.400"><MessageIcon /></Box>
          <Text fontSize="xs" color="gray.500">Enviado em {arte.enviadoEm}</Text>
        </HStack>

        {/* Comentários anteriores deste produto */}
        {comentariosDoProduto.length > 0 && (
          <VStack align="stretch" gap={2} mb={arte.status === 'PENDENTE' ? 3 : 0}>
            {comentariosDoProduto.map((c) => (
              <Box key={c.id} bg="gray.50" border="1px solid" borderColor="gray.200" borderRadius="md" p={3}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="xs" fontWeight="700" color="#1a1616">{c.autor}</Text>
                  <Text fontSize="11px" color="gray.400">{c.criadoEm}</Text>
                </HStack>
                <Text fontSize="xs" color="gray.700">{c.mensagem}</Text>
              </Box>
            ))}
          </VStack>
        )}

        {/* Ações (só quando PENDENTE) */}
        {arte.status === 'PENDENTE' && (
          <>
            {erro && (
              <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" px={3} py={2} mb={2}>
                <Text fontSize="xs" color="red.600">{erro}</Text>
              </Box>
            )}
            <Textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Adicione comentários ou sugestões (obrigatório para solicitar ajuste)"
              fontSize="xs"
              size="sm"
              borderColor="gray.200"
              borderRadius="md"
              resize="none"
              rows={2}
              mb={3}
              _focus={{ borderColor: '#1a1616', boxShadow: 'none' }}
            />
            <HStack gap={3}>
              <Button
                flex={1} size="sm" bg="#15803d" color="white" fontWeight="600" fontSize="xs"
                borderRadius="md" _hover={{ bg: '#166534' }}
                disabled={salvando}
                onClick={() => handleAvaliar('APROVAR')}
              >
                <HStack gap={1.5}>
                  {salvando ? <Spinner size="xs" /> : <CheckIcon />}
                  <Text>Aprovar Arte</Text>
                </HStack>
              </Button>
              <Button
                flex={1} size="sm" variant="outline" borderColor="#dc2626" color="#dc2626"
                fontWeight="600" fontSize="xs" borderRadius="md" _hover={{ bg: '#fee2e2' }}
                disabled={salvando}
                onClick={() => handleAvaliar('SOLICITAR_AJUSTE')}
              >
                <HStack gap={1.5}>
                  {salvando ? <Spinner size="xs" /> : <AlertIcon />}
                  <Text>Solicitar Ajuste</Text>
                </HStack>
              </Button>
            </HStack>
          </>
        )}
      </Box>
    </Box>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export const OrcamentoDetalhe = () => {
  const { id } = useParams<{ id: string }>()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState<OrcamentoDetalheResponseDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await orcamentoService.obterDetalhe(token, Number(id))
        if (isMounted) setData(result)
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : 'Erro ao carregar orçamento')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [id, token])

  const badgeStyle = data
    ? (STATUS_BADGE_STYLE[data.status] ?? { bg: 'gray.100', color: 'gray.700' })
    : { bg: 'gray.100', color: 'gray.700' }

  const statusLabel = data
    ? (STATUS_LABEL[data.status] ?? data.status)
    : ''

  const gerarRecibo = () => {
    if (!data) return
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()
    const gray = '#6B7280'
    const dark = '#111827'

    // ── Cabeçalho ──
    doc.setFontSize(20)
    doc.setTextColor(dark)
    doc.setFont('helvetica', 'bold')
    doc.text('RECIBO DE PEDIDO', pageW / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setTextColor(gray)
    doc.setFont('helvetica', 'normal')
    doc.text('Bahia Brindes', pageW / 2, 28, { align: 'center' })

    // ── Linha divisória ──
    doc.setDrawColor('#E5E7EB')
    doc.line(14, 33, pageW - 14, 33)

    // ── Informações do pedido ──
    doc.setFontSize(10)
    doc.setTextColor(dark)
    doc.setFont('helvetica', 'bold')
    doc.text('PEDIDO', 14, 41)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(gray)
    doc.text(data.codigo ?? `#${data.id}`, 14, 47)

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dark)
    doc.text('STATUS', pageW / 2, 41, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(gray)
    doc.text(STATUS_LABEL[data.status] ?? data.status, pageW / 2, 47, { align: 'center' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dark)
    doc.text('DATA', pageW - 14, 41, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(gray)
    doc.text(data.dataCriacao ?? '—', pageW - 14, 47, { align: 'right' })

    // ── Dados do cliente ──
    doc.line(14, 52, pageW - 14, 52)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dark)
    doc.text('CLIENTE', 14, 59)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(gray)
    doc.text(data.nomeCliente ?? '—', 14, 65)
    if (data.emailCliente) doc.text(data.emailCliente, 14, 70)
    if (data.telefoneCliente) doc.text(data.telefoneCliente, 14, 75)

    // ── Tabela de produtos ──
    const tableTop = data.emailCliente ? (data.telefoneCliente ? 82 : 77) : 72
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(dark)
    doc.text('PRODUTOS', 14, tableTop)

    autoTable(doc, {
      startY: tableTop + 4,
      head: [['Produto', 'Qtd', 'Valor Unit.', 'Desconto', 'Total']],
      body: (data.produtos ?? []).map(p => [
        p.nome,
        String(p.quantidade),
        formatPreco(Number(p.precoUnitario ?? 0)),
        p.desconto && Number(p.desconto) > 0 ? `- ${formatPreco(Number(p.desconto))}` : '—',
        formatPreco(Number(p.precoTotal ?? 0)),
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: '#1F2937', textColor: '#FFFFFF', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: '#F9FAFB' },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'right', cellWidth: 32 },
        3: { halign: 'right', cellWidth: 28 },
        4: { halign: 'right', cellWidth: 32 },
      },
      margin: { left: 14, right: 14 },
    })

    // ── Totais ──
    const finalY = (doc as any).lastAutoTable.finalY + 8
    const col1 = pageW - 80
    const col2 = pageW - 14

    const addTotalRow = (label: string, value: string, y: number, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(bold ? 10 : 9)
      doc.setTextColor(bold ? dark : gray)
      doc.text(label, col1, y)
      doc.text(value, col2, y, { align: 'right' })
    }

    let y = finalY
    addTotalRow('Subtotal:', formatPreco(Number(data.subtotal ?? 0)), y)
    if (Number(data.descontoTotal ?? 0) > 0) {
      y += 6
      addTotalRow('Desconto:', `- ${formatPreco(Number(data.descontoTotal))}`, y)
    }
    y += 6
    doc.setDrawColor('#E5E7EB')
    doc.line(col1, y - 2, col2, y - 2)
    addTotalRow('TOTAL:', formatPreco(Number(data.valorTotal ?? 0)), y + 2, true)

    if (Number(data.valorPago ?? 0) > 0) {
      y += 10
      addTotalRow('Valor Pago:', formatPreco(Number(data.valorPago)), y)
      const restante = Number(data.valorTotal ?? 0) - Number(data.valorPago ?? 0)
      if (restante > 0) {
        y += 6
        doc.setTextColor('#DC2626')
        addTotalRow('Saldo Restante:', formatPreco(restante), y)
      }
    }

    // ── Método de pagamento ──
    if (data.metodoPagamento) {
      y += 12
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(gray)
      doc.text(`Forma de pagamento: ${data.metodoPagamento}`, 14, y)
    }

    // ── Rodapé ──
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFontSize(8)
    doc.setTextColor('#9CA3AF')
    doc.text('Documento gerado por Bahia Brindes', pageW / 2, pageH - 10, { align: 'center' })

    doc.save(`recibo-${data.codigo ?? data.id}.pdf`)
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <HomeNavbar />

      <Box as="main" py={8} flex="1">
        <Container maxW="6xl">

          {/* ── Loading / Error ── */}
          {loading && (
            <VStack py={20} gap={3}>
              <Spinner size="lg" color="gray.500" />
              <Text fontSize="sm" color="gray.500">Carregando orçamento...</Text>
            </VStack>
          )}

          {!loading && error && (
            <VStack py={20} gap={3}>
              <Text fontSize="sm" color="red.500">{error}</Text>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/meus-orcamentos')}
              >
                Voltar para Orçamentos
              </Button>
            </VStack>
          )}

          {!loading && data && (
            <>
              {/* ── Cabeçalho ── */}
              <HStack
                mb={4}
                gap={1}
                color="gray.500"
                fontSize="sm"
                cursor="pointer"
                _hover={{ color: '#1a1616' }}
                onClick={() => navigate('/meus-orcamentos')}
                w="fit-content"
              >
                <ArrowLeftIcon />
                <Text>Voltar para Orçamentos</Text>
              </HStack>

              <HStack justify="space-between" align="start" mb={6} flexWrap="wrap" gap={3}>
                <VStack align="start" gap={2}>
                  <Text as="h1" fontSize="2xl" fontWeight="700" color="#1a1616">
                    Pedido {data.codigo ?? `#${data.id}`}
                  </Text>
                  <Badge
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={badgeStyle.bg}
                    color={badgeStyle.color}
                    fontSize="xs"
                    fontWeight="600"
                  >
                    {statusLabel}
                  </Badge>
                </VStack>

                <Button
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  fontWeight="600"
                  fontSize="sm"
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => window.print()}
                >
                  <HStack gap={2}>
                    <DownloadIcon />
                    <Text>Baixar Orçamento PDF</Text>
                  </HStack>
                </Button>
              </HStack>

              {/* ── Layout 2 colunas ── */}
              <Grid
                templateColumns={{ base: '1fr', lg: '1fr 320px' }}
                gap={6}
                alignItems="start"
              >
                {/* Coluna esquerda */}
                <GridItem>
                  <VStack gap={6} align="stretch">

                    {/* Histórico de Status */}
                    {(data.historico ?? []).length > 0 && (
                      <HistoricoStatus historico={data.historico ?? []} statusAtual={data.status} />
                    )}

                    {/* Artes para Aprovação */}
                    {(data.artes ?? []).length > 0 && (
                      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={6}>
                        <HStack gap={2} mb={5}>
                          <Box color="gray.600"><DocumentIcon /></Box>
                          <Text fontWeight="700" fontSize="sm" color="#1a1616">
                            Artes para Aprovação
                          </Text>
                        </HStack>
                        <VStack gap={5} align="stretch">
                          {(data.artes ?? []).map((arte) => (
                            <ArteCard
                              key={arte.id}
                              arte={arte}
                              orcamentoId={data.id}
                              token={token}
                              comentariosDoProduto={(data.comentarios ?? []).filter(c => c.produtoNome === arte.produtoNome)}
                              onAtualizado={setData}
                            />
                          ))}
                        </VStack>
                      </Box>
                    )}

                    {/* Produtos */}
                    {(data.produtos ?? []).length > 0 && (
                      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={6}>
                        <HStack gap={2} mb={5}>
                          <Box color="gray.600"><BoxIcon /></Box>
                          <Text fontWeight="700" fontSize="sm" color="#1a1616">
                            Produtos
                          </Text>
                        </HStack>
                        <VStack gap={4} align="stretch">
                          {(data.produtos ?? []).map((produto) => (
                            <HStack
                              key={produto.id}
                              gap={4}
                              p={4}
                              bg="gray.50"
                              borderRadius="md"
                              align="start"
                            >
                              {/* Imagem */}
                              <Box
                                w="80px"
                                h="80px"
                                borderRadius="md"
                                overflow="hidden"
                                flexShrink={0}
                                bg="gray.200"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Image
                                  src={produto.imagemUrl ?? ''}
                                  alt={produto.nome}
                                  w="full"
                                  h="full"
                                  objectFit="cover"
                                />
                              </Box>

                              {/* Detalhes */}
                              <Box flex={1} minW={0}>
                                <Text fontSize="sm" fontWeight="700" color="#1a1616" mb={1}>
                                  {produto.nome}
                                </Text>
                                <VStack align="start" gap={0.5}>
                                  <Text fontSize="xs" color="gray.600">
                                    Quantidade: {produto.quantidade} unidades
                                  </Text>
                                  {produto.cor && (
                                    <Text fontSize="xs" color="gray.600">
                                      Cor: {produto.cor}
                                    </Text>
                                  )}
                                  {produto.tamanho && (
                                    <Text fontSize="xs" color="gray.600">
                                      Tamanho: {produto.tamanho}
                                    </Text>
                                  )}
                                  {produto.impressao && (
                                    <Text fontSize="xs" color="gray.600">
                                      Impressão: {produto.impressao}
                                    </Text>
                                  )}
                                </VStack>
                              </Box>

                              {/* Preços */}
                              <VStack align="end" gap={0.5} flexShrink={0}>
                                <Text fontSize="xs" color="gray.500">Valor unitário</Text>
                                <Text fontSize="sm" fontWeight="600" color="#1a1616">
                                  {formatPreco(produto.precoUnitario)}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>Total</Text>
                                <Text fontSize="sm" fontWeight="700" color="#1a1616">
                                  {formatPreco(produto.precoTotal)}
                                </Text>
                              </VStack>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                </GridItem>

                {/* Coluna direita (sticky) */}
                <GridItem>
                  <VStack
                    gap={4}
                    align="stretch"
                    position={{ base: 'static', lg: 'sticky' }}
                    top="90px"
                  >
                    {/* Resumo do Pedido */}
                    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={5}>
                      <Text fontWeight="700" fontSize="sm" color="#1a1616" mb={4}>
                        Resumo do Pedido
                      </Text>

                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.600">Subtotal</Text>
                        <Text fontSize="sm" fontWeight="600" color="#1a1616">
                          {formatPreco(data.subtotal)}
                        </Text>
                      </HStack>

                      <HStack justify="space-between" mb={4}>
                        <Text fontSize="sm" color="gray.600">Frete</Text>
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color={data.frete === 0 ? 'green.600' : '#1a1616'}
                        >
                          {data.frete === 0 ? 'Grátis' : formatPreco(data.frete)}
                        </Text>
                      </HStack>

                      <Box h="1px" bg="gray.100" mb={4} />

                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="700" color="#1a1616">Total</Text>
                        <Text fontSize="lg" fontWeight="700" color="#1a1616">
                          {formatPreco(data.valorTotal)}
                        </Text>
                      </HStack>
                    </Box>

                    {/* Entrega Estimada */}
                    {data.dataPrevisaoEntrega && (
                      <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={5}>
                        <HStack gap={2} mb={2}>
                          <Box color="gray.500"><CalendarIcon /></Box>
                          <Text fontWeight="700" fontSize="sm" color="#1a1616">
                            Entrega Estimada
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.700" fontWeight="500">
                          {data.dataPrevisaoEntrega}
                        </Text>
                      </Box>
                    )}

                    {/* Precisa de Ajuda? */}
                    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" p={5}>
                      <Text fontWeight="700" fontSize="sm" color="#1a1616" mb={3}>
                        Precisa de Ajuda?
                      </Text>
                      <VStack gap={2} align="stretch">
                        <Button
                          variant="outline"
                          borderColor="gray.200"
                          color="#1a1616"
                          fontWeight="500"
                          fontSize="sm"
                          borderRadius="md"
                          _hover={{ bg: 'gray.50' }}
                          onClick={() => {
                            const phone = '558781440072'
                            const codigo = data.codigo ?? `#${data.id}`
                            const nome = data.nomeCliente ?? 'cliente'
                            const message = `Olá, sou ${nome} e gostaria de suporte sobre o pedido ${codigo}.`
                            const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
                            window.open(url, '_blank')
                          }}
                        >
                          Falar com Suporte
                        </Button>
                        <Button
                          variant="outline"
                          borderColor="gray.200"
                          color="#1a1616"
                          fontWeight="500"
                          fontSize="sm"
                          borderRadius="md"
                          _hover={{ bg: 'gray.50' }}
                          onClick={gerarRecibo}
                        >
                          <HStack gap={2}>
                            <DownloadIcon />
                            <Text>Baixar Recibo</Text>
                          </HStack>
                        </Button>
                      </VStack>
                    </Box>
                  </VStack>
                </GridItem>
              </Grid>
            </>
          )}
        </Container>
      </Box>

      <HomeFooter />
    </Box>
  )
}
