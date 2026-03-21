import { useEffect, useRef, useState } from 'react'
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Heading,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import { AppBreadcrumbs } from '../components/AppBreadcrumbs'
import { useAuth } from '../context/useAuth'
import { funcionarioService } from '../services/funcionarioService'
import type { FuncionarioResponse } from '../services/funcionarioService'

const perfilLabel = (p: string) => (p === 'ROLE_ADMIN' ? 'Admin' : 'Funcionário')

const PerfilBadge = ({ perfil }: { perfil: string }) => (
  <Box
    as="span"
    px={2}
    py="2px"
    borderRadius="md"
    fontSize="xs"
    fontWeight="600"
    bg={perfil === 'ROLE_ADMIN' ? 'purple.100' : 'blue.100'}
    color={perfil === 'ROLE_ADMIN' ? 'purple.700' : 'blue.700'}
  >
    {perfilLabel(perfil)}
  </Box>
)

const ErrorAlert = ({ message }: { message: string }) => (
  <Box bg="red.50" border="1px solid" borderColor="red.300" borderRadius="md" px={4} py={3} display="flex" alignItems="flex-start" gap={2}>
    <Text color="red.500" fontWeight="bold" fontSize="md" lineHeight="1.4" flexShrink={0}>✕</Text>
    <Text fontSize="sm" color="red.700" fontWeight="600" lineHeight="1.5">{message}</Text>
  </Box>
)

const SuccessAlert = ({ message }: { message: string }) => (
  <Box bg="green.50" border="1px solid" borderColor="green.300" borderRadius="md" px={4} py={3} display="flex" alignItems="flex-start" gap={2}>
    <Text color="green.500" fontWeight="bold" fontSize="md" lineHeight="1.4" flexShrink={0}>✓</Text>
    <Text fontSize="sm" color="green.700" fontWeight="600" lineHeight="1.5">{message}</Text>
  </Box>
)

const SectionCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" boxShadow="sm" overflow="hidden">
    <Box px={5} py={4} borderBottom="1px solid" borderColor="gray.100">
      <Text fontWeight="700" color="gray.900">{title}</Text>
    </Box>
    <Box p={5}>{children}</Box>
  </Box>
)

