import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { CreateTimeEntryDto, FieldName, FIELD_LABELS, TimeEntryData, TimeEntryResponse } from '@/types/time-entry'
import { RetroactiveFormData } from '@/types/form'

import Page from '@/components/page'
import Section from '@/components/section'
import AuthGuard from '@/components/auth-guard'
import { Breadcrumb } from '@/components/breadcrumb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { TimeInput } from '@/components/ui/time-input'
import { TimeEntriesList } from '@/components/time-entries-list'

import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { parseDate, createTimeFromDateAndTime, getDayName, getCurrentDateISO, formatDateBR, getDateISO, formatTime, formatTimeBR } from '@/lib/date-utils'
import { DEFAULT_ORGANIZATION_ID, API_ROUTES, MESSAGES } from '@/lib/constants'

import { toast } from 'sonner'
import { Calendar, Clock, Save, ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { useTimeEntry } from '@/hooks/use-time-entry'


const RetroativoPage = () => {

  const { user } = useAuth()
  const { timeEntries, fetchTimeEntriesPerMonth } = useTimeEntry()
  const router = useRouter()
  const params = useSearchParams()

  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const [ dateParam, setDateParam ] = useState( params.get('date') ? formatDateBR(new Date(params.get('date') || '')) : '' )
  const [ entry, setEntry ] = useState<TimeEntryResponse>()

  const [formData, setFormData] = useState<RetroactiveFormData>( {
    
    date: dateParam || '',
    clockIn: '',
    lunchStart: '',
    lunchEnd: '',
    clockOut: '',
    clockInJustification: '',
    lunchStartJustification: '',
    lunchEndJustification: '',
    clockOutJustification: ''
    
  })

  useEffect(() => {
    if (timeEntries.length > 0 && dateParam) {
      const timeEntriesFiltred = timeEntries.filter(entry => entry.date.split('T')[0] === getDateISO(dateParam))
      if (timeEntriesFiltred.length > 0) {
        const foundEntry = timeEntriesFiltred[0]
        setEntry(foundEntry)
        
        // Também atualizar o formData com os dados do entry encontrado
        setFormData(prev => ({
          ...prev,
          clockIn: formatTime(foundEntry.clockIn )|| '',
          lunchStart: formatTime(foundEntry.lunchStart) || '',
          lunchEnd: formatTime(foundEntry.lunchEnd) || '',
          clockOut: formatTime(foundEntry.clockOut) || '',
          clockInJustification: foundEntry.clockInJustification || '',
          lunchStartJustification: foundEntry.lunchStartJustification || '',
          lunchEndJustification: foundEntry.lunchEndJustification || '',
          clockOutJustification: foundEntry.clockOutJustification || ''
        }))
      }
    }
  }, [timeEntries, dateParam])

  const handleDateChange = (value: string) => {

    setFormData(prev => ({
      ...prev,
      ['date']: value
    }))

    const timeEntriesFiltred = timeEntries.filter(entry => entry.date.split('T')[0] === getDateISO(value))
    if (timeEntriesFiltred.length === 0) {
      setEntry(undefined)
      setFormData(prev => ({
        ...prev,
        clockIn: '',
        lunchStart: '',
        lunchEnd: '',
        clockOut: '',
        clockInJustification: '',
        lunchStartJustification: '',
        lunchEndJustification: '',
        clockOutJustification: ''
      }))
      return
    }
    
    const foundEntry = timeEntriesFiltred[0]
    setEntry(foundEntry)

    setFormData(prev => ({
      ...prev,
      clockIn: formatTimeBR(foundEntry.clockIn )|| '',
      lunchStart: formatTimeBR(foundEntry.lunchStart) || '',
      lunchEnd: formatTimeBR(foundEntry.lunchEnd) || '',
      clockOut: formatTimeBR(foundEntry.clockOut) || '',
      clockInJustification: foundEntry.clockInJustification || '',
      lunchStartJustification: foundEntry.lunchStartJustification || '',
      lunchEndJustification: foundEntry.lunchEndJustification || '',
      clockOutJustification: foundEntry.clockOutJustification || ''
    }))
    
  }

  const handleInputChange = (field: keyof RetroactiveFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.date) {
      toast.error(MESSAGES.ERROR.MISSING_DATE)
      return
    }

    if (!formData.clockIn && !formData.lunchStart && !formData.lunchEnd && !formData.clockOut) {
      toast.error(MESSAGES.ERROR.MISSING_TIME)
      return
    }

    setIsSubmitting(true)

    try {
      const selectedDate = parseDate(formData.date)
      if (!selectedDate) {
        throw new Error(MESSAGES.ERROR.INVALID_DATE)
      }

      const timeEntryData: CreateTimeEntryDto = {
        userId: user?.id || 0,
        organizationId: DEFAULT_ORGANIZATION_ID,
        date: selectedDate
      }

      if (formData.clockIn) {
        timeEntryData.clockIn = createTimeFromDateAndTime(selectedDate, formData.clockIn)
        if (formData.clockInJustification) {
          timeEntryData.clockInJustification = formData.clockInJustification
        }
      }

      if (formData.lunchStart) {
        timeEntryData.lunchStart = createTimeFromDateAndTime(selectedDate, formData.lunchStart)
        if (formData.lunchStartJustification) {
          timeEntryData.lunchStartJustification = formData.lunchStartJustification
        }
      }

      if (formData.lunchEnd) {
        timeEntryData.lunchEnd = createTimeFromDateAndTime(selectedDate, formData.lunchEnd)
        if (formData.lunchEndJustification) {
          timeEntryData.lunchEndJustification = formData.lunchEndJustification
        }
      }

      if (formData.clockOut) {
        timeEntryData.clockOut = createTimeFromDateAndTime(selectedDate, formData.clockOut)
        if (formData.clockOutJustification) {
          timeEntryData.clockOutJustification = formData.clockOutJustification
        }
      }

      if (entry === undefined) {
        await api.post(API_ROUTES.TIME_ENTRY.CREATE, timeEntryData, true)
      } else {
        await api.put(API_ROUTES.TIME_ENTRY.BY_ID(entry.id), timeEntryData, true)
      }     

      toast.success(MESSAGES.SUCCESS.RETROACTIVE_SAVED)
      fetchTimeEntriesPerMonth()
      
      // Limpar formulário
      setFormData({
        date: '',
        clockIn: '',
        lunchStart: '',
        lunchEnd: '',
        clockOut: '',
        clockInJustification: '',
        lunchStartJustification: '',
        lunchEndJustification: '',
        clockOutJustification: ''
      })

    } catch (error: any) {
      toast.error(error.message || MESSAGES.ERROR.RETROACTIVE_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  	return (
		<AuthGuard>
			<Page>
				<Section>
					<Breadcrumb />
					<div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className='text-2xl font-semibold text-foreground flex items-center gap-2'>
                  <Calendar className="h-6 w-6" />
                  Registro Retroativo
                </h2>
                <p className='text-muted-foreground mt-1'>
                  Registre pontos de dias anteriores que podem ter sido esquecidos
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <DatePicker
                    value={ formData.date}
                    onChange={(date) => handleDateChange(date)}
                    maxDate={getCurrentDateISO()}
                    placeholder="dd/mm/aaaa"
                  />
                  {formData.date && (
                    <p className="text-xs text-muted-foreground">
                      Data selecionada: {formData.date} ({getDayName(formData.date)})
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['clockIn', 'lunchStart', 'lunchEnd', 'clockOut'] as FieldName[]).map((fieldName) => (
                    <div key={fieldName} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Label className="font-medium">{FIELD_LABELS[fieldName]}</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <TimeInput
                          value={(formData[fieldName])}
                          onChange={(time) => handleInputChange(fieldName, time)}
                          placeholder="HH:MM"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${fieldName}Justification`}>Justificativa (opcional)</Label>
                        <Input
                          id={`${fieldName}Justification`}
                          type="text"
                          placeholder="Ex: Esqueci de registrar o ponto"
                          value={formData[`${fieldName}Justification` as keyof RetroactiveFormData]}
                          onChange={(e) => handleInputChange(`${fieldName}Justification` as keyof RetroactiveFormData, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/')}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.date}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Registrando...' : 'Registrar Pontos'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
          <TimeEntriesList
            timeEntries={timeEntries}
            isLoading={false}
          />
        </Section>
      </Page>
    </AuthGuard>
  )
}

export default RetroativoPage 