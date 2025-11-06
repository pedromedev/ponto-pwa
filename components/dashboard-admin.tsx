import React, { useState, useMemo } from 'react';
import { Users, UserCheck, Clock } from 'lucide-react';
import { Button } from './ui/button';
import TimesheetTable from './timesheet-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { TimeEntryResponse, TimeEntryWithUserResponse } from '@/types/time-entry';
import { formatMinutesToHours } from '@/lib/date-utils';
import { useTimeEntry } from '@/hooks/use-time-entry'
import UserDetailsModal from '@/components/user-details-modal'

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
  externalStats: { totalTeams: number, timeEntries: TimeEntryWithUserResponse[]; };
}

const Dashboard: React.FC<TimesheetOverviewProps> = ({ externalStats }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<TimesheetEmployee | null>(null);

  // Mapear timeEntries para TimesheetEmployee
  const employeeData: TimesheetEmployee[] = useMemo(() => {

    function formatBankHoursHHMM(hours: number): string {
      // Obtém o sinal (positivo ou negativo)
      const sign = hours < 0 ? '-' : '+';
      // Trabalha com o valor absoluto
      const absHours = Math.abs(hours);
      // Extrai a parte inteira (horas)
      const hrs = Math.floor(absHours);
      // Extrai os minutos (parte fracionária * 60)
      const mins = Math.round((absHours - hrs) * 60);
      // Formata com dois dígitos para horas e minutos
      return `${sign}${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    if (!externalStats || !externalStats.timeEntries) return [];

    const entriesByUser = externalStats.timeEntries.reduce((acc, entry) => {
      if (!acc[entry.userId]) {
        acc[entry.userId] = [];
      }
      acc[entry.userId].push(entry);
      return acc;
    }, {} as Record<number, TimeEntryWithUserResponse[]>);

    let calculatedEntriesByUser = Object.entries(entriesByUser).map(([userId, entries]) => ({
      id: Number(userId),
      name: entries[0].userName || `Usuário ${userId}`,
      role: entries[0].userRole || (entries.some(e => e.status.includes('MANAGER')) ? 'MANAGER' : 'MEMBER'),
      status: 'Ativo',
      daysWorked: entries.reduce((sum, entry) => {
        const days = entry.calculatedDaysWorked;
        return sum + days;
      }, 0),
      hoursWorked: entries.reduce((sum, entry) => {
        const hours = entry.calculatedHoursWorked;
        return sum + hours;
      }, 0),
      avgHoursPerDay: 0,
      bankHours: entries.reduce((sum, entry) => {
        const bankHours = entry.calculatedBankHours;
        return sum + bankHours;
      }, 0),
      absences: entries.reduce((sum, entry) => {
        const absences = entry.calculatedAbsences;
        return sum + absences;
      }, 0),
      records: entries.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('pt-BR'),
        entry: entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        lunchOut: entry.lunchStart ? new Date(entry.lunchStart).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        lunchIn: entry.lunchEnd ? new Date(entry.lunchEnd).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        exit: entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-',
        totalHours: entry.calculatedHoursWorked.toString() || '-',
        balance: entry.calculatedBankHours ? formatBankHoursHHMM(entry.calculatedBankHours) : '+0',
        obs: entry.clockInJustification || entry.lunchStartJustification || entry.lunchEndJustification || entry.clockOutJustification || '',
      })),
    }))

    calculatedEntriesByUser = Object.values(calculatedEntriesByUser).map((userEntries) => {
      userEntries.avgHoursPerDay = userEntries.hoursWorked / userEntries.daysWorked
      return userEntries
    })

    return calculatedEntriesByUser;
  }, [externalStats]);
  
  const overviewStats = useMemo(() => {

    let totalEmployees = 0;let activeEmployees = 0;let totalDaysWorked = 0;let totalHoursWorked = 0
    let totalAbsences = 0;let avgHours = 0;let employeesWithNegativeBalance = 0;let employeesWithPositiveBalance = 0

    totalEmployees = employeeData.filter(emp => emp.role === 'MEMBER').length;
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
          <div className="text-3xl font-bold text-white">{externalStats?.totalTeams || 0}</div>
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
            {/* <div className="flex justify-between">
              <span className="text-slate-400">Saldo acumulado:</span>
              <span className="font-semibold text-red-400">-9h25m</span>
            </div> */}
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
              <span className="font-semibold text-green-400">{overviewStats.activeEmployees}</span>
            </div>
          </div>
        </div>
      </div>

      <TimesheetTable data={employeeData} onSelectEmployee={setSelectedEmployee} />

      {selectedEmployee && (
        <UserDetailsModal
          users={employeeData.map(u => ({ id: u.id, name: u.name }))}
          initialUserId={selectedEmployee.id}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;