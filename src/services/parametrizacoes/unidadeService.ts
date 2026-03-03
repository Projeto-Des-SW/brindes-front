import { apiUrl, API_ENDPOINTS } from '../../config/api'
import { authHeaders, getJsonOrThrow } from '../http'

export const unidadeService = {
  async getUnidades(token?: string | null, signal?: AbortSignal): Promise<string[]> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.unidades), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })
    const data = await getJsonOrThrow<string[]>(res)
    return (data ?? []).map((u) => String(u))
  },
}

