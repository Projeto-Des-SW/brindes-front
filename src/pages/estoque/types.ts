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
  data: string
  tipo: TipoMovimentacao
  materiaPrima: string
  quantidade: number
  fornecedor: string
  responsavel: string
  destino: string
  valorTotal: number
}

