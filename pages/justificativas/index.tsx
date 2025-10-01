import AuthGuard from '@/components/auth-guard'
import JustificationsAdmin from '@/components/justifications'
import Page from '@/components/page'
import Section from '@/components/section'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { API_ROUTES } from '@/lib/constants'
import { User } from '@/types/user'
import { Loader2 } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'

const JustificationPage = () => {

    const { user, isLoading: isAuthLoading } = useAuth()
    const [availableUsers, setAvailableUsers] = useState<User[]>([])
    const [initialLoading, setInitialLoading] = useState(true)

    const loadAvailableUsers = useCallback(async () => {
        try {
            
            if (!user) {
                console.error("Usuário não logado")
                return
            }

            if (user.role == 'MANAGER'){ 
                const data = await api.get<User[]>(API_ROUTES.MANAGEMENT.AVAILABLE_USERS, true)
                setAvailableUsers(data)
                return
            }

            setAvailableUsers([user])
        } catch (error) {
            console.error('Erro ao carregar usuários:', error)
            toast.error('Erro ao carregar usuários')
        }
    }, [user])

    const loadInitialData = useCallback(async () => {
        setInitialLoading(true)
        try {
            await Promise.all([
                loadAvailableUsers(),
            ])
        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error)
            toast.error('Erro ao carregar dados do sistema')
        } finally {
            setInitialLoading(false)
        }
    }, [loadAvailableUsers])

    useEffect(() => {
        if(!user || isAuthLoading) return
        loadInitialData()
    }, [user, isAuthLoading, loadInitialData])

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando sistema de gerenciamento...</span>
                </div>
            </div>
        )
    }

    return (
        <AuthGuard>
            <Page>
                <Section>
                    <JustificationsAdmin availableUsers={availableUsers}/>
                </Section>
            </Page>
        </AuthGuard>
    )
}

export default JustificationPage