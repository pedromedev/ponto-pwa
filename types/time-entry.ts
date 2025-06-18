export interface TimeField {
  value: string | null
  isJustified: boolean
  justification: string
  showJustificationForm: boolean
}

export interface TimeEntryFields {
  clockIn: TimeField
  lunchStart: TimeField
  lunchEnd: TimeField
  clockOut: TimeField
}

export type FieldName = keyof TimeEntryFields

export interface TimeEntryData {
  userId: number
  organizationId: number
  date: Date
  clockIn?: Date
  lunchStart?: Date
  lunchEnd?: Date
  clockOut?: Date
  clockInJustification?: string
  lunchStartJustification?: string
  lunchEndJustification?: string
  clockOutJustification?: string
}

export const FIELD_LABELS: Record<FieldName, string> = {
  clockIn: 'Entrada',
  lunchStart: 'Início do Almoço',
  lunchEnd: 'Fim do Almoço',
  clockOut: 'Saída'
}

export const INITIAL_FIELD_STATE: TimeField = {
  value: null,
  isJustified: false,
  justification: '',
  showJustificationForm: false
}

export const INITIAL_FIELDS_STATE: TimeEntryFields = {
  clockIn: { ...INITIAL_FIELD_STATE },
  lunchStart: { ...INITIAL_FIELD_STATE },
  lunchEnd: { ...INITIAL_FIELD_STATE },
  clockOut: { ...INITIAL_FIELD_STATE }
} 