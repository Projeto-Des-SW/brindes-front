export type AppModuleKey =
  | 'estoque'
  | 'produtos'
  | 'vendas-clientes'
  | 'admin'

export interface AppModule {
  key: AppModuleKey
  label: string
  path: `/${string}`
}

export const APP_MODULES: AppModule[] = [
  { key: 'estoque', label: 'Estoque', path: '/estoque' },
  { key: 'produtos', label: 'Produtos', path: '/produtos' },
  { key: 'vendas-clientes', label: 'Vendas e Clientes', path: '/vendas-clientes' },
  { key: 'admin', label: 'Admin', path: '/admin' },
]

export const APP_DEFAULT_PATH = '/portal-interno'

export const moduleFromPathname = (pathname: string) => {
  return APP_MODULES.find((m) => pathname === m.path || pathname.startsWith(`${m.path}/`)) ?? null
}

