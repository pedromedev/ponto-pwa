import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  TimeEntryFields,
  FieldName,
  TimeEntryData,
  INITIAL_FIELDS_STATE
} from '@/types/time-entry'

export const useTimeEntry = () => {
  const { user } = useAuth()
  const [fields, setFields] = useState<TimeEntryFields>(INITIAL_FIELDS_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getCurrentTime = (): string => {
    const now = new Date()
    return now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  const handleFieldClick = (fieldName: FieldName): void => {
    if (fields[fieldName].isJustified) return
    
    const currentTime = getCurrentTime()
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value: currentTime
      }
    }))
  }

  const handleJustifyClick = (fieldName: FieldName): void => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        showJustificationForm: true
      }
    }))
  }

  const handleJustificationSubmit = (fieldName: FieldName): void => {
    if (!fields[fieldName].justification.trim()) {
      toast.error('Justificativa não pode estar vazia')
      return
    }

    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isJustified: true,
        showJustificationForm: false
      }
    }))
    toast.success('Justificativa salva com sucesso!')
  }

  const handleJustificationCancel = (fieldName: FieldName): void => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        showJustificationForm: false,
        justification: ''
      }
    }))
  }

  const handleJustificationChange = (fieldName: FieldName, value: string): void => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        justification: value
      }
    }))
  }

  const isAllFieldsFilled = (): boolean => {
    return Object.values(fields).every(field => field.value !== null)
  }

  const createDateTime = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':')
    const today = new Date()
    today.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    return today
  }

  const buildTimeEntryData = (): TimeEntryData => {
    if (!user?.id) {
      throw new Error('Usuário não está autenticado')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return {
      userId: user.id,
      organizationId: 1, // TODO: Get from user context when available
      date: today,
      clockIn: fields.clockIn.value ? createDateTime(fields.clockIn.value) : undefined,
      lunchStart: fields.lunchStart.value ? createDateTime(fields.lunchStart.value) : undefined,
      lunchEnd: fields.lunchEnd.value ? createDateTime(fields.lunchEnd.value) : undefined,
      clockOut: fields.clockOut.value ? createDateTime(fields.clockOut.value) : undefined,
      clockInJustification: fields.clockIn.justification || undefined,
      lunchStartJustification: fields.lunchStart.justification || undefined,
      lunchEndJustification: fields.lunchEnd.justification || undefined,
      clockOutJustification: fields.clockOut.justification || undefined
    }
  }

  const handleSubmit = async (): Promise<void> => {
    if (!isAllFieldsFilled()) return

    try {
      setIsSubmitting(true)
      const timeEntryData = buildTimeEntryData()
      await api.post('/time-entry', timeEntryData, true)
      toast.success('Ponto registrado com sucesso!')
      setFields(INITIAL_FIELDS_STATE)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar ponto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    fields,
    isSubmitting,
    isAllFieldsFilled: isAllFieldsFilled(),
    handleFieldClick,
    handleJustifyClick,
    handleJustificationSubmit,
    handleJustificationCancel,
    handleJustificationChange,
    handleSubmit
  }
} 