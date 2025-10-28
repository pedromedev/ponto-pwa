import React, { useMemo } from 'react'

interface JustificationSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  userRole?: 'MANAGER' | 'MEMBER'
}

const JUSTIFICATION_OPTIONS = [
  'Esquecimento',
  'Atraso justificado',
  'Saída antecipada',
  'Médico/Odontólogo',
  'Compromisso acadêmico',
  'Falecimento de familiar',
  'Casamento',
  'Doação de sangue',
  'Comparecimento judicial/eleitoral',
  'Treinamento/Reunião interna',
  'Viagem a Trabalho',
  'Falha Técnica no REP/APP',
  'Intervalo estendido',
  'Falta não justificada',
  'Licença maternidade/paternidade',
  'Atividade sindical',
  'Acompanhamento de filho(a) em consulta',
  'Acompanhamento de filho(a) doente',
  'Doença em Família',
  'Falecimento de familiar',
  'Abono',
  'Falta'
]

// Opções exclusivas para administradores
const MANAGER_ONLY_OPTIONS = ['Abono', 'Falta']

export const JustificationSelect: React.FC<JustificationSelectProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Selecione uma justificativa...",
  className = "",
  userRole = 'MEMBER'
}) => {
  // Filtrar opções baseado na role do usuário
  const availableOptions = useMemo(() => {
    if (userRole === 'MANAGER') {
      return JUSTIFICATION_OPTIONS
    }
    return JUSTIFICATION_OPTIONS.filter(option => !MANAGER_ONLY_OPTIONS.includes(option))
  }, [userRole])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background ${className}`}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {availableOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export { JUSTIFICATION_OPTIONS }