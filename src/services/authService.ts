const API_URL = 'https://brindes-back.onrender.com/api/auth'

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  novaSenha: string
}

export const authService = {
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao enviar e-mail de recuperação')
    }
  },

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const response = await fetch(`${API_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Erro ao resetar senha')
    }
  },
}
