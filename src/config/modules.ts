export type AppModuleKey =
  | 'admin'
  | 'estoque'
  | 'compras'
  | 'vendas-clientes'
  | 'gestao-arquivos'

export interface AppModule {
  key: AppModuleKey
  label: string
  path: `/${string}`
}

export const APP_MODULES: AppModule[] = [
  { key: 'admin', label: 'Admin', path: '/admin' },
  { key: 'estoque', label: 'Estoque', path: '/estoque' },
  { key: 'compras', label: 'Compras', path: '/compras' },
  { key: 'vendas-clientes', label: 'Vendas e Clientes', path: '/vendas-clientes' },
  { key: 'gestao-arquivos', label: 'Gestão de Arquivos', path: '/gestao-arquivos' },
]

export const moduleFromPathname = (pathname: string) => {
  return APP_MODULES.find((m) => pathname === m.path || pathname.startsWith(`${m.path}/`)) ?? null
}

