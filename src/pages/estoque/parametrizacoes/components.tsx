import type { ReactNode } from 'react'
import { Box, Button, Flex, PopoverBody, PopoverContent, PopoverPositioner, PopoverRoot, PopoverTrigger, Stack } from '@chakra-ui/react'
import { PencilIcon } from '../../../components/icons'
import { SimpleTable } from '../components'
import { formatInt } from '../format'
import type { CategoriaRow, FornecedorRow, LocalEstoqueRow, MateriaPrimaRow, ParamTabKey, StatusAtivo } from './types'

const RowActionsPopover = ({
  onEdit,
  onToggle,
  toggleLabel = 'Inativar',
  toggleColor = 'red.600',
  toggleHoverBg = 'red.50',
}: {
  onEdit?: () => void
  onToggle?: () => void
  toggleLabel?: string
  toggleColor?: string
  toggleHoverBg?: string
}) => (
  <PopoverRoot positioning={{ placement: 'bottom-end' }}>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ações">
        <PencilIcon size={16} />
      </Button>
    </PopoverTrigger>
    <PopoverPositioner>
      <PopoverContent w="140px" p={0} boxShadow="md" borderRadius="md" border="1px solid" borderColor="gray.200">
        <PopoverBody p={1}>
          <Stack gap={0}>
            <Button
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              fontWeight="400"
              fontSize="sm"
              borderRadius="sm"
              px={3}
              h="34px"
              onClick={onEdit}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              justifyContent="flex-start"
              fontWeight="400"
              fontSize="sm"
              borderRadius="sm"
              px={3}
              h="34px"
              color={toggleColor}
              _hover={{ bg: toggleHoverBg }}
              onClick={onToggle}
            >
              {toggleLabel}
            </Button>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </PopoverPositioner>
  </PopoverRoot>
)

const tabLabel: Record<ParamTabKey, string> = {
  fornecedores: 'FORNECEDORES',
  'materias-primas': 'MATÉRIAS-PRIMAS',
  locais: 'LOCAIS DE ESTOQUE',
  categorias: 'CATEGORIAS',
}

export const TabsHeader = ({ value, onChange }: { value: ParamTabKey; onChange: (next: ParamTabKey) => void }) => {
  return (
    <Flex mt={6} borderBottom="1px solid" borderColor="gray.200">
      {Object.keys(tabLabel).map((k) => {
        const key = k as ParamTabKey
        const selected = key === value
        return (
          <Button
            key={key}
            variant="ghost"
            flex="1"
            h="40px"
            borderRadius="0"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.4px"
            color={selected ? 'blue.600' : 'gray.500'}
            borderBottom={selected ? '2px solid' : '2px solid'}
            borderBottomColor={selected ? 'blue.500' : 'transparent'}
            onClick={() => onChange(key)}
            _hover={{ bg: 'transparent' }}
          >
            {tabLabel[key]}
          </Button>
        )
      })}
    </Flex>
  )
}

const pillSchemeFromStatus = (status: StatusAtivo) => {
  if (status === 'ATIVO') return { bg: 'green.100', color: 'green.700' }
  return { bg: 'red.100', color: 'red.600' }
}

export const AtivoPill = ({ status }: { status: StatusAtivo }) => {
  const scheme = pillSchemeFromStatus(status)
  return (
    <Box
      px={3}
      py="3px"
      borderRadius="full"
      fontSize="xs"
      fontWeight="700"
      textAlign="center"
      minW="78px"
      bg={scheme.bg}
      color={scheme.color}
    >
      {status}
    </Box>
  )
}

const TableCellTruncate = ({ maxW, title, children }: { maxW: string; title: string; children: ReactNode }) => {
  return (
    <Box maxW={maxW} whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis" title={title}>
      {children}
    </Box>
  )
}

