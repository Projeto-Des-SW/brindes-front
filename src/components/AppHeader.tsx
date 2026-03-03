import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, Button, Flex, HStack, Image, Text, VStack } from '@chakra-ui/react'
import logo from '../assets/logo.svg'
import { APP_MODULES, moduleFromPathname } from '../config/modules'
import { useAuth } from '../context/AuthContext'
import { CheckIcon, ChevronDownIcon, GearIcon, ProfileIcon, UserCircleIcon } from './icons'
import { useOutsideDismiss } from './useOutsideDismiss'

const headerShadow = '0px 2px 6px rgba(0, 0, 0, 0.25)'

const roleLabelFromPerfis = (perfis?: string[]) => {
  if (!perfis || perfis.length === 0) return 'Usuário'
  const normalized = perfis.map((p) => p.toUpperCase())
  if (normalized.some((p) => p.includes('ADMIN'))) return 'Administrador'
  return perfis[0]
}

export const AppHeader = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const selectedModule = useMemo(() => moduleFromPathname(location.pathname), [location.pathname])

  const [isModuleOpen, setIsModuleOpen] = useState(false)
  const [isUserOpen, setIsUserOpen] = useState(false)

  const moduleRef = useRef<HTMLDivElement | null>(null)
  const userRef = useRef<HTMLDivElement | null>(null)

  useOutsideDismiss(moduleRef, () => setIsModuleOpen(false), isModuleOpen)
  useOutsideDismiss(userRef, () => setIsUserOpen(false), isUserOpen)

  const go = (path: string) => {
    navigate(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Box as="header" position="sticky" top={0} zIndex={10} w="full" bg="white" boxShadow={headerShadow}>
      <Flex h="72px" px={{ base: 4, md: 8 }} align="center" justify="space-between">
        <HStack gap={3} align="center">
          <Image src={logo} alt="Bahia Brindes" h={{ base: '26px', md: '30px' }} />
        </HStack>

        <HStack gap={3} align="center">
          {/* Seletor de módulo */}
          <Box position="relative" ref={moduleRef}>
            <Button
              variant="outline"
              borderColor="gray.200"
              bg="white"
              h="34px"
              minW={{ base: '180px', md: '210px' }}
              px={3}
              fontSize="sm"
              fontWeight="400"
              color="gray.800"
              onClick={() => {
                setIsModuleOpen((v) => !v)
                setIsUserOpen(false)
              }}
            >
              <HStack w="full" justify="space-between" gap={3}>
                <Text lineClamp={1}>
                  {selectedModule?.label ?? 'Selecione o Módulo'}
                </Text>
                <ChevronDownIcon color="gray.600" />
              </HStack>
            </Button>

            {isModuleOpen && (
              <Box
                position="absolute"
                top="calc(100% + 10px)"
                right={0}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="lg"
                py={2}
                minW="240px"
              >
                {APP_MODULES.map((m) => {
                  const isSelected = selectedModule?.key === m.key
                  return (
                    <Button
                      key={m.key}
                      variant="ghost"
                      w="full"
                      justifyContent="flex-start"
                      borderRadius="0"
                      h="36px"
                      px={3}
                      fontSize="sm"
                      fontWeight="400"
                      onClick={() => {
                        setIsModuleOpen(false)
                        go(m.path)
                      }}
                    >
                      <HStack w="full" gap={2} align="center">
                        <Box w="18px" color="gray.800">
                          {isSelected ? <CheckIcon /> : null}
                        </Box>
                        <Text>{m.label}</Text>
                      </HStack>
                    </Button>
                  )
                })}
              </Box>
            )}
          </Box>

          {/* Menu do usuário */}
          <Box position="relative" ref={userRef}>
            <Button
              aria-label="Menu do usuário"
              bg="white"
              border="2px solid"
              borderColor="gray.900"
              borderRadius="full"
              w="44px"
              h="44px"
              p={0}
              minW="44px"
              onClick={() => {
                setIsUserOpen((v) => !v)
                setIsModuleOpen(false)
              }}
            >
              <UserCircleIcon size={28} color="gray.900" />
            </Button>

            {isUserOpen && (
              <Box
                position="absolute"
                top="calc(100% + 10px)"
                right={0}
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="lg"
                w="280px"
                overflow="hidden"
              >
                <Box px={4} pt={3} pb={2}>
                  <Text fontWeight="600" color="gray.900" fontSize="sm">
                    {user?.nome ?? 'Nome do Usuário'}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Descrição da Ocupação ({roleLabelFromPerfis(user?.perfis)})
                  </Text>
                </Box>

                <Box h="1px" bg="gray.100" />

                <VStack align="stretch" gap={0} py={2}>
                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    borderRadius="0"
                    h="36px"
                    px={4}
                    fontSize="sm"
                    fontWeight="400"
                    onClick={() => {
                      setIsUserOpen(false)
                      go('/perfil')
                    }}
                  >
                    <HStack gap={2}>
                      <ProfileIcon color="gray.700" />
                      <Text>Meu perfil</Text>
                    </HStack>
                  </Button>

                  <Button
                    variant="ghost"
                    justifyContent="flex-start"
                    borderRadius="0"
                    h="36px"
                    px={4}
                    fontSize="sm"
                    fontWeight="400"
                    onClick={() => {
                      setIsUserOpen(false)
                      go('/configuracoes')
                    }}
                  >
                    <HStack gap={2}>
                      <GearIcon color="gray.700" />
                      <Text>Configurações</Text>
                    </HStack>
                  </Button>
                </VStack>

                <Box px={4} pb={3} display="flex" justifyContent="flex-end">
                  <Button
                    size="sm"
                    h="28px"
                    px={4}
                    bg="gray.900"
                    color="white"
                    fontSize="xs"
                    fontWeight="600"
                    _hover={{ bg: 'gray.800' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </HStack>
      </Flex>
    </Box>
  )
}

