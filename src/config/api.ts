// Configuração global da API - constante que pode ser facilmente alterada
export const API_BASE_URL = 'https://brindes-back.onrender.com'

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    forgotPassword: '/api/auth/forgot-password',
    resetPassword: '/api/auth/reset-password',
  },
  estoque: {
    resumo: '/api/estoque/resumo',
    itens: '/api/estoque/itens',
    movimentacoes: '/api/estoque/movimentacoes',
    materiasPrimas: '/api/estoque/materias-primas',
    fornecedores: '/api/estoque/fornecedores',
    locais: '/api/estoque/locais',
    categorias: '/api/estoque/categorias',
    unidades: '/api/estoque/unidades',
  },
}