export const Perfil = () => {
  const { token } = useAuth()

  const [data, setData] = useState<FuncionarioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Dados pessoais
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [savingDados, setSavingDados] = useState(false)
  const [errorDados, setErrorDados] = useState<string | null>(null)
  const [successDados, setSuccessDados] = useState(false)

  // Senha
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [savingSenha, setSavingSenha] = useState(false)
  const [errorSenha, setErrorSenha] = useState<string | null>(null)
  const [successSenha, setSuccessSenha] = useState(false)

  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    funcionarioService
      .me(token!, controller.signal)
      .then((f) => {
        setData(f)
        setNome(f.nome)
        setEmail(f.email)
      })
      .catch((e) => { if (!controller.signal.aborted) setLoadError(e instanceof Error ? e.message : 'Erro ao carregar perfil') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token])

  const handleSaveDados = async () => {
    if (!nome.trim() || !email.trim()) { setErrorDados('Nome e email são obrigatórios.'); return }
    setSavingDados(true)
    setErrorDados(null)
    setSuccessDados(false)
    try {
      const updated = await funcionarioService.atualizarMe({ nome: nome.trim(), email: email.trim() }, token!)
      setData(updated)
      setNome(updated.nome)
      setEmail(updated.email)
      setSuccessDados(true)
      setTimeout(() => setSuccessDados(false), 4000)
    } catch (e) {
      setErrorDados(e instanceof Error ? e.message : 'Erro ao salvar dados')
    } finally {
      setSavingDados(false)
    }
  }

  const handleSaveSenha = async () => {
    if (!novaSenha.trim()) { setErrorSenha('Informe a nova senha.'); return }
    if (novaSenha !== confirmarSenha) { setErrorSenha('As senhas não coincidem.'); return }
    if (novaSenha.length < 6) { setErrorSenha('A senha deve ter pelo menos 6 caracteres.'); return }
    setSavingSenha(true)
    setErrorSenha(null)
    setSuccessSenha(false)
    try {
      await funcionarioService.atualizarMe({ nome: nome.trim(), email: email.trim(), senha: novaSenha }, token!)
      setNovaSenha('')
      setConfirmarSenha('')
      setSuccessSenha(true)
      setTimeout(() => setSuccessSenha(false), 4000)
    } catch (e) {
      setErrorSenha(e instanceof Error ? e.message : 'Erro ao alterar senha')
    } finally {
      setSavingSenha(false)
    }
  }

  return (
    <Box py={6}>
      <Container maxW="4xl">
        <AppBreadcrumbs />

        <Flex mt={3} align="flex-start" justify="space-between" gap={4} wrap="wrap">
          <Box>
            <Heading as="h1" size="md" color="gray.900">Meu Perfil</Heading>
            <Text mt={1} fontSize="sm" color="gray.500">Visualize e edite suas informações pessoais</Text>
          </Box>
        </Flex>

        {loadError ? (
          <Box mt={4}><ErrorAlert message={loadError} /></Box>
        ) : loading ? (
          <Flex mt={10} justify="center"><Spinner /></Flex>
        ) : (
          <Stack mt={6} gap={5}>

            {/* Resumo */}
            <Box bg="white" border="1px solid" borderColor="gray.200" borderRadius="lg" boxShadow="sm" p={5}>
              <Flex align="center" gap={4}>
                <Flex
                  w="56px" h="56px" borderRadius="full" bg="gray.900"
                  align="center" justify="center" flexShrink={0}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="white" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" />
                  </svg>
                </Flex>
                <Box>
                  <Text fontWeight="700" fontSize="md" color="gray.900">{data?.nome}</Text>
                  <Text fontSize="sm" color="gray.500">{data?.email}</Text>
                  <HStack gap={1} mt={1}>
                    {(data?.perfis ?? []).map((p) => <PerfilBadge key={p} perfil={p} />)}
                  </HStack>
                </Box>
              </Flex>
            </Box>

            {/* Dados pessoais */}
            <SectionCard title="Dados Pessoais">
              <Stack gap={4}>
                {errorDados ? <ErrorAlert message={errorDados} /> : null}
                {successDados ? <SuccessAlert message="Dados atualizados com sucesso!" /> : null}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>Nome</Text>
                    <Input
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      h="38px" bg="white" borderColor="gray.200" fontSize="sm"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>Email</Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      h="38px" bg="white" borderColor="gray.200" fontSize="sm"
                    />
                  </Box>
                </SimpleGrid>
                <Flex justify="flex-end">
                  <Button
                    bg="gray.900" color="white" _hover={{ bg: 'gray.800' }}
                    size="sm" h="34px" px={5} onClick={handleSaveDados} disabled={savingDados}
                  >
                    {savingDados
                      ? <HStack gap={2}><Spinner size="sm" /><span>Salvando...</span></HStack>
                      : 'Salvar dados'}
                  </Button>
                </Flex>
              </Stack>
            </SectionCard>

            {/* Segurança */}
            <SectionCard title="Alterar Senha">
              <Stack gap={4}>
                {errorSenha ? <ErrorAlert message={errorSenha} /> : null}
                {successSenha ? <SuccessAlert message="Senha alterada com sucesso!" /> : null}
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>Nova senha</Text>
                    <Input
                      type="password"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      h="38px" bg="white" borderColor="gray.200" fontSize="sm"
                    />
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="700" mb={1}>Confirmar nova senha</Text>
                    <Input
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      h="38px" bg="white" borderColor="gray.200" fontSize="sm"
                    />
                  </Box>
                </SimpleGrid>
                <Flex justify="flex-end">
                  <Button
                    bg="gray.900" color="white" _hover={{ bg: 'gray.800' }}
                    size="sm" h="34px" px={5} onClick={handleSaveSenha} disabled={savingSenha}
                  >
                    {savingSenha
                      ? <HStack gap={2}><Spinner size="sm" /><span>Salvando...</span></HStack>
                      : 'Alterar senha'}
                  </Button>
                </Flex>
              </Stack>
            </SectionCard>

          </Stack>
        )}
      </Container>
    </Box>
  )
}
