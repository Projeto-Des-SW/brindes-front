import type { ReactNode } from 'react'
import { Box, Button, Flex, MenuContent, MenuItem, MenuRoot, MenuTrigger } from '@chakra-ui/react'
import { PencilIcon } from '../../../components/icons'
import { SimpleTable } from '../components'
import { formatInt } from '../format'
import type { FornecedorRow, LocalEstoqueRow, MateriaPrimaRow, ParamTabKey, StatusAtivo } from './types'

const tabLabel: Record<ParamTabKey, string> = {
  fornecedores: 'FORNECEDORES',
  'materias-primas': 'MATÉRIAS-PRIMAS',
  locais: 'LOCAIS DE ESTOQUE',
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
  onDelete,
}: {
  rows: FornecedorRow[]
  onEdit?: (row: FornecedorRow) => void
  onDelete?: (row: FornecedorRow) => void
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
            <MenuRoot positioning={{ placement: 'bottom-end' }}>
              <MenuTrigger asChild>
                <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ações do fornecedor">
                  <PencilIcon size={16} />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="edit" onClick={() => onEdit?.(r)}>
                  Editar
                </MenuItem>
                <MenuItem value="delete" onClick={() => onDelete?.(r)} color="red.600">
                  Excluir
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

export const MateriasPrimasTable = ({
  rows,
  onEdit,
  onDelete,
}: {
  rows: MateriaPrimaRow[]
  onEdit?: (row: MateriaPrimaRow) => void
  onDelete?: (row: MateriaPrimaRow) => void
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
            <MenuRoot positioning={{ placement: 'bottom-end' }}>
              <MenuTrigger asChild>
                <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ações da matéria-prima">
                  <PencilIcon size={16} />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="edit" onClick={() => onEdit?.(r)}>
                  Editar
                </MenuItem>
                <MenuItem value="delete" onClick={() => onDelete?.(r)} color="red.600">
                  Excluir
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

export const LocaisEstoqueTable = ({
  rows,
  onEdit,
  onDelete,
}: {
  rows: LocalEstoqueRow[]
  onEdit?: (row: LocalEstoqueRow) => void
  onDelete?: (row: LocalEstoqueRow) => void
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
            <MenuRoot positioning={{ placement: 'bottom-end' }}>
              <MenuTrigger asChild>
                <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ações do local de estoque">
                  <PencilIcon size={16} />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem value="edit" onClick={() => onEdit?.(r)}>
                  Editar
                </MenuItem>
                <MenuItem value="delete" onClick={() => onDelete?.(r)} color="red.600">
                  Excluir
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

