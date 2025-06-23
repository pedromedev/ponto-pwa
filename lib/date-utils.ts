import { format, parse, differenceInMinutes, startOfDay, setHours, setMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
}

export const formatTime = (time: Date | string | null): string => {
  if (!time) return '--:--'
  const dateObj = typeof time === 'string' ? new Date(time) : time
  return format(dateObj, 'HH:mm')
}

export const getCurrentTime = (): string => {
  return format(new Date(), 'HH:mm')
}

export const getCurrentDateISO = (): string => {
  return format(new Date(), 'yyyy-MM-dd')
}

export const parseDate = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length !== 10) return null
  
  try {
    return parse(dateStr, 'dd/MM/yyyy', new Date())
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
  const dateObj = typeof date === 'string' ? parseDate(date) : date
  if (!dateObj) return ''
  
  return format(dateObj, 'EEEE', { locale: ptBR })
} 