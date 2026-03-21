import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  HStack,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import logo from '../assets/logo.svg'
import loginFrame from '../assets/login_frame.png'
import { authService } from '../services/authService'

export const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [documento, setDocumento] = useState('')
  const [telefone, setTelefone] = useState('')
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [cep, setCep] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [segmentacao, setSegmentacao] = useState('')
  const [token, setToken] = useState('')
  const [tokenSent, setTokenSent] = useState(false)
  const [tokenSuccessMessage, setTokenSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendToken = async () => {
    setError('')
    setTokenSuccessMessage('')

    if (!email) {
      setError('Informe seu email para receber o token de cadastro')
      return
    }

    setIsLoading(true)

    try {
      await authService.requestRegisterToken({ email })
      setTokenSent(true)
      setTokenSuccessMessage('Token enviado com sucesso. Confira seu email para concluir o cadastro.')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar token de cadastro'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const doRegister = async () => {
    setError('')
    setTokenSuccessMessage('')
    setIsLoading(true)

    try {
      const endereco =
        rua.trim() || numero.trim() || cep.trim() || cidade.trim() || estado.trim()
          ? {
              rua: rua.trim() || undefined,
              numero: numero.trim() || undefined,
              cep: cep.replace(/\D/g, '') || undefined,
              cidade: cidade.trim() || undefined,
              estado: estado.trim() || undefined,
            }
          : undefined

      await authService.register({
        nome,
        email,
        senha,
        token,
        documento: documento || undefined,
        telefone: telefone || undefined,
        endereco,
        segmentacao: segmentacao || undefined,
      })

      navigate('/login', {
        replace: true,
        state: {
          registerSuccess: true,
          registeredEmail: email,
        },
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar cliente'
      if (errorMessage.toLowerCase().includes('token')) {
        setStep(0)
        setToken('')
        setTokenSent(false)
        setError('Seu token expirou ou é inválido. Solicite um novo token para continuar.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const steps = [
    { title: 'Conta', subtitle: 'Email e token' },
    { title: 'Segurança', subtitle: 'Senha' },
    { title: 'Dados', subtitle: 'CPF e telefone' },
    { title: 'Endereço', subtitle: 'Onde você está' },
  ] as const

  const canGoNext = () => {
    if (step === 0) return Boolean(nome.trim() && email.trim() && token.trim())
    if (step === 1) return Boolean(senha && confirmarSenha && senha === confirmarSenha)
    return true
  }

  const goNext = async () => {
    setError('')
    setTokenSuccessMessage('')

    if (step === 0) {
      if (!nome.trim() || !email.trim() || !token.trim()) {
        setError('Preencha nome, email e token para avançar')
        return
      }
      setIsLoading(true)
      try {
        await authService.validateToken({ email, token })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Token inválido ou expirado'
        setError(msg)
        setIsLoading(false)
        return
      } finally {
        setIsLoading(false)
      }
    }

    if (step === 1) {
      if (!senha || !confirmarSenha) {
        setError('Informe a senha e confirme para avançar')
        return
      }
      if (senha !== confirmarSenha) {
        setError('As senhas não conferem')
        return
      }
    }

    setStep((s) => (s < 3 ? ((s + 1) as any) : s))
  }

  const goBack = () => {
    setError('')
    setStep((s) => (s > 0 ? ((s - 1) as any) : s))
  }

  return (
    <Box display="flex" minH="100vh">
      <Box
        display={{ base: 'none', md: 'flex' }}
        w={{ base: 'full', md: '50%' }}
        bg="white"
        justifyContent="center"
        alignItems="center"
        p={{ base: 4, sm: 6, md: 8 }}
      >
        <img
          src={logo}
          alt="Bahia Brindes Logo"
          style={{
            width: 'clamp(16rem, 10vw, 8rem)',
            height: 'clamp(16rem, 10vw, 8rem)',
          }}
        />
      </Box>

      <Box
        w={{ base: 'full', md: '50%' }}
        backgroundImage={`url(${loginFrame})`}
        backgroundPosition="center"
        backgroundSize="cover"
        backgroundAttachment="fixed"
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius={{ base: 0, md: '3xl 0 0 3xl' }}
        p={4}
      >
        <Container maxW="2xl" w="full">
          <VStack
            as="form"
            onSubmit={handleSubmit}
            gap={4}
            bg="white"
            p={{ base: 6, md: 8 }}
            borderRadius="lg"
            boxShadow="12px 16px 4px 0px rgba(0, 0, 0, 0.15)"
            maxW="760px"
            mx="auto"
          >
            <Box display={{ base: 'flex', md: 'none' }} w="full" textAlign="center" justifyContent="center">
              <img
                src={logo}
                alt="Bahia Brindes Logo"
                style={{
                  width: '12rem',
                  height: '12rem',
                }}
              />
            </Box>

            <Text fontSize="2xl" fontWeight="700" color="slate.900" textAlign="center">
              Cadastre-se
            </Text>

            <VStack w="full" align="stretch" gap={2}>
              <HStack justify="space-between" w="full">
                {steps.map((s, idx) => {
                  const active = idx === step
                  const done = idx < step
                  return (
                    <VStack key={s.title} gap={1} align="center" flex={1}>
                      <Box
                        w="26px"
                        h="26px"
                        borderRadius="full"
                        bg={done || active ? 'green.500' : 'gray.200'}
                        color={done || active ? 'white' : 'gray.600'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                        fontWeight="700"
                      >
                        {idx + 1}
                      </Box>
                      <Text fontSize="xs" fontWeight={active ? '700' : '600'} color={active ? 'slate.900' : 'gray.500'}>
                        {s.title}
                      </Text>
                    </VStack>
                  )
                })}
              </HStack>
              <Box w="full" h="6px" bg="gray.200" borderRadius="full" overflow="hidden">
                <Box
                  h="full"
                  bg="slate.900"
                  borderRadius="full"
                  width={`${((step + 1) / steps.length) * 100}%`}
                  transition="width 0.2s ease"
                />
              </Box>
            </VStack>

            {error && (
              <Box
                bg="red.50"
                border="1px solid"
                borderColor="red.200"
                p={3}
                borderRadius="md"
                w="full"
              >
                <Text color="red.800" fontSize="sm">
                  {error}
                </Text>
              </Box>
            )}

            {tokenSuccessMessage && (
              <Box
                bg="green.50"
                border="1px solid"
                borderColor="green.200"
                p={3}
                borderRadius="md"
                w="full"
              >
                <Text color="green.800" fontSize="sm">
                  {tokenSuccessMessage}
                </Text>
              </Box>
            )}

            {step === 0 && (
              <>
                <VStack w="full" align="start" gap={2}>
                  <Text as="label" fontSize="sm" fontWeight="medium">
                    Nome
                  </Text>
                  <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" disabled={isLoading} />
                </VStack>

                <VStack w="full" align="start" gap={2}>
                  <Text as="label" fontSize="sm" fontWeight="medium">
                    Email
                  </Text>
                  <HStack w="full" align="start" gap={3} flexDir={{ base: 'column', md: 'row' }}>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setToken('')
                        setTokenSent(false)
                        setTokenSuccessMessage('')
                      }}
                      placeholder="seu@email.com"
                      disabled={isLoading}
                    />
                    <Button
                      minW={{ base: 'full', md: '180px' }}
                      onClick={handleSendToken}
                      type="button"
                      variant="outline"
                      borderColor="slate.900"
                      color="slate.900"
                      disabled={isLoading || !email}
                    >
                      {tokenSent ? 'Reenviar token' : 'Enviar token'}
                    </Button>
                  </HStack>
                </VStack>

                <VStack w="full" align="start" gap={2}>
                  <Text as="label" fontSize="sm" fontWeight="medium">
                    Token de confirmação
                  </Text>
                  <Input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Cole o token enviado por email"
                    disabled={isLoading}
                  />
                </VStack>
              </>
            )}

            {step === 1 && (
              <HStack w="full" align="start" gap={3} flexDir={{ base: 'column', sm: 'row' }}>
                <VStack flex={1} align="start" gap={2}>
                  <Text as="label" fontSize="sm" fontWeight="medium">
                    Senha
                  </Text>
                  <Input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Sua senha"
                    disabled={isLoading}
                  />
                </VStack>
                <VStack flex={1} align="start" gap={2}>
                  <Text as="label" fontSize="sm" fontWeight="medium">
                    Confirmar senha
                  </Text>
                  <Input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    disabled={isLoading}
                  />
                </VStack>
              </HStack>
            )}

            {step === 2 && (
              <>
                <HStack w="full" align="start" gap={3} flexDir={{ base: 'column', sm: 'row' }}>
                  <VStack flex={1} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      CPF
                    </Text>
                    <Input
                      value={documento}
                      onChange={(e) => setDocumento(e.target.value.replace(/\D/g, ''))}
                      placeholder="Somente números"
                      maxLength={11}
                      disabled={isLoading}
                    />
                  </VStack>
                  <VStack flex={1} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      Telefone
                    </Text>
                    <Input
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Somente números"
                      maxLength={11}
                      disabled={isLoading}
                    />
                  </VStack>
                </HStack>

                <VStack w="full" align="start" gap={2}>
                  <Text as="label" fontSize="sm" fontWeight="medium">
                    Segmentação
                  </Text>
                  <Input
                    value={segmentacao}
                    onChange={(e) => setSegmentacao(e.target.value)}
                    placeholder="Ex.: Varejo"
                    disabled={isLoading}
                  />
                </VStack>
              </>
            )}

            {step === 3 && (
              <>
                <HStack w="full" align="start" gap={3} flexDir={{ base: 'column', sm: 'row' }}>
                  <VStack flex={2} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      Rua
                    </Text>
                    <Input value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua" disabled={isLoading} />
                  </VStack>
                  <VStack flex={1} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      Número
                    </Text>
                    <Input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" disabled={isLoading} />
                  </VStack>
                </HStack>

                <HStack w="full" align="start" gap={3} flexDir={{ base: 'column', sm: 'row' }}>
                  <VStack flex={1} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      CEP
                    </Text>
                    <Input
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                      placeholder="Somente números"
                      maxLength={8}
                      disabled={isLoading}
                    />
                  </VStack>
                  <VStack flex={1} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      Cidade
                    </Text>
                    <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" disabled={isLoading} />
                  </VStack>
                  <VStack w={{ base: 'full', sm: '140px' }} align="start" gap={2}>
                    <Text as="label" fontSize="sm" fontWeight="medium">
                      Estado
                    </Text>
                    <Input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="UF" maxLength={2} disabled={isLoading} />
                  </VStack>
                </HStack>
              </>
            )}

            <HStack w="full" gap={3} pt={2}>
              <Button
                flex={1}
                variant="outline"
                borderColor="gray.300"
                color="slate.900"
                type="button"
                onClick={goBack}
                disabled={isLoading || step === 0}
              >
                Voltar
              </Button>
              {step < 3 ? (
                <Button
                  flex={2}
                  type="button"
                  onClick={goNext}
                  disabled={isLoading || !canGoNext()}
                  bg="linear-gradient(135deg, #000000ff 0%, #2d3561 100%)"
                  color="white"
                  fontSize="sm"
                  fontWeight="600"
                  letterSpacing="0.5px"
                  py={3}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(26, 31, 58, 0.3)',
                  }}
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  flex={2}
                  type="button"
                  loading={isLoading}
                  disabled={isLoading || !nome || !email || !senha || !confirmarSenha || !token}
                  loadingText="Cadastrando..."
                  onClick={doRegister}
                  bg="linear-gradient(135deg, #000000ff 0%, #2d3561 100%)"
                  color="white"
                  fontSize="sm"
                  fontWeight="600"
                  letterSpacing="0.5px"
                  py={3}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(26, 31, 58, 0.3)',
                  }}
                >
                  CRIAR CONTA
                </Button>
              )}
            </HStack>

            <Button
              variant="ghost"
              size="sm"
              color="slate.900"
              fontSize="xs"
              onClick={() => navigate('/login')}
              _hover={{ textDecoration: 'underline' }}
            >
              Já tem conta? Entrar
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}
