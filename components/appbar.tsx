import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { ThemeToggle } from './theme-toggle'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

const links: { label: string; href: string }[] = []

const Appbar = () => {
	const router = useRouter()
	const { user, logout } = useAuth()
	const { theme, resolvedTheme } = useTheme()

	// Determinar qual logo usar baseado no tema
	const logoSrc = resolvedTheme === 'dark' 
		? '/images/logo-pvt-branca-endoso.png' 
		: '/images/logo-pvt-preta-endoso.png'

	return (
		<div className='fixed top-0 left-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-border pt-safe'>
			<header className='bg-background/95 px-safe'>
				<div className='mx-auto flex h-16 max-w-screen-md items-center justify-between px-6'>
					<Link href='/' className="flex items-center space-x-3">
						<Image
							src={logoSrc}
							alt="PVT Software e Serviços"
							width={120}
							height={32}
							className="h-8 w-auto"
							priority
						/>
						<div className="h-6 w-px bg-border" />
						<span className='font-semibold text-foreground hover:text-primary transition-colors'>
							Ponto Virtual
						</span>
					</Link>
					
					<div className="flex items-center space-x-4">
						<Link
							href="/retroativo"
							className={`text-sm font-medium transition-colors ${
								router.pathname === '/retroativo'
									? 'text-primary'
									: 'text-muted-foreground hover:text-foreground'
							}`}
						>
							Retroativo
						</Link>
					</div>

					<nav className='flex items-center space-x-4'>
						<div className='hidden sm:block'>
							<div className='flex items-center space-x-6'>
								{links.map(({ label, href }) => (
									<Link
										key={label}
										href={href}
										className={`text-sm transition-colors ${
											router.pathname === href
												? 'text-primary font-medium'
												: 'text-muted-foreground hover:text-foreground'
										}`}
									>
										{label}
									</Link>
								))}
							</div>
						</div>

						<ThemeToggle />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-8 w-8 rounded-full"
								>
									<div
										className='h-8 w-8 rounded-full bg-muted bg-cover bg-center ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer flex items-center justify-center rounded-full h-8 w-8'
									>
										<User className="h-4 w-8 rounded-full" />
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<div className="flex items-center justify-start gap-2 p-2">
									<div className="flex flex-col space-y-1 leading-none">
										<p className="font-medium">{user?.name || 'Usuário'}</p>
										<p className="w-[200px] truncate text-sm text-muted-foreground">
											{user?.email}
										</p>
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem onClick={logout} className="cursor-pointer">
									<LogOut className="mr-2 h-4 w-4" />
									<span>Sair</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</nav>
				</div>
			</header>
		</div>
	)
}

export default Appbar
