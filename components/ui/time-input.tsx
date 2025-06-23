import React, { useState, useEffect } from 'react'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface TimeInputProps {
  value?: string // formato HH:MM
  onChange: (time: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value = '',
  onChange,
  placeholder = 'HH:MM',
  disabled = false,
  className
}) => {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    
    // Limitar a 4 dígitos
    if (val.length > 4) {
      val = val.substring(0, 4)
    }
    
    // Formatação automática
    if (val.length >= 2) {
      val = val.substring(0, 2) + ':' + val.substring(2)
    }
    
    setInputValue(val)
    
    // Validar hora se completa
    if (val.length === 5) {
      const [hours, minutes] = val.split(':')
      const h = parseInt(hours)
      const m = parseInt(minutes)
      
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(val)
      }
    } else if (val.length === 0) {
      onChange('')
    }
  }

  const handleBlur = () => {
    // Validar e corrigir formato ao perder foco
    if (inputValue.length === 5) {
      const [hours, minutes] = inputValue.split(':')
      const h = Math.min(23, Math.max(0, parseInt(hours) || 0))
      const m = Math.min(59, Math.max(0, parseInt(minutes) || 0))
      
      const correctedTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      setInputValue(correctedTime)
      onChange(correctedTime)
    }
  }

  return (
    <Input
      type="text"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={cn("font-mono", className)}
      maxLength={5}
    />
  )
} 