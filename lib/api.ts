
import { ApiRequestOptions, ApiError } from '@/types/api'
import { STORAGE_KEYS, COOKIE_CONFIG, API_ROUTES, MESSAGES } from './constants'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = {
  async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    const { requireAuth = false, headers = {}, ...fetchOptions } = options
    
    const url = `${API_BASE_URL}${endpoint}`
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    }

    if (requireAuth) {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`
      }
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      })

      if (response.status === 401 && requireAuth) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          const newToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
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
              const ct = retryResponse.headers.get('content-type') || ''
              if (retryResponse.status === 204 || retryResponse.status === 205) {
                return undefined as any
              }
              const retryText = await retryResponse.text()
              if (!retryText) return undefined as any
              if (ct.includes('application/json')) return JSON.parse(retryText)
              return retryText as any
            }
          }
        }
        
        this.handleAuthError()
        throw new ApiError(MESSAGES.ERROR.TOKEN_EXPIRED, 401)
      }

      if (!response.ok) {
        let message = 'Erro na requisição'
        try {
          const contentType = response.headers.get('content-type') || ''
          const text = await response.text()
          if (text) {
            if (contentType.includes('application/json')) {
              const json = JSON.parse(text)
              message = json.message || message
            } else {
              message = text
            }
          }
        } catch {}
        throw new ApiError(message, response.status)
      }

      const contentType = response.headers.get('content-type') || ''
      if (response.status === 204 || response.status === 205) {
        return undefined as T
      }
      const text = await response.text()
      if (!text) {
        return undefined as T
      }
      if (contentType.includes('application/json')) {
        return JSON.parse(text) as T
      }
      return text as unknown as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(MESSAGES.ERROR.CONNECTION_ERROR, 0)
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      if (!refreshToken) {
        return false
      }

      const response = await fetch(`${API_BASE_URL}${API_ROUTES.AUTH.REFRESH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.accessToken)
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken)
        
        document.cookie = `${COOKIE_CONFIG.AUTH_TOKEN.name}=${data.accessToken}; path=/; max-age=${COOKIE_CONFIG.AUTH_TOKEN.maxAge}`
        
        return true
      }

      return false
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      return false
    }
  },

  handleAuthError() {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    document.cookie = `${COOKIE_CONFIG.AUTH_TOKEN.name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    
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

  patch<T>(endpoint: string, data?: any, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      requireAuth,
    })
  },

  delete<T>(endpoint: string, requireAuth = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requireAuth })
  },
}

export { ApiError } 