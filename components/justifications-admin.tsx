import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth'
import { User } from '@/types/management';
import { API_ROUTES } from '@/lib/constants';

interface Justification {
  id: number;
  timeEntryId: number;
  userId: number;
  timeType: string;
  justification: string;
  status: string;
  approverId: number | null;
  approvedAt: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    role: string;
  };
  timeEntry: {
    date: string;
    status: string;
    clockIn?: string;
    lunchStart?: string;
    lunchEnd?: string;
    clockOut?: string;
    clockInJustification?: string | null;
    lunchStartJustification?: string | null;
    lunchEndJustification?: string | null;
    clockOutJustification?: string | null;
  };
}

interface JustificationsAdminProps {
  availableUsers: User[];
}

const JustificationsAdmin: React.FC<JustificationsAdminProps> = ({ availableUsers }) => {
  const context = useAuth()
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [justificationFilters, setJustificationFilters] = useState<{
    startDate: string | null;
    endDate: string | null;
    userId: number | null;
  }>({
    startDate: null,
    endDate: null,
    userId: null,
  });
  const [isLoadingJustifications, setIsLoadingJustifications] = useState(false);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);
  
  useEffect(() => {
    loadJustifications();
  }, [justificationFilters]);

  const loadJustifications = async () => {
    try {
      setIsLoadingJustifications(true);
      const params = new URLSearchParams();
      if (justificationFilters.startDate) params.append('startDate', justificationFilters.startDate);
      if (justificationFilters.endDate) params.append('endDate', justificationFilters.endDate);
      if (justificationFilters.userId) params.append('userId', justificationFilters.userId.toString());

      const data = await api.get<Justification[]>(`${API_ROUTES.JUSTIFICATIONS.PENDING}?${params.toString()}`, true);
      setJustifications(data);
    } catch (error) {
      console.error('Erro ao carregar justificativas:', error);
      toast.error('Erro ao carregar justificativas');
    } finally {
      setIsLoadingJustifications(false);
    }
  };

  const handleApproveJustification = async (id: number) => {

    if(!context.isAuthenticated || !context.user?.id) {
      return
    }

    try {
      setLoadingAction(id);
      await api.patch(API_ROUTES.JUSTIFICATIONS.APPROVE(id, context.user?.id), {}, true);
      toast.success('Justificativa aprovada com sucesso');
      loadJustifications();
    } catch (error) {
      console.error('Erro ao aprovar justificativa:', error);
      toast.error('Erro ao aprovar justificativa');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectJustification = async (id: number) => {
    
    if(!context.isAuthenticated || !context.user?.id) {
      return
    }

    try {
      setLoadingAction(id);
      await api.patch(API_ROUTES.JUSTIFICATIONS.REJECT(id, context.user?.id), {}, true);
      toast.success('Justificativa recusada com sucesso');
      loadJustifications();
    } catch (error) {
      console.error('Erro ao recusar justificativa:', error);
      toast.error('Erro ao recusar justificativa');
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDateTime = (dateTime?: string) => {
    return dateTime ? new Date(dateTime).toLocaleString('pt-BR') : 'Não registrado';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciamento de Justificativas</h2>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="startDate">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={justificationFilters.startDate || ''}
                onChange={(e) => setJustificationFilters({ ...justificationFilters, startDate: e.target.value || null })}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={justificationFilters.endDate || ''}
                onChange={(e) => setJustificationFilters({ ...justificationFilters, endDate: e.target.value || null })}
              />
            </div>
            <div>
              <Label>Usuário</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {justificationFilters.userId 
                      ? availableUsers.find(u => u.id === justificationFilters.userId)?.name || 'Selecione um usuário'
                      : 'Todos os usuários'
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  <DropdownMenuItem onClick={() => setJustificationFilters({ ...justificationFilters, userId: null })}>
                    Todos os usuários
                  </DropdownMenuItem>
                  {availableUsers.map(user => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => setJustificationFilters({ ...justificationFilters, userId: user.id })}
                    >
                      {user.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Justificativas */}
      <TooltipProvider>
        {isLoadingJustifications ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4">
            {justifications.map(justification => {
              return (
                <Card key={justification.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div>
                          <CardTitle>
                            {justification.user.name} - {new Date(justification.createdAt).toLocaleDateString('pt-BR')}
                          </CardTitle>
                          <CardDescription>
                            <Badge variant="secondary">{justification.status}</Badge>
                            <span className="ml-2">Role: {justification.user.role}</span>
                          </CardDescription>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Justificativa: {justification.justification}
                          </div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Info className="h-4 w-4 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md p-4">
                            <h4 className="font-semibold mb-2">Detalhes do Registro de Tempo</h4>
                            <div className="text-sm space-y-1">
                              <p><strong>Data:</strong> {new Date(justification.timeEntry.date).toLocaleDateString('pt-BR')}</p>
                              <p><strong>Entrada:</strong> {formatDateTime(justification.timeEntry.clockIn)}</p>
                              <p><strong>Justificativa de Entrada:</strong> {justification.timeEntry.clockInJustification || 'Nenhuma'}</p>
                              <p><strong>Início do Almoço:</strong> {formatDateTime(justification.timeEntry.lunchStart)}</p>
                              <p><strong>Justificativa de Início do Almoço:</strong> {justification.timeEntry.lunchStartJustification || 'Nenhuma'}</p>
                              <br></br>
                              <p><strong>Fim do Almoço:</strong> {formatDateTime(justification.timeEntry.lunchEnd)}</p>
                              <p><strong>Justificativa de Fim do Almoço:</strong> {justification.timeEntry.lunchEndJustification || 'Nenhuma'}</p>
                              <p><strong>Saída:</strong> {formatDateTime(justification.timeEntry.clockOut)}</p>
                              <p><strong>Justificativa de Saída:</strong> {justification.timeEntry.clockOutJustification || 'Nenhuma'}</p>
                              <br></br>
                              <p><strong>Status:</strong> {justification.timeEntry.status}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="default" 
                          size="sm" 
                          disabled={loadingAction === justification.id}
                          onClick={() => handleApproveJustification(justification.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={loadingAction === justification.id}
                          onClick={() => handleRejectJustification(justification.id)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
            {justifications.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                Nenhuma justificativa pendente encontrada
              </div>
            )}
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};

export default JustificationsAdmin;