import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { CreateTimeEntryDto, FieldName, FIELD_LABELS, TimeEntryData, TimeEntryResponse, PunchTimeDto } from '@/types/time-entry'
import { RetroactiveFormData } from '@/types/form'

import Page from '@/components/page'
import Section from '@/components/section'
import AuthGuard from '@/components/auth-guard'
import { Breadcrumb } from '@/components/breadcrumb'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { TimeInput } from '@/components/ui/time-input'
import { TimeEntriesList } from '@/components/time-entries-list'

import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { parseDate, createTimeFromDateAndTime, getDayName, getCurrentDateISO, getDateISO, formatTime, formatTimeBR, parseString } from '@/lib/date-utils'
import { DEFAULT_ORGANIZATION_ID, API_ROUTES, MESSAGES } from '@/lib/constants'

import { toast } from 'sonner'
import { Calendar, Clock, Save, ArrowLeft } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { useTimeEntry } from '@/hooks/use-time-entry'
import { format } from 'date-fns'
import { JustificationSelect } from '@/components/ui/select'
import TimeEntriesAdmin from '@/components/time-entries-admin'
import { JustificationType } from '@/types/justifications'

interface Justifications {
  clockInJustification: string,
  lunchStartJustification: string,
  lunchEndJustification: string,
  clockOutJustification: string
}

