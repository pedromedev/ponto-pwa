import Head from 'next/head'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'

interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ title, children }: Props) => (
	<>
		{title ? (
			<Head>
				<title>Ponto | {title}</title>
			</Head>
		) : (
			<Head>
				<title>Ponto</title>
			</Head>
		)}

		<Appbar />

		<main
			/**
			 * Padding top = `appbar` height (ajustado para h-16)
			 * Padding bottom = `bottom-nav` height
			 */
			className='mx-auto max-w-screen-lg pt-16 pb-16 px-safe sm:pb-0'
		>
			<div className='p-6'>{children}</div>
		</main>

		<BottomNav />
	</>
)

export default Page
