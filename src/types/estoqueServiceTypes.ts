import type { StatusEstoque, TipoMovimentacao } from '../pages/estoque/types'

export interface PageResponse<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface EstoqueResumoResponse {
  valorTotalEmEstoque: number
  itensAbaixoMinimo: number
  totalMateriasPrimas: number
  produtosSemMovimentacao: number
}

export interface MateriaPrimaResponse {
  id: number
  codigo: string
  descricao: string
  unidade: string
  categoria: string
  fornecedorPrincipal: string
  fornecedorSecundarioId?: number | null
  fornecedorSecundario?: string
  localEstoqueId?: number | null
  localEstoque?: string
  estoqueAtual: number
  estoqueMinimo: number
}

export interface FornecedorResponse {
  id: number
  nome: string
  cnpj: string
  telefone: string
  email: string
  prazoEntrega: string
  status: string
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

export interface LocalEstoqueResponse {
  id: number
  nome: string
  descricao: string
}

export interface CategoriaResponse {
  id: number
  nome: string
}

export interface ProdutoEstoqueItemResponse {
  id: number
  codigo: string
  materiaPrima: string
  quantidadeAtual: number
  estoqueMinimo: number
  valorUnitario: number
  status: StatusEstoque | string
}

export interface MovimentacaoResponse {
  id: number
  data: string // ISO local datetime
  tipo: TipoMovimentacao | string
  materiaPrimaId: number
  materiaPrima: string
  quantidade: number
  fornecedorId?: number | null
  fornecedor: string
  responsavel: string
  destinoId?: number | null
  destino: string
  valorUnitario?: number | null
  motivo?: string | null
  valorTotal: number
}

export interface CriarMovimentacaoRequest {
  tipo: TipoMovimentacao
  materiaPrimaId: number
  quantidade: number
  fornecedorId?: number | null
  destinoId?: number | null
  valorUnitario?: number | null
  data?: string | null
  motivo?: string | null
}

export interface AtualizarMovimentacaoRequest extends CriarMovimentacaoRequest {}

