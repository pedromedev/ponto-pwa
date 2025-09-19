import React, { useState, useMemo } from 'react';
import { Users, UserCheck, Clock } from 'lucide-react';
import { Button } from './ui/button';
import TimesheetTable from './timesheet-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { TimeEntryResponse, TimeEntryWithUserResponse } from '@/types/time-entry';
import { formatMinutesToHours } from '@/lib/date-utils';
import { useTimeEntry } from '@/hooks/use-time-entry'
// // Dados simulados
// const timesheetData = [
//   {
//     id: 1,
//     name: 'Jean Pissineli',
//     role: 'MANAGER',
//     status: 'Ativo',
//     daysWorked: 4,
//     hoursWorked: 25.58,
//     avgHoursPerDay: 6.40,
//     bankHours: -166.55,
//     absences: 18,
//     records: [
//       { date: '31/08/2025', entry: '08:25', lunchOut: '12:00', lunchIn: '13:30', exit: '18:20', totalHours: '8h 25m', balance: '-0h20m', obs: 'Entrada: Licença casamento' },
//       { date: '14/09/2025', entry: '08:00', lunchOut: '12:00', lunchIn: '13:35', exit: '18:00', totalHours: '8h 25m', balance: '-0h20m', obs: '' },
//       { date: '15/09/2025', entry: '08:00', lunchOut: '12:00', lunchIn: '13:15', exit: '18:00', totalHours: '8h 45m', balance: '0h00m', obs: '' },
//       { date: '17/09/2025', entry: '16:55', lunchOut: '-', lunchIn: '-', exit: '-', totalHours: '-', balance: '-8h45m', obs: '' }
//     ]
//   },
//   {
//     id: 2,
//     name: 'Administrador PVT',
//     role: 'MANAGER',
//     status: 'Ativo',
//     daysWorked: 1,
//     hoursWorked: 0,
//     avgHoursPerDay: 0,
//     bankHours: -192.30,
//     absences: 21,
//     records: []
//   },
//   {
//     id: 3,
//     name: 'Gerente Operacional',
//     role: 'MANAGER',
//     status: 'Ativo',
//     daysWorked: 0,
//     hoursWorked: 0,
//     avgHoursPerDay: 0,
//     bankHours: -192.30,
//     absences: 22,
//     records: []
//   },
//   {
//     id: 4,
//     name: 'João Silva',
//     role: 'MEMBER',
//     status: 'Ativo',
//     daysWorked: 0,
//     hoursWorked: 0,
//     avgHoursPerDay: 0,
//     bankHours: -192.30,
//     absences: 22,
//     records: []
//   },
//   {
//     id: 5,
//     name: 'Maria Santos',
//     role: 'MEMBER',
//     status: 'Ativo',
//     daysWorked: 0,
//     hoursWorked: 0,
//     avgHoursPerDay: 0,
//     bankHours: -192.30,
//     absences: 22,
//     records: []
//   },
//   {
//     id: 6,
//     name: 'Pedro Oliveira',
//     role: 'MEMBER',
//     status: 'Ativo',
//     daysWorked: 0,
//     hoursWorked: 0,
//     avgHoursPerDay: 0,
//     bankHours: -192.30,
//     absences: 22,
//     records: []
//   },
//   {
//     id: 7,
//     name: 'Ana Costa',
//     role: 'MEMBER',
//     status: 'Ativo',
//     daysWorked: 0,
//     hoursWorked: 0,
//     avgHoursPerDay: 0,
//     bankHours: -192.30,
//     absences: 22,
//     records: []
//   }
// ];

interface TimesheetRecord {
  date: string;
  entry: string;
  lunchOut: string;
  lunchIn: string;
  exit: string;
  totalHours: string;
  balance: string;
  obs: string;
}

interface TimesheetEmployee {
  id: number;
  name: string;
  role: 'MANAGER' | 'MEMBER';
  status: string;
  daysWorked: number;
  hoursWorked: number;
  avgHoursPerDay: number;
  bankHours: number;
  absences: number;
  records: TimesheetRecord[];
}

interface TimesheetOverviewProps {
  externalStats?: { totalTeams: number, timeEntries: TimeEntryWithUserResponse[]; };
}

