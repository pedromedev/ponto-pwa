import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from './api'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Verificar se o usuário está logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authToken = localStorage.getItem('auth-token')
        const userData = localStorage.getItem('user-data')
        
        if (authToken && userData) {
          setUser(JSON.parse(userData))
          // Definir cookie para o middleware
          document.cookie = `auth-token=${authToken}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 dias
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Fazer login na API
      const loginData = await api.post<{ accessToken: string; refreshToken: string }>('/auth/login', { email, password })
      
      // Salvar tokens
      localStorage.setItem('auth-token', loginData.accessToken)
      localStorage.setItem('refresh-token', loginData.refreshToken)
      document.cookie = `auth-token=${loginData.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`
      
      // Buscar dados do usuário
      const userData = await api.get<User>('/auth/profile', true)
      
      // Salvar dados do usuário
      localStorage.setItem('user-data', JSON.stringify(userData))
      setUser(userData)
      
      return true
    } catch (error) {
      console.error('Erro durante o login:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true)
    
    try {
      await api.post('/auth/register', { email, password, name })
      return { success: true, message: 'Usuário criado com sucesso! Faça login para continuar.' }
    } catch (error: any) {
      console.error('Erro durante o registro:', error)
      return { 
        success: false, 
        message: error.message || 'Erro de conexão. Tente novamente.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh-token')
      
      // Tentar fazer logout na API se tiver refresh token
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken }, true).catch(error => {
          console.warn('Erro ao fazer logout na API:', error)
        })
      }
    } catch (error) {
      console.warn('Erro durante logout na API:', error)
    } finally {
      // Sempre limpar dados locais, mesmo se a API falhar
      localStorage.removeItem('auth-token')
      localStorage.removeItem('refresh-token')
      localStorage.removeItem('user-data')
      
      // Remover cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      
      setUser(null)
      
      // Redirecionar para login
      window.location.href = '/auth/login'
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
} 