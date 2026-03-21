import { apiUrl, API_ENDPOINTS } from '../config/api'
import { authHeaders, getJsonOrThrow } from './http'
import type { PageResponse } from '../types/estoqueServiceTypes'

export interface ProdutoResumoDTO {
  id: number
  nome: string
  detalhesResumo: string
  imagemUrl?: string | null
}

export interface MeusOrcamentosItemResponseDTO {
  id: number
  codigo: string
  status: string
  dataCriacao?: string | null
  dataPrevisaoEntrega?: string | null
  valorTotal: number
  produtos: ProdutoResumoDTO[]
}

export interface CriarOrcamentoItemRequest {
  produtoId: number
  quantidade: number
  cor?: string
  impressao?: string
  precoUnitario?: number
  desconto?: number
}

export interface CriarOrcamentoRequest {
  itens: CriarOrcamentoItemRequest[]
  observacoes?: string
}

export interface CriarOrcamentoAdminRequest {
  itens: CriarOrcamentoItemRequest[]
  observacoes?: string
  nomeCliente?: string
  emailCliente?: string
  telefoneCliente?: string
}

// ─── DTOs de Detalhe ─────────────────────────────────────────────────────────

export interface HistoricoStatusItemDTO {
  id: number
  status: string
  titulo: string
  descricao: string
  data: string
  responsavel?: string | null
}

export interface ArteDTO {
  id: number
  produtoNome: string
  imagemUrl?: string | null
  nomeArquivo?: string // Nome original do arquivo com extensão
  imagemData?: string | null // Imagem em base64 para renderizar no frontend
  status: 'PENDENTE' | 'APROVADA' | 'AJUSTE_SOLICITADO'
  enviadoEm: string
}

export interface OrcamentoProdutoDetalheDTO {
  id: number
  produtoId?: number | null
  jaAvaliado?: boolean
  notaAvaliacao?: number | null
  comentarioAvaliacao?: string | null
  nome: string
  quantidade: number
  cor?: string | null
  tamanho?: string | null
  impressao?: string | null
  imagemUrl?: string | null
  precoUnitario: number
  desconto: number
  precoTotal: number
}

export interface ComentarioOrcamentoDTO {
  id: number
  autor: string
  mensagem: string
  produtoNome?: string | null
  criadoEm: string
}

export interface OrcamentoDetalheResponseDTO {
  id: number
  codigo: string
  status: string
  dataCriacao?: string | null
  dataPrevisaoEntrega?: string | null
  subtotal: number
  descontoTotal: number
  frete: number
  valorTotal: number
  nomeCliente?: string | null
  emailCliente?: string | null
  telefoneCliente?: string | null
  metodoPagamento?: string | null
  valorPago?: number | null
  historico: HistoricoStatusItemDTO[]
  artes: ArteDTO[]
  produtos: OrcamentoProdutoDetalheDTO[]
  comentarios: ComentarioOrcamentoDTO[]
}

export interface AtualizarPagamentoRequest {
  metodoPagamento?: string
  valorPago?: number
}

export interface AdminOrcamentoListItemDTO {
  id: number
  codigo: string
  status: string
  dataCriacao?: string | null
  valorTotal: number
  numProdutos: number
  nomeCliente?: string | null
  telefoneCliente?: string | null
}

export const orcamentoService = {
  async listarMeus(
    token: string | null,
    page = 1,
    pageSize = 10,
  ): Promise<PageResponse<MeusOrcamentosItemResponseDTO>> {
    const url = apiUrl(
      `${API_ENDPOINTS.orcamentos}/meus?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`,
    )

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
    })

    return getJsonOrThrow<PageResponse<MeusOrcamentosItemResponseDTO>>(res)
  },

  async listarTodos(
    token: string | null,
    page = 1,
    pageSize = 20,
    status?: string,
  ): Promise<PageResponse<AdminOrcamentoListItemDTO>> {
    let path = `${API_ENDPOINTS.orcamentos}/admin?page=${encodeURIComponent(page)}&pageSize=${encodeURIComponent(pageSize)}`
    if (status) path += `&status=${encodeURIComponent(status)}`
    const res = await fetch(apiUrl(path), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    })
    return getJsonOrThrow<PageResponse<AdminOrcamentoListItemDTO>>(res)
  },

  async criar(token: string | null, data: CriarOrcamentoRequest) {
    const url = apiUrl(API_ENDPOINTS.orcamentos)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(data),
    })

    return getJsonOrThrow(res)
  },

  async criarAdmin(
    token: string | null,
    data: CriarOrcamentoAdminRequest
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/admin`)
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(data),
    })

    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async obterDetalhe(
    token: string | null,
    id: number,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/meus/${id}`)
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async obterDetalheAdmin(
    token: string | null,
    id: number,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/admin/${id}`)
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async atualizarPagamento(
    token: string | null,
    id: number,
    data: AtualizarPagamentoRequest,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/${id}/pagamento`)
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(data),
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async uploadArte(
    token: string | null,
    orcamentoId: number,
    produtoNome: string,
    arquivo: File,
  ): Promise<ArteDTO> {
    const form = new FormData()
    form.append('produtoNome', produtoNome)
    form.append('arquivo', arquivo)
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/${orcamentoId}/artes`)
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(token), // sem Content-Type: browser define boundary do multipart
      body: form,
    })
    return getJsonOrThrow<ArteDTO>(res)
  },

  async downloadArte(token: string | null, arteId: number): Promise<void> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/artes/${arteId}/download`)
    const res = await fetch(url, {
      method: 'GET',
      headers: authHeaders(token),
    })

    if (!res.ok) {
      throw new Error('Erro ao baixar arquivo')
    }

    // Extrair nome do arquivo do header Content-Disposition
    const contentDisposition = res.headers.get('Content-Disposition')
    let nomeArquivo = 'arte.jpg'
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename="(.+?)"/)
      if (matches && matches[1]) {
        nomeArquivo = matches[1]
      }
    }

    // Converter response em blob e fazer download
    const blob = await res.blob()
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = nomeArquivo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  },

  async avaliarArte(
    token: string | null,
    orcamentoId: number,
    arteId: number,
    acao: 'APROVAR' | 'SOLICITAR_AJUSTE',
    comentario?: string,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/meus/${orcamentoId}/artes/${arteId}/avaliar`)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ acao, comentario: comentario ?? '' }),
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async notificar(
    token: string | null,
    orcamentoId: number,
    tipo: 'status' | 'arte',
  ): Promise<void> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/${orcamentoId}/notificar/${tipo}`)
    const res = await fetch(url, { method: 'POST', headers: authHeaders(token) })
    if (!res.ok) throw new Error(await res.text())
  },

  async criarAvaliacao(
    token: string | null,
    orcamentoId: number,
    data: { produtoId: number; nota: number; comentario?: string },
  ): Promise<{ id: number; nomeCliente: string; nota: number; comentario: string | null; criadoEm: string }> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/meus/${orcamentoId}/avaliar`)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(data),
    })
    return getJsonOrThrow(res)
  },

  async atualizarStatus(
    token: string | null,
    id: number,
    novoStatus: string,
    responsavel?: string,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const params = new URLSearchParams({ novoStatus })
    if (responsavel) params.set('responsavel', responsavel)
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/${id}/status?${params.toString()}`)
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async avaliarArteAdmin(
    token: string | null,
    orcamentoId: number,
    arteId: number,
    novoStatus: string,
    comentario?: string,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/admin/${orcamentoId}/artes/${arteId}/status`)
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ novoStatus, comentario }),
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async atualizarDescontoItem(
    token: string | null,
    orcamentoId: number,
    itemId: number,
    desconto: number,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/admin/${orcamentoId}/itens/${itemId}`)
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ desconto }),
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },

  async adicionarComentario(
    token: string | null,
    orcamentoId: number,
    mensagem: string,
    produtoNome?: string,
  ): Promise<OrcamentoDetalheResponseDTO> {
    const url = apiUrl(`${API_ENDPOINTS.orcamentos}/admin/${orcamentoId}/comentario`)
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify({ mensagem, produtoNome }),
    })
    return getJsonOrThrow<OrcamentoDetalheResponseDTO>(res)
  },
}

