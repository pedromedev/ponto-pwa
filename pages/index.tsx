import Page from '@/components/page'
import Section from '@/components/section'

const Index = () => (
	<Page>
		<Section>
			<h2 className='text-xl font-semibold text-foreground'>
				We grow a lot of rice.
			</h2>

			<div className='mt-2'>
				<p className='text-muted-foreground'>
					You love rice, and so does the rest of the world. In the crop year
					2008/2009, the milled rice production volume amounted to over{' '}
					<span className='font-medium text-foreground'>
						448 million tons
					</span>{' '}
					worldwide.
				</p>

				<br />

				<p className='text-sm text-muted-foreground'>
					<a
						href='https://github.com/mvllow/next-pwa-template'
						className='underline hover:text-foreground transition-colors'
					>
						Source
					</a>
				</p>
			</div>
		</Section>
	</Page>
)

export default Index
