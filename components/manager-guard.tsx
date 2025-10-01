import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldX, ArrowLeft } from 'lucide-react'
import Loading from '@/components/loading'

interface ManagerGuardProps {
  children: React.ReactNode
}

const ManagerGuard = ({ children }: ManagerGuardProps) => {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  const checkManagerPermission = useCallback(async () => {
    try {
      // Verificar se o usuário está autenticado
      const token = localStorage.getItem('auth-token')
      if (!token) {
        router.push('/auth/login')
        return
      }

      // Obter dados do usuário (aqui você pode fazer uma chamada para a API)
      const userData = localStorage.getItem('user-data')
      if (userData) {
        const user = JSON.parse(userData)
        setUserRole(user.role)
        
        // Verificar se o usuário é MANAGER
        if (user.role === 'MANAGER') {
          setIsAuthorized(true)
        } else {
          setIsAuthorized(false)
        }
      } else {
        // Se não tem dados do usuário, redirecionar para login
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error)
      router.push('/auth/login')
    }
  }, [router])

  const handleGoBack = () => {
    router.push('/')
  }

  useEffect(() => {
    checkManagerPermission()
  }, [checkManagerPermission])

  // Loading state
  if (isAuthorized === null) {
    return <Loading />
  }

  // Acesso negado
  if (isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Acesso Negado</CardTitle>
            <CardDescription>
              Esta página é exclusiva para gerentes. Você precisa ter permissões de gerente para acessar esta funcionalidade.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Seu nível de acesso:</strong> {userRole === 'MEMBER' ? 'Membro' : userRole || 'Não identificado'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <strong>Nível necessário:</strong> Gerente
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Se você acredita que deveria ter acesso a esta página, entre em contato com um administrador.
              </p>
              <Button onClick={handleGoBack} variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar à página inicial
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Usuário autorizado - renderizar o conteúdo
  return <>{children}</>
}

export default ManagerGuard 