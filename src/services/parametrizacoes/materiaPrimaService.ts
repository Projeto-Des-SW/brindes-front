import { apiUrl, API_ENDPOINTS } from '../../config/api'
import { authHeaders, getJsonOrThrow, parseErrorMessage, toQueryString } from '../http'
import type { MateriaPrimaResponse, PageResponse } from '../../types/estoqueServiceTypes'

export const materiaPrimaService = {
  async getMateriasPrimas(
    params: { search?: string; categoria?: string; page?: number; pageSize?: number },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<PageResponse<MateriaPrimaResponse>> {
    const qs = toQueryString({
      search: params.search,
      categoria: params.categoria,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    })

    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.materiasPrimas}${qs}`), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })

    const data = await getJsonOrThrow<PageResponse<MateriaPrimaResponse>>(res)
    return {
      ...data,
      items: (data.items ?? []).map((mp) => ({
        id: Number(mp.id),
        codigo: mp.codigo ?? '',
        descricao: mp.descricao ?? '',
        unidade: mp.unidade ?? '',
        categoria: mp.categoria ?? '',
        fornecedorPrincipal: mp.fornecedorPrincipal ?? '',
        fornecedorSecundarioId: (mp as any).fornecedorSecundarioId ?? null,
        fornecedorSecundario: (mp as any).fornecedorSecundario ?? '',
        localEstoqueId: (mp as any).localEstoqueId ?? null,
        localEstoque: (mp as any).localEstoque ?? '',
        estoqueAtual: Number((mp as any).estoqueAtual ?? 0),
        estoqueMinimo: Number((mp as any).estoqueMinimo ?? 0),
      })),
    }
  },

  async getMateriaPrimaById(
    token: string | null | undefined,
    id: number,
    signal?: AbortSignal
  ): Promise<MateriaPrimaResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.materiasPrimas}/${id}`), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })
    const data = await getJsonOrThrow<{
      id: number
      codigo: string
      descricao: string
      unidade: string
      categoria: string
      fornecedorPrincipal: string
      estoqueAtual: number
      estoqueMinimo: number
    }>(res)

    return {
      id: Number(data.id),
      codigo: data.codigo ?? '',
      descricao: data.descricao ?? '',
      unidade: data.unidade ?? '',
      categoria: data.categoria ?? '',
      fornecedorPrincipal: data.fornecedorPrincipal ?? '',
      fornecedorSecundarioId: (data as any).fornecedorSecundarioId ?? null,
      fornecedorSecundario: (data as any).fornecedorSecundario ?? '',
      localEstoqueId: (data as any).localEstoqueId ?? null,
      localEstoque: (data as any).localEstoque ?? '',
      estoqueAtual: Number(data.estoqueAtual ?? 0),
      estoqueMinimo: Number(data.estoqueMinimo ?? 0),
    }
  },

  async createMateriaPrima(
    payload: {
      codigo: string
      descricao: string
      unidade?: string
      categoria?: string
      categoriaId?: number | null
      fornecedorPrincipalId?: number | null
      fornecedorSecundarioId?: number | null
      localEstoqueId?: number | null
      estoqueMinimo?: number
    },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<MateriaPrimaResponse> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.materiasPrimas), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
    const mp = await getJsonOrThrow<MateriaPrimaResponse>(res)
    return {
      id: Number(mp.id),
      codigo: mp.codigo ?? '',
      descricao: mp.descricao ?? '',
      unidade: mp.unidade ?? '',
      categoria: mp.categoria ?? '',
      fornecedorPrincipal: mp.fornecedorPrincipal ?? '',
      fornecedorSecundarioId: mp.fornecedorSecundarioId ?? null,
      fornecedorSecundario: mp.fornecedorSecundario ?? '',
      localEstoqueId: mp.localEstoqueId ?? null,
      localEstoque: mp.localEstoque ?? '',
      estoqueAtual: Number((mp as any).estoqueAtual ?? 0),
      estoqueMinimo: Number((mp as any).estoqueMinimo ?? 0),
    }
  },

  async updateMateriaPrima(
    id: number,
    payload: {
      codigo: string
      descricao: string
      unidade?: string
      categoria?: string
      categoriaId?: number | null
      fornecedorPrincipalId?: number | null
      fornecedorSecundarioId?: number | null
      localEstoqueId?: number | null
      estoqueMinimo?: number
    },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<MateriaPrimaResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.materiasPrimas}/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
    const mp = await getJsonOrThrow<MateriaPrimaResponse>(res)
    return {
      id: Number(mp.id),
      codigo: mp.codigo ?? '',
      descricao: mp.descricao ?? '',
      unidade: mp.unidade ?? '',
      categoria: mp.categoria ?? '',
      fornecedorPrincipal: mp.fornecedorPrincipal ?? '',
      fornecedorSecundarioId: mp.fornecedorSecundarioId ?? null,
      fornecedorSecundario: mp.fornecedorSecundario ?? '',
      localEstoqueId: mp.localEstoqueId ?? null,
      localEstoque: mp.localEstoque ?? '',
      estoqueAtual: Number((mp as any).estoqueAtual ?? 0),
      estoqueMinimo: Number((mp as any).estoqueMinimo ?? 0),
    }
  },

  async deleteMateriaPrima(id: number, token?: string | null, signal?: AbortSignal): Promise<void> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.materiasPrimas}/${id}`), {
      method: 'DELETE',
      headers: { ...authHeaders(token) },
      signal,
    })
    if (!res.ok) {
      const msg = await parseErrorMessage(res)
      throw new Error(msg || `Erro HTTP ${res.status}`)
    }
  },

  async toggleStatus(id: number, token?: string | null): Promise<MateriaPrimaResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.materiasPrimas}/${id}/toggle`), {
      method: 'PATCH',
      headers: { ...authHeaders(token) },
    })
    return getJsonOrThrow<MateriaPrimaResponse>(res)
  },
}