const RetroativoPage = () => {

  const { 
    timeEntries,
    justificationTypes,
    setTimeEntries
  } = useTimeEntry()

  const { user } = useAuth()
  const isManager = user?.role === 'MANAGER'
  
  const router = useRouter()
  const params = useSearchParams()

  const [ isSubmitting, setIsSubmitting ] = useState(false)
  const [ isCompletedRegister, setIsCompletedRegister ] = useState(false)
  const [ dateParam, setDateParam ] = useState( params.get('date') )
  const [ entry, setEntry ] = useState<TimeEntryResponse>()

  const [formData, setFormData] = useState<RetroactiveFormData>({
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

  // Justificativas como objeto único, não array
  const [justifications, setJustifications] = useState<Justifications>({
    clockInJustification: '',
    lunchStartJustification: '',
    lunchEndJustification: '',
    clockOutJustification: ''
  })

  // preencher campos com entry selecionado
  const initializeFormWithEntry = (foundEntry: TimeEntryResponse, dateStr: string) => {
    
    if (foundEntry.clockIn && foundEntry.lunchStart && foundEntry.lunchEnd && foundEntry.clockOut) {
      setIsCompletedRegister(true)
    } else {
      setIsCompletedRegister(false)
    }

    setEntry(foundEntry)
    setFormData(prev => ({
      ...prev,
      date: dateStr,
      clockIn: formatTime(foundEntry.clockIn) || '',
      lunchStart: formatTime(foundEntry.lunchStart) || '',
      lunchEnd: formatTime(foundEntry.lunchEnd) || '',
      clockOut: foundEntry.clockOut ? formatTime(foundEntry.clockOut) : '',
      clockInJustification: foundEntry.clockInJustification || '',
      lunchStartJustification: foundEntry.lunchStartJustification || '',
      lunchEndJustification: foundEntry.lunchEndJustification || '',
      clockOutJustification: foundEntry.clockOutJustification || ''
    }))
  }

  // inicialização com parâmetro de URL
  useEffect(() => {

    if (dateParam) {
      try {
        const date = new Date(dateParam)
        date.setMinutes(date.getMinutes() + date.getTimezoneOffset())

        const formattedDate = format(date, 'dd/MM/yyyy')
        const dateISO = getDateISO(formattedDate)
        
        const timeEntriesFiltered = timeEntries.filter(entry => 
          entry.date.split('T')[0] === dateISO
        )
        
        if (timeEntriesFiltered.length > 0) {
          initializeFormWithEntry(timeEntriesFiltered[0], formattedDate)
        } else {
          // Se não encontrar entry, pelo menos definir a data
          
          setFormData(prev => ({
            ...prev,
            date: formattedDate
          }))
        }
      } catch (error) {
        console.log('Erro ao processar dateParam:', error)
        toast.error('Erro ao processar a data selecionada')
      }
    }
  }, [timeEntries, dateParam])

  const handleDateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      date: value,
    }))

    try {
      const dateISO = getDateISO(value)
      const timeEntriesFiltered = timeEntries.filter(entry => 
        entry.date.split('T')[0] === dateISO
      )
      
      if (timeEntriesFiltered.length === 0) {
        // Limpar entry e campos de tempo, mas manter a data
        setIsCompletedRegister(false)
        setEntry(undefined)
        setFormData(prev => ({
          ...prev,
          date: value, // Manter a data selecionada
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
      
      const foundEntry = timeEntriesFiltered[0]
      initializeFormWithEntry(foundEntry, value)
      
    } catch (error) {
      console.error('Erro ao processar mudança de data:', error)
      toast.error('Erro ao processar a data selecionada')
    }
  }

  const handleInputChange = (field: keyof RetroactiveFormData, value: string) => {
    if (field.includes('Justification')) {
      setJustifications(prev => ({
        ...prev,
        [field]: value
      }))
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      console.error("Usuário não logado")
      return
    }
    
    if (!formData.date) {
      toast.error(MESSAGES.ERROR.MISSING_DATE)
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
        date: selectedDate,
        saldoDoDia: 0.0
      }


      timeEntryData.clockIn = createTimeFromDateAndTime(selectedDate, formData.clockIn)
      if (formData.clockInJustification) {
        timeEntryData.clockInJustification = formData.clockInJustification
      }
    


      timeEntryData.lunchStart = createTimeFromDateAndTime(selectedDate, formData.lunchStart)
      if (formData.lunchStartJustification) {
        timeEntryData.lunchStartJustification = formData.lunchStartJustification
      }
    


      timeEntryData.lunchEnd = createTimeFromDateAndTime(selectedDate, formData.lunchEnd)
      if (formData.lunchEndJustification) {
        timeEntryData.lunchEndJustification = formData.lunchEndJustification
      }
    


      timeEntryData.clockOut = createTimeFromDateAndTime(selectedDate, formData.clockOut)
      if (formData.clockOutJustification) {
        timeEntryData.clockOutJustification = formData.clockOutJustification
      }
      

      let response: TimeEntryResponse
      if (entry === undefined) {
        timeEntryData.status = 'Pendente aprovação'
        response = await api.post(API_ROUTES.TIME_ENTRY.CREATE, timeEntryData, true)
        setTimeEntries([...timeEntries, response])
      }

      if (entry && !isCompletedRegister) {    
        timeEntryData.status = 'Pendente aprovação'
        response = await api.patch(API_ROUTES.TIME_ENTRY.BY_ID(entry.id), timeEntryData, true)
        setTimeEntries(timeEntries.map(timeEntry => 
          timeEntry.id === entry.id ? response : timeEntry
        ))
      } 
      
      if (entry && isCompletedRegister) {   
        // Se o registro está completo, ele só consegue justificar.
        for (const key of Object.keys(justifications)) {
          const justificationValue = justifications[key as keyof Justifications];
          if (justificationValue && justificationValue.trim() !== '') {
            // Exemplo: key = 'clockInJustification' => timeType = 'clockIn'
            const timeType = key.replace('Justification', '');
            const punchData = {
              userId: timeEntryData.userId,
              organizationId: DEFAULT_ORGANIZATION_ID,
              date: timeEntryData.date,
              timeType,
              justification: justificationValue
            };
            await api.post(API_ROUTES.TIME_ENTRY.PUNCH, punchData, true);
          }
        }

        // response = await api.patch(API_ROUTES.TIME_ENTRY.BY_ID(entry.id), timeEntryData, true)
        // setTimeEntries(timeEntries.map(timeEntry => 
        //   timeEntry.id === entry.id ? response : timeEntry
        // ))
      }

      toast.success(MESSAGES.SUCCESS.RETROACTIVE_SAVED)
      
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
      
      setEntry(undefined)
      setDateParam('')

    } catch (error: any) {
      console.error('Erro no submit:', error)
      toast.error(error.message || MESSAGES.ERROR.RETROACTIVE_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleTimeEntryClick(entry: TimeEntryResponse): void {
    setDateParam(entry.date.split('T')[0])
    
    // Scroll para o topo da página
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    toast.success('Registro selecionado com sucesso')
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

            { !isManager && (
              <Card className="p-6">
              <form id='retroativo-form' onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <DatePicker
                    value={formData.date}
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
                          disabled={isCompletedRegister} 
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`${fieldName}Justification`}>Justificativa (opcional)</Label>

                        <JustificationSelect
                            justificationOptions={justificationTypes.map((type: JustificationType) => type.justification)}
                            value={formData[`${fieldName}Justification` as keyof RetroactiveFormData]}
                            onChange={(value) => handleInputChange(`${fieldName}Justification` as keyof RetroactiveFormData, value)}
                            disabled={isSubmitting}
                            userRole={user?.role}
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
            )}

            { isManager && (
              <TimeEntriesAdmin/>
            )}
          </div>
          <TimeEntriesList
            onClick={handleTimeEntryClick}
            timeEntries={timeEntries}
            isLoading={false}
          />
        </Section>
      </Page>
    </AuthGuard>
  )
}

export default RetroativoPage