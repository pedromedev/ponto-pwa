import Page from '@/components/page'
import Section from '@/components/section'
import AuthGuard from '@/components/auth-guard'
import { useAuth } from '@/lib/auth'

const Index = () => {
	const { user } = useAuth()
	
	return (
		<AuthGuard>
			<Page>
				<Section>
					<h2 className='text-xl font-semibold text-foreground'>
						Bem-vindo ao Sistema de Ponto, {user?.name}!
					</h2>

					<div className='mt-2'>
						<p className='text-muted-foreground'>
							Este é seu painel principal para gerenciar registros de ponto e 
							acompanhar suas horas trabalhadas.
						</p>

						<br />

						<div className='grid gap-4 md:grid-cols-2'>
							<div className='p-4 border rounded-lg'>
								<h3 className='font-medium text-foreground mb-2'>
									Registrar Ponto
								</h3>
								<p className='text-sm text-muted-foreground'>
									Registre sua entrada, saída ou intervalo.
								</p>
							</div>
							
							<div className='p-4 border rounded-lg'>
								<h3 className='font-medium text-foreground mb-2'>
									Relatórios
								</h3>
								<p className='text-sm text-muted-foreground'>
									Visualize seus relatórios de horas trabalhadas.
								</p>
							</div>
						</div>
					</div>
				</Section>
			</Page>
		</AuthGuard>
	)
}

export default Index
