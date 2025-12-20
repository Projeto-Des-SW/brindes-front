import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  id: number
  nome: string
  email: string
  perfis: string[]
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar token ao carregar a aplicação
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setIsAuthenticated(true)
      } catch (err) {
        console.error('Erro ao restaurar autenticação:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, senha: string) => {
    setError(null)
    setLoading(true)
    
    try {
      console.log('Iniciando login para:', email)
      const response = await fetch('https://brindes-back.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      console.log('Resposta recebida:', response.status, response.statusText)

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        let errorData
        try {
          errorData = contentType?.includes('application/json') ? await response.json() : { message: await response.text() }
        } catch {
          errorData = { message: 'Erro ao processar resposta da API' }
        }
        throw new Error(errorData.message || `Erro HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Login bem-sucedido:', data)
      
      // Guardar dados no localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        nome: data.nome,
        email: data.email,
        perfis: data.perfis,
      }))
      
      setToken(data.token)
      setUser({
        id: data.id,
        nome: data.nome,
        email: data.email,
        perfis: data.perfis,
      })
      setIsAuthenticated(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      console.error('Erro no login:', errorMessage)
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}
