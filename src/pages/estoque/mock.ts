import type { MovimentacaoRow, ProdutoEstoqueRow } from './types'

export const buildMockProdutos = (): ProdutoEstoqueRow[] => {
  const base: ProdutoEstoqueRow = {
    codigo: 'A000000000000001',
    materiaPrima: 'Papel Crepom Azul do Leste...',
    quantidadeAtual: 99999,
    estoqueMinimo: 99999,
    valorUnitario: 9999.99,
    status: 'ABAIXO',
  }

  const rows: ProdutoEstoqueRow[] = []
  rows.push({ ...base, status: 'NORMAL' })
  for (let i = 0; i < 7; i++) rows.push({ ...base, codigo: `A00000000000000${i + 1}` })
  return rows
}

export const buildMockMovimentacoes = (): MovimentacaoRow[] => {
  return [
    {
      data: '24/11/2025',
      tipo: 'Entrada',
      materiaPrima: 'Papel Crepom',
      quantidade: 99999,
      fornecedor: 'SOCD',
      responsavel: 'Fabiana Bahia',
      destino: '-',
      valorTotal: 99999.89,
    },
    {
      data: '24/11/2025',
      tipo: 'Saída',
      materiaPrima: 'Embalagem de Pre...',
      quantidade: 99999,
      fornecedor: 'Ink Mix',
      responsavel: 'Carlos Eduardo Ba...',
      destino: 'Embalagem Careca',
      valorTotal: 99999.89,
    },
    {
      data: '24/11/2025',
      tipo: 'Entrada',
      materiaPrima: 'Durex',
      quantidade: 99999,
      fornecedor: 'Forturia Subli...',
      responsavel: 'Fabiana Bahia',
      destino: 'Embalagem de Pre...',
      valorTotal: 99999.89,
    },
    {
      data: '24/11/2025',
      tipo: 'Saída',
      materiaPrima: 'Papel Crepom',
      quantidade: 99999,
      fornecedor: 'SOCD',
      responsavel: 'Carlos Eduardo Ba...',
      destino: 'Caneca Personaliza...',
      valorTotal: 99999.89,
    },
    {
      data: '24/11/2025',
      tipo: 'Entrada',
      materiaPrima: 'Embalagem de Pre...',
      quantidade: 99999,
      fornecedor: 'Ink Mix',
      responsavel: 'Fabiana Bahia',
      destino: 'Embalagem de Pre...',
      valorTotal: 99999.89,
    },
    {
      data: '24/11/2025',
      tipo: 'Saída',
      materiaPrima: 'Durex',
      quantidade: 99999,
      fornecedor: 'Forturia Subli...',
      responsavel: 'Carlos Eduardo Ba...',
      destino: 'Durex',
      valorTotal: 99999.89,
    },
  ]
}

