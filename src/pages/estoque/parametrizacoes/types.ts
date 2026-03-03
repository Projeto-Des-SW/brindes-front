export type ParamTabKey = 'fornecedores' | 'materias-primas' | 'locais'

export type StatusAtivo = 'ATIVO' | 'INATIVO'

export interface FornecedorRow {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
  prazoEntrega: string
  status: StatusAtivo
  condicoesPagamento?: string
  observacoes?: string
  endereco?: {
    rua?: string
    numero?: string
    cep?: string
    cidade?: string
    estado?: string
  } | null
}

export interface MateriaPrimaRow {
  id: number
  codigo: string
  descricao: string
  unidade: string
  categoria: string
  fornecedorPrincipal: string
  estoqueAtual: number
  estoqueMinimo: number
}

export interface LocalEstoqueRow {
  id: number
  nome: string
  descricao: string
}

