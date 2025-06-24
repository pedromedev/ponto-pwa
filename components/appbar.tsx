import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { getNavigationItems, type NavigationItem } from '@/lib/navigation'

const Appbar = () => {
	const router = useRouter()
	const { user, logout } = useAuth()
	const { theme, resolvedTheme } = useTheme()
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	// Obter navegação baseada no role do usuário
	const navigationItems = getNavigationItems(user?.role)

	const logoSrc = resolvedTheme === 'dark' 
		? '/images/logo-pvt-branca-endoso.png' 
		: '/images/logo-pvt-preta-endoso.png'

	const NavLinkComponent = ({ link, isMobile = false }: { link: NavigationItem; isMobile?: boolean }) => {
		const isActive = router.pathname === link.href
		const IconComponent = link.icon

		return (
			<Link
				href={link.href}
				onClick={() => isMobile && setIsMobileMenuOpen(false)}
				className={`
					group relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out
					${isActive 
						? 'bg-primary/10 text-primary border border-primary/20' 
						: 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
					}
					${isMobile ? 'w-full' : ''}
				`}
			>
				<IconComponent className={`
					h-4 w-4 transition-transform duration-200 
					${isActive ? 'scale-110' : 'group-hover:scale-105'}
				`} />
				<span className={`
					font-medium transition-all duration-200
					${isActive ? 'text-primary' : 'group-hover:text-foreground'}
				`}>
					{link.label}
				</span>
				
				{/* Badge para roles especiais */}
				{link.badge && (
					<Badge variant="secondary" className="text-xs ml-2">
						{link.badge}
					</Badge>
				)}

				{isMobile && link.description && (
					<span className="text-xs text-muted-foreground ml-auto">
						{link.description}
					</span>
				)}
				
				{/* Indicador de ativo */}
				{isActive && !isMobile && (
					<div className="absolute -bottom-1 left-1/2 h-0.5 w-6 bg-primary rounded-full transform -translate-x-1/2 animate-in slide-in-from-bottom-1 duration-200" />
				)}
			</Link>
		)
	}

	return (
		<>
			<div className='fixed top-0 left-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/50 pt-safe'>
				<header className='bg-background/95 px-safe'>
					<div className='mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6'>
						{/* Logo */}
						<Link 
							href='/' 
							className="group flex items-center space-x-3 transition-transform duration-200 hover:scale-105"
						>
							<div className="relative overflow-hidden rounded-lg">
								<Image
									src={logoSrc}
									alt="PVT Software e Serviços"
									width={120}
									height={32}
									className="h-8 w-auto transition-transform duration-300 group-hover:scale-110"
									priority
								/>
								<div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
							</div>
							<div className="h-6 w-px bg-border transition-colors duration-200 group-hover:bg-primary/30" />
							<span className='font-semibold text-foreground group-hover:text-primary transition-colors duration-200'>
								Ponto Virtual
							</span>
						</Link>
						
						{/* Navegação Desktop */}
						<nav className='hidden md:flex items-center space-x-2'>
							{navigationItems.map((link) => (
								<NavLinkComponent key={link.href} link={link} />
							))}
						</nav>

						{/* Controles do lado direito */}
						<div className='flex items-center space-x-3'>
							<ThemeToggle />

							{/* Menu mobile */}
							<Button
								variant="ghost"
								size="sm"
								className="md:hidden relative p-2 hover:bg-accent rounded-lg transition-colors duration-200"
								onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							>
								<div className="relative w-5 h-5">
									<Menu className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} />
									<X className={`absolute inset-0 h-5 w-5 transition-all duration-200 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} />
								</div>
							</Button>

							{/* Dropdown do usuário */}
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="group relative h-10 w-10 rounded-full p-0 hover:bg-accent transition-all duration-200 hover:scale-105"
									>
										<div className='h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-200 flex items-center justify-center'>
											<User className="h-4 w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
										</div>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-64 p-2" align="end" forceMount>
									<div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg mb-2">
										<div className='h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center'>
											<User className="h-5 w-5 text-primary" />
										</div>
										<div className="flex flex-col">
											<div className="flex items-center gap-2">
												<p className="font-medium text-sm">{user?.name || 'Usuário'}</p>
												{user?.role === 'MANAGER' && (
													<Badge variant="secondary" className="text-xs">
														Manager
													</Badge>
												)}
											</div>
											<p className="text-xs text-muted-foreground truncate max-w-[150px]">
												{user?.email}
											</p>
										</div>
									</div>
									<DropdownMenuSeparator />
									<DropdownMenuItem 
										onClick={logout} 
										className="cursor-pointer group flex items-center gap-3 p-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
									>
										<LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
										<span>Sair da conta</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>
			</div>

			{/* Menu Mobile Overlay */}
			{isMobileMenuOpen && (
				<div className="fixed inset-0 z-40 md:hidden">
					<div 
						className="absolute inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setIsMobileMenuOpen(false)}
					/>
					<div className="absolute top-16 left-0 right-0 bg-background border-b border-border/50 shadow-lg animate-in slide-in-from-top-4 duration-200">
						<nav className="p-4 space-y-2">
							{navigationItems.map((link) => (
								<NavLinkComponent key={link.href} link={link} isMobile />
							))}
						</nav>
						
						{/* Informações do usuário no mobile */}
						<div className="border-t border-border/50 p-4">
							<div className="flex items-center gap-3 p-3 bg-accent/30 rounded-lg">
								<div className='h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center'>
									<User className="h-5 w-5 text-primary" />
								</div>
								<div className="flex flex-col flex-1">
									<div className="flex items-center gap-2">
										<p className="font-medium text-sm">{user?.name || 'Usuário'}</p>
										{user?.role === 'MANAGER' && (
											<Badge variant="secondary" className="text-xs">
												Manager
											</Badge>
										)}
									</div>
									<p className="text-xs text-muted-foreground">
										{user?.email}
									</p>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										logout()
										setIsMobileMenuOpen(false)
									}}
									className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors duration-200"
								>
									<LogOut className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default Appbar
