
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
}

class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

export const api = {
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { requireAuth = false, headers = {}, ...fetchOptions } = options
    
    const url = `${API_BASE_URL}${endpoint}`
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    // Adicionar token de autenticação se necessário
    if (requireAuth) {
      const token = localStorage.getItem('auth-token')
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      })

      // Se o token expirou (401), tentar renovar
      if (response.status === 401 && requireAuth) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Tentar novamente com o novo token
          const newToken = localStorage.getItem('auth-token')
          if (newToken) {
            const newHeaders: Record<string, string> = {
              ...requestHeaders,
              Authorization: `Bearer ${newToken}`
            }
            const retryResponse = await fetch(url, {
              ...fetchOptions,
              headers: newHeaders,
            })
            
            if (retryResponse.ok) {
              return retryResponse.json()
            }
          }
        }
        
        // Se não conseguiu renovar ou ainda deu erro, fazer logout
        this.handleAuthError()
        throw new ApiError('Token expirado', 401)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
        throw new ApiError(errorData.message || 'Erro na requisição', response.status)
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Erro de conexão', 0)
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refresh-token')
      if (!refreshToken) {
        return false
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth-token', data.accessToken)
        localStorage.setItem('refresh-token', data.refreshToken)
        
        // Atualizar cookie
        document.cookie = `auth-token=${data.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}`
        
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return false
    }
  },

  handleAuthError() {
    // Limpar dados de autenticação
    localStorage.removeItem('auth-token')
    localStorage.removeItem('refresh-token')
    localStorage.removeItem('user-data')
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Redirecionar para login
    window.location.href = '/auth/login'
  },

  // Métodos de conveniência
  get<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requireAuth })
  },

  post<T>(endpoint: string, data?: any, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth,
    })
  },

  put<T>(endpoint: string, data?: any, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth,
    })
  },

  delete<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth })
  },
}

export { ApiError } 