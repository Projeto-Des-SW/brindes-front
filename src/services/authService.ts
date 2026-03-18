import { apiUrl, API_ENDPOINTS } from '../config/api'

export interface EnderecoDTO {
  rua?: string
  numero?: string
  cep?: string
  cidade?: string
  estado?: string
}

export interface RegisterRequest {
  nome: string
  email: string
  senha: string
  token: string
  documento?: string
  telefone?: string
  endereco?: EnderecoDTO
  segmentacao?: string
}

export interface RegisterTokenRequest {
  email: string
}

export interface RegisterResponse {
  id: number
  nome: string
  email: string
  documento?: string | null
  telefone?: string | null
  endereco?: (EnderecoDTO & { id?: number | null }) | null
  segmentacao?: string | null
  criadoEm?: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  novaSenha: string
}

export const authService = {
  async requestRegisterToken(data: RegisterTokenRequest): Promise<void> {
    const response = await fetch(apiUrl(`${API_ENDPOINTS.auth.register}/request-token`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      const errorData = contentType?.includes('application/json')
        ? await response.json()
        : { message: 'Erro ao enviar token de cadastro' }
      throw new Error(errorData.message || 'Erro ao enviar token de cadastro')
    }
  },

  async validateToken(data: { email: string; token: string }): Promise<void> {
    const response = await fetch(apiUrl(`${API_ENDPOINTS.auth.register}/validate-token`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      const errorData = contentType?.includes('application/json')
        ? await response.json()
        : { message: 'Token inválido ou expirado' }
      throw new Error(errorData.message || 'Token inválido ou expirado')
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(apiUrl(API_ENDPOINTS.auth.register), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      const errorData = contentType?.includes('application/json')
        ? await response.json()
        : { message: 'Erro ao cadastrar cliente' }
      throw new Error(errorData.message || 'Erro ao cadastrar cliente')
    }

    return response.json()
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await fetch(apiUrl(API_ENDPOINTS.auth.forgotPassword), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar e-mail de recuperação')
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await fetch(apiUrl(API_ENDPOINTS.auth.resetPassword), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao resetar senha')
    }
  },
}
