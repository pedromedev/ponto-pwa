export interface ApiRequestOptions extends RequestInit {
  requireAuth?: boolean
}

export class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
} 