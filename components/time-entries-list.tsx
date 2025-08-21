import React from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TimeEntryResponse, FIELD_LABELS } from '@/types/time-entry'
import { formatDateBR, formatTime, calculateTimeDifference, formatMinutesToHours, formatTimeBR, formatDate, getDayName } from '@/lib/date-utils'

import { useTimeEntry } from '@/hooks/use-time-entry'

interface TimeEntriesListProps {
  timeEntries: TimeEntryResponse[],
  isLoading: boolean
}

export const TimeEntriesList: React.FC<TimeEntriesListProps> = ({
  timeEntries,
  isLoading
}) => {

  const { calculateWorkedHours } = useTimeEntry()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Histórico de Pontos</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (timeEntries.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Histórico de Pontos</h3>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum ponto registrado ainda.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 py-8">
      <h3 className="text-xl font-semibold text-foreground">Histórico de Pontos</h3>

      {/* Filtros
      <div className="flex justify-around pb-4">
        <div className='flex flex-col items-center space-x-2'>
          <h4 className="font-medium text-foreground"> Data Inicial </h4>
          <DatePicker
            onChange={() => console.log(1)}
            value={}
          />
        </div>
        <div className='flex flex-col items-center space-x-2'>
          <h4 className="font-medium text-foreground"> Data Final </h4>
          <DatePicker
            onChange={() => console.log(1)}
            value={}
          />
        </div>
      </div> */}

      
      <div className="space-y-3 max-h-60 overflow-auto">
        {timeEntries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-foreground">
                  {getDayName(entry.date) + formatDateBR(entry.date)}
                </h4>
                <span className="text-sm font-medium text-muted-foreground">
                  Horas trabalhadas: {calculateWorkedHours(entry)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <TimeSlot
                  label={FIELD_LABELS.clockIn}
                  time={formatTime(entry.clockIn)}
                  justification={entry.clockInJustification}
                />
                <TimeSlot
                  label={FIELD_LABELS.lunchStart}
                  time={formatTime(entry.lunchStart)}
                  justification={entry.lunchStartJustification}
                />
                <TimeSlot
                  label={FIELD_LABELS.lunchEnd}
                  time={formatTime(entry.lunchEnd)}
                  justification={entry.lunchEndJustification}
                />
                <TimeSlot
                  label={FIELD_LABELS.clockOut}
                  time={formatTime(entry.clockOut)}
                  justification={entry.clockOutJustification}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface TimeSlotProps {
  label: string
  time: string
  justification: string | null
}

const TimeSlot: React.FC<TimeSlotProps> = ({ label, time, justification }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground font-medium">{label}</p>
    <p className="text-sm font-mono">{time}</p>
    {justification && (
      <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
        📝 {justification}
      </p>
    )}
  </div>
) 