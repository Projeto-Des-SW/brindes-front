export type StatusEstoque = 'NORMAL' | 'ABAIXO'

export interface ProdutoEstoqueRow {
  id?: number
  codigo: string
  materiaPrima: string
  quantidadeAtual: number
  estoqueMinimo: number
  valorUnitario: number
  status: StatusEstoque
}

export type TipoMovimentacao = 'Entrada' | 'Saída'

export interface MovimentacaoRow {
  id: number
  data: string
  dataIso?: string | null
  tipo: TipoMovimentacao
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

