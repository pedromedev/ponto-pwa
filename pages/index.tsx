import React, { useEffect } from 'react'
import Link from 'next/link'
import { Users, ArrowRight, Settings } from 'lucide-react'

import { FieldName } from '@/types/time-entry'

import Page from '@/components/page'
import Section from '@/components/section'
import AuthGuard from '@/components/auth-guard'
import { TimeFieldComponent } from '@/components/time-field-component'
import { MonthCalendar } from '@/components/month-calendar'
import { TodayTimeEntryStatus } from '@/components/today-timeentry-status'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useTimeEntry } from '@/hooks/use-time-entry'


const FIELD_ORDER: FieldName[] = ['clockIn', 'lunchStart', 'lunchEnd', 'clockOut']

const Index = () => {

	const {
		fields,
		isSubmitting,
		markers,
		todayEntry,
		isLoadingToday,
		currentWorkedHours,
		handleFieldClick,
		handleJustifyClick,
		handleJustificationSubmit,
		handleJustificationCancel,
		handleJustificationChange,
		fetchDateSelectedTimeEntry,
	} = useTimeEntry()

	// Verificar se pelo menos a entrada foi preenchida para mostrar o cálculo
	const hasAnyTime = fields.clockIn.value !== null

	return (
		<AuthGuard>
			<Page>
				<Section>
					<div className="space-y-2">
						<Header isLoadingToday={isLoadingToday} />
						
						{/* Card de acesso rápido para managers
						{user?.role === 'MANAGER' && (
							<ManagerQuickAccess />
						)} */}
						
						<TodayTimeEntryStatus 
							todayEntry={todayEntry}
							isLoading={isLoadingToday}
							currentWorkedHours={currentWorkedHours}
							hasAnyTime={hasAnyTime}
						/>
						<TimeFieldsGrid
							fields={fields}
							fieldOrder={FIELD_ORDER}
							isSubmitting={isSubmitting}
							onFieldClick={handleFieldClick}
							onJustifyClick={handleJustifyClick}
							onJustificationSubmit={handleJustificationSubmit}
							onJustificationCancel={handleJustificationCancel}
							onJustificationChange={handleJustificationChange}
						/>
						
						<MonthCalendar
							markers={markers} // todayEntry?.markers
							onMarkerClick={fetchDateSelectedTimeEntry}
						/>
					

						{/* <TimeEntriesList 
							timeEntries={timeEntries}
							isLoading={isLoadingEntries}
						/> */}
					</div>
				</Section>
			</Page>
		</AuthGuard>
	)
}

interface HeaderProps {
	isLoadingToday: boolean
}

const Header: React.FC<HeaderProps> = ({ isLoadingToday }) => (
	<div>
		<h2 className='text-2xl font-semibold text-foreground'>
			Registrar Ponto {isLoadingToday && <span className="text-muted-foreground">- Carregando...</span>}
		</h2>
		<p className='text-muted-foreground mt-1'>
			Clique nos campos para registrar os horários do seu dia ou adicione justificativas
		</p>
	</div>
)

const ManagerQuickAccess: React.FC = () => (
	<Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
		<CardHeader>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
						<Users className="h-5 w-5 text-primary" />
					</div>
					<div>
						<CardTitle className="text-lg flex items-center gap-2">
							Sistema de Gerenciamento
							<Badge variant="secondary" className="text-xs">
								Manager
							</Badge>
						</CardTitle>
						<CardDescription>
							Gerencie equipes, convites e gere relatórios da organização
						</CardDescription>
					</div>
				</div>
				<Link href="/gerenciamento">
					<Button className="group">
						<Settings className="h-4 w-4 mr-2" />
						Acessar
						<ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
					</Button>
				</Link>
			</div>
		</CardHeader>
		<CardContent>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
				<div className="flex items-center gap-2 text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-green-500"></div>
					<span>Gerenciar equipes e membros</span>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-blue-500"></div>
					<span>Enviar convites de usuários</span>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<div className="h-2 w-2 rounded-full bg-purple-500"></div>
					<span>Gerar relatórios mensais</span>
				</div>
			</div>
		</CardContent>
	</Card>
)

interface TimeFieldsGridProps {
	fields: Record<FieldName, import('@/types/time-entry').TimeField>
	fieldOrder: FieldName[]
	isSubmitting: Record<FieldName, boolean>
	onFieldClick: (fieldName: FieldName) => void
	onJustifyClick: (fieldName: FieldName) => void
	onJustificationSubmit: (fieldName: FieldName) => void
	onJustificationCancel: (fieldName: FieldName) => void
	onJustificationChange: (fieldName: FieldName, value: string) => void
}

const TimeFieldsGrid: React.FC<TimeFieldsGridProps> = ({
	fields,
	fieldOrder,
	isSubmitting,
	onFieldClick,
	onJustifyClick,
	onJustificationSubmit,
	onJustificationCancel,
	onJustificationChange
}) => (
	<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
		{fieldOrder.map(fieldName => (
			<TimeFieldComponent
				key={fieldName}
				fieldName={fieldName}
				field={fields[fieldName]}
				isSubmitting={isSubmitting[fieldName]}
				onFieldClick={onFieldClick}
				onJustifyClick={onJustifyClick}
				onJustificationSubmit={onJustificationSubmit}
				onJustificationCancel={onJustificationCancel}
				onJustificationChange={onJustificationChange}
			/>
		))}
	</div>
)

export default Index
