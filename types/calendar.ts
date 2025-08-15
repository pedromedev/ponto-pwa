import { TimeEntryResponse } from '@/types/time-entry'

export interface DayMarker {
  id: number
  date: Date
  status: 'complete' | 'incomplete' | 'missing' | 'holiday'
  tooltip?: string
}

export interface MonthCalendarProps {
  markers: DayMarker[]
  onNotMarkerClick?: (date: string) => void
  onMonthChange?: (date: Date) => void
}