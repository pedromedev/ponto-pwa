import React, { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string // formato dd/MM/yyyy
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  maxDate?: string // formato yyyy-MM-dd
  minDate?: string // formato yyyy-MM-dd
  className?: string
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const DatePicker: React.FC<DatePickerProps> = ({
  value = '',
  onChange,
  placeholder = 'dd/mm/aaaa',
  disabled = false,
  maxDate,
  minDate,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth())
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear())
  const [inputValue, setInputValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Converter dd/MM/yyyy para Date
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.length !== 10) return null
    const [day, month, year] = dateStr.split('/')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return isNaN(date.getTime()) ? null : date
  }

  // Converter Date para dd/MM/yyyy
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Validar se a data está dentro dos limites
  const isDateInRange = (date: Date): boolean => {
    if (minDate) {
      const min = new Date(minDate)
      if (date < min) return false
    }
    if (maxDate) {
      const max = new Date(maxDate)
      if (date > max) return false
    }
    return true
  }

  // Gerar calendário do mês
  const generateCalendar = () => {
    const firstDay = new Date(displayYear, displayMonth, 1)
    const lastDay = new Date(displayYear, displayMonth + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const calendar: Date[] = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      calendar.push(date)
    }

    return calendar
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    
    if (val.length >= 2) {
      val = val.substring(0, 2) + '/' + val.substring(2)
    }
    if (val.length >= 5) {
      val = val.substring(0, 5) + '/' + val.substring(5, 9)
    }
    
    setInputValue(val)
    
    if (val.length === 10) {
      const parsedDate = parseDate(val)
      if (parsedDate && isDateInRange(parsedDate)) {
        onChange(val)
        setDisplayMonth(parsedDate.getMonth())
        setDisplayYear(parsedDate.getFullYear())
      }
    }
  }

  const handleDateSelect = (date: Date) => {
    if (!isDateInRange(date)) return
    
    const formatted = formatDate(date)
    setInputValue(formatted)
    onChange(formatted)
    setIsOpen(false)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (displayMonth === 0) {
        setDisplayMonth(11)
        setDisplayYear(displayYear - 1)
      } else {
        setDisplayMonth(displayMonth - 1)
      }
    } else {
      if (displayMonth === 11) {
        setDisplayMonth(0)
        setDisplayYear(displayYear + 1)
      } else {
        setDisplayMonth(displayMonth + 1)
      }
    }
  }

  const selectedDate = parseDate(inputValue)
  const today = new Date()
  const calendar = generateCalendar()

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-10"
          maxLength={10}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-md border bg-popover p-3 shadow-md">
          {/* Header do calendário */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('prev')}
              className="h-7 w-7"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm font-medium">
              {MONTHS[displayMonth]} {displayYear}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => navigateMonth('next')}
              className="h-7 w-7"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="h-8 text-xs font-medium text-muted-foreground flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {calendar.map((date, index) => {
              const isCurrentMonth = date.getMonth() === displayMonth
              const isSelected = selectedDate && 
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth() &&
                date.getFullYear() === selectedDate.getFullYear()
              const isToday = 
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
              const isDisabled = !isDateInRange(date)

              return (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDateSelect(date)}
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8 p-0 font-normal",
                    !isCurrentMonth && "text-muted-foreground opacity-50",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isToday && !isSelected && "bg-accent text-accent-foreground",
                    isDisabled && "opacity-30 cursor-not-allowed"
                  )}
                >
                  {date.getDate()}
                </Button>
              )
            })}
          </div>

          {/* Botão hoje */}
          <div className="mt-3 flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDateSelect(today)}
              disabled={!isDateInRange(today)}
              className="text-xs"
            >
              Hoje
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}