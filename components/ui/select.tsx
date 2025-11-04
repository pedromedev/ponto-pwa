import React, { useMemo } from 'react'

interface JustificationSelectProps {
  justificationOptions: string[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  userRole?: 'MANAGER' | 'MEMBER'
}

// Opções exclusivas para administradores
const MANAGER_ONLY_OPTIONS = ['Abono', 'Falta']

export const JustificationSelect: React.FC<JustificationSelectProps> = ({
  justificationOptions,
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
      return justificationOptions;
    }
    return justificationOptions.filter((option: string) => !MANAGER_ONLY_OPTIONS.includes(option));
  }, [userRole, justificationOptions])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background ${className}`}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {availableOptions.map((option: string) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}