import type { MovimentacaoRow, ProdutoEstoqueRow, StatusEstoque, TipoMovimentacao } from './types'

const includesInsensitive = (value: string, term: string) => {
  return value.toLowerCase().includes(term)
}

export const filterProdutos = (produtos: ProdutoEstoqueRow[], search: string, statusFiltro: string) => {
  const termo = search.trim().toLowerCase()
  const status = statusFiltro as StatusEstoque | ''

  return produtos.filter((p) => {
    const matchTexto =
      termo.length === 0 ||
      includesInsensitive(p.codigo, termo) ||
      includesInsensitive(p.materiaPrima, termo)

    const matchStatus = status.length === 0 || p.status === status

    return matchTexto && matchStatus
  })
}

export const filterMovimentacoes = (movs: MovimentacaoRow[], search: string, tipoFiltro: string) => {
  const termo = search.trim().toLowerCase()
  const tipo = tipoFiltro as TipoMovimentacao | ''

  return movs.filter((m) => {
    const matchTexto =
      termo.length === 0 ||
      includesInsensitive(m.materiaPrima, termo) ||
      includesInsensitive(m.fornecedor, termo) ||
      includesInsensitive(m.responsavel, termo) ||
      includesInsensitive(m.destino, termo)

    const matchTipo = tipo.length === 0 || m.tipo === tipo

    return matchTexto && matchTipo
  })
}

