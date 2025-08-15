export interface DayMarker {
  id: number
  date: Date
  status: 'complete' | 'incomplete' | 'missing' | 'holiday'
  tooltip?: string
}

export interface MonthCalendarProps {
  markers: DayMarker[]
  onDateSelect?: (date: Date) => void
  onMonthChange?: (date: Date) => void
}