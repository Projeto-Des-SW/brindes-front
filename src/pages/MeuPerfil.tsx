import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  HStack,
  Image,
  Input,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { HomeNavbar } from '../components/home/HomeNavbar'
import { HomeFooter } from '../components/home/HomeFooter'
import { useAuth } from '../context/useAuth'
import { clienteService, type ClientePerfilDTO } from '../services/clienteService'
import { toaster } from '../lib/toaster'

// Avatar padrão gerado a partir do nome
const avatarFallback = (nome: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(nome)}&backgroundColor=1a1616&textColor=ffffff&fontSize=38`

// ─── Campo de formulário ──────────────────────────────────────────────────────
interface FieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  disabled?: boolean
}

const Field = ({ label, value, onChange, type = 'text', placeholder, disabled }: FieldProps) => (
  <Box>
    <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="0.05em">
      {label}
    </Text>
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      size="sm"
      borderColor="gray.200"
      borderRadius="md"
      fontSize="sm"
      color="#1a1616"
      _focus={{ borderColor: '#1a1616', boxShadow: '0 0 0 1px #1a1616' }}
      _disabled={{ bg: 'gray.50', cursor: 'not-allowed', color: 'gray.400' }}
    />
  </Box>
)

// ─── Componente principal ─────────────────────────────────────────────────────
export const MeuPerfil = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [perfil, setPerfil] = useState<ClientePerfilDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [documento, setDocumento] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)

  // Carregar dados do perfil
  useEffect(() => {
    let mounted = true
    clienteService.buscarMeu(token).then((data) => {
      if (!mounted) return
      setPerfil(data)
      setNome(data.nome ?? '')
      setEmail(data.email ?? '')
      setTelefone(data.telefone ?? '')
      setDocumento(data.documento ?? '')
      setRua(data.endereco?.rua ?? '')
      setNumero(data.endereco?.numero ?? '')
      setCep(data.endereco?.cep ?? '')
      setCidade(data.endereco?.cidade ?? '')
      setEstado(data.endereco?.estado ?? '')
      setFotoPerfil(data.fotoPerfil ?? null)
      setLoading(false)
    }).catch(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [token])

  // Converter imagem selecionada para base64
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFotoPerfil(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Salvar alterações
  const handleSalvar = async () => {
    setSaving(true)
    try {
      const payload: any = {}
      if (nome.trim()) payload.nome = nome.trim()
      if (email.trim()) payload.email = email.trim()
      if (telefone.trim()) payload.telefone = telefone.replace(/\D/g, '')
      if (documento.trim()) payload.documento = documento.replace(/\D/g, '')
      if (fotoPerfil !== null) payload.fotoPerfil = fotoPerfil

      const enderecoFilled = rua.trim() || numero.trim() || cep.trim() || cidade.trim() || estado.trim()
      if (enderecoFilled) {
        payload.endereco = {
          rua: rua.trim() || undefined,
          numero: numero.trim() || undefined,
          cep: cep.replace(/\D/g, '') || undefined,
          cidade: cidade.trim() || undefined,
          estado: estado.trim() || undefined,
        }
      } else {
        payload.endereco = null
      }

      const updated = await clienteService.atualizarMeu(token, payload)
      setPerfil(updated)
      toaster.create({ title: 'Perfil atualizado com sucesso!', type: 'success', duration: 3000 })
    } catch (err) {
      toaster.create({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        type: 'error',
        duration: 4000,
      })
    } finally {
      setSaving(false)
    }
  }

  const fotoExibida = fotoPerfil ?? avatarFallback(nome || 'U')

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <HomeNavbar />

      <Box as="main" flex="1" py={10}>
        <Container maxW="5xl">

          {/* Cabeçalho */}
          <HStack
            mb={6}
            gap={1}
            color="gray.500"
            fontSize="sm"
            cursor="pointer"
            _hover={{ color: '#1a1616' }}
            onClick={() => navigate('/')}
            w="fit-content"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <Text>Voltar para a loja</Text>
          </HStack>

          <Text fontSize="2xl" fontWeight="700" color="#1a1616" mb={6}>
            Meu Perfil
          </Text>

          {loading ? (
            <VStack py={20} gap={3}>
              <Spinner size="lg" color="gray.400" />
              <Text fontSize="sm" color="gray.500">Carregando perfil...</Text>
            </VStack>
          ) : (
            <Grid templateColumns={{ base: '1fr', lg: '240px 1fr' }} gap={6} alignItems="start">

              {/* ── Coluna esquerda: foto de perfil ── */}
              <GridItem>
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  p={6}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={4}
                >
                  {/* Avatar circular */}
                  <Box
                    position="relative"
                    cursor="pointer"
                    onClick={() => fileInputRef.current?.click()}
                    role="group"
                  >
                    <Image
                      src={fotoExibida}
                      alt={nome}
                      w="120px"
                      h="120px"
                      borderRadius="full"
                      objectFit="cover"
                      border="3px solid"
                      borderColor="gray.200"
                    />
                    {/* Overlay de hover */}
                    <Box
                      position="absolute"
                      inset={0}
                      borderRadius="full"
                      bg="blackAlpha.600"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </Box>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFotoChange}
                    />
                  </Box>

                  <VStack gap={0.5} textAlign="center">
                    <Text fontWeight="700" fontSize="sm" color="#1a1616">
                      {perfil?.nome ?? nome}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {perfil?.email ?? email}
                    </Text>
                  </VStack>

                  <Text fontSize="xs" color="gray.400" textAlign="center">
                    Clique na foto para alterar
                  </Text>
                </Box>
              </GridItem>

              {/* ── Coluna direita: formulário ── */}
              <GridItem>
                <Box
                  bg="white"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="xl"
                  p={6}
                >
                  <Text fontWeight="700" fontSize="md" color="#1a1616" mb={5}>
                    Informações Pessoais
                  </Text>

                  <VStack gap={4} align="stretch">
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      <Field label="Nome completo" value={nome} onChange={setNome} placeholder="Seu nome" />
                      <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="seu@email.com" />
                    </Grid>

                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                      <Field
                        label="Telefone"
                        value={telefone}
                        onChange={setTelefone}
                        placeholder="(11) 99999-9999"
                      />
                      <Field
                        label="CPF"
                        value={documento}
                        onChange={setDocumento}
                        placeholder="000.000.000-00"
                      />
                    </Grid>

                    <Text fontWeight="700" fontSize="sm" color="#1a1616" pt={2}>
                      Endereço
                    </Text>
                    <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={4}>
                      <Field label="Rua" value={rua} onChange={setRua} placeholder="Rua" />
                      <Field label="Número" value={numero} onChange={setNumero} placeholder="Número" />
                    </Grid>
                    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 160px' }} gap={4}>
                      <Field label="CEP" value={cep} onChange={setCep} placeholder="Somente números" />
                      <Field label="Cidade" value={cidade} onChange={setCidade} placeholder="Cidade" />
                      <Field label="Estado" value={estado} onChange={setEstado} placeholder="UF" />
                    </Grid>

                    {/* Botões */}
                    <HStack justify="flex-end" gap={3} pt={2}>
                      <Button
                        variant="outline"
                        borderColor="gray.200"
                        color="gray.600"
                        fontWeight="500"
                        fontSize="sm"
                        borderRadius="md"
                        size="sm"
                        onClick={() => navigate('/')}
                      >
                        Cancelar
                      </Button>
                      <Button
                        bg="#1a1616"
                        color="white"
                        fontWeight="600"
                        fontSize="sm"
                        borderRadius="md"
                        size="sm"
                        px={6}
                        _hover={{ bg: '#111111' }}
                        loading={saving}
                        onClick={handleSalvar}
                      >
                        Salvar Alterações
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </GridItem>
            </Grid>
          )}
        </Container>
      </Box>

      <HomeFooter />
    </Box>
  )
}
