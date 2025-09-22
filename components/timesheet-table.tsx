import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { Button } from './ui/button';

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

interface TimesheetTableProps {
  data: TimesheetEmployee[];
  onSelectEmployee?: (employee: TimesheetEmployee | null) => void;
}

const TimesheetTable: React.FC<TimesheetTableProps> = ({ data, onSelectEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'MANAGER' | 'MEMBER'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ativo' | 'Inativo'>('all');

  const filteredEmployees = useMemo(() => {
    return data.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data, searchTerm, roleFilter, statusFilter]);

  const formatHours = (hours: number) => {
    if (hours === 0) return '0h';
    const h = Math.floor(Math.abs(hours));
    const m = Math.round((Math.abs(hours) - h) * 60);
    const sign = hours < 0 ? '-' : '';
    return `${sign}${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  const formatBankHours = (hours: number) => {
    if (hours === 0) return '0h';
    const h = Math.floor(Math.abs(hours));
    const m = Math.round((Math.abs(hours) - h) * 60);
    const sign = hours < 0 ? '+' : '-';
    return `${sign}${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  const getBadgeVariant = (value: number, type: 'balance' | 'absences') => {
    if (type === 'balance') {
      return value < -50 ? 'destructive' : value < 0 ? 'secondary' : 'default';
    }
    if (type === 'absences') {
      return value > 20 ? 'destructive' : value > 10 ? 'secondary' : 'default';
    }
    return 'default';
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">Visão por Colaborador</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="search" className="text-slate-300">Buscar por nome</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="search"
              placeholder="Digite o nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-slate-300">Função</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start mt-1 bg-slate-700 border-slate-600 text-white">
                {roleFilter === 'all' ? 'Todas as funções' : roleFilter === 'MANAGER' ? 'Gerente' : 'Membro'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-700 border-slate-600">
              <DropdownMenuItem onSelect={() => setRoleFilter('all')} className="text-white hover:bg-slate-600">Todas as funções</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRoleFilter('MANAGER')} className="text-white hover:bg-slate-600">Gerente</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRoleFilter('MEMBER')} className="text-white hover:bg-slate-600">Membro</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Label className="text-slate-300">Status</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-start mt-1 bg-slate-700 border-slate-600 text-white">
                {statusFilter === 'all' ? 'Todos os status' : statusFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-700 border-slate-600">
              <DropdownMenuItem onSelect={() => setStatusFilter('all')} className="text-white hover:bg-slate-600">Todos os status</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter('Ativo')} className="text-white hover:bg-slate-600">Ativo</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setStatusFilter('Inativo')} className="text-white hover:bg-slate-600">Inativo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-750 border-b border-slate-700">
              <TableHead className="text-slate-300">Nome</TableHead>
              <TableHead className="text-slate-300">Função</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Dias Trabalhados</TableHead>
              <TableHead className="text-slate-300">Horas Trabalhadas</TableHead>
              <TableHead className="text-slate-300">Média/Dia</TableHead>
              <TableHead className="text-slate-300">Banco de Horas</TableHead>
              <TableHead className="text-slate-300">Faltas</TableHead>
              <TableHead className="text-slate-300">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id} className="hover:bg-slate-750 transition-colors border-b border-slate-700">
                <TableCell className="font-medium text-white">{emp.name}</TableCell>
                <TableCell>
                  <Badge variant={emp.role === 'MANAGER' ? 'default' : 'secondary'}>
                    {emp.role === 'MANAGER' ? 'Gerente' : 'Membro'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={emp.status === 'Ativo' ? 'default' : 'secondary'}>
                    {emp.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">{emp.daysWorked}</TableCell>
                <TableCell className="text-white">{formatHours(emp.hoursWorked)}</TableCell>
                <TableCell className="text-white">{formatHours(emp.avgHoursPerDay)}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(emp.bankHours, 'balance')}>
                    {formatBankHours(emp.bankHours)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(emp.absences, 'absences')}>
                    {emp.absences}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onSelectEmployee?.(emp)}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-slate-400">
                  Nenhum colaborador encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimesheetTable;