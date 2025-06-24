import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Team, TeamMember, User, AddMemberRequest } from '@/types/management'
import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import { toast } from 'sonner'
import { X, UserPlus, UserMinus, Users } from 'lucide-react'

interface TeamMembersModalProps {
  team: Team
  isOpen: boolean
  onClose: () => void
  availableUsers: User[]
  onUpdate: () => void
}

const TeamMembersModal = ({ team, isOpen, onClose, availableUsers, onUpdate }: TeamMembersModalProps) => {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && team) {
      loadTeamMembers()
    }
  }, [isOpen, team])

  const loadTeamMembers = async () => {
    try {
      // Temporariamente usando dados mock até os endpoints específicos estarem prontos
      // TODO: Implementar endpoint GET /organization/{organizationId}/teams/{id}/members
      console.log('Carregando membros da equipe:', team.id)
      
      // Simulando uma lista de membros baseada nos dados da equipe
      if (team.members) {
        setMembers(team.members)
      } else {
        setMembers([])
      }
    } catch (error) {
      console.error('Erro ao carregar membros da equipe:', error)
      toast.error('Erro ao carregar membros da equipe')
    }
  }

  const handleAddMember = async (userId: number) => {
    setLoading(true)
    try {
      // TODO: Usar endpoint POST /organization/{organizationId}/teams/{id}/members
      const request = { userId }
      await api.post(API_ROUTES.ORGANIZATION.ADD_MEMBER(team.id), request, true)
      toast.success('Membro adicionado com sucesso')
      loadTeamMembers()
      onUpdate()
    } catch (error) {
      console.error('Erro ao adicionar membro:', error)
      toast.error('Funcionalidade ainda não implementada no backend')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Tem certeza que deseja remover este membro da equipe?')) return

    setLoading(true)
    try {
      // TODO: Usar endpoint DELETE /organization/{organizationId}/teams/{id}/members/{userId}
      await api.delete(API_ROUTES.ORGANIZATION.REMOVE_MEMBER(team.id, userId), true)
      toast.success('Membro removido com sucesso')
      loadTeamMembers()
      onUpdate()
    } catch (error) {
      console.error('Erro ao remover membro:', error)
      toast.error('Funcionalidade ainda não implementada no backend')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar usuários que não estão na equipe
  const usersNotInTeam = availableUsers.filter(user => 
    !members.some(member => member.id === user.id) && user.id !== team.managerId
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Membros da Equipe: {team.name}</span>
                </CardTitle>
                <CardDescription>
                  Gerencie os membros desta equipe
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Gerente da Equipe */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Gerente</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{team.manager.name}</p>
                      <p className="text-sm text-muted-foreground">{team.manager.email}</p>
                    </div>
                    <Badge variant="default">Gerente</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Adicionar Novo Membro */}
            {usersNotInTeam.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Adicionar Membro</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start" disabled={loading}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Selecionar usuário para adicionar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-w-xs">
                    {usersNotInTeam.map(user => (
                      <DropdownMenuItem
                        key={user.id}
                        onClick={() => handleAddMember(user.id)}
                        disabled={loading}
                      >
                        <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            {/* Lista de Membros */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Membros ({members.length})
              </h3>
              
              {members.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">Nenhum membro na equipe</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Funcionalidade de membros será implementada quando o backend estiver pronto
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {members.map(member => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Membro desde {new Date(member.joinedAt).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {member.role === 'MANAGER' ? 'Gerente' : 'Membro'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={loading}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default TeamMembersModal 