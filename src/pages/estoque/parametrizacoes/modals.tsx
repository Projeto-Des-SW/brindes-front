import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react'
import type { StatusAtivo } from './types'

const FieldLabel = ({ children }: { children: string }) => {
  return (
    <Text as="label" fontSize="sm" color="gray.700" fontWeight="600">
      {children}
    </Text>
  )
}

const SelectField = ({
  value,
  placeholder,
  options,
  onChange,
}: {
  value: string
  placeholder: string
  options: { label: string; value: string }[]
  onChange: (next: string) => void
}) => {
  return (
    <Box>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          height: '40px',
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

export type FornecedorFormValues = {
  nome: string
  cnpj: string
  telefone: string
  email: string
  status: StatusAtivo | ''
  prazoEntrega: string

  // Campos do Figma (não persistidos no back ainda)
  rua: string
  numero: string
  cep: string
  cidade: string
  estado: string
  condicoesPagamento: string
  observacoes: string
}

const onlyDigits = (s: string) => (s ?? '').replace(/\D/g, '')

const maskCnpj = (raw: string) => {
  const d = onlyDigits(raw).slice(0, 14)
  // 00.000.000/0000-00
  const p1 = d.slice(0, 2)
  const p2 = d.slice(2, 5)
  const p3 = d.slice(5, 8)
  const p4 = d.slice(8, 12)
  const p5 = d.slice(12, 14)

  if (d.length <= 2) return p1
  if (d.length <= 5) return `${p1}.${p2}`
  if (d.length <= 8) return `${p1}.${p2}.${p3}`
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`
  return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

export const FornecedorUpsertDialog = ({
  open,
  mode,
  initialValues,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<FornecedorFormValues>
  submitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: FornecedorFormValues) => void
}) => {
  const [values, setValues] = useState<FornecedorFormValues>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    status: 'ATIVO',
    prazoEntrega: '',
    rua: '',
    numero: '',
    cep: '',
    cidade: '',
    estado: '',
    condicoesPagamento: '',
    observacoes: '',
  })

  useEffect(() => {
    if (!open) return
    setValues((prev) => ({
      ...prev,
      ...initialValues,
    }))
  }, [initialValues, open])

  const canSubmit =
    values.nome.trim() &&
    values.cnpj.trim() &&
    values.telefone.trim() &&
    values.email.trim() &&
    values.status &&
    values.prazoEntrega.trim()

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="980px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Cadastrar Fornecedor' : 'Editar Fornecedor'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {error ? (
              <Text mb={3} fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : null}

            <Stack gap={4}>
              <Stack gap={2}>
                <FieldLabel>Nome / Razão Social *</FieldLabel>
                <Input
                  value={values.nome}
                  onChange={(e) => setValues((s) => ({ ...s, nome: e.target.value }))}
                  placeholder=""
                  bg="white"
                />
              </Stack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>CNPJ *</FieldLabel>
                  <Input
                    value={values.cnpj}
                    onChange={(e) => setValues((s) => ({ ...s, cnpj: maskCnpj(e.target.value) }))}
                    placeholder="00.000.000/0000-00"
                    bg="white"
                  />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>Telefone *</FieldLabel>
                  <Input
                    value={values.telefone}
                    onChange={(e) => setValues((s) => ({ ...s, telefone: e.target.value }))}
                    placeholder="(00) 0000-0000"
                    bg="white"
                  />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>E-mail *</FieldLabel>
                  <Input
                    value={values.email}
                    onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
                    placeholder=""
                    bg="white"
                  />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>Status *</FieldLabel>
                  <SelectField
                    value={values.status}
                    placeholder="Selecione o Status"
                    options={[
                      { label: 'ATIVO', value: 'ATIVO' },
                      { label: 'INATIVO', value: 'INATIVO' },
                    ]}
                    onChange={(next) => setValues((s) => ({ ...s, status: next as StatusAtivo }))}
                  />
                </Stack>
              </SimpleGrid>

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Endereço
              </Text>
              <Stack gap={2}>
                <FieldLabel>Rua</FieldLabel>
                <Input value={values.rua} onChange={(e) => setValues((s) => ({ ...s, rua: e.target.value }))} bg="white" />
              </Stack>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Número</FieldLabel>
                  <Input
                    value={values.numero}
                    onChange={(e) => setValues((s) => ({ ...s, numero: e.target.value }))}
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>CEP</FieldLabel>
                  <Input
                    value={values.cep}
                    onChange={(e) => setValues((s) => ({ ...s, cep: e.target.value }))}
                    placeholder="00000-000"
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Cidade</FieldLabel>
                  <Input
                    value={values.cidade}
                    onChange={(e) => setValues((s) => ({ ...s, cidade: e.target.value }))}
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Estado</FieldLabel>
                  <Input
                    value={values.estado}
                    onChange={(e) => setValues((s) => ({ ...s, estado: e.target.value }))}
                    placeholder="SP"
                    bg="white"
                  />
                </Stack>
              </SimpleGrid>

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Informações Comerciais
              </Text>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Condições de Pagamento</FieldLabel>
                  <Input
                    value={values.condicoesPagamento}
                    onChange={(e) => setValues((s) => ({ ...s, condicoesPagamento: e.target.value }))}
                    placeholder="Ex: 30/60 dias"
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Prazo de Entrega Padrão *</FieldLabel>
                  <Input
                    value={values.prazoEntrega}
                    onChange={(e) => setValues((s) => ({ ...s, prazoEntrega: e.target.value }))}
                    placeholder="Ex: 5 dias úteis"
                    bg="white"
                  />
                </Stack>
              </SimpleGrid>

              <Stack gap={2}>
                <FieldLabel>Observações</FieldLabel>
                <Textarea
                  value={values.observacoes}
                  onChange={(e) => setValues((s) => ({ ...s, observacoes: e.target.value }))}
                  bg="white"
                  minH="120px"
                />
              </Stack>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose} disabled={Boolean(submitting)}>
                Cancelar
              </Button>
              <Button
                bg="blue.600"
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={() => onSubmit(values)}
                disabled={!canSubmit || Boolean(submitting)}
              >
                {mode === 'create' ? 'Cadastrar' : 'Salvar'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

export type LocalEstoqueFormValues = {
  nome: string
  descricao: string
}

export const LocalEstoqueUpsertDialog = ({
  open,
  mode,
  initialValues,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<LocalEstoqueFormValues>
  submitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: LocalEstoqueFormValues) => void
}) => {
  const [values, setValues] = useState<LocalEstoqueFormValues>({ nome: '', descricao: '' })

  useEffect(() => {
    if (!open) return
    setValues((prev) => ({ ...prev, ...initialValues }))
  }, [initialValues, open])

  const canSubmit = values.nome.trim() && values.descricao.trim()

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="520px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Adicionar Local de Estoque' : 'Editar Local de Estoque'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {error ? (
              <Text mb={3} fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : null}

            <Stack gap={4}>
              <Stack gap={2}>
                <FieldLabel>Nome do Local *</FieldLabel>
                <Input
                  value={values.nome}
                  onChange={(e) => setValues((s) => ({ ...s, nome: e.target.value }))}
                  placeholder="Ex: Depósito Principal"
                  bg="white"
                />
              </Stack>
              <Stack gap={2}>
                <FieldLabel>Descrição Curta *</FieldLabel>
                <Input
                  value={values.descricao}
                  onChange={(e) => setValues((s) => ({ ...s, descricao: e.target.value }))}
                  placeholder="Descreva brevemente o local de estoque"
                  bg="white"
                />
              </Stack>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose} disabled={Boolean(submitting)}>
                Cancelar
              </Button>
              <Button
                bg="blue.600"
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={() => onSubmit(values)}
                disabled={!canSubmit || Boolean(submitting)}
              >
                {mode === 'create' ? 'Adicionar' : 'Salvar'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

export type MateriaPrimaFormValues = {
  codigo: string
  descricao: string
  unidade: string
  categoria: string
  estoqueMinimo: string
  fornecedorPrincipalId: string // id string

  // Campos do Figma (não persistidos no back ainda)
  fornecedoresSecundarios: string
  localizacaoEstoque: string
  observacoes: string
}

export const MateriaPrimaUpsertDialog = ({
  open,
  mode,
  initialValues,
  categorias,
  unidades,
  fornecedores,
  locaisEstoque,
  submitting,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<MateriaPrimaFormValues>
  categorias: { id: number; nome: string }[]
  unidades: string[]
  fornecedores: { id: number; nome: string }[]
  locaisEstoque: { id: number; nome: string }[]
  submitting?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (values: MateriaPrimaFormValues, resolved: { categoriaId: number | null; fornecedorPrincipalId: number | null }) => void
}) => {
  const [values, setValues] = useState<MateriaPrimaFormValues>({
    codigo: '',
    descricao: '',
    unidade: '',
    categoria: '',
    estoqueMinimo: '0',
    fornecedorPrincipalId: '',
    fornecedoresSecundarios: '',
    localizacaoEstoque: '',
    observacoes: '',
  })

  useEffect(() => {
    if (!open) return
    setValues((prev) => ({ ...prev, ...initialValues }))
  }, [initialValues, open])

  const categoriaIdResolved = useMemo(() => {
    const nome = values.categoria.trim().toLowerCase()
    if (!nome) return null
    const found = categorias.find((c) => c.nome.trim().toLowerCase() === nome)
    return found ? Number(found.id) : null
  }, [categorias, values.categoria])

  const fornecedorPrincipalIdResolved = useMemo(() => {
    if (!values.fornecedorPrincipalId) return null
    const n = Number(values.fornecedorPrincipalId)
    return Number.isFinite(n) ? n : null
  }, [values.fornecedorPrincipalId])

  const canSubmit =
    values.codigo.trim() &&
    values.descricao.trim() &&
    values.unidade.trim() &&
    values.categoria.trim() &&
    values.fornecedorPrincipalId.trim() &&
    values.estoqueMinimo.trim()

  const unidadesOptions = useMemo(
    () => unidades.map((u) => ({ label: u, value: u })),
    [unidades]
  )

  const fornecedoresOptions = useMemo(
    () => fornecedores.map((f) => ({ label: f.nome, value: String(f.id) })),
    [fornecedores]
  )

  const categoriasOptions = useMemo(
    () => categorias.map((c) => ({ label: c.nome, value: c.nome })),
    [categorias]
  )

  const locaisOptions = useMemo(
    () => locaisEstoque.map((l) => ({ label: l.nome, value: String(l.id) })),
    [locaisEstoque]
  )

  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="980px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Cadastrar Matéria-Prima' : 'Editar Matéria-Prima'}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {error ? (
              <Text mb={3} fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : null}

            <Stack gap={5}>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Código Interno *</FieldLabel>
                  <Input
                    value={values.codigo}
                    onChange={(e) => setValues((s) => ({ ...s, codigo: e.target.value }))}
                    placeholder="MP-001"
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Descrição *</FieldLabel>
                  <Input
                    value={values.descricao}
                    onChange={(e) => setValues((s) => ({ ...s, descricao: e.target.value }))}
                    placeholder=""
                    bg="white"
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Unidade de Medida *</FieldLabel>
                  <SelectField
                    value={values.unidade}
                    placeholder="Selecione a Unidade"
                    options={unidadesOptions}
                    onChange={(next) => setValues((s) => ({ ...s, unidade: next }))}
                  />
                </Stack>
                <Stack gap={2}>
                  <FieldLabel>Categoria *</FieldLabel>
                  <SelectField
                    value={values.categoria}
                    placeholder="Selecione a Categoria"
                    options={categoriasOptions}
                    onChange={(next) => setValues((s) => ({ ...s, categoria: next }))}
                  />
                </Stack>
                <Stack gap={2} maxW={{ base: 'full', md: '260px' }}>
                  <FieldLabel>Estoque Mínimo *</FieldLabel>
                  <Input
                    value={values.estoqueMinimo}
                    onChange={(e) => setValues((s) => ({ ...s, estoqueMinimo: e.target.value }))}
                    placeholder="0"
                    bg="white"
                  />
                </Stack>
              </SimpleGrid>

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Fornecedores
              </Text>

              <Stack gap={4}>
                <Stack gap={2}>
                  <FieldLabel>Fornecedor Principal *</FieldLabel>
                  <SelectField
                    value={values.fornecedorPrincipalId}
                    placeholder="Selecione o Fornecedor"
                    options={fornecedoresOptions}
                    onChange={(next) => setValues((s) => ({ ...s, fornecedorPrincipalId: next }))}
                  />
                </Stack>

                <Stack gap={2}>
                  <FieldLabel>Fornecedores Secundários *</FieldLabel>
                  <Input
                    value={values.fornecedoresSecundarios}
                    onChange={(e) => setValues((s) => ({ ...s, fornecedoresSecundarios: e.target.value }))}
                    bg="white"
                  />
                </Stack>
              </Stack>

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Localização no Estoque
              </Text>
              <SelectField
                value={values.localizacaoEstoque}
                placeholder="Selecione o Local"
                options={locaisOptions}
                onChange={(next) => setValues((s) => ({ ...s, localizacaoEstoque: next }))}
              />

              <Box h="1px" bg="gray.100" />

              <Text fontSize="sm" fontWeight="700" color="gray.800">
                Observações
              </Text>
              <Textarea
                value={values.observacoes}
                onChange={(e) => setValues((s) => ({ ...s, observacoes: e.target.value }))}
                bg="white"
                minH="120px"
              />
            </Stack>
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose} disabled={Boolean(submitting)}>
                Cancelar
              </Button>
              <Button
                bg="blue.600"
                color="white"
                _hover={{ bg: 'blue.700' }}
                onClick={() => onSubmit(values, { categoriaId: categoriaIdResolved, fornecedorPrincipalId: fornecedorPrincipalIdResolved })}
                disabled={!canSubmit || Boolean(submitting)}
              >
                {mode === 'create' ? 'Cadastrar' : 'Salvar'}
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

export const ConfirmDeleteDialog = ({
  open,
  title,
  description,
  submitting,
  error,
  onClose,
  onConfirm,
}: {
  open: boolean
  title: string
  description: string
  submitting?: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}) => {
  return (
    <DialogRoot open={open} onOpenChange={(e) => (!e.open ? onClose() : null)}>
      <DialogBackdrop />
      <DialogPositioner>
        <DialogContent maxW="520px">
          <DialogCloseTrigger />
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="gray.700">
              {description}
            </Text>
            {error ? (
              <Text mt={3} fontSize="sm" color="red.500">
                {error}
              </Text>
            ) : null}
          </DialogBody>
          <DialogFooter>
            <HStack justify="flex-end" gap={3} w="full">
              <Button variant="outline" onClick={onClose} disabled={Boolean(submitting)}>
                Cancelar
              </Button>
              <Button bg="red.600" color="white" _hover={{ bg: 'red.700' }} onClick={onConfirm} disabled={Boolean(submitting)}>
                Excluir
              </Button>
            </HStack>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}

