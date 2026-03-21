import { apiUrl, API_ENDPOINTS } from '../config/api'
import { authHeaders, getJsonOrThrow } from './http'

export interface EnderecoDTO {
  id?: number | null
  rua?: string | null
  numero?: string | null
  cep?: string | null
  cidade?: string | null
  estado?: string | null
}

export interface ClientePerfilDTO {
  id: number
  nome: string
  email: string
  documento?: string | null
  telefone?: string | null
  endereco?: EnderecoDTO | null
  segmentacao?: string | null
  fotoPerfil?: string | null
}

export interface AtualizarPerfilRequest {
  nome?: string
  email?: string
  senha?: string
  documento?: string
  telefone?: string
  endereco?: {
    rua?: string
    numero?: string
    cep?: string
    cidade?: string
    estado?: string
  } | null
  fotoPerfil?: string
}

export const clienteService = {
  async buscarMeu(token: string | null): Promise<ClientePerfilDTO> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.clientes}/me`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
    })
    return getJsonOrThrow<ClientePerfilDTO>(res)
  },

  async atualizarMeu(
    token: string | null,
    data: AtualizarPerfilRequest,
  ): Promise<ClientePerfilDTO> {
    const res = await fetch(apiUrl(`${API_ENDPOINTS.clientes}/me`), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(data),
    })
    return getJsonOrThrow<ClientePerfilDTO>(res)
  },
}
