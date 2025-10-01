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

export interface PunchTimeDto {
  userId: number
  organizationId: number
  timeType: 'clockIn' | 'lunchStart' | 'lunchEnd' | 'clockOut'
  justification?: string
  timestamp?: string
  date?: string
}

// DTO para criação completa de time entry (retroativo)
export interface CreateTimeEntryDto {
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
  status?: string
}

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

export interface TimeEntryResponse {
  id: number
  userId: number
  userName: string
  organizationId: number
  date: string
  clockIn: string | null
  lunchStart: string | null
  lunchEnd: string | null
  clockOut: string | null
  clockInJustification: string | null
  lunchStartJustification: string | null
  lunchEndJustification: string | null
  clockOutJustification: string | null
  createdAt: string
  updatedAt: string
  status: string
}

// Novo tipo para response do ponto do dia
export interface TodayTimeEntryResponse {
  id: number | null
  userId: number
  date: string
  clockIn: string | null
  lunchStart: string | null
  lunchEnd: string | null
  clockOut: string | null
  clockInJustification: string | null
  lunchStartJustification: string | null
  lunchEndJustification: string | null
  clockOutJustification: string | null
}

export interface TimeEntryWithUserResponse extends TimeEntryResponse {
  userName: string;
  userRole: 'MANAGER' | 'MEMBER';
  calculatedHoursWorked: number; // Calculado no backend
  calculatedDaysWorked: number;
  calculatedAbsences: number;
  calculatedBankHours: number;
  calculatedAvgHoursPerDay: number;
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