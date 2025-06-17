import Link from 'next/link'
import { useRouter } from 'next/router'
import { ThemeToggle } from './theme-toggle'

const links = [
	{ label: 'Story', href: '/story' },
	{ label: 'Recipes', href: '/recipes' },
]

const Appbar = () => {
	const router = useRouter()

	return (
		<div className='fixed top-0 left-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b border-border pt-safe'>
			<header className='bg-background/95 px-safe'>
				<div className='mx-auto flex h-16 max-w-screen-md items-center justify-between px-6'>
					<Link href='/'>
						<h1 className='font-semibold text-foreground hover:text-primary transition-colors'>
							Rice Bowl
						</h1>
					</Link>

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

						<div
							title='Usuário'
							className='h-8 w-8 rounded-full bg-muted bg-cover bg-center ring-2 ring-border hover:ring-primary/50 transition-all cursor-pointer'
							style={{
								backgroundImage:
									'url(https://images.unsplash.com/photo-1612480797665-c96d261eae09?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80)',
							}}
						/>
					</nav>
				</div>
			</header>
		</div>
	)
}

export default Appbar
