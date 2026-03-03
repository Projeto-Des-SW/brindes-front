import type { FornecedorRow, LocalEstoqueRow, MateriaPrimaRow, StatusAtivo } from './types'

const includesInsensitive = (value: string, term: string) => value.toLowerCase().includes(term)

export const filterFornecedores = (rows: FornecedorRow[], search: string, statusFiltro: string) => {
  const termo = search.trim().toLowerCase()
  const status = statusFiltro as StatusAtivo | ''

  return rows.filter((r) => {
    const matchTexto =
      termo.length === 0 ||
      includesInsensitive(r.nome, termo) ||
      includesInsensitive(r.cnpj, termo) ||
      includesInsensitive(r.telefone, termo) ||
      includesInsensitive(r.email, termo)

    const matchStatus = status.length === 0 || r.status === status

    return matchTexto && matchStatus
  })
}

export const filterMateriasPrimas = (rows: MateriaPrimaRow[], search: string, categoriaFiltro: string) => {
  const termo = search.trim().toLowerCase()
  const categoria = categoriaFiltro.trim()

  return rows.filter((r) => {
    const matchTexto =
      termo.length === 0 ||
      includesInsensitive(r.codigo, termo) ||
      includesInsensitive(r.descricao, termo) ||
      includesInsensitive(r.fornecedorPrincipal, termo)

    const matchCategoria = categoria.length === 0 || r.categoria === categoria

    return matchTexto && matchCategoria
  })
}

export const filterLocaisEstoque = (rows: LocalEstoqueRow[], search: string) => {
  const termo = search.trim().toLowerCase()

  return rows.filter((r) => {
    if (termo.length === 0) return true
    return includesInsensitive(r.nome, termo) || includesInsensitive(r.descricao, termo)
  })
}

