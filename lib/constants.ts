export const DEFAULT_ORGANIZATION_ID = 1

export const API_ROUTES = {
  TIME_ENTRY: {
    PUNCH: '/time-entry/punch',
    ORGANIZATION: (organizationId: number) => `/time-entry?organizationId=${organizationId}`,
    TODAY: (userId: number) => `/time-entry/today/${userId}`,
    USER: (userId: number) => `/time-entry/user/${userId}`,
    CREATE: '/time-entry',
    BY_DATE: (userId: number, date: string) => `/time-entry/by-date/${userId}/${date}`,
    BY_COMPETENCE: (userId: number, competence: string) => `/time-entry/by-competence/${userId}/${competence}`,
    BY_ID: (id: number) => `/time-entry/${id}`
  },
  JUSTIFICATIONS: {
    TYPES: '/justification/types',
    TYPES_BY_ID: (id: number) => `/justification/types/${id}`,
    ALL: `/justification/`,
    BY_USER: (userId: number, initialDate?: string, finalDate?: string) => {
      const params = new URLSearchParams();
      if (initialDate) params.append('startDate', initialDate);
      if (finalDate) params.append('endDate', finalDate);
      if (userId) params.append('userId', userId.toString());
      return `/justification?${params.toString()}`;
    },
    PENDING: `/justification/pending/`,
    APPROVE: (justificationId: number, approverId: number) =>
      `/justification/${justificationId}/approve/${approverId}`,
    REJECT: (justificationId: number, approverId: number) =>
      `/justification/${justificationId}/reject/${approverId}`,
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  },
  ORGANIZATION: {
    TEAMS: (organizationId: number = DEFAULT_ORGANIZATION_ID) => `/organization/${organizationId}/teams`,
    TEAM: (teamId: number, organizationId: number = DEFAULT_ORGANIZATION_ID) => `/organization/${organizationId}/teams/${teamId}`,
    TEAM_MEMBERS: (teamId: number, organizationId: number = DEFAULT_ORGANIZATION_ID) => `/organization/${organizationId}/teams/${teamId}/members`,
    ADD_MEMBER: (teamId: number, organizationId: number = DEFAULT_ORGANIZATION_ID) => `/organization/${organizationId}/teams/${teamId}/members`,
    REMOVE_MEMBER: (teamId: number, userId: number, organizationId: number = DEFAULT_ORGANIZATION_ID) => `/organization/${organizationId}/teams/${teamId}/members/${userId}`,
    TEAM_TIME_ENTRIES: (teamId: number, organizationId: number = DEFAULT_ORGANIZATION_ID) => `/organization/${organizationId}/teams/${teamId}/time-entries`
  },
  REPORTS: {
    TEAM_MONTHLY: (teamId: number) => `/reports/team/${teamId}/monthly`,
    ORGANIZATION_MONTHLY: (organizationId: number = DEFAULT_ORGANIZATION_ID) => `/reports/organization/${organizationId}/monthly`,
    TEST_MONTHLY: '/reports/test/monthly'
  },
  USER: {
    BY_ID: (id: number) => `/user/${id}`,
  },
  MANAGEMENT: {
    STATS: '/management/stats',
    INVITATIONS: '/management/invitations',
    INVITATION: (id: number) => `/management/invitations/${id}`,
    AVAILABLE_USERS: '/management/users/available'
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

export const getFieldDisplayName = (fieldName: string): string => {
  const names: Record<string, string> = {
    clockIn: 'Entrada',
    lunchStart: 'Início do almoço',
    lunchEnd: 'Fim do almoço',
    clockOut: 'Saída'
  }
  return names[fieldName] || fieldName
} 