import { useState, useEffect } from 'react'
import { NextPageWithLayout } from '@/pages/_app'
import Page from '@/components/page'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  OrganizationStats, 
  Team, 
  Invitation, 
  CreateTeamRequest, 
  CreateInvitationRequest,
  ReportFilters,
} from '@/types/management'
import { User } from "@/types/user"
import { api } from '@/lib/api'
import { API_ROUTES, DEFAULT_ORGANIZATION_ID } from '@/lib/constants'
import { toast } from 'sonner'
import { 
  Users, 
  UserPlus, 
  Mail, 
  Download, 
  Send, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  X,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react'
import TeamMembersModal from '@/components/team-members-modal'
import ManagerGuard from '@/components/manager-guard'
import Dashboard from '@/components/dashboard-admin'
import { TimeEntryWithUserResponse } from '@/types/time-entry'

const GerenciamentoPage: NextPageWithLayout = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'teams' | 'invitations' | 'reports' | 'justifications'>('dashboard')
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [timeEntriesWithUser, setTimeEntriesWithUser] = useState<TimeEntryWithUserResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  
  // Estados para formulários
  const [showTeamForm, setShowTeamForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [teamForm, setTeamForm] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    managerId: 0
  })
  const [inviteForm, setInviteForm] = useState<CreateInvitationRequest>({
    email: '',
    name: '',
    role: 'MEMBER'
  })
  const [reportFilters, setReportFilters] = useState<ReportFilters>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    teamId: null
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setInitialLoading(true)
    try {
      // Carregar todos os dados em paralelo
      await Promise.all([
        loadStats(),
        loadTeams(),
        loadInvitations(),
        loadAvailableUsers(),
        loadDashboardEntries()
      ])
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      toast.error('Erro ao carregar dados do sistema')
    } finally {
      setInitialLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await api.get<OrganizationStats>(API_ROUTES.MANAGEMENT.STATS, true)
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas')
    }
  }

  const loadTeams = async () => {
    try {
      const data = await api.get<Team[]>(API_ROUTES.ORGANIZATION.TEAMS(), true)
      setTeams(data)
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
      toast.error('Erro ao carregar equipes')
    }
  }

  const loadInvitations = async () => {
    try {
      const data = await api.get<Invitation[]>(API_ROUTES.MANAGEMENT.INVITATIONS, true)
      setInvitations(data)
    } catch (error) {
      console.error('Erro ao carregar convites:', error)
      toast.error('Erro ao carregar convites')
    }
  }

  const loadDashboardEntries = async () => {
    try {
      const data = await api.get<TimeEntryWithUserResponse[]>(API_ROUTES.TIME_ENTRY.ORGANIZATION(DEFAULT_ORGANIZATION_ID), true)
      setTimeEntriesWithUser(data)
    } catch (error) {
      console.error('Erro ao carregar entradas do dashboard:', error)
      toast.error('Erro ao carregar entradas do dashboard')
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const data = await api.get<User[]>(API_ROUTES.MANAGEMENT.AVAILABLE_USERS, true)
      setAvailableUsers(data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast.error('Erro ao carregar usuários')
    }
  }

  const handleCreateTeam = async () => {
    if (!teamForm.name || !teamForm.managerId) {
      toast.error('Nome e gerente são obrigatórios')
      return
    }

    setLoading(true)
    try {
      if (editingTeam) {
        await api.put(API_ROUTES.ORGANIZATION.TEAM(editingTeam.id), teamForm, true)
        toast.success('Equipe atualizada com sucesso')
      } else {
        await api.post(API_ROUTES.ORGANIZATION.TEAMS(), teamForm, true)
        toast.success('Equipe criada com sucesso')
      }
      
      setShowTeamForm(false)
      setEditingTeam(null)
      setTeamForm({ name: '', description: '', managerId: 0 })
      
      // Recarregar dados
      await Promise.all([loadTeams(), loadStats()])
    } catch (error) {
      console.error('Erro ao salvar equipe:', error)
      toast.error('Erro ao salvar equipe')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta equipe?')) return

    setLoading(true)
    try {
      await api.delete(API_ROUTES.ORGANIZATION.TEAM(teamId), true)
      toast.success('Equipe excluída com sucesso')
      
      // Recarregar dados
      await Promise.all([loadTeams(), loadStats()])
    } catch (error) {
      console.error('Erro ao excluir equipe:', error)
      toast.error('Erro ao excluir equipe')
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvite = async () => {
    if (!inviteForm.email) {
      toast.error('Email é obrigatório')
      return
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(inviteForm.email)) {
      toast.error('Email inválido')
      return
    }

    setLoading(true)
    try {
      await api.post(API_ROUTES.MANAGEMENT.INVITATIONS, inviteForm, true)
      toast.success('Convite enviado com sucesso')
      setShowInviteForm(false)
      setInviteForm({ email: '', name: '', role: 'MEMBER' })
      
      // Recarregar dados
      await Promise.all([loadInvitations(), loadStats()])
    } catch (error: any) {
      console.error('Erro ao enviar convite:', error)
      if (error.status === 409) {
        toast.error('Este email já possui um convite pendente ou usuário já existe')
      } else {
        toast.error('Erro ao enviar convite')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelInvite = async (inviteId: number) => {
    if (!confirm('Tem certeza que deseja cancelar este convite?')) return

    setLoading(true)
    try {
      await api.delete(API_ROUTES.MANAGEMENT.INVITATION(inviteId), true)
      toast.success('Convite cancelado com sucesso')
      
      // Recarregar dados
      await Promise.all([loadInvitations(), loadStats()])
    } catch (error) {
      console.error('Erro ao cancelar convite:', error)
      toast.error('Erro ao cancelar convite')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    try {
      // Determinar qual endpoint usar baseado no filtro de equipe
      const reportUrl = reportFilters.teamId 
        ? API_ROUTES.REPORTS.TEAM_MONTHLY(reportFilters.teamId)
        : API_ROUTES.REPORTS.ORGANIZATION_MONTHLY()

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${reportUrl}?year=${reportFilters.year}&month=${reportFilters.month}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        
        // Nome do arquivo baseado nos filtros
        const teamName = reportFilters.teamId 
          ? teams.find(t => t.id === reportFilters.teamId)?.name?.replace(/\s+/g, '_') || 'equipe'
          : 'organizacao'
        a.download = `relatorio_${teamName}_${reportFilters.year}_${String(reportFilters.month).padStart(2, '0')}.xlsx`
        
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Relatório gerado e baixado com sucesso')
      } else {
        throw new Error('Erro na resposta do servidor')
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      toast.error('Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    setLoading(true)
    try {
      await api.post(API_ROUTES.REPORTS.TEST_MONTHLY, reportFilters, true)
      toast.success('Email de teste enviado com sucesso')
    } catch (error) {
      console.error('Erro ao enviar email de teste:', error)
      toast.error('Erro ao enviar email de teste')
    } finally {
      setLoading(false)
    }
  }

  const editTeam = (team: Team) => {
    setEditingTeam(team)
    setTeamForm({
      name: team.name,
      description: team.description || '',
      managerId: team.managerId
    })
    setShowTeamForm(true)
  }

  const viewTeamMembers = (team: Team) => {
    setSelectedTeam(team)
    setShowMembersModal(true)
  }

  const resetTeamForm = () => {
    setShowTeamForm(false)
    setEditingTeam(null)
    setTeamForm({ name: '', description: '', managerId: 0 })
  }

  const resetInviteForm = () => {
    setShowInviteForm(false)
    setInviteForm({ email: '', name: '', role: 'MEMBER' })
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando sistema de gerenciamento...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navegação por abas */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        {[
          { key: 'dashboard', label: 'Dashboard', icon: Users },
          { key: 'teams', label: 'Equipes', icon: Users },
          { key: 'invitations', label: 'Convites', icon: Mail },
          { key: 'reports', label: 'Relatórios', icon: Download }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Dashboard */}
      {activeTab === 'dashboard' && (
        <Dashboard externalStats={{ totalTeams: stats?.totalTeams || 0, timeEntries: timeEntriesWithUser}} />
      )}

      {/* Gerenciamento de Equipes */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gerenciamento de Equipes</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Clique no botão "Membros" de cada equipe para adicionar ou remover pessoas
              </p>
            </div>
            <Button onClick={() => setShowTeamForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Equipe
            </Button>
          </div>

          {/* Formulário de Equipe */}
          {showTeamForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTeam ? 'Editar Equipe' : 'Nova Equipe'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Nome *</Label>
                  <Input
                    id="teamName"
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    placeholder="Nome da equipe"
                  />
                </div>
                <div>
                  <Label htmlFor="teamDescription">Descrição</Label>
                  <Input
                    id="teamDescription"
                    value={teamForm.description}
                    onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                    placeholder="Descrição da equipe"
                  />
                </div>
                <div>
                  <Label htmlFor="teamManager">Gerente *</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {teamForm.managerId 
                          ? availableUsers.find(u => u.id === teamForm.managerId)?.name || 'Selecione um gerente'
                          : 'Selecione um gerente'
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {availableUsers.filter(u => u.role === 'MANAGER').map(user => (
                        <DropdownMenuItem
                          key={user.id}
                          onClick={() => setTeamForm({ ...teamForm, managerId: user.id })}
                        >
                          {user.name} ({user.email})
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateTeam} disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetTeamForm}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Equipes */}
          <div className="grid gap-4">
            {teams.map(team => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>{team.description}</CardDescription>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><strong>Gerente:</strong> {team.manager.name}</p>
                        <p><strong>Membros:</strong> {team.memberCount}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => editTeam(team)}
                        title="Editar equipe"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => viewTeamMembers(team)}
                        title="Gerenciar membros"
                      >
                        <Users className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">Membros</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteTeam(team.id)}
                        title="Excluir equipe"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Convites */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gerenciamento de Convites</h2>
            <Button onClick={() => setShowInviteForm(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Convite
            </Button>
          </div>

          {/* Formulário de Convite */}
          {showInviteForm && (
            <Card>
              <CardHeader>
                <CardTitle>Novo Convite</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="inviteEmail">Email *</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="inviteName">Nome</Label>
                  <Input
                    id="inviteName"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div>
                  <Label>Função</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="MANAGER"
                        checked={inviteForm.role === 'MANAGER'}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'MANAGER' | 'MEMBER' })}
                      />
                      <span>Gerente</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="MEMBER"
                        checked={inviteForm.role === 'MEMBER'}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'MANAGER' | 'MEMBER' })}
                      />
                      <span>Membro</span>
                    </label>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleSendInvite} disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetInviteForm}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Convites */}
          <div className="grid gap-4">
            {invitations.map(invitation => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{invitation.email}</CardTitle>
                      <CardDescription>
                        {invitation.name && <span>{invitation.name} • </span>}
                        <Badge variant={invitation.role === 'MANAGER' ? 'default' : 'secondary'}>
                          {invitation.role === 'MANAGER' ? 'Gerente' : 'Membro'}
                        </Badge>
                      </CardDescription>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Convidado em {new Date(invitation.invitedAt).toLocaleDateString('pt-BR')}
                        {invitation.team && <span> • Equipe: {invitation.team.name}</span>}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleCancelInvite(invitation.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Relatórios */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Relatórios</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="reportYear">Ano</Label>
                  <Input
                    id="reportYear"
                    type="number"
                    value={reportFilters.year}
                    onChange={(e) => setReportFilters({ ...reportFilters, year: parseInt(e.target.value) })}
                    min="2020"
                    max="2030"
                  />
                </div>
                <div>
                  <Label htmlFor="reportMonth">Mês</Label>
                  <Input
                    id="reportMonth"
                    type="number"
                    value={reportFilters.month}
                    onChange={(e) => setReportFilters({ ...reportFilters, month: parseInt(e.target.value) })}
                    min="1"
                    max="12"
                  />
                </div>
                <div>
                  <Label>Equipe</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {reportFilters.teamId 
                          ? teams.find(t => t.id === reportFilters.teamId)?.name || 'Selecione uma equipe'
                          : 'Toda organização'
                        }
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => setReportFilters({ ...reportFilters, teamId: null })}>
                        Toda organização
                      </DropdownMenuItem>
                      {teams.map(team => (
                        <DropdownMenuItem
                          key={team.id}
                          onClick={() => setReportFilters({ ...reportFilters, teamId: team.id })}
                        >
                          {team.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleGenerateReport} disabled={loading}>
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Gerando...' : 'Gerar Relatório Excel'}
                </Button>
                <Button variant="outline" onClick={handleTestEmail} disabled={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Enviando...' : 'Testar Envio por Email'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Membros da Equipe */}
      {selectedTeam && (
        <TeamMembersModal
          team={selectedTeam}
          isOpen={showMembersModal}
          onClose={() => {
            setShowMembersModal(false)
            setSelectedTeam(null)
          }}
          availableUsers={availableUsers}
          onUpdate={() => {
            loadTeams()
            loadStats()
          }}
        />
      )}
    </div>
  )
}

GerenciamentoPage.getLayout = (page) => (
  <Page title="Gerenciamento">
    <ManagerGuard>{page}</ManagerGuard>
  </Page>
)

export default GerenciamentoPage