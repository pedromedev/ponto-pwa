import React, { useState, useMemo, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TimeEntryResponse, FIELD_LABELS } from '@/types/time-entry'
import { formatDateBR, formatTime, calculateTimeDifference, formatMinutesToHours, formatTimeBR, formatDate, getDayName } from '@/lib/date-utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useTimeEntry } from '@/hooks/use-time-entry'
import { DatePicker } from './ui/date-picker'

interface TimeEntriesListProps {
  timeEntries: TimeEntryResponse[],
  isLoading: boolean,
  users?: { id: string, name: string }[]
}

export const TimeEntriesList: React.FC<TimeEntriesListProps> = ({
  timeEntries,
  isLoading,
  users = []
}) => {
  const { calculateWorkedHours } = useTimeEntry()

  // Estado dos filtros
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    status: '',
  })

  // Configurar datas iniciais (primeiro e último dia do mês atual)
  useEffect(() => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const pad = (n: number) => n.toString().padStart(2, '0')
    const format = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

    setFilters(prev => ({
      ...prev,
      startDate: format(firstDay),
      endDate: format(lastDay)
    }))
  }, [])

  // Status possíveis
  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'Correto', label: 'Correto' },
    { value: 'Fora do padrão', label: 'Fora do padrão' },
    { value: 'Sem justificativa', label: 'Sem justificativa' },
    { value: 'Pendente aprovação', label: 'Pendente aprovação' },
  ]

  // Filtragem dos timeEntries
  const filteredEntries = useMemo(() => {
    return timeEntries.filter(entry => {
      // Filtro por data
      const entryDate = entry.date.split('T')[0] // Assume formato ISO
      if (filters.startDate && entryDate < filters.startDate) return false
      if (filters.endDate && entryDate > filters.endDate) return false
      // Filtro por usuário
      if (filters.userId && String(entry.userId) !== filters.userId) return false
      // Filtro por status
      if (filters.status && entry.status !== filters.status) return false
      return true
    })
  }, [timeEntries, filters])

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

  return (
    <div className="space-y-4 py-8">
      <h3 className="text-xl font-semibold text-foreground">Histórico de Pontos</h3>

      {/* Filtros */}
      <Card className="mb-4">
        <div className="p-6">
          <h4 className="text-sm font-semibold mb-4">Filtros</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label>Usuário</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {filters.userId 
                      ? users.find(u => String(u.id) === filters.userId)?.name || 'Selecione um usuário'
                      : 'Todos os usuários'
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuItem onClick={() => setFilters(prev => ({ ...prev, userId: '' }))}>
                    Todos os usuários
                  </DropdownMenuItem>
                  {users.map(user => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => setFilters(prev => ({ ...prev, userId: String(user.id) }))}>
                      {user.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <Label>Status</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {filters.status 
                      ? statusOptions.find(s => s.value === filters.status)?.label
                      : 'Todos os status'
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {statusOptions.map(status => (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => setFilters(prev => ({ ...prev, status: status.value }))}>
                      {status.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-3 max-h-96 overflow-auto">

        {filteredEntries.length === 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Histórico de Pontos</h3>
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum ponto registrado ainda.</p>
            </Card>
          </div>
        )}
        
        {filteredEntries.length !== 0 && filteredEntries.map((entry) => {
          // Definir cor do status
          let statusColor = 'text-muted-foreground bg-muted';
          if (entry.status === 'Correto') statusColor = 'text-green-600 bg-green-50 border border-green-200';
          else if (entry.status === 'Fora do padrão') statusColor = 'text-yellow-700 bg-yellow-50 border border-yellow-200';
          else if (entry.status === 'Sem justificativa') statusColor = 'text-red-600 bg-red-50 border border-red-200';
          else if (entry.status === 'Pendente aprovação') statusColor = 'text-orange-600 bg-orange-50 border border-orange-200';

          return (
            <Card key={entry.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h4 className="font-medium text-foreground">
                      {getDayName(entry.date) + formatDateBR(entry.date)}
                    </h4>
                    <span className="text-sm font-medium text-muted-foreground">
                      Horas trabalhadas: {calculateWorkedHours(entry)}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded ${statusColor}`}>{entry.status}</span>
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
          );
        })}
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
      <p className="text-xs px-2 py-1 rounded border border-orange-200">
        📝 {justification}
      </p>
    )}
  </div>
) 