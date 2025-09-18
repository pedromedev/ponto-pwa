export interface DayMarker {
  id: number
  date: Date
  status: string //'complete' | 'incomplete' | 'missing' | 'holiday'
  tooltip?: string
}

export interface MonthCalendarProps {
  markers: DayMarker[]
  onMarkerClick?: (date: string) => void
  onMonthChange?: (date: Date) => void
}