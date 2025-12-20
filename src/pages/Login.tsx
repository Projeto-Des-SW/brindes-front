import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Input,
  Text,
  VStack,
  Heading,
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import logo from '../assets/logo.svg'
import loginFrame from '../assets/login_frame.png'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordError, setForgotPasswordError] = useState('')
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetPasswordConfirm, setResetPasswordConfirm] = useState('')
  const [resetPasswordError, setResetPasswordError] = useState('')
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false)
  
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, senha)
      navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordError('')
    setIsLoading(true)

    try {
      await authService.forgotPassword({ email: forgotPasswordEmail })
      setForgotPasswordSuccess(true)
      setTimeout(() => {
        setShowForgotPassword(false)
        setShowResetPassword(true)
        setForgotPasswordSuccess(false)
        setForgotPasswordEmail('')
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar solicitação'
      setForgotPasswordError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setShowResetPassword(false)
    setForgotPasswordEmail('')
    setForgotPasswordError('')
    setForgotPasswordSuccess(false)
    setResetToken('')
    setResetPassword('')
    setResetPasswordConfirm('')
    setResetPasswordError('')
    setResetPasswordSuccess(false)
  }

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetPasswordError('')
    
    if (resetPassword !== resetPasswordConfirm) {
      setResetPasswordError('As senhas não conferem')
      return
    }

    if (resetPassword.length < 6) {
      setResetPasswordError('A senha deve ter no mínimo 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      await authService.resetPassword({ token: resetToken, novaSenha: resetPassword })
      setResetPasswordSuccess(true)
      setTimeout(() => {
        setShowResetPassword(false)
        setResetPasswordSuccess(false)
        setResetToken('')
        setResetPassword('')
        setResetPasswordConfirm('')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao resetar senha'
      setResetPasswordError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box display="flex" minH="100vh">
      {/* Coluna 1 - Logo (Hidden em mobile, visible em md+) */}
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

      {/* Coluna 2 - Formulário com Background */}
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
        <Container maxW="sm" w="full">
          {!showForgotPassword && !showResetPassword ? (
            // TELA DE LOGIN
            <VStack
              as="form"
              onSubmit={handleSubmit}
              gap={6}
              bg="white"
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              boxShadow="12px 16px 4px 0px rgba(0, 0, 0, 0.15)"
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

              <VStack w="full" align="start" gap={2}>
                <Text as="label" fontSize="sm" fontWeight="medium">
                  Email
                </Text>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  _focus={{
                    borderColor: 'slate.900',
                    boxShadow: '0 0 0 3px rgba(26, 31, 58, 0.1)',
                  }}
                />
              </VStack>

              <VStack w="full" align="start" gap={2}>
                <Text as="label" fontSize="sm" fontWeight="medium">
                  Senha
                </Text>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  disabled={isLoading}
                  _focus={{
                    borderColor: 'slate.900',
                    boxShadow: '0 0 0 3px rgba(26, 31, 58, 0.1)',
                  }}
                />
              </VStack>

              <Button
                w="full"
                type="submit"
                loading={isLoading}
                disabled={isLoading || !email || !senha}
                loadingText="Entrando..."
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
                _active={{
                  transform: 'translateY(0)',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  transform: 'none',
                  boxShadow: 'none',
                }}
              >
                LOGIN
              </Button>

              <Button
                variant="ghost"
                size="sm"
                color="slate.900"
                fontSize="xs"
                onClick={() => setShowForgotPassword(true)}
                _hover={{ textDecoration: 'underline' }}
              >
                Esqueceu sua senha?
              </Button>
            </VStack>
          ) : showForgotPassword && !showResetPassword ? (
            // TELA DE RECUPERAÇÃO DE SENHA
            <VStack
              as="form"
              onSubmit={handleForgotPasswordSubmit}
              gap={6}
              bg="white"
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              boxShadow="12px 16px 4px 0px rgba(0, 0, 0, 0.15)"
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

              <Heading as="h2" size="lg" color="slate.900" textAlign="center">
                Recuperar Senha
              </Heading>

              {forgotPasswordError && (
                <Box
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  p={3}
                  borderRadius="md"
                  w="full"
                >
                  <Text color="red.800" fontSize="sm">
                    {forgotPasswordError}
                  </Text>
                </Box>
              )}

              {forgotPasswordSuccess && (
                <Box
                  bg="green.50"
                  border="1px solid"
                  borderColor="green.200"
                  p={3}
                  borderRadius="md"
                  w="full"
                >
                  <Text color="green.800" fontSize="sm">
                    ✓ E-mail de recuperação enviado com sucesso! Redirecionando...
                  </Text>
                </Box>
              )}

              <VStack w="full" align="start" gap={2}>
                <Text as="label" fontSize="sm" fontWeight="medium">
                  Email
                </Text>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  disabled={isLoading || forgotPasswordSuccess}
                  _focus={{
                    borderColor: 'slate.900',
                    boxShadow: '0 0 0 3px rgba(26, 31, 58, 0.1)',
                  }}
                />
              </VStack>

              <Button
                w="full"
                type="submit"
                loading={isLoading}
                disabled={isLoading || !forgotPasswordEmail || forgotPasswordSuccess}
                loadingText="Enviando..."
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
                _active={{
                  transform: 'translateY(0)',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  transform: 'none',
                  boxShadow: 'none',
                }}
              >
                ENVIAR
              </Button>

              <Button
                w="full"
                variant="ghost"
                size="sm"
                color="slate.900"
                fontSize="xs"
                onClick={handleBackToLogin}
                disabled={isLoading || forgotPasswordSuccess}
              >
                ← Voltar ao Login
              </Button>
            </VStack>
          ) : showResetPassword ? (
            // TELA DE RESETAR SENHA
            <VStack
              as="form"
              onSubmit={handleResetPasswordSubmit}
              gap={6}
              bg="white"
              p={{ base: 6, md: 8 }}
              borderRadius="lg"
              boxShadow="12px 16px 4px 0px rgba(0, 0, 0, 0.15)"
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

              <Heading as="h2" size="lg" color="slate.900" textAlign="center">
                Alterar Senha
              </Heading>

              {resetPasswordError && (
                <Box
                  bg="red.50"
                  border="1px solid"
                  borderColor="red.200"
                  p={3}
                  borderRadius="md"
                  w="full"
                >
                  <Text color="red.800" fontSize="sm">
                    {resetPasswordError}
                  </Text>
                </Box>
              )}

              {resetPasswordSuccess && (
                <Box
                  bg="green.50"
                  border="1px solid"
                  borderColor="green.200"
                  p={3}
                  borderRadius="md"
                  w="full"
                >
                  <Text color="green.800" fontSize="sm">
                    ✓ Senha alterada com sucesso! Redirecionando...
                  </Text>
                </Box>
              )}

              <VStack w="full" align="start" gap={2}>
                <Text as="label" fontSize="sm" fontWeight="medium">
                  Token
                </Text>
                <Input
                  id="token"
                  type="text"
                  placeholder="Código enviado por e-mail"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  disabled={isLoading || resetPasswordSuccess}
                  _focus={{
                    borderColor: 'slate.900',
                    boxShadow: '0 0 0 3px rgba(26, 31, 58, 0.1)',
                  }}
                />
              </VStack>

              <VStack w="full" align="start" gap={2}>
                <Text as="label" fontSize="sm" fontWeight="medium">
                  Nova Senha
                </Text>
                <Input
                  id="reset-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  disabled={isLoading || resetPasswordSuccess}
                  _focus={{
                    borderColor: 'slate.900',
                    boxShadow: '0 0 0 3px rgba(26, 31, 58, 0.1)',
                  }}
                />
              </VStack>

              <VStack w="full" align="start" gap={2}>
                <Text as="label" fontSize="sm" fontWeight="medium">
                  Confirmar Senha
                </Text>
                <Input
                  id="reset-password-confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={resetPasswordConfirm}
                  onChange={(e) => setResetPasswordConfirm(e.target.value)}
                  disabled={isLoading || resetPasswordSuccess}
                  _focus={{
                    borderColor: 'slate.900',
                    boxShadow: '0 0 0 3px rgba(26, 31, 58, 0.1)',
                  }}
                />
              </VStack>

              <Button
                w="full"
                type="submit"
                loading={isLoading}
                disabled={isLoading || !resetToken || !resetPassword || !resetPasswordConfirm || resetPasswordSuccess}
                loadingText="Alterando..."
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
                _active={{
                  transform: 'translateY(0)',
                }}
                _disabled={{
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  transform: 'none',
                  boxShadow: 'none',
                }}
              >
                ALTERAR SENHA
              </Button>

              <Button
                w="full"
                variant="ghost"
                size="sm"
                color="slate.900"
                fontSize="xs"
                onClick={handleBackToLogin}
                disabled={isLoading || resetPasswordSuccess}
              >
                ← Voltar ao Login
              </Button>
            </VStack>
          ) : null}
        </Container>
      </Box>
    </Box>
  )
}
