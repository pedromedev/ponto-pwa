import React from 'react'

interface JustificationSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

const JUSTIFICATION_OPTIONS = [
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
]

export const JustificationSelect: React.FC<JustificationSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Selecione uma justificativa...",
  className = ""
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background ${className}`}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {JUSTIFICATION_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export { JUSTIFICATION_OPTIONS }