export interface User {
  id: number
  email: string
  name: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  isAuthenticated: boolean
} 