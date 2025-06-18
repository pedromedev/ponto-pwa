import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Loading from './loading'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <Loading />
  }

  // Se não está autenticado, não renderizar nada (redirecionamento já foi iniciado)
  if (!isAuthenticated) {
    return null
  }

  // Se está autenticado, renderizar o conteúdo
  return <>{children}</>
} 