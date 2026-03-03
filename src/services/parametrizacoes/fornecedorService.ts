import { apiUrl, API_ENDPOINTS } from '../../config/api'
import { authHeaders, getJsonOrThrow, parseErrorMessage, toQueryString } from '../http'
import type { FornecedorResponse, PageResponse } from '../../types/estoqueServiceTypes'

export const fornecedorService = {
  async getFornecedores(
    params: { search?: string; status?: string; page?: number; pageSize?: number },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<PageResponse<FornecedorResponse>> {
    const qs = toQueryString({
      search: params.search,
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    })

    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.fornecedores}${qs}`), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })

    const data = await getJsonOrThrow<PageResponse<FornecedorResponse>>(res)
    return {
      ...data,
      items: (data.items ?? []).map((f) => ({
        id: Number(f.id),
        nome: f.nome ?? '',
        cnpj: f.cnpj ?? '',
        telefone: f.telefone ?? '',
        email: f.email ?? '',
        prazoEntrega: f.prazoEntrega ?? '',
        status: f.status ?? 'ATIVO',
        condicoesPagamento: (f as any).condicoesPagamento ?? '',
        observacoes: (f as any).observacoes ?? '',
        endereco: (f as any).endereco ?? null,
      })),
    }
  },

  async createFornecedor(
    payload: {
      nome: string
      cnpj?: string
      telefone?: string
      email?: string
      prazoEntrega?: string
      status?: string
      condicoesPagamento?: string
      observacoes?: string
      endereco?: { rua?: string; numero?: string; cep?: string; cidade?: string; estado?: string } | null
    },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<FornecedorResponse> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.fornecedores), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
    const f = await getJsonOrThrow<FornecedorResponse>(res)
    return {
      id: Number(f.id),
      nome: f.nome ?? '',
      cnpj: f.cnpj ?? '',
      telefone: f.telefone ?? '',
      email: f.email ?? '',
      prazoEntrega: f.prazoEntrega ?? '',
      status: f.status ?? 'ATIVO',
      condicoesPagamento: (f as any).condicoesPagamento ?? '',
      observacoes: (f as any).observacoes ?? '',
      endereco: (f as any).endereco ?? null,
    }
  },

  async updateFornecedor(
    id: number,
    payload: {
      nome: string
      cnpj?: string
      telefone?: string
      email?: string
      prazoEntrega?: string
      status?: string
      condicoesPagamento?: string
      observacoes?: string
      endereco?: { rua?: string; numero?: string; cep?: string; cidade?: string; estado?: string } | null
    },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<FornecedorResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.fornecedores}/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
    const f = await getJsonOrThrow<FornecedorResponse>(res)
    return {
      id: Number(f.id),
      nome: f.nome ?? '',
      cnpj: f.cnpj ?? '',
      telefone: f.telefone ?? '',
      email: f.email ?? '',
      prazoEntrega: f.prazoEntrega ?? '',
      status: f.status ?? 'ATIVO',
      condicoesPagamento: (f as any).condicoesPagamento ?? '',
      observacoes: (f as any).observacoes ?? '',
      endereco: (f as any).endereco ?? null,
    }
  },

  async deleteFornecedor(id: number, token?: string | null, signal?: AbortSignal): Promise<void> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.fornecedores}/${id}`), {
      method: 'DELETE',
      headers: { ...authHeaders(token) },
      signal,
    })
    if (!res.ok) {
      const msg = await parseErrorMessage(res)
      throw new Error(msg || `Erro HTTP ${res.status}`)
    }
  },
}

