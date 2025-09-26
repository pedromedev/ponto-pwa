export interface Team {
  id: number
  name: string
  description?: string
  managerId: number
  manager: {
    id: number
    name: string
    email: string
  }
  memberCount: number
  members?: TeamMember[]
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: number
  name: string
  email: string
  role: 'MANAGER' | 'MEMBER'
  joinedAt: string
}

export interface CreateTeamRequest {
  name: string
  description?: string
  managerId: number
}

export interface UpdateTeamRequest {
  name?: string
  description?: string
  managerId?: number
}

export interface Invitation {
  id: number
  email: string
  name?: string
  role: 'MANAGER' | 'MEMBER'
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  invitedAt: string
  invitedBy: {
    id: number
    name: string
    email: string
  }
  teamId?: number
  team?: {
    id: number
    name: string
  }
}

export interface CreateInvitationRequest {
  email: string
  name?: string
  role: 'MANAGER' | 'MEMBER'
  teamId?: number
}

export interface OrganizationStats {
  totalTeams: number
  totalMembers: number
  pendingInvitations: number
  activeTeams: number
}

export interface ReportFilters {
  year: number
  month: number
  teamId?: number | null // null para "Toda organização"
}

export interface AddMemberRequest {
  userId: number
  teamId: number
}

export interface RemoveMemberRequest {
  userId: number
  teamId: number
} 