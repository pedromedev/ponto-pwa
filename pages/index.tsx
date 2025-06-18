import React from 'react'
import Page from '@/components/page'
import Section from '@/components/section'
import AuthGuard from '@/components/auth-guard'
import { Button } from '@/components/ui/button'
import { TimeFieldComponent } from '@/components/time-field-component'
import { useTimeEntry } from '@/hooks/use-time-entry'
import { FieldName } from '@/types/time-entry'

const FIELD_ORDER: FieldName[] = ['clockIn', 'lunchStart', 'lunchEnd', 'clockOut']

const Index = () => {
	const {
		fields,
		isSubmitting,
		isAllFieldsFilled,
		handleFieldClick,
		handleJustifyClick,
		handleJustificationSubmit,
		handleJustificationCancel,
		handleJustificationChange,
		handleSubmit
	} = useTimeEntry()

	return (
		<AuthGuard>
			<Page>
				<Section>
					<div className="space-y-6">
						<Header />
						<TimeFieldsGrid
							fields={fields}
							fieldOrder={FIELD_ORDER}
							onFieldClick={handleFieldClick}
							onJustifyClick={handleJustifyClick}
							onJustificationSubmit={handleJustificationSubmit}
							onJustificationCancel={handleJustificationCancel}
							onJustificationChange={handleJustificationChange}
						/>
						{isAllFieldsFilled && (
							<SubmitButton
								onSubmit={handleSubmit}
								isSubmitting={isSubmitting}
							/>
						)}
					</div>
				</Section>
			</Page>
		</AuthGuard>
	)
}

const Header = () => (
	<div>
		<h2 className='text-2xl font-semibold text-foreground'>
			Registrar Ponto
		</h2>
		<p className='text-muted-foreground mt-1'>
			Clique nos campos para registrar os horários do seu dia
		</p>
	</div>
)

interface TimeFieldsGridProps {
	fields: Record<FieldName, import('@/types/time-entry').TimeField>
	fieldOrder: FieldName[]
	onFieldClick: (fieldName: FieldName) => void
	onJustifyClick: (fieldName: FieldName) => void
	onJustificationSubmit: (fieldName: FieldName) => void
	onJustificationCancel: (fieldName: FieldName) => void
	onJustificationChange: (fieldName: FieldName, value: string) => void
}

const TimeFieldsGrid: React.FC<TimeFieldsGridProps> = ({
	fields,
	fieldOrder,
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
				onFieldClick={onFieldClick}
				onJustifyClick={onJustifyClick}
				onJustificationSubmit={onJustificationSubmit}
				onJustificationCancel={onJustificationCancel}
				onJustificationChange={onJustificationChange}
			/>
		))}
	</div>
)

interface SubmitButtonProps {
	onSubmit: () => void
	isSubmitting: boolean
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
	onSubmit,
	isSubmitting
}) => (
	<div className="flex justify-center pt-6 animate-in slide-in-from-bottom-3 duration-500">
		<Button
			onClick={onSubmit}
			disabled={isSubmitting}
			size="lg"
			className="px-8 py-3 text-base font-medium"
		>
			{isSubmitting ? 'Registrando...' : 'Registrar Ponto'}
		</Button>
	</div>
)

export default Index
