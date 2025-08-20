import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TimeField, FieldName, FIELD_LABELS } from '@/types/time-entry'
import { Loader2 } from 'lucide-react'
import { JustificationSelect } from './ui/select'

interface TimeFieldComponentProps {
  fieldName: FieldName
  field: TimeField
  isSubmitting: boolean
  onFieldClick: (fieldName: FieldName) => void
  onJustifyClick: (fieldName: FieldName) => void
  onJustificationSubmit: (fieldName: FieldName) => void
  onJustificationCancel: (fieldName: FieldName) => void
  onJustificationChange: (fieldName: FieldName, value: string) => void
}

export const TimeFieldComponent: React.FC<TimeFieldComponentProps> = ({
  fieldName,
  field,
  isSubmitting,
  onFieldClick,
  onJustifyClick,
  onJustificationSubmit,
  onJustificationCancel,
  onJustificationChange
}) => {

  const label = FIELD_LABELS[fieldName]
  const justificationOptions = [
    'Licença maternidade/paternidade',
    'Licença casamento',
    'Licença luto',
    'Doação de sangue',
    'Convocação judicial/militar',
    'Atestado médico',
    'Consulta médica/odontológica',
    'Doença em família',
    'Falecimento de familiar',
    'Atraso de transporte público/trânsito',
    'Compromisso pessoal previamente autorizado',
    'Compromisso acadêmico (prova, aula, etc.)',
    'Home office (quando não estava previsto)',
    'Férias'
  ];

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        {label}
      </label>
      
      <div className="relative group">
        <Input
          type="text"
          value={field.value || ''}
          placeholder="--:--"
          readOnly
          onClick={() => {
            if (!isSubmitting) {
              onFieldClick(fieldName)
            }
          }}
          className={`cursor-pointer transition-all duration-200 ${
            field.isJustified 
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
              : isSubmitting
              ? 'cursor-wait opacity-50'
              : 'hover:border-primary cursor-pointer'
          } ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
          disabled={isSubmitting}
        />
        
        {/* Indicador de carregamento */}
        {isSubmitting && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-primary">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
        
        {/* Botão de justificar */}
        {field.value && !field.isJustified && !isSubmitting && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onJustifyClick(fieldName)}
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105 bg-background hover:bg-accent"
          >
            Justificar
          </Button>
        )}
        
        {/* Indicador de justificado */}
        {field.isJustified && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium flex items-center gap-1">
            <span className="text-green-500">✓</span>
            Justificado
          </div>
        )}
      </div>

      {/* Formulário de justificativa */}
      {field.showJustificationForm && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/50 animate-in slide-in-from-top-2 duration-300">
          <label className="text-sm font-medium text-foreground">
            Justificar {label}
          </label>

           <JustificationSelect
              value={field.justification}
              onChange={(value) => onJustificationChange(fieldName, value)}
              disabled={isSubmitting}
            />

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onJustificationCancel(fieldName)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onJustificationSubmit(fieldName)}
              disabled={isSubmitting || !field.justification.trim()}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Salvando...
                </div>
              ) : (
                'Salvar Justificativa'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Mostrar justificativa salva */}
      {field.isJustified && field.justification && (
        <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20 border-green-200">
          <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">
            Justificativa:
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            {field.justification}
          </p>
        </div>
      )}
    </div>
  )
}