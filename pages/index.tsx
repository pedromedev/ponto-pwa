import React from 'react'
import Page from '@/components/page'
import Section from '@/components/section'
import AuthGuard from '@/components/auth-guard'
import { TimeFieldComponent } from '@/components/time-field-component'
import { TimeEntriesList } from '@/components/time-entries-list'
import { TodayTimeEntryStatus } from '@/components/today-timeentry-status'
import { useTimeEntry } from '@/hooks/use-time-entry'
import { FieldName } from '@/types/time-entry'

const FIELD_ORDER: FieldName[] = ['clockIn', 'lunchStart', 'lunchEnd', 'clockOut']

const Index = () => {
	const {
		fields,
		isSubmitting,
		timeEntries,
		isLoadingEntries,
		todayEntry,
		isLoadingToday,
		currentWorkedHours,
		handleFieldClick,
		handleJustifyClick,
		handleJustificationSubmit,
		handleJustificationCancel,
		handleJustificationChange,
		fetchTodayTimeEntry
	} = useTimeEntry()

	// Verificar se pelo menos a entrada foi preenchida para mostrar o cálculo
	const hasAnyTime = fields.clockIn.value !== null

	return (
		<AuthGuard>
			<Page>
				<Section>
					<div className="space-y-8">
						<Header isLoadingToday={isLoadingToday} />
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
						<TimeEntriesList 
							timeEntries={timeEntries}
							isLoading={isLoadingEntries}
						/>
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
