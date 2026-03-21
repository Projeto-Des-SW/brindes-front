import { apiUrl, API_ENDPOINTS } from '../../config/api'
import { authHeaders, getJsonOrThrow } from '../http'
import type { CategoriaResponse } from '../../types/estoqueServiceTypes'

export interface CategoriaPayload {
  nome: string
}

export const categoriaService = {
  async getCategorias(token?: string | null, signal?: AbortSignal): Promise<CategoriaResponse[]> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.categorias), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })
    const data = await getJsonOrThrow<CategoriaResponse[]>(res)
    return (data ?? []).map((c) => ({ id: Number(c.id), nome: c.nome ?? '' }))
  },

  async createCategoria(payload: CategoriaPayload, token?: string | null): Promise<CategoriaResponse> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.categorias), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
    })
    return getJsonOrThrow<CategoriaResponse>(res)
  },

  async updateCategoria(id: number, payload: CategoriaPayload, token?: string | null): Promise<CategoriaResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.categorias}/${id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
      body: JSON.stringify(payload),
    })
    return getJsonOrThrow<CategoriaResponse>(res)
  },

  async deleteCategoria(id: number, token?: string | null): Promise<void> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.categorias}/${id}`), {
      method: 'DELETE',
      headers: { ...authHeaders(token) },
    })
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || `Erro HTTP ${res.status}`)
    }
  },

  async toggleStatus(id: number, token?: string | null): Promise<CategoriaResponse> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.categorias}/${id}/toggle`), {
      method: 'PATCH',
      headers: { ...authHeaders(token) },
    })
    return getJsonOrThrow<CategoriaResponse>(res)
  },
}
