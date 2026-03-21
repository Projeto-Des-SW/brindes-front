import { apiUrl } from '../config/api'

export interface FuncionarioResponse {
  id: number
  nome: string
  email: string
  ativo: boolean
  perfis: string[]
  dtCriacao: string | null
}

export interface FuncionarioRequest {
  nome: string
  email: string
  senha: string
  perfis?: string[]
}

export interface FuncionarioUpdateRequest {
  nome: string
  email: string
  senha?: string
  perfis?: string[]
}

const authHeader = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
})

const parseError = async (res: Response): Promise<never> => {
  const data = await res.json().catch(() => ({}))
  throw new Error((data as { message?: string }).message || `Erro ${res.status}`)
}

export const funcionarioService = {
  async listar(
    params: { search?: string; page?: number; pageSize?: number },
    token: string,
    signal?: AbortSignal,
  ): Promise<{ items: FuncionarioResponse[]; total: number; page: number; pageSize: number }> {
    const q = new URLSearchParams()
    if (params.search) q.set('search', params.search)
    q.set('page', String(params.page ?? 1))
    q.set('pageSize', String(params.pageSize ?? 50))
    const res = await fetch(apiUrl(`/api/funcionarios?${q}`), { headers: authHeader(token), signal })
    if (!res.ok) await parseError(res)
    return res.json()
  },

  async criar(request: FuncionarioRequest, token: string): Promise<FuncionarioResponse> {
    const res = await fetch(apiUrl('/api/funcionarios'), {
      method: 'POST',
      headers: authHeader(token),
      body: JSON.stringify(request),
    })
    if (!res.ok) await parseError(res)
    return res.json()
  },

  async atualizar(id: number, request: FuncionarioUpdateRequest, token: string): Promise<FuncionarioResponse> {
    const res = await fetch(apiUrl(`/api/funcionarios/${id}`), {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(request),
    })
    if (!res.ok) await parseError(res)
    return res.json()
  },

  async me(token: string, signal?: AbortSignal): Promise<FuncionarioResponse> {
    const res = await fetch(apiUrl('/api/meu-perfil'), { headers: authHeader(token), signal })
    if (!res.ok) await parseError(res)
    return res.json()
  },

  async atualizarMe(
    request: { nome: string; email: string; senha?: string },
    token: string,
  ): Promise<FuncionarioResponse> {
    const res = await fetch(apiUrl('/api/meu-perfil'), {
      method: 'PUT',
      headers: authHeader(token),
      body: JSON.stringify(request),
    })
    if (!res.ok) await parseError(res)
    return res.json()
  },

  async remover(id: number, token: string): Promise<void> {
    const res = await fetch(apiUrl(`/api/funcionarios/${id}`), {
      method: 'DELETE',
      headers: authHeader(token),
    })
    if (!res.ok) await parseError(res)
  },
}
