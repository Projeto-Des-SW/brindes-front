import { apiUrl, API_ENDPOINTS } from '../../config/api'
import { authHeaders, getJsonOrThrow } from '../http'
import type { CategoriaResponse } from '../../types/estoqueServiceTypes'

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
}

