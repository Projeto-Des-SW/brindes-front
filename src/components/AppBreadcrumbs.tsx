import { HStack, Text, chakra } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { moduleFromPathname } from '../config/modules'

type Crumb = { label: string; to: string }

const RouterLinkChakra = chakra(RouterLink)

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Início',

  // Estoque
  '/estoque': 'Gestão de Matérias Primas',
  '/estoque/parametrizacoes': 'Parametrizações',

  // Módulos
  '/admin': 'Admin',
  '/compras': 'Compras',
  '/vendas-clientes': 'Vendas e Clientes',
  '/gestao-arquivos': 'Gestão de Arquivos',

  // Outras páginas
  '/perfil': 'Meu perfil',
  '/configuracoes': 'Configurações',
}

const titleFromSegment = (seg: string) => {
  const s = decodeURIComponent(seg ?? '').replace(/-/g, ' ').trim()
  if (!s) return ''
  return s.replace(/\b\p{L}/gu, (c) => c.toUpperCase())
}

const buildCrumbs = (pathname: string): Crumb[] => {
  const path = pathname || '/'
  if (path === '/login') return []

  const module = moduleFromPathname(path)
  const out: Crumb[] = [{ label: ROUTE_LABELS['/'] ?? 'Início', to: '/' }]

  if (module) {
    out.push({ label: module.label, to: module.path })
  }

  const segments = path.split('/').filter(Boolean)
  let cum = ''
  for (const seg of segments) {
    cum += `/${seg}`

    // Se já temos o módulo como primeiro crumb, tratamos o "root page label" como um crumb adicional (se diferente)
    if (module && cum === module.path) {
      const label = ROUTE_LABELS[cum] ?? module.label
      if (label && label !== module.label) {
        out.push({ label, to: cum })
      }
      continue
    }

    const label = ROUTE_LABELS[cum] ?? titleFromSegment(seg)
    if (!label) continue
    out.push({ label, to: cum })
  }

  // Remove duplicatas consecutivas
  return out.filter((c, i) => {
    const prev = out[i - 1]
    return !(prev && prev.label === c.label && prev.to === c.to)
  })
}

export const AppBreadcrumbs = () => {
  const location = useLocation()
  const crumbs = buildCrumbs(location.pathname)

  if (crumbs.length === 0) return null

  return (
    <HStack gap={2} color="gray.500" fontSize="xs" fontWeight="500">
      {crumbs.map((c, idx) => {
        const isLast = idx === crumbs.length - 1
        return (
          <HStack key={`${c.to}-${c.label}`} gap={2}>
            <RouterLinkChakra
              to={c.to}
              color={isLast ? 'blue.600' : 'gray.500'}
              fontWeight={isLast ? '700' : '500'}
              _hover={{ textDecoration: 'underline', color: isLast ? 'blue.700' : 'gray.700' }}
            >
              {c.label}
            </RouterLinkChakra>
            {!isLast ? <Text>›</Text> : null}
          </HStack>
        )
      })}
    </HStack>
  )
}

