import { useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import { User } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, CalendarDays, User2, X, Pencil, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

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

const formatBankMinutes = (minutes?: number | null) => {
  if (minutes == null) return '-'
  const isNegative = minutes < 0
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  const sign = isNegative ? '-' : '+'
  return `${sign}${h}h${m.toString().padStart(2, '0')}m`
}

export default function UserDetailsModal({ users, initialUserId, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(() => Math.max(0, users.findIndex(u => u.id === initialUserId)))
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1)
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)
  const [userData, setUserData] = useState<User | null>(null)
  const [entries, setEntries] = useState<MonthEntry[]>([])
  const [animateKey, setAnimateKey] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<{ name: string; email: string; role: 'MANAGER' | 'MEMBER'; status: 'ACTIVE' | 'INACTIVE' } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; label: string }>({ open: false, id: null, label: '' })
  const [deleting, setDeleting] = useState(false)

  const currentUser = users[currentIndex]

  const monthLabel = useMemo(() => {
    const d = new Date(year, month - 1, 1)
    const monthStr = d.toLocaleString('pt-BR', { month: 'long' })
    return `${monthStr} / ${year}`
  }, [month, year])

  const loadData = async (uid: number, m: number, y: number) => {
    setLoading(true)
    try {
      let mStr = month < 10 ? `0${month}` : month.toString()
      const [userInfo, monthEntries] = await Promise.allSettled([
        api.get<User>(API_ROUTES.USER.BY_ID(uid), true),
        api.get<MonthEntry[]>(API_ROUTES.TIME_ENTRY.BY_COMPETENCE(uid, `${mStr}${y}`), true),
      ])
      setUserData(userInfo.status === 'fulfilled' ? userInfo.value : null)
      setForm({
        name: userInfo.status === 'fulfilled' ? userInfo.value.name : '',
        email: userInfo.status === 'fulfilled' ? userInfo.value.email : '',
        role: userInfo.status === 'fulfilled' ? userInfo.value.role : 'MEMBER',
        status: userInfo.status === 'fulfilled' ? userInfo.value.status : 'ACTIVE',
      })
      setEntries(monthEntries.status === 'fulfilled' ? monthEntries.value : [])
    } catch (e: any) {
      // erros já são tratados por api.ts com mensagens
      setUserData(null)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      loadData(currentUser.id, month, year)
    }
  }, [currentUser?.id, month, year])

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
  const prevMonth = () => {
    let m = month
    if (m === 1) {
      setMonth(12)
      setYear((y) => y - 1)
    } else {
      setMonth(m - 1)
    }
  }
  const nextMonth = () => {
    let m = month
    if (m === 12) {
      setMonth(1)
      setYear((y) => y + 1)
    } else {
      setMonth(m + 1)
    }
  }

  const startEdit = () => {
    if (!userData) return
    setForm({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: userData.status,
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setForm({
      name: userData?.name || '',
      email: userData?.email || '',
      role: userData?.role || 'MEMBER',
      status: userData?.status || 'ACTIVE',
    })
  }

  const saveEdit = async () => {
    if (!form || !currentUser) return
    if (!form.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!form.email.trim()) {
      toast.error('Email é obrigatório')
      return
    }
    setSavingEdit(true)
    try {
      const updated = await api.patch<User>(API_ROUTES.USER.BY_ID(currentUser.id), {
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
      }, true)
      setUserData(updated)
      setIsEditing(false)
      setForm({
        name: updated?.name || '',
        email: updated?.email || '',
        role: updated?.role || 'MEMBER',
        status: updated?.status || 'ACTIVE',
      })
      toast.success('Usuário atualizado com sucesso')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao atualizar usuário')
    } finally {
      setSavingEdit(false)
    }
  }

  const removeTimeEntry = async (id: number | null) => {
    if (!id) return
    setDeleting(true)
    try {
      await api.delete(API_ROUTES.TIME_ENTRY.BY_ID(id), true)
      toast.success('Registro removido')
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (e: any) {
      toast.error(e.message || 'Erro ao remover registro')
    } finally {
      setDeleting(false)
      setConfirmDelete({ open: false, id: null, label: '' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200" onClick={onClose} role="dialog" aria-label="Detalhes do usuário">
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
            <Button variant="outline" size="icon" onClick={startEdit} disabled={isEditing} title="Editar dados do usuário">
              <Pencil className="h-4 w-4" />
            </Button>
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

        {/* Seção 30% (form) + 70% (apontamentos) */}
        <div className="p-4 h-[80vh] flex flex-col gap-4">
          {/* Top 30% */}
          <div className="basis-[30%] flex-none border border-slate-700 rounded-md p-3">
            {form && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Nome</div>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} readOnly={!isEditing} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Email</div>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} readOnly={!isEditing} />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Função</div>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as 'MANAGER' | 'MEMBER' })}
                    disabled={!isEditing}
                  >
                    <option value="MANAGER">Gerente</option>
                    <option value="MEMBER">Membro</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Status</div>
                  <select
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    disabled={!isEditing}
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Banco de Horas</div>
                  <div className="text-white font-medium py-2">{formatBankMinutes(userData?.bancoDeHoras)}</div>
                </div>
                {isEditing && (
                  <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                    <Button variant="ghost" onClick={cancelEdit} disabled={savingEdit}>Cancelar</Button>
                    <Button onClick={saveEdit} disabled={savingEdit}>{savingEdit ? 'Salvando...' : 'Salvar'}</Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom 70% */}
          <div className="basis-[70%] flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
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

            <div key={animateKey} className="transition-all duration-200 flex-1 min-h-0">
              <div className="overflow-x-auto h-full overflow-y-auto">
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
                      <TableHead className="text-slate-300">Ações</TableHead>
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
                          <TableCell>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => setConfirmDelete({ open: true, id: e.id, label: new Date(e.date).toLocaleDateString('pt-BR') })}
                              disabled={deleting}
                              title="Excluir registro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
        {confirmDelete.open && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => !deleting && setConfirmDelete({ open: false, id: null, label: '' })}>
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative w-full max-w-md mx-4 bg-slate-800 border border-slate-700 rounded-lg p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold text-white mb-2">Remover registro</h3>
              <p className="text-sm text-slate-300 mb-4">Deseja remover o registro do dia {confirmDelete.label}?</p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmDelete({ open: false, id: null, label: '' })} disabled={deleting}>Cancelar</Button>
                <Button variant="destructive" onClick={() => removeTimeEntry(confirmDelete.id)} disabled={deleting}>{deleting ? 'Removendo...' : 'Remover'}</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