export const FornecedoresTable = ({
  rows,
  onEdit,
  onToggle,
}: {
  rows: FornecedorRow[]
  onEdit?: (row: FornecedorRow) => void
  onToggle?: (row: FornecedorRow) => void
}) => {
  const columns = [
    { label: 'Nome', w: '220px' },
    { label: 'CNPJ', w: '150px' },
    { label: 'Telefone', w: '120px' },
    { label: 'Email', w: '210px' },
    { label: 'Prazo de Entrega', w: '120px' },
    { label: 'Status', w: '120px', align: 'center' as const },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  return (
    <SimpleTable columns={columns}>
      {rows.map((r) => (
        <Box as="tr" key={r.id}>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="210px" title={r.nome}>
              {r.nome}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            {r.cnpj}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            {r.telefone}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="200px" title={r.email}>
              {r.email}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            {r.prazoEntrega}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
            <AtivoPill status={r.status} />
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
            <RowActionsPopover
              onEdit={() => onEdit?.(r)}
              onToggle={() => onToggle?.(r)}
              toggleLabel={r.status === 'INATIVO' ? 'Ativar' : 'Inativar'}
              toggleColor={r.status === 'INATIVO' ? 'green.600' : 'red.600'}
              toggleHoverBg={r.status === 'INATIVO' ? 'green.50' : 'red.50'}
            />
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

export const MateriasPrimasTable = ({
  rows,
  onEdit,
  onToggle,
}: {
  rows: MateriaPrimaRow[]
  onEdit?: (row: MateriaPrimaRow) => void
  onToggle?: (row: MateriaPrimaRow) => void
}) => {
  const columns = [
    { label: 'Código', w: '140px' },
    { label: 'Descrição', w: '220px' },
    { label: 'Unidade', w: '80px' },
    { label: 'Categoria', w: '120px' },
    { label: 'Fornecedor Principal', w: '160px' },
    { label: 'Estoque Atual', w: '110px', align: 'right' as const },
    { label: 'Estoque Mínimo', w: '110px', align: 'right' as const },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  return (
    <SimpleTable columns={columns}>
      {rows.map((r) => (
        <Box as="tr" key={r.id}>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="130px" title={r.codigo}>
              {r.codigo}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="210px" title={r.descricao}>
              {r.descricao}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            {r.unidade}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            {r.categoria}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="150px" title={r.fornecedorPrincipal}>
              {r.fornecedorPrincipal}
            </TableCellTruncate>
          </Box>
          <Box
            as="td"
            px={3}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
            fontSize="xs"
            color="gray.700"
            textAlign="right"
          >
            {formatInt(r.estoqueAtual)}
          </Box>
          <Box
            as="td"
            px={3}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
            fontSize="xs"
            color="gray.700"
            textAlign="right"
          >
            {formatInt(r.estoqueMinimo)}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
            <RowActionsPopover
              onEdit={() => onEdit?.(r)}
              onToggle={() => onToggle?.(r)}
              toggleLabel={r.status === 'INATIVO' ? 'Ativar' : 'Inativar'}
              toggleColor={r.status === 'INATIVO' ? 'green.600' : 'red.600'}
              toggleHoverBg={r.status === 'INATIVO' ? 'green.50' : 'red.50'}
            />
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

export const LocaisEstoqueTable = ({
  rows,
  onEdit,
  onToggle,
}: {
  rows: LocalEstoqueRow[]
  onEdit?: (row: LocalEstoqueRow) => void
  onToggle?: (row: LocalEstoqueRow) => void
}) => {
  const columns = [
    { label: 'Nome', w: '260px' },
    { label: 'Descrição', w: '1fr' },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  return (
    <SimpleTable columns={columns}>
      {rows.map((r) => (
        <Box as="tr" key={r.id}>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="250px" title={r.nome}>
              {r.nome}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="520px" title={r.descricao}>
              {r.descricao}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
            <RowActionsPopover
              onEdit={() => onEdit?.(r)}
              onToggle={() => onToggle?.(r)}
              toggleLabel={r.status === 'INATIVO' ? 'Ativar' : 'Inativar'}
              toggleColor={r.status === 'INATIVO' ? 'green.600' : 'red.600'}
              toggleHoverBg={r.status === 'INATIVO' ? 'green.50' : 'red.50'}
            />
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

export const CategoriasTable = ({
  rows,
  onEdit,
  onToggle,
}: {
  rows: CategoriaRow[]
  onEdit?: (row: CategoriaRow) => void
  onToggle?: (row: CategoriaRow) => void
}) => {
  const columns = [
    { label: '#', w: '60px' },
    { label: 'Nome', w: '1fr' },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  return (
    <SimpleTable columns={columns}>
      {rows.map((r) => (
        <Box as="tr" key={r.id}>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.400">
            {r.id}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <TableCellTruncate maxW="600px" title={r.nome}>
              {r.nome}
            </TableCellTruncate>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
            <RowActionsPopover
              onEdit={() => onEdit?.(r)}
              onToggle={() => onToggle?.(r)}
              toggleLabel={r.status === 'INATIVO' ? 'Ativar' : 'Inativar'}
              toggleColor={r.status === 'INATIVO' ? 'green.600' : 'red.600'}
              toggleHoverBg={r.status === 'INATIVO' ? 'green.50' : 'red.50'}
            />
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}
