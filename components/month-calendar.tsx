import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { MonthCalendarProps, DayMarker } from '@/types/calendar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { redirect } from 'next/navigation'
import { useRouter } from 'next/router'
import { formatDateBR } from '@/lib/date-utils'

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  markers = [],
  onNotMarkerClick = () => {},
}) => {
  const [referenceMonth, setReferencMonth]= useState(new Date()) // Usa a data atual

  const router = useRouter()
  const isCurrentMonth = isSameMonth(referenceMonth, new Date())
  const monthStart = startOfMonth(referenceMonth)
  const monthEnd = endOfMonth(referenceMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // 0 = domingo
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getMarkerForDate = (date: Date): DayMarker | undefined => {
    return markers.find((marker) => isSameDay(marker.date, date))
  }

  const handleMarkerClick = (date: Date) => {

    const formattedDate = format(date, 'yyyy-MM-dd')
    router.push(`/retroativo?date=${formattedDate}`)
  }

  const handlePreviousMonth = () => {
    setReferencMonth(subMonths(referenceMonth, 1))
  }

  const handleNextMonth = () => {
    setReferencMonth(addMonths(referenceMonth, 1))
  }

  const getDayStyles = (date: Date, marker?: DayMarker) => {
    const baseStyles = 'h-10 w-10 rounded-full flex items-center justify-center text-sm'
    
    if (!isSameMonth(date, referenceMonth)) {
      return cn(baseStyles, 'text-muted-foreground opacity-50')
    }

    if (!marker) {
      return cn(baseStyles, 'hover:bg-accent cursor-pointer')
    }

    const statusStyles = {
      complete: 'bg-green-100 text-green-700 hover:bg-green-200',
      incomplete: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      missing: 'bg-red-100 text-red-700 hover:bg-red-200',
      holiday: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    }

    return cn(baseStyles, statusStyles[marker.status], 'cursor-pointer')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={handlePreviousMonth}
          size="icon"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-semibold">
          {format(referenceMonth, 'MMMM yyyy', { locale: ptBR })}
        </h2>
        <Button
          variant="ghost"
          onClick={handleNextMonth}
          size="icon"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInCalendar.map((date) => {
          const marker = getMarkerForDate(date)
          return (
            <TooltipProvider key={date.toString()}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={getDayStyles(date, marker)}
                    onClick={ () => marker === undefined ? handleMarkerClick(date) : onNotMarkerClick(formatDateBR(date)) }
                    disabled={!isSameMonth(date, referenceMonth)}
                  >
                    {format(date, 'd')}
                  </button>
                </TooltipTrigger>
                {marker?.tooltip && (
                  <TooltipContent>
                    <p>{marker.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    </div>
  )
}