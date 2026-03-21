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
  imagemUrl: string
  status: 'PENDENTE' | 'APROVADA' | 'AJUSTE_SOLICITADO'
  enviadoEm: string
}

export interface OrcamentoProdutoDetalheDTO {
  id: number
  nome: string
  quantidade: number
  cor?: string | null
  tamanho?: string | null
  impressao?: string | null
  imagemUrl?: string | null
  precoUnitario: number
  precoTotal: number
}

export interface ComentarioOrcamentoDTO {
  id: number
  autor: string
  mensagem: string
  criadoEm: string
}

export interface OrcamentoDetalheResponseDTO {
  id: number
  codigo: string
  status: string
  dataCriacao?: string | null
  dataPrevisaoEntrega?: string | null
  subtotal: number
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
}

