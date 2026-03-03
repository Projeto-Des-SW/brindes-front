import type { ReactNode } from 'react'
import { Badge, Box, Button, Flex, Input, SimpleGrid, Text } from '@chakra-ui/react'
import { EyeIcon, SearchIcon } from '../../components/icons'
import type { MovimentacaoRow, ProdutoEstoqueRow, StatusEstoque, TipoMovimentacao } from './types'
import { formatBRL, formatInt } from './format'

export const StatusPill = ({ status }: { status: StatusEstoque }) => {
  const scheme =
    status === 'NORMAL'
      ? { bg: 'green.100', color: 'green.700' }
      : { bg: 'red.100', color: 'red.600' }

  return (
    <Box
      px={3}
      py="3px"
      borderRadius="full"
      fontSize="xs"
      fontWeight="700"
      textAlign="center"
      minW="86px"
      bg={scheme.bg}
      color={scheme.color}
    >
      {status}
    </Box>
  )
}

export const CardResumo = ({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) => {
  return (
    <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.200" p={4} boxShadow="sm">
      <Text fontSize="xs" color="gray.500" fontWeight="600">
        {title}
      </Text>
      <Text mt={2} fontSize="xl" fontWeight="700" color="gray.900">
        {value}
      </Text>
      {subtitle ? (
        <Text mt={1} fontSize="xs" color="gray.400">
          {subtitle}
        </Text>
      ) : null}
    </Box>
  )
}

export const CardsResumoGrid = ({
  resumo,
  loading,
}: {
  resumo?: {
    valorTotalEmEstoque: number
    itensAbaixoMinimo: number
    totalMateriasPrimas: number
    produtosSemMovimentacao: number
  } | null
  loading?: boolean
}) => {
  const v = resumo ?? {
    valorTotalEmEstoque: 0,
    itensAbaixoMinimo: 0,
    totalMateriasPrimas: 0,
    produtosSemMovimentacao: 0,
  }

  const dash = '—'
  return (
    <SimpleGrid mt={5} columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
      <CardResumo
        title="Valor Total em Estoque"
        value={loading ? dash : formatBRL(Number(v.valorTotalEmEstoque ?? 0))}
        subtitle=""
      />
      <CardResumo
        title="Itens abaixo do mínimo"
        value={loading ? dash : formatInt(Number(v.itensAbaixoMinimo ?? 0))}
        subtitle=""
      />
      <CardResumo
        title="Total de Matérias Primas"
        value={loading ? dash : formatInt(Number(v.totalMateriasPrimas ?? 0))}
        subtitle=""
      />
      <CardResumo
        title="Produtos sem movimentação"
        value={loading ? dash : formatInt(Number(v.produtosSemMovimentacao ?? 0))}
        subtitle=""
      />
    </SimpleGrid>
  )
}

export const SelectLike = ({
  value,
  placeholder,
  options,
  onChange,
  minW,
}: {
  value: string
  placeholder: string
  options: { label: string; value: string }[]
  onChange: (next: string) => void
  minW?: string
}) => {
  return (
    <Box minW={minW}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '38px',
          padding: '0 12px',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          background: 'white',
          fontSize: '14px',
          color: '#374151',
          outline: 'none',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Box>
  )
}

export const SearchInput = ({
  value,
  placeholder,
  onChange,
  minW,
}: {
  value: string
  placeholder: string
  onChange: (next: string) => void
  minW?: string
}) => {
  return (
    <Box position="relative" minW={minW}>
      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400">
        <SearchIcon />
      </Box>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        h="38px"
        pl="38px"
        borderColor="gray.200"
        bg="white"
        fontSize="sm"
      />
    </Box>
  )
}

export const SectionCard = ({ title, actions, children }: { title: string; actions?: ReactNode; children: ReactNode }) => {
  return (
    <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" boxShadow="sm" overflow="hidden">
      <Flex px={5} py={4} align="center" justify="space-between">
        <Text fontWeight="700" color="gray.900">
          {title}
        </Text>
        {actions}
      </Flex>
      <Box h="1px" bg="gray.100" />
      <Box p={5}>{children}</Box>
    </Box>
  )
}

export const SimpleTable = ({
  columns,
  children,
}: {
  columns: { label: string; w?: string; align?: 'left' | 'right' | 'center' }[]
  children: ReactNode
}) => {
  return (
    <Box overflowX="auto" border="1px solid" borderColor="gray.200" borderRadius="md">
      <Box as="table" w="full" borderCollapse="collapse" tableLayout="fixed">
        <Box as="thead" bg="gray.50">
          <Box as="tr">
            {columns.map((col) => (
              <Box
                as="th"
                key={col.label}
                textAlign={col.align ?? 'left'}
                fontSize="xs"
                color="gray.500"
                fontWeight="700"
                px={3}
                py={3}
                borderBottom="1px solid"
                borderColor="gray.200"
                w={col.w}
              >
                {col.label}
              </Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">{children}</Box>
      </Box>
    </Box>
  )
}

export const ProdutosTable = ({ rows, onView }: { rows: ProdutoEstoqueRow[]; onView?: (row: ProdutoEstoqueRow) => void }) => {
  const columns = [
    { label: 'Código', w: '140px' },
    { label: 'Matéria Prima', w: '240px' },
    { label: 'Quantidade Atual', w: '120px', align: 'right' as const },
    { label: 'Estoque Mínimo', w: '120px', align: 'right' as const },
    { label: 'Valor Unitário', w: '120px', align: 'right' as const },
    { label: 'Valor Total', w: '120px', align: 'right' as const },
    { label: 'Status', w: '120px', align: 'center' as const },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  return (
    <SimpleTable columns={columns}>
      {rows.map((r) => {
        const valorTotal = r.quantidadeAtual * r.valorUnitario
        const canView = Boolean(onView && r.id != null)
        return (
          <Box as="tr" key={`${r.id ?? r.codigo}-${r.materiaPrima}`}>
            <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
              <Box
                maxW="130px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                title={r.codigo}
              >
                {r.codigo}
              </Box>
            </Box>
            <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
              <Box
                maxW="230px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                title={r.materiaPrima}
              >
                {r.materiaPrima}
              </Box>
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
              {formatInt(r.quantidadeAtual)}
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
              {formatBRL(r.valorUnitario)}
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
              {formatBRL(valorTotal)}
            </Box>
            <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
              <StatusPill status={r.status} />
            </Box>
            <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
              <Button
                variant="ghost"
                size="sm"
                h="28px"
                w="28px"
                p={0}
                aria-label="Ver detalhes"
                onClick={canView ? () => onView?.(r) : undefined}
                disabled={!canView}
              >
                <EyeIcon size={16} />
              </Button>
            </Box>
          </Box>
        )
      })}
    </SimpleTable>
  )
}

const badgePaletteFromTipo = (tipo: TipoMovimentacao) => {
  return tipo === 'Entrada' ? 'blue' : 'orange'
}

export const MovimentacoesTable = ({ rows }: { rows: MovimentacaoRow[] }) => {
  const columns = [
    { label: 'Data', w: '90px' },
    { label: 'Tipo', w: '80px' },
    { label: 'Matéria Prima', w: '160px' },
    { label: 'Quantidade', w: '110px', align: 'right' as const },
    { label: 'Fornecedor', w: '120px' },
    { label: 'Responsável', w: '140px' },
    { label: 'Destino', w: '140px' },
    { label: 'Valor Total', w: '120px', align: 'right' as const },
    { label: 'Ações', w: '80px', align: 'center' as const },
  ]

  return (
    <SimpleTable columns={columns}>
      {rows.map((r, idx) => (
        <Box as="tr" key={`${r.data}-${r.materiaPrima}-${idx}`}>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            {r.data}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs">
            <Badge
              colorPalette={badgePaletteFromTipo(r.tipo)}
              variant="subtle"
              fontSize="xs"
              px={2}
              py="2px"
              borderRadius="md"
            >
              {r.tipo}
            </Badge>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <Box
              maxW="150px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              title={r.materiaPrima}
            >
              {r.materiaPrima}
            </Box>
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
            {formatInt(r.quantidade)}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <Box
              maxW="110px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              title={r.fornecedor}
            >
              {r.fornecedor}
            </Box>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <Box
              maxW="130px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              title={r.responsavel}
            >
              {r.responsavel}
            </Box>
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" fontSize="xs" color="gray.700">
            <Box
              maxW="130px"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              title={r.destino}
            >
              {r.destino || '-'}
            </Box>
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
            {formatBRL(r.valorTotal)}
          </Box>
          <Box as="td" px={3} py={3} borderBottom="1px solid" borderColor="gray.100" textAlign="center">
            <Button variant="ghost" size="sm" h="28px" w="28px" p={0} aria-label="Ver movimentação">
              <EyeIcon size={16} />
            </Button>
          </Box>
        </Box>
      ))}
    </SimpleTable>
  )
}

