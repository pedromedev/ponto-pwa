import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { TodayTimeEntryResponse, FieldName, FIELD_LABELS } from '@/types/time-entry'

interface TodayTimeEntryStatusProps {
  todayEntry: TodayTimeEntryResponse | null
  isLoading: boolean
  currentWorkedHours: {
    total: string
    details: {
      morning: string
      afternoon: string
      lunchBreak: string
    }
  }
  hasAnyTime: boolean
}

export const TodayTimeEntryStatus: React.FC<TodayTimeEntryStatusProps> = ({
  todayEntry,
  isLoading,
  currentWorkedHours,
  hasAnyTime
}) => {

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (!todayEntry) {
    return (
      <Card className="p-4 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <div className="flex items-center gap-2">
          <span className="text-orange-500">⏳</span>
          <div>
            <h3 className="font-medium text-orange-900 dark:text-orange-100">
              Nenhum ponto registrado hoje
            </h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              Clique nos campos para começar a registrar seu ponto
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const getStatusInfo = () => {
    const hasClockIn = !!todayEntry.clockIn
    const hasLunchStart = !!todayEntry.lunchStart
    const hasLunchEnd = !!todayEntry.lunchEnd
    const hasClockOut = !!todayEntry.clockOut

    if (!hasClockIn) {
      return { 
        style: 'orange', 
        icon: '⏳', 
        text: 'Aguardando entrada',
        description: 'Registre sua entrada para começar o dia',
        cardClass: 'border-orange-200 bg-orange-50 dark:bg-orange-950/20',
        textClass: 'text-orange-900 dark:text-orange-100',
        subTextClass: 'text-orange-700 dark:text-orange-300'
      }
    }

    if (hasClockIn && !hasLunchStart) {
      return { 
        style: 'blue', 
        icon: '🟢', 
        text: 'Trabalhando',
        description: 'Entrada registrada - registre o almoço quando for pausar',
        cardClass: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
        textClass: 'text-blue-900 dark:text-blue-100',
        subTextClass: 'text-blue-700 dark:text-blue-300'
      }
    }

    if (hasLunchStart && !hasLunchEnd) {
      return { 
        style: 'yellow', 
        icon: '🍽️', 
        text: 'Em pausa para almoço',
        description: 'Registre o fim do almoço quando voltar',
        cardClass: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20',
        textClass: 'text-yellow-900 dark:text-yellow-100',
        subTextClass: 'text-yellow-700 dark:text-yellow-300'
      }
    }

    if (hasLunchEnd && !hasClockOut) {
      return { 
        style: 'blue', 
        icon: '🟢', 
        text: 'Trabalhando (tarde)',
        description: 'Registre a saída quando terminar o expediente',
        cardClass: 'border-blue-200 bg-blue-50 dark:bg-blue-950/20',
        textClass: 'text-blue-900 dark:text-blue-100',
        subTextClass: 'text-blue-700 dark:text-blue-300'
      }
    }

    if (hasClockOut) {
      return { 
        style: 'green', 
        icon: '✅', 
        text: 'Expediente concluído',
        description: 'Todos os pontos foram registrados',
        cardClass: 'border-green-200 bg-green-50 dark:bg-green-950/20',
        textClass: 'text-green-900 dark:text-green-100',
        subTextClass: 'text-green-700 dark:text-green-300'
      }
    }

    return { 
      style: 'gray', 
      icon: '❓', 
      text: 'Status indefinido',
      description: '',
      cardClass: 'border-gray-200 bg-gray-50 dark:bg-gray-950/20',
      textClass: 'text-gray-900 dark:text-gray-100',
      subTextClass: 'text-gray-700 dark:text-gray-300'
    }
  }

  const status = getStatusInfo()
  const registeredFields = (['clockIn', 'lunchStart', 'lunchEnd', 'clockOut'] as FieldName[])
    .filter(field => todayEntry[field])

  return (
    <Card className={`p-4 ${status.cardClass}`}>
      <div className="space-y-4">
        {/* Status Principal */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{status.icon}</span>
            <div>
              <h3 className={`font-medium ${status.textClass}`}>
                {status.text}
              </h3>
              <p className={`text-sm ${status.subTextClass}`}>
                {status.description}
              </p>
            </div>
          </div>
          <div className="px-2 py-1 rounded-full border text-xs font-medium bg-background">
            {registeredFields.length}/4
          </div>
        </div>

        {/* Horas Trabalhadas */}
        {hasAnyTime && (
          <div className="pt-3 border-t border-current/20">
            <div className="flex items-center justify-center mb-3">
              <div className={`text-md font-bold font-mono ${status.textClass}`}>
                {currentWorkedHours.total}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className={`text-xs font-medium ${status.subTextClass}`}>Manhã</p>
                <p className={`text-sm font-mono ${status.textClass}`}>
                  {currentWorkedHours.details.morning}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${status.subTextClass}`}>Tarde</p>
                <p className={`text-sm font-mono ${status.textClass}`}>
                  {currentWorkedHours.details.afternoon}
                </p>
              </div>
              <div className="text-center">
                <p className={`text-xs font-medium ${status.subTextClass}`}>Almoço</p>
                <p className={`text-sm font-mono ${status.textClass}`}>
                  {currentWorkedHours.details.lunchBreak}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 