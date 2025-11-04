import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import {
  TimeEntryFields,
  FieldName,
  TimeEntryResponse,
  TimeEntryWithUserResponse,
  TodayTimeEntryResponse,
  PunchTimeDto,
  INITIAL_FIELDS_STATE
} from '@/types/time-entry'

import { DayMarker } from '@/types/calendar'

import { 
  formatTime, 
  getCurrentTime, 
  parseTimeToMinutes, 
  formatMinutesToHours,
  calculateTimeDifference,
  getCurrentDateISO,
  formatFusoHorario,
  getDateISO,
  formatTimeBR
} from '@/lib/date-utils'
import { DEFAULT_ORGANIZATION_ID, API_ROUTES, MESSAGES } from '@/lib/constants'
import { JustificationType } from '@/types/justifications'

export const useTimeEntry = () => {
  const { user, isLoading: isAuthLoading } = useAuth()
  const [month, setMonth ] = useState<number>(new Date().getMonth() + 1)
  const [fields, setFields] = useState<TimeEntryFields>(INITIAL_FIELDS_STATE)
  const [justificationTypes, setJustificationTypes] = useState<JustificationType[]>([])
  const [isSubmitting, setIsSubmitting] = useState<Record<FieldName, boolean>>({
    clockIn: false,
    lunchStart: false,
    lunchEnd: false,
    clockOut: false
  })
  const [markers, setMarkers] = useState<DayMarker[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntryResponse[]>([])
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [todayEntry, setTodayEntry] = useState<TodayTimeEntryResponse | null>(null)
  const [isLoadingToday, setIsLoadingToday] = useState(false)

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) return;
    fetchTodayTimeEntry();
    fetchTimeEntriesByUser();
    fetchJustificationTypes();
  }, [isAuthLoading, user])

  useEffect(() => {
    getMarkersForEntries()
  }, [timeEntries])

  const fetchJustificationTypes = async (): Promise<void> => {
    try {
      const response = await api.get<JustificationType[]>(API_ROUTES.JUSTIFICATIONS.TYPES, true)
      setJustificationTypes(response)
    } catch (error) {
      console.error('Erro ao carregar tipos de justificativa:', error)
    }
  }
  const checkTolerancia = (date: string, clockStr: string, clockJustification: string, timeType: string): { bancoHoras: number, isJustified: boolean } => {
    // Converte data ISO 8601 em minutos totais do dia
    const timeToMinutes = (dateStr: string): number => {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        throw new Error('Formato de data inválido');
      }
      return date.getHours() * 60 + date.getMinutes();
    };

    // Valida o formato do parâmetro date (YYYY-MM-DD)
    if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error('Data base deve estar no formato YYYY-MM-DD');
    }

    if (clockStr === null) {
      return { bancoHoras: 0, isJustified: false };
    }

    let refTime: number, upperLimit: number, lowerLimit: number;

    switch (timeType) {
      case 'clockIn':
        refTime = timeToMinutes(`${date}T11:00:00.000Z`);
        upperLimit = timeToMinutes(`${date}T11:10:00.000Z`);
        lowerLimit = timeToMinutes(`${date}T10:50:00.000Z`);
        break;
      case 'lunchStart':
        refTime = timeToMinutes(`${date}T15:00:00.000Z`);
        upperLimit = timeToMinutes(`${date}T15:10:00.000Z`);
        lowerLimit = timeToMinutes(`${date}T14:50:00.000Z`);
        break;
      case 'lunchEnd':
        refTime = timeToMinutes(`${date}T16:15:00.000Z`);
        upperLimit = timeToMinutes(`${date}T16:25:00.000Z`);
        lowerLimit = timeToMinutes(`${date}T16:05:00.000Z`);
        break;
      case 'clockOut':
        refTime = timeToMinutes(`${date}T21:00:00.000Z`);
        upperLimit = timeToMinutes(`${date}T21:10:00.000Z`);
        lowerLimit = timeToMinutes(`${date}T20:50:00.000Z`);
        break;
      default:
        throw new Error('Tipo de marcação inválido');
    }

    const clockMinutes = timeToMinutes(clockStr);

    let bancoHoras = 0;
    let isJustified = clockJustification.trim() !== '';

    if (clockMinutes > upperLimit) {
      // Atrasado além da tolerância → saldo negativo
      bancoHoras = clockMinutes - refTime;
      isJustified = clockJustification.trim() !== '';
      return { bancoHoras, isJustified };
    }

    if (clockMinutes < lowerLimit) {
      // Adiantado além da tolerância → saldo positivo
      bancoHoras = clockMinutes - refTime;
      isJustified = clockJustification.trim() !== '';
      return { bancoHoras, isJustified };
    }

    // Dentro da tolerância → saldo neutro
    return { bancoHoras, isJustified };
  }

  const getMarkersForEntries = () => {

    const markersData = timeEntries.map(entry => {
  
      const dateObj = new Date(entry.date);
      const dateFusoHorario = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)

      return {
        id: entry.id,
        date: dateFusoHorario,
        status: entry.status,
        tooltip: entry.status
      }
    
    })

    setMarkers(markersData)
  }
  
  // Buscar ponto do dia atual
  const fetchTodayTimeEntry = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoadingToday(true)
      const entry = await api.get<TodayTimeEntryResponse>(API_ROUTES.TIME_ENTRY.TODAY(user.id), true)
      setTodayEntry(entry)
      
      setFields({
        clockIn: {
          value: entry.clockIn ? formatTimeBR(entry.clockIn) : null,
          isJustified: !!entry.clockInJustification,
          justification: entry.clockInJustification || '',
          showJustificationForm: false
        },
        lunchStart: {
          value: entry.lunchStart ? formatTimeBR(entry.lunchStart) : null,
          isJustified: !!entry.lunchStartJustification,
          justification: entry.lunchStartJustification || '',
          showJustificationForm: false
        },
        lunchEnd: {
          value: entry.lunchEnd ? formatTimeBR(entry.lunchEnd) : null,
          isJustified: !!entry.lunchEndJustification,
          justification: entry.lunchEndJustification || '',
          showJustificationForm: false
        },
        clockOut: {
          value: entry.clockOut ? formatTimeBR(entry.clockOut) : null,
          isJustified: !!entry.clockOutJustification,
          justification: entry.clockOutJustification || '',
          showJustificationForm: false
        }
      })
    } catch (error: any) {
      if (error.status !== 404) {
        toast.error(MESSAGES.ERROR.TODAY_LOAD_ERROR)
      }
    } finally {
      setIsLoadingToday(false)
    }
  }

  // Buscar ponto do dia selecionado
  const fetchDateSelectedTimeEntry = async (date: string | undefined ): Promise<void> => {
    
    if (!user || !date) return;

    try {
      setIsLoadingToday(true)
      const entry = await api.get<TodayTimeEntryResponse>(API_ROUTES.TIME_ENTRY.BY_DATE(user.id, getDateISO(date)), true)
      setTodayEntry(entry)
      
      setFields({
        clockIn: {
          value: entry.clockIn ? formatTimeBR(entry.clockIn) : null,
          isJustified: !!entry.clockInJustification,
          justification: entry.clockInJustification || '',
          showJustificationForm: false
        },
        lunchStart: {
          value: entry.lunchStart ? formatTimeBR(entry.lunchStart) : null,
          isJustified: !!entry.lunchStartJustification,
          justification: entry.lunchStartJustification || '',
          showJustificationForm: false
        },
        lunchEnd: {
          value: entry.lunchEnd ? formatTimeBR(entry.lunchEnd) : null,
          isJustified: !!entry.lunchEndJustification,
          justification: entry.lunchEndJustification || '',
          showJustificationForm: false
        },
        clockOut: {
          value: entry.clockOut ? formatTimeBR(entry.clockOut) : null,
          isJustified: !!entry.clockOutJustification,
          justification: entry.clockOutJustification || '',
          showJustificationForm: false
        }
      })
    } catch (error: any) {
      console.log(error)
      if (error.status !== 404) {
        toast.error(MESSAGES.ERROR.TODAY_LOAD_ERROR)
      }
    } finally {
      setIsLoadingToday(false)
    }
  }

  // Buscar histórico de time entries
  const fetchTimeEntries = async (): Promise<void> => {
    if (!user) return;

    try {
      setIsLoadingEntries(true)
      const entries = await api.get<TimeEntryResponse[]>(API_ROUTES.TIME_ENTRY.USER(user.id), true)
      setTimeEntries(entries)
    } catch (error: any) {
      toast.error(MESSAGES.ERROR.ENTRIES_LOAD_ERROR)
    } finally {
      setIsLoadingEntries(false)
    }
  }

  // Buscar histórico de entries do usuario por mês
  const fetchTimeEntriesPerMonth = async (): Promise<void> => {

    if (!user || !month) return;

    try {
      setIsLoadingEntries(true)
      const entries = await api.get<TimeEntryResponse[]>(API_ROUTES.TIME_ENTRY.BY_MONTH(user.id, month), true)
      setTimeEntries(entries)
      getMarkersForEntries()
    } catch (error: any) {
      toast.error(MESSAGES.ERROR.ENTRIES_LOAD_ERROR)
    } finally {
      setIsLoadingEntries(false)
    }
  }

  // Buscar histórico de entries do usuario por mês
  const fetchTimeEntriesByUser= async (): Promise<void> => {

    if (!user) return;

    try {
      setIsLoadingEntries(true)
      const entries = await api.get<TimeEntryResponse[]>(API_ROUTES.TIME_ENTRY.USER(user.id), true)
      setTimeEntries(entries)
      getMarkersForEntries()
    } catch (error: any) {
      toast.error(MESSAGES.ERROR.ENTRIES_LOAD_ERROR)
    } finally {
      setIsLoadingEntries(false)
    }
  }

  const calculateWorkedHours = (entry: TimeEntryResponse) => {
    if (!entry.clockIn || !entry.clockOut) return '--'
    
    const clockIn = new Date(entry.clockIn)
    const clockOut = new Date(entry.clockOut)
    const lunchStart = entry.lunchStart ? new Date(entry.lunchStart) : null
    const lunchEnd = entry.lunchEnd ? new Date(entry.lunchEnd) : null
    
    let totalMinutes = calculateTimeDifference(clockIn, clockOut)
    
    if (lunchStart && lunchEnd) {
      const lunchMinutes = calculateTimeDifference(lunchStart, lunchEnd)
      totalMinutes -= lunchMinutes
    }
    
    return formatMinutesToHours(totalMinutes)
  }


  const calculateCurrentWorkedHours = (): { 
    total: string
    details: {
      morning: string
      afternoon: string
      lunchBreak: string
    }
  } => {
    const { clockIn, lunchStart, lunchEnd, clockOut } = fields
    
    // Se não tem entrada, não há o que calcular
    if (!clockIn.value) {
      return {
        total: '0h00m',
        details: {
          morning: '0h00m',
          afternoon: '0h00m',
          lunchBreak: '0h00m'
        }
      }
    }

    const clockInMinutes = parseTimeToMinutes(clockIn.value)
    let totalWorkedMinutes = 0
    let morningMinutes = 0
    let afternoonMinutes = 0
    let lunchBreakMinutes = 0

    // Calcular período da manhã (entrada até início do almoço)
    if (lunchStart.value) {
      const lunchStartMinutes = parseTimeToMinutes(lunchStart.value)
      morningMinutes = lunchStartMinutes - clockInMinutes
      totalWorkedMinutes += morningMinutes
    }

    // Calcular tempo de almoço
    if (lunchStart.value && lunchEnd.value) {
      const lunchStartMinutes = parseTimeToMinutes(lunchStart.value)
      const lunchEndMinutes = parseTimeToMinutes(lunchEnd.value)
      lunchBreakMinutes = lunchEndMinutes - lunchStartMinutes
    }

    // Calcular período da tarde (fim do almoço até saída)
    if (lunchEnd.value && clockOut.value) {
      const lunchEndMinutes = parseTimeToMinutes(lunchEnd.value)
      const clockOutMinutes = parseTimeToMinutes(clockOut.value)
      afternoonMinutes = clockOutMinutes - lunchEndMinutes
      totalWorkedMinutes += afternoonMinutes
    } else if (lunchEnd.value && !clockOut.value) {
      const lunchEndMinutes = parseTimeToMinutes(lunchEnd.value)
      const currentMinutes = parseTimeToMinutes(getCurrentTime())
      afternoonMinutes = Math.max(0, currentMinutes - lunchEndMinutes)
      totalWorkedMinutes += afternoonMinutes
    } else if (!lunchStart.value && clockOut.value) {
      const clockOutMinutes = parseTimeToMinutes(clockOut.value)
      totalWorkedMinutes = clockOutMinutes - clockInMinutes
      morningMinutes = totalWorkedMinutes
    } else if (!lunchStart.value && !clockOut.value) {
      const currentMinutes = parseTimeToMinutes(getCurrentTime())
      totalWorkedMinutes = Math.max(0, currentMinutes - clockInMinutes)
      morningMinutes = totalWorkedMinutes
    }

    return {
      total: formatMinutesToHours(Math.max(0, totalWorkedMinutes)),
      details: {
        morning: formatMinutesToHours(Math.max(0, morningMinutes)),
        afternoon: formatMinutesToHours(Math.max(0, afternoonMinutes)),
        lunchBreak: formatMinutesToHours(Math.max(0, lunchBreakMinutes))
      }
    }
  }

  // Registrar ponto individual usando o novo endpoint
  const handleFieldClick = async (fieldName: FieldName): Promise<void> => {

    const todayDate = new Date().toISOString()

    const referenceToday = todayDate.split('T')[0]
    const referenceDate = todayEntry?.date ? todayEntry?.date.split('T')[0] : new Date().toISOString().split('T')[0];

    const isRegistrationCompleted = Object.values(fields).every(field => field.isJustified);
    const isFieldHasValue = fields[fieldName].value !== undefined && fields[fieldName].value !== null;
    const isSameDate = referenceToday === referenceDate; // Compare only year, month, day

    if (!isSameDate) {
      toast.error("Não é possível registrar o ponto para uma data diferente da data atual")
      return
    }

    if (isFieldHasValue) {
      toast.error("Horário já registrado")
      return
    }

    if (isRegistrationCompleted) {
      toast.error("Registro de horário já está completo")
      return
    }
    
    if (!user || isSubmitting[fieldName]) {
      return;
    }
    
    try {
      setIsSubmitting(prev => ({ ...prev, [fieldName]: true }))
      
      const punchData: PunchTimeDto = {
        userId: user.id,
        organizationId: DEFAULT_ORGANIZATION_ID,
        timeType: fieldName,
        timestamp: todayDate
      }
      
      await api.post(API_ROUTES.TIME_ENTRY.PUNCH, punchData, true)
      
      const currentTime = getCurrentTime(new Date())
      setFields(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          value: currentTime
        }
      }))

      toast.success(MESSAGES.SUCCESS.PUNCH_REGISTERED(fieldName))
      
      await fetchTodayTimeEntry()
      await fetchTimeEntriesPerMonth()
      
    } catch (error: any) {
      console.log('error', error)
      toast.error(`${MESSAGES.ERROR.PUNCH_ERROR(fieldName)}: ${error.message}`)
    } finally {
      setIsSubmitting(prev => ({ ...prev, [fieldName]: false }))
    }
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

  // Submeter justificativa usando o novo endpoint
  const handleJustificationSubmit = async (fieldName: FieldName): Promise<void> => {

    if (!user|| !fields[fieldName].justification.trim() || isSubmitting[fieldName]) {
      toast.error(MESSAGES.ERROR.EMPTY_JUSTIFICATION)
      return
    }

    try {
      setIsSubmitting(prev => ({ ...prev, [fieldName]: true }))
      
      const punchData: PunchTimeDto = {
        userId: user.id,
        organizationId: DEFAULT_ORGANIZATION_ID,
        date: todayEntry?.date,
        timeType: fieldName,
        justification: fields[fieldName].justification,
        ...(fields[fieldName].value ? {} : { timestamp: formatFusoHorario(new Date()).toISOString() })
      }

      await api.post(API_ROUTES.TIME_ENTRY.PUNCH, punchData, true)

      setFields(prev => ({
        ...prev,
        [fieldName]: {
          ...prev[fieldName],
          isJustified: true,
          showJustificationForm: false,
          value: prev[fieldName].value || getCurrentTime()
        }
      }))

      toast.success(MESSAGES.SUCCESS.JUSTIFICATION_SAVED)
      await fetchTodayTimeEntry()
      
    } catch (error: any) {
      toast.error(MESSAGES.ERROR.JUSTIFICATION_ERROR)
    } finally {
      setIsSubmitting(prev => ({ ...prev, [fieldName]: false }))
    }
  }

  const handleJustificationCancel = (fieldName: FieldName): void => {
    setFields(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        showJustificationForm: false,
        justification: prev[fieldName].isJustified ? prev[fieldName].justification : ''
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

  return {
    fields,
    isSubmitting,
    markers,
    timeEntries,
    isLoadingEntries,
    todayEntry,
    isLoadingToday,
    justificationTypes,
    currentWorkedHours: calculateCurrentWorkedHours(),
    setTimeEntries,
    fetchJustificationTypes,
    calculateWorkedHours,
    handleFieldClick,
    handleJustifyClick,
    handleJustificationSubmit,
    handleJustificationCancel,
    handleJustificationChange,
    fetchTodayTimeEntry,
    fetchDateSelectedTimeEntry,
    fetchTimeEntries,
    fetchTimeEntriesPerMonth,
    fetchTimeEntriesByUser,
    getMarkersForEntries,
    checkTolerancia
  }
} 