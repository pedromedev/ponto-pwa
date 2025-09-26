import { Home, Calendar, Clock, BarChart3, Settings, Users } from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  badge?: string
  isActive?: boolean
  isComingSoon?: boolean
  requiredRole?: 'MANAGER' | 'MEMBER'
}

export const baseNavigationItems: NavigationItem[] = [
  {
    label: 'Início',
    href: '/',
    icon: Home,
    description: 'Página principal com registro de ponto'
  },
  {
    label: 'Retroativo',
    href: '/retroativo',
    icon: Calendar,
    description: 'Registrar pontos de dias anteriores'
  },
  {
    label: 'Justificativas',
    href: '/justificativas',
    icon: Users,
    description: 'Gerenciar justificativas'
  },
  {
    label: 'Gerenciamento',
    href: '/gerenciamento',
    icon: Users,
    description: 'Gerenciar equipes, convites e relatórios',
    badge: 'Manager',
    requiredRole: 'MANAGER'
  }
  // Rotas futuras - descomente conforme implementar
  // {
  //   label: 'Relatórios',
  //   href: '/relatorios',
  //   icon: BarChart3,
  //   description: 'Visualizar relatórios de horas trabalhadas',
  //   isComingSoon: true
  // },
  // {
  //   label: 'Equipe',
  //   href: '/equipe',
  //   icon: Users,
  //   description: 'Gerenciar time e colaboradores',
  //   isComingSoon: true,
  //   badge: 'Admin'
  // },
  // {
  //   label: 'Configurações',
  //   href: '/configuracoes',
  //   icon: Settings,
  //   description: 'Configurações do sistema e perfil',
  //   isComingSoon: true
  // }
]

export const getNavigationItems = (userRole?: 'MANAGER' | 'MEMBER'): NavigationItem[] => {
  return baseNavigationItems.filter(item => {
    // Se o item não tem role específico, mostra para todos
    if (!item.requiredRole) return true
    
    // Se o usuário não tem role, não mostra items que precisam de role
    if (!userRole) return false
    
    // Mostra apenas se o role do usuário corresponde ao requerido
    return item.requiredRole === userRole
  })
}

// Mantém a variável navigationItems para compatibilidade
export const navigationItems: NavigationItem[] = baseNavigationItems.filter(item => !item.requiredRole)

export const getActiveNavigationItem = (pathname: string, userRole?: 'MANAGER' | 'MEMBER'): NavigationItem | undefined => {
  const items = getNavigationItems(userRole)
  return items.find(item => item.href === pathname)
}

export const getNavigationItemsByVisibility = (userRole?: 'MANAGER' | 'MEMBER') => {
  const items = getNavigationItems(userRole)
  return {
    active: items.filter(item => !item.isComingSoon),
    comingSoon: items.filter(item => item.isComingSoon)
  }
} 