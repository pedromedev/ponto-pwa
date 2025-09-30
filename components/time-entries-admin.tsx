import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { TimeEntryResponse } from '@/types/time-entry';
import { formatDateBR, getDayName } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth';

interface TimeEntriesAdminProps {
  organizationId?: number;
}

const TimeEntriesAdmin: React.FC<TimeEntriesAdminProps> = ({ organizationId }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TimeEntryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, [organizationId]);

  const loadEntries = async () => {
    setIsLoading(true);
    try {
      // Buscar apenas registros retroativos pendentes de aprovação
      const data = await api.get<TimeEntryResponse[]>(API_ROUTES.TIME_ENTRY.ORGANIZATION(organizationId || 1), true);
      setEntries(data.filter(e => e.status === 'Pendente aprovação'));
    } catch (error) {
      toast.error('Erro ao carregar registros retroativos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    setLoadingAction(id);
    try {
      const timeEntry = entries.filter((entry: any) => entry.id === id)[0]
      const data = {
          userId: timeEntry.userId,
          organizationId: timeEntry.organizationId,
          date: timeEntry.date,
          clockIn: timeEntry.clockIn,
          lunchStart: timeEntry.lunchStart,
          lunchEnd: timeEntry.lunchEnd,
          clockOut: timeEntry.clockOut,
          clockInJustification: timeEntry.clockInJustification,
          lunchStartJustification: timeEntry.lunchStartJustification,
          lunchEndJustification: timeEntry.lunchEndJustification,
          clockOutJustification: timeEntry.clockOutJustification,
          status: 'Aprovado'
      }
      await api.patch(API_ROUTES.TIME_ENTRY.BY_ID(id), data, true);
      toast.success('Registro aprovado com sucesso');
      loadEntries();
    } catch (error) {
      toast.error('Erro ao aprovar registro');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async (id: number) => {
    setLoadingAction(id);
    try {
      const timeEntry = entries.filter((entry: any) => entry.id === id)[0]
      const data = {
          userId: timeEntry.userId,
          organizationId: timeEntry.organizationId,
          date: timeEntry.date,
          clockIn: timeEntry.clockIn,
          lunchStart: timeEntry.lunchStart,
          lunchEnd: timeEntry.lunchEnd,
          clockOut: timeEntry.clockOut,
          clockInJustification: timeEntry.clockInJustification,
          lunchStartJustification: timeEntry.lunchStartJustification,
          lunchEndJustification: timeEntry.lunchEndJustification,
          clockOutJustification: timeEntry.clockOutJustification,
          status: 'Reprovado'
      }
      await api.patch(API_ROUTES.TIME_ENTRY.BY_ID(id), data, true);
      toast.success('Registro reprovado com sucesso');
      loadEntries();
    } catch (error) {
      toast.error('Erro ao reprovar registro');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Aprovação de Registros Retroativos</h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum registro retroativo pendente de aprovação.</p>
            </Card>
          ) : (
            entries.map(entry => (
              <Card key={entry.id}>
                <CardHeader>
                  <CardTitle>
                    {getDayName(entry.date)} {formatDateBR(entry.date)}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">{entry.status}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2 mb-4">
                    <span><strong>Usuário:</strong> {entry.userName || entry.userId}</span>
                    <div className='flex gap-4'>
                      <span><strong>Entrada:</strong> {entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                      <span><strong>Início Almoço:</strong> {entry.lunchStart ? new Date(entry.lunchStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                      <span><strong>Fim Almoço:</strong> {entry.lunchEnd ? new Date(entry.lunchEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                      <span><strong>Saída:</strong> {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>
                    <span><strong>Justificativas:</strong> {entry.clockInJustification || entry.lunchStartJustification || entry.lunchEndJustification || entry.clockOutJustification || '-'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      disabled={loadingAction === entry.id}
                      onClick={() => handleApprove(entry.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={loadingAction === entry.id}
                      onClick={() => handleReject(entry.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" /> Reprovar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TimeEntriesAdmin;
