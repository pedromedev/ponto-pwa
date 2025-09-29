import { 
  format,
  parse,
  differenceInMinutes,
  startOfDay,
  setHours,
  setMinutes,
  startOfMonth,
  endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatDateInFull= (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const dateFusoHorario = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
  return format(dateFusoHorario, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
}

export const formatDate= (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR })
}

export const formatDateBR= (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const dateFusoHorario = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000)
  return format(dateFusoHorario, 'dd/MM/yyyy', { locale: ptBR })
}

export const formatTimeBR= (date: Date | string | null): string => {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'HH:mm')
}

export const formatFusoHorario = (date: Date): Date => {
  const dateFusoHorario = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return dateFusoHorario
}

export const formatTime = (time: Date | string | null): string => {
  if (!time) return '--:--'
  const dateObj = typeof time === 'string' ? new Date(time) : time
  return format(dateObj, 'HH:mm')
}

export const getCurrentTime = (date?: Date): string => {
  return format(date || new Date(), 'HH:mm')
}

export const getCurrentDateISO = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

export const getDateISO = (date: string): string => {
  const parsed = parse(date, 'dd/MM/yyyy', new Date())
  return format(new Date(parsed), 'yyyy-MM-dd')
}

export const parseDate = (dateStr: string | null): Date | null => {
  if (!dateStr || dateStr.length !== 10) return null
  
  try {
    return parse(dateStr, 'dd/MM/yyyy', new Date())
  } catch {
    return null
  }
}

export const parseString = (dateObj: Date | null): String | null => {
  if (!dateObj) return null

  try{
    return format(dateObj, 'dd/MM/yyyy')
  } catch {
    return null
  }

}

export const parseTimeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

export const formatMinutesToHours = (totalMinutes: number): string => {
  if (totalMinutes <= 0) return '0h00m'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  
  return `${hours}h${minutes.toString().padStart(2, '0')}m`
}

export const createTimeFromDateAndTime = (date: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number)
  return setMinutes(setHours(startOfDay(date), hours), minutes)
}

export const calculateTimeDifference = (start: Date, end: Date): number => {
  return differenceInMinutes(end, start)
}

export const getDayName = (date: Date | string): string => {

  try {
    const dateObj = typeof date === 'string' ? parseDate(date) : date
    if (!dateObj) return ''
    return format(dateObj, 'EEEE', { locale: ptBR })
  } catch (e) {
    return 'Não definido'
  }

}

export const getMonthStartDate = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return startOfMonth(dateObj)
}

export const getMonthEndDate = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return endOfMonth(dateObj)
}

export const getMonthStartDateISO = (date: Date | string): string => {
  return format(getMonthStartDate(date), 'yyyy-MM-dd')
}

export const getMonthEndDateISO = (date: Date | string): string => {
  return format(getMonthEndDate(date), 'yyyy-MM-dd')
}