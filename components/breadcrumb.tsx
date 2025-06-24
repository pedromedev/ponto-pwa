import { useRouter } from 'next/router'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { navigationItems } from '@/lib/navigation'

export const Breadcrumb = () => {
  const router = useRouter()
  
  const currentRoute = navigationItems.find(item => item.href === router.pathname)
  
  if (!currentRoute || currentRoute.href === '/') {
    return null
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link 
        href="/"
        className="flex items-center gap-1 hover:text-foreground transition-colors duration-200 group"
      >
        <Home className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
        <span>Início</span>
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <div className="flex items-center gap-2">
        <currentRoute.icon className="h-4 w-4 text-primary" />
        <span className="text-foreground font-medium">{currentRoute.label}</span>
      </div>
    </nav>
  )
} 