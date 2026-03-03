import { apiUrl, API_ENDPOINTS } from '../config/api'
import type { ProdutoEstoqueRow, StatusEstoque } from '../pages/estoque/types'
import type { EstoqueResumoResponse, PageResponse, ProdutoEstoqueItemResponse } from '../types/estoqueServiceTypes'
import { authHeaders, getJsonOrThrow, toQueryString } from './http'

export const estoqueService = {
  async getResumo(token?: string | null, signal?: AbortSignal): Promise<EstoqueResumoResponse> {
    const res = await fetch(apiUrl(API_ENDPOINTS.estoque.resumo), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })
    return await getJsonOrThrow<EstoqueResumoResponse>(res)
  },

  async getItens(
    params: { search?: string; status?: string; page?: number; pageSize?: number },
    token?: string | null,
    signal?: AbortSignal
  ): Promise<PageResponse<ProdutoEstoqueRow>> {
    const qs = toQueryString({
      search: params.search,
      status: params.status,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    })

    const res = await fetch(apiUrl(`${API_ENDPOINTS.estoque.itens}${qs}`), {
      method: 'GET',
      headers: { ...authHeaders(token) },
      signal,
    })

    const data = await getJsonOrThrow<PageResponse<ProdutoEstoqueItemResponse>>(res)
    return {
      ...data,
      items: (data.items ?? []).map((p) => ({
        id: p.id,
        codigo: p.codigo ?? '',
        materiaPrima: p.materiaPrima ?? '',
        quantidadeAtual: Number(p.quantidadeAtual ?? 0),
        estoqueMinimo: Number(p.estoqueMinimo ?? 0),
        valorUnitario: Number(p.valorUnitario ?? 0),
        status: (p.status === 'ABAIXO' ? 'ABAIXO' : 'NORMAL') as StatusEstoque,
      })),
    }
  },
}

