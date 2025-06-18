import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TimeField, FieldName, FIELD_LABELS } from '@/types/time-entry'

interface TimeFieldComponentProps {
  fieldName: FieldName
  field: TimeField
  onFieldClick: (fieldName: FieldName) => void
  onJustifyClick: (fieldName: FieldName) => void
  onJustificationSubmit: (fieldName: FieldName) => void
  onJustificationCancel: (fieldName: FieldName) => void
  onJustificationChange: (fieldName: FieldName, value: string) => void
}

export const TimeFieldComponent: React.FC<TimeFieldComponentProps> = ({
  fieldName,
  field,
  onFieldClick,
  onJustifyClick,
  onJustificationSubmit,
  onJustificationCancel,
  onJustificationChange
}) => {
  const label = FIELD_LABELS[fieldName]

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
          onClick={() => onFieldClick(fieldName)}
          className={`cursor-pointer transition-all duration-200 ${
            field.isJustified 
              ? 'border-green-500 bg-green-50 dark:bg-green-950/20 cursor-not-allowed' 
              : 'hover:border-primary'
          } ${field.value ? 'text-foreground' : 'text-muted-foreground'}`}
        />
        
        {field.value && !field.isJustified && (
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
        
        {field.isJustified && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 text-xs font-medium">
            Justificado
          </div>
        )}
      </div>

      {field.showJustificationForm && (
        <div className="space-y-3 p-4 border rounded-lg bg-muted/50 animate-in slide-in-from-top-2 duration-300">
          <label className="text-sm font-medium text-foreground">
            Justificar {label}
          </label>
          <textarea
            value={field.justification}
            onChange={(e) => onJustificationChange(fieldName, e.target.value)}
            placeholder="Digite sua justificativa..."
            className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-background"
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onJustificationCancel(fieldName)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onJustificationSubmit(fieldName)}
            >
              Salvar Justificativa
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}