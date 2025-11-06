import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, CalendarDays, User2, X } from 'lucide-react'

interface Props {
  users: { id: number; name: string }[]
  initialUserId: number
  onClose: () => void
}

interface MonthEntry {
  id: number
  date: string
  clockIn?: string
  lunchStart?: string
  lunchEnd?: string
  clockOut?: string
  status?: string
  clockInJustification?: string | null
  lunchStartJustification?: string | null
  lunchEndJustification?: string | null
  clockOutJustification?: string | null
}

const formatTime = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export default function UserDetailsModal({ users, initialUserId, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.max(0, users.findIndex(u => u.id === initialUserId)))
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [entries, setEntries] = useState<MonthEntry[]>([])
  const [animateKey, setAnimateKey] = useState(0)

  const currentUser = users[currentIndex]

  const monthLabel = useMemo(() => {
    const d = new Date()
    d.setMonth(month - 1)
    return d.toLocaleString('pt-BR', { month: 'long' })
  }, [month])

  const loadData = async (uid: number, m: number) => {
    setLoading(true)
    try {
      const [userInfo, monthEntries] = await Promise.all([
        api.get<User>(API_ROUTES.USER.BY_ID(uid), true),
        api.get<MonthEntry[]>(API_ROUTES.TIME_ENTRY.BY_MONTH(uid, m), true),
      ])
      setUserData(userInfo)
      setEntries(monthEntries || [])
    } catch (e: any) {
      // erros já são tratados por api.ts com mensagens
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadData(currentUser.id, month)
    }
  }, [currentUser?.id, month])

  const goPrevUser = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setAnimateKey(k => k + 1)
    }
  }
  const goNextUser = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setAnimateKey(k => k + 1)
    }
  }
  const prevMonth = () => setMonth(m => (m === 1 ? 12 : m - 1))
  const nextMonth = () => setMonth(m => (m === 12 ? 1 : m + 1))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose} role="dialog" aria-label="Detalhes do usuário">
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-5xl mx-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <User2 className="h-5 w-5 text-slate-300" />
            <div>
              <div className="text-white font-semibold">{userData?.name || currentUser?.name}</div>
              <div className="text-slate-400 text-sm">{userData?.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goPrevUser} disabled={currentIndex === 0} title="Usuário anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={goNextUser} disabled={currentIndex === users.length - 1} title="Próximo usuário">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-300">
              <CalendarDays className="h-4 w-4" />
              <span className="capitalize">{monthLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth} title="Mês anterior">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} title="Próximo mês">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div key={animateKey} className="transition-all duration-200">
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-750 border-b border-slate-700 sticky top-0">
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Entrada</TableHead>
                    <TableHead className="text-slate-300">Saída Almoço</TableHead>
                    <TableHead className="text-slate-300">Volta Almoço</TableHead>
                    <TableHead className="text-slate-300">Saída</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Obs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-400">Carregando...</TableCell>
                    </TableRow>
                  ) : entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-slate-400">Sem apontamentos para o mês</TableCell>
                    </TableRow>
                  ) : (
                    entries.map((e) => (
                      <TableRow key={e.id} className="hover:bg-slate-750 transition-colors border-b border-slate-700">
                        <TableCell className="text-white font-medium">{new Date(e.date).toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="text-slate-300">{formatTime(e.clockIn)}</TableCell>
                        <TableCell className="text-slate-300">{formatTime(e.lunchStart)}</TableCell>
                        <TableCell className="text-slate-300">{formatTime(e.lunchEnd)}</TableCell>
                        <TableCell className="text-slate-300">{formatTime(e.clockOut)}</TableCell>
                        <TableCell className="text-slate-300">{e.status || '-'}</TableCell>
                        <TableCell className="text-sm text-slate-400">
                          {e.clockInJustification || e.lunchStartJustification || e.lunchEndJustification || e.clockOutJustification || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

