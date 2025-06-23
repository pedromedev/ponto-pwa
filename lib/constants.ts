export const DEFAULT_ORGANIZATION_ID = 1

export const API_ROUTES = {
  TIME_ENTRY: {
    PUNCH: '/time-entry/punch',
    TODAY: (userId: number) => `/time-entry/today/${userId}`,
    USER: (userId: number) => `/time-entry/user/${userId}`,
    CREATE: '/time-entry'
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  }
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
  USER_DATA: 'user-data'
} as const

export const COOKIE_CONFIG = {
  AUTH_TOKEN: {
    name: 'auth-token',
    maxAge: 60 * 60 * 24 * 7 // 7 dias
  }
} as const

export const MESSAGES = {
  SUCCESS: {
    PUNCH_REGISTERED: (fieldName: string) => `${getFieldDisplayName(fieldName)} registrada com sucesso!`,
    JUSTIFICATION_SAVED: 'Justificativa registrada com sucesso!',
    RETROACTIVE_SAVED: 'Pontos retroativos registrados com sucesso!',
    USER_CREATED: 'Usuário criado com sucesso! Faça login para continuar.'
  },
  ERROR: {
    EMPTY_JUSTIFICATION: 'Justificativa não pode estar vazia',
    INVALID_DATE: 'Data inválida',
    MISSING_DATE: 'Selecione uma data',
    MISSING_TIME: 'Preencha pelo menos um horário',
    CONNECTION_ERROR: 'Erro de conexão',
    TOKEN_EXPIRED: 'Token expirado',
    PUNCH_ERROR: (fieldName: string) => `Erro ao registrar ${getFieldDisplayName(fieldName).toLowerCase()}`,
    JUSTIFICATION_ERROR: 'Erro ao enviar justificativa',
    RETROACTIVE_ERROR: 'Erro ao registrar pontos retroativos',
    TODAY_LOAD_ERROR: 'Erro ao carregar ponto do dia',
    ENTRIES_LOAD_ERROR: 'Erro ao carregar histórico de pontos'
  }
} as const

const getFieldDisplayName = (fieldName: string): string => {
  const names: Record<string, string> = {
    clockIn: 'Entrada',
    lunchStart: 'Início do almoço',
    lunchEnd: 'Fim do almoço',
    clockOut: 'Saída'
  }
  return names[fieldName] || fieldName
} 