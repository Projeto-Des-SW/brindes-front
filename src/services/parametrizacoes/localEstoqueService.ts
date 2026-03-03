import { apiUrl, API_ENDPOINTS } from '../../config/api'
import { authHeaders, getJsonOrThrow, parseErrorMessage, toQueryString } from '../http'
import type { LocalEstoqueResponse, PageResponse } from '../../types/estoqueServiceTypes'

export const localEstoqueService = {
  async getLocaisEstoque(
    params: { search?: string; page?: number; pageSize?: number },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<PageResponse<LocalEstoqueResponse>> {
    const qs = toQueryString({
      search: params.search,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    })

    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.locais}${qs}`), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })

    const data = await getJsonOrThrow<PageResponse<LocalEstoqueResponse>>(res)
    return {
      ...data,
      items: (data.items ?? []).map((l) => ({
        id: Number(l.id),
        nome: l.nome ?? '',
        descricao: l.descricao ?? '',
      })),
    }
  },

  async createLocalEstoque(
    payload: { nome: string; descricao?: string },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<LocalEstoqueResponse> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.locais), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
    const l = await getJsonOrThrow<LocalEstoqueResponse>(res)
    return { id: Number(l.id), nome: l.nome ?? '', descricao: l.descricao ?? '' }
  },

  async updateLocalEstoque(
    id: number,
    payload: { nome: string; descricao?: string },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<LocalEstoqueResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.locais}/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
      signal,
    })
    const l = await getJsonOrThrow<LocalEstoqueResponse>(res)
    return { id: Number(l.id), nome: l.nome ?? '', descricao: l.descricao ?? '' }
  },

  async deleteLocalEstoque(id: number, token?: string | null, signal?: AbortSignal): Promise<void> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.locais}/${id}`), {
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

