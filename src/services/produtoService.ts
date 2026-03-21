import { apiUrl, API_ENDPOINTS } from '../config/api'
import { authHeaders, getJsonOrThrow, toQueryString } from './http'

/* ── Types ───────────────────────────────────────────────── */

export interface ProdutoImagemResponse {
    id: number
    url: string
    ordem: number
}

export interface ProdutoImagemRequest {
    url: string
    ordem?: number
}

export interface ItemFichaTecnicaResponse {
    id: number
    materiaPrimaId: number
    materiaPrimaNome: string
    materiaPrimaUnidade: string
    quantidadeNecessaria: number
    custoCalculado: number | null
}

export interface ProdutoResponse {
    id: number
    nome: string
    descricao: string | null
    sku: string | null
    precoVenda: number | null
    custoProducao: number | null
    categoriaId: number | null
    categoriaNome: string | null
    estoqueAtual: number | null
    estoqueMinimo: number | null
    status: string
    condicoesPagamento: string | null
    prazoProducao: string | null
    observacoes: string | null
    itensFichaTecnica: ItemFichaTecnicaResponse[]
    imagens: ProdutoImagemResponse[]
}

export interface PageResponse<T> {
    items: T[]
    page: number
    pageSize: number
    total: number
}

export interface ItemFichaTecnicaRequest {
    id?: number | null
    materiaPrimaId: number
    quantidadeNecessaria: number
}

export interface ProdutoRequest {
    nome: string
    descricao?: string
    sku?: string
    precoVenda?: number | null
    custoProducao?: number | null
    categoriaId?: number | null
    estoqueMinimo?: number | null
    estoqueAtual?: number | null
    status?: string
    condicoesPagamento?: string
    prazoProducao?: string
    observacoes?: string
    itensFichaTecnica: ItemFichaTecnicaRequest[]
    /** Mínimo 1, máximo 4. A de menor ordem é a capa. */
    imagens: ProdutoImagemRequest[]
}

/* ── Service ─────────────────────────────────────────────── */

const base = () => API_ENDPOINTS.produtos

export const produtoService = {
    async listar(
        params: { page?: number; pageSize?: number },
        token?: string | null,
        signal?: AbortSignal
    ): Promise<PageResponse<ProdutoResponse>> {
        const qs = toQueryString({ page: params.page ?? 1, pageSize: params.pageSize ?? 20 })
        const res = await fetch(apiUrl(`${base()}${qs}`), {
            method: 'GET',
            headers: { ...authHeaders(token) },
            signal,
        })
        return getJsonOrThrow<PageResponse<ProdutoResponse>>(res)
    },

    async buscarPorId(id: number, token?: string | null, signal?: AbortSignal): Promise<ProdutoResponse> {
        const res = await fetch(apiUrl(`${base()}/${id}`), {
            method: 'GET',
            headers: { ...authHeaders(token) },
            signal,
        })
        return getJsonOrThrow<ProdutoResponse>(res)
    },

    async criar(data: ProdutoRequest, token?: string | null): Promise<ProdutoResponse> {
        const res = await fetch(apiUrl(base()), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify(data),
        })
        return getJsonOrThrow<ProdutoResponse>(res)
    },

    async atualizar(id: number, data: ProdutoRequest, token?: string | null): Promise<ProdutoResponse> {
        const res = await fetch(apiUrl(`${base()}/${id}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
            body: JSON.stringify(data),
        })
        return getJsonOrThrow<ProdutoResponse>(res)
    },

    async remover(id: number, token?: string | null): Promise<void> {
        const res = await fetch(apiUrl(`${base()}/${id}`), {
            method: 'DELETE',
            headers: { ...authHeaders(token) },
        })
        if (!res.ok) {
            const msg = await res.text()
            throw new Error(msg || `Erro HTTP ${res.status}`)
        }
    },
}