const Dashboard: React.FC<TimesheetOverviewProps> = ({ externalStats }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<TimesheetEmployee | null>(null);
  const { checkTolerancia } = useTimeEntry();

    // Mapear timeEntries para TimesheetEmployee
  const employeeData: TimesheetEmployee[] = useMemo(() => {

    if (!externalStats || !externalStats.timeEntries) return [];

    console.log('externalStats.timeEntries:', externalStats.timeEntries);

    const entriesByUser = externalStats.timeEntries.reduce((acc, entry) => {
      if (!acc[entry.userId]) {
        acc[entry.userId] = [];
      }
      acc[entry.userId].push(entry);
      return acc;
    }, {} as Record<number, TimeEntryWithUserResponse[]>);

    return Object.entries(entriesByUser).map(([userId, entries]) => ({
      id: Number(userId),
      name: entries[0].userName || `Usuário ${userId}`,
      role: entries[0].userRole || (entries.some(e => e.status.includes('MANAGER')) ? 'MANAGER' : 'MEMBER'),
      status: 'Ativo',
      daysWorked: entries[0].calculatedDaysWorked || 0,
      hoursWorked: entries.reduce((sum, entry) => {
        const hoursStr = entry.calculatedHoursWorked.toString();
        if (hoursStr === '--') return sum;
        const [h, m] = hoursStr.replace('h', ':').replace('m', '').split(':').map(Number);
        return sum + h + m / 60;
      }, 0),
      avgHoursPerDay: entries[0].calculatedAvgHoursPerDay || 0,
      bankHours: entries[0].calculatedBankHours || 0,
      absences: entries[0].calculatedAbsences || 0,
      records: entries.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('pt-BR'),
        entry: entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        lunchOut: entry.lunchStart ? new Date(entry.lunchStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        lunchIn: entry.lunchEnd ? new Date(entry.lunchEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        exit: entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        totalHours: entry.calculatedHoursWorked.toString() || '-',
        balance: entry.clockIn
          ? formatMinutesToHours(
              checkTolerancia(
                entry.date.split('T')[0],
                entry.clockIn,
                entry.clockInJustification || '',
                'clockIn'
              ).bancoHoras
            )
          : '-',
        obs: entry.clockInJustification || entry.lunchStartJustification || entry.lunchEndJustification || entry.clockOutJustification || '',
      })),
    }));
  }, [externalStats?.timeEntries]);
  
  const overviewStats = useMemo(() => {

    let totalEmployees = 0;let activeEmployees = 0;let totalDaysWorked = 0;let totalHoursWorked = 0
    let totalAbsences = 0;let avgHours = 0;let employeesWithNegativeBalance = 0;let employeesWithPositiveBalance = 0

    console.log('employeeData - overviewStats:', employeeData)

    totalEmployees = employeeData.length;
    activeEmployees = employeeData.filter(emp => emp.status === 'Ativo').length;
    totalDaysWorked = employeeData.reduce((sum, emp) => sum + emp.daysWorked, 0);
    totalHoursWorked = employeeData.reduce((sum, emp) => sum + emp.hoursWorked, 0);
    totalAbsences = employeeData.reduce((sum, emp) => sum + emp.absences, 0);
    avgHours = totalDaysWorked ? totalHoursWorked / totalDaysWorked : 0;
    employeesWithNegativeBalance = employeeData.filter(emp => emp.bankHours < 0).length;
    employeesWithPositiveBalance = employeeData.filter(emp => emp.bankHours > 0).length;

    return {
      totalEmployees,
      activeEmployees,
      totalDaysWorked,
      totalHoursWorked,
      totalAbsences,
      avgHours,
      employeesWithNegativeBalance,
      employeesWithPositiveBalance
    };
  }, [employeeData]);

  const formatHours = (hours: number) => {
    if (hours === 0) return '0h';
    const h = Math.floor(Math.abs(hours));
    const m = Math.round((Math.abs(hours) - h) * 60);
    const sign = hours < 0 ? '-' : '';
    return `${sign}${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Total de Equipes</div>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-white">{externalStats?.totalTeams || 7}</div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Total de Membros</div>
            <UserCheck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-white">{overviewStats.totalEmployees}</div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Horas Trabalhadas</div>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-white">{formatHours(overviewStats.totalHoursWorked)}</div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-400">Funcionários Ativos</div>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-white">{overviewStats.activeEmployees}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Resumo do Mês</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Total de dias trabalhados:</span>
              <span className="font-semibold text-white">{overviewStats.totalDaysWorked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total de horas trabalhadas:</span>
              <span className="font-semibold text-white">{formatHours(overviewStats.totalHoursWorked)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Média de horas por dia:</span>
              <span className="font-semibold text-white">{formatHours(overviewStats.avgHours)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Saldo acumulado:</span>
              <span className="font-semibold text-red-400">-9h25m</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-white">Resumo - PVT</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Total de Faltas:</span>
              <span className="font-semibold text-amber-400">{overviewStats.totalAbsences}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Funcionários com saldo negativo:</span>
              <span className="font-semibold text-red-400">{overviewStats.employeesWithNegativeBalance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Funcionários ativos no período:</span>
              <span className="font-semibold text-green-400">1</span>
            </div>
          </div>
        </div>
      </div>

      <TimesheetTable data={employeeData} onSelectEmployee={setSelectedEmployee} />

      {selectedEmployee && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedEmployee(null)}
          role="dialog"
          aria-label={`Detalhes de ${selectedEmployee.name}`}
        >
          <div
            className="bg-slate-700 rounded-lg border border-slate-600 p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold text-white mb-4">Registros de {selectedEmployee.name}</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-750 border-b border-slate-700">
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Entrada</TableHead>
                    <TableHead className="text-slate-300">Saída Almoço</TableHead>
                    <TableHead className="text-slate-300">Volta Almoço</TableHead>
                    <TableHead className="text-slate-300">Saída</TableHead>
                    <TableHead className="text-slate-300">Horas Trabalhadas</TableHead>
                    <TableHead className="text-slate-300">Saldo do Dia</TableHead>
                    <TableHead className="text-slate-300">Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployee.records.length > 0 ? (
                    selectedEmployee.records.map((record: TimesheetRecord, index: number) => (
                      <TableRow key={index} className="hover:bg-slate-750 transition-colors border-b border-slate-700">
                        <TableCell className="font-medium text-white">{record.date}</TableCell>
                        <TableCell className="text-slate-300">{record.entry}</TableCell>
                        <TableCell className="text-slate-300">{record.lunchOut}</TableCell>
                        <TableCell className="text-slate-300">{record.lunchIn}</TableCell>
                        <TableCell className="text-slate-300">{record.exit}</TableCell>
                        <TableCell className="text-white font-medium">{record.totalHours}</TableCell>
                        <TableCell>
                          <span className={record.balance.includes('-') ? 'text-red-400' : 'text-green-400'}>
                            {record.balance}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-slate-400">{record.obs}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-400">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button
              onClick={() => setSelectedEmployee(null)}
              variant="outline"
              className="mt-4 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;