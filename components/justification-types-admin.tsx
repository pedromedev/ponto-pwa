import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { API_ROUTES } from '@/lib/constants'
import { JustificationType } from '@/types/justifications'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'

type EditableType = Omit<JustificationType, 'id'> & { id?: number }

const TIME_TYPES = [
  { value: 'all', label: 'Todos (all)' },
  { value: 'clockIn', label: 'Entrada (clockIn)' },
  { value: 'lunchStart', label: 'Início almoço (lunchStart)' },
  { value: 'lunchEnd', label: 'Fim almoço (lunchEnd)' },
  { value: 'clockOut', label: 'Saída (clockOut)' },
]

function validateExclusiveFlags(data: { abonable: boolean; discountable: boolean; absence: boolean }): boolean {
  const count = [data.abonable, data.discountable, data.absence].filter(Boolean).length
  return count <= 1
}

const JustificationTypesAdmin: React.FC = () => {
  const [types, setTypes] = useState<JustificationType[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formDraft, setFormDraft] = useState<EditableType>({
    timeType: 'all',
    justification: '',
    abonable: false,
    discountable: false,
    absence: false,
  })

  const [confirmState, setConfirmState] = useState<{ open: boolean, id: number | null, label: string }>({ open: false, id: null, label: '' })

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get<JustificationType[]>(API_ROUTES.JUSTIFICATIONS.TYPES, true)
      setTypes(data)
    } catch (e: any) {
      toast.error(e.message || 'Erro ao carregar tipos de justificativa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleFlagChange = (state: EditableType, flag: 'abonable' | 'discountable' | 'absence', value: boolean): EditableType => {
    // Exclusividade: se um vira true, os outros devem ser false
    if (value) {
      return { ...state, abonable: flag === 'abonable', discountable: flag === 'discountable', absence: flag === 'absence' }
    }
    return { ...state, [flag]: value } as EditableType
  }

  const submitForm = async () => {
    if (!formDraft.justification.trim()) {
      toast.error('Justificativa não pode estar vazia')
      return
    }
    if (!validateExclusiveFlags(formDraft)) {
      toast.error('Apenas uma das flags pode ser verdadeira')
      return
    }
    setSaving(true)
    try {
      if (formMode === 'create') {
        await api.post(API_ROUTES.JUSTIFICATIONS.TYPES, formDraft, true)
        toast.success('Tipo criado com sucesso')
      } else if (formMode === 'edit' && selectedId) {
        await api.patch(API_ROUTES.JUSTIFICATIONS.TYPES_BY_ID(selectedId), formDraft, true)
        toast.success('Tipo atualizado')
      }
      setIsFormOpen(false)
      setSelectedId(null)
      await load()
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar tipo')
    } finally {
      setSaving(false)
    }
  }

  const openCreate = () => {
    setFormMode('create')
    setSelectedId(null)
    setFormDraft({ timeType: 'all', justification: '', abonable: false, discountable: false, absence: false })
    setIsFormOpen(true)
  }

  const openEdit = (t: JustificationType) => {
    setFormMode('edit')
    setSelectedId(t.id)
    setFormDraft({ timeType: t.timeType as any, justification: t.justification, abonable: t.abonable, discountable: t.discountable, absence: t.absence })
    setIsFormOpen(true)
  }

  const remove = async (id: number) => {
    setSaving(true)
    try {
      await api.delete(API_ROUTES.JUSTIFICATIONS.TYPES_BY_ID(id), true)
      toast.success('Tipo removido')
    } catch (e: any) {
      toast.error(e.message || 'Erro ao remover tipo')
    } finally {
      setSaving(false)
      await load()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Tipos de Justificativa</h2>
          <p className="text-sm text-muted-foreground">Gerencie as opções e suas flags (exclusivas).</p>
        </div>
        <Button onClick={openCreate}>Novo tipo</Button>
      </div>

      <div className="border rounded-md">
        <div className="max-h-[28rem] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Justificativa</TableHead>
              <TableHead>Abonável</TableHead>
              <TableHead>Descontável</TableHead>
              <TableHead>Ausência</TableHead>
              <TableHead className="w-[180px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {types.map(t => {
              return (
                <TableRow key={t.id}>
                  <TableCell>
                    {t.timeType}
                  </TableCell>
                  <TableCell>
                    {t.justification}
                  </TableCell>
                  <TableCell>
                    {t.abonable ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell>
                    {t.discountable ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell>
                    {t.absence ? 'Sim' : 'Não'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="icon" onClick={() => openEdit(t)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => setConfirmState({ open: true, id: t.id, label: t.justification })} disabled={saving} aria-label="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {types.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">Nenhum tipo cadastrado</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setIsFormOpen(false)}></div>
          <div className="relative w-full max-w-xl rounded-md border bg-background p-5 shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">{formMode === 'create' ? 'Novo tipo de justificativa' : 'Editar tipo de justificativa'}</h3>
              <p className="text-sm text-muted-foreground">Preencha os campos abaixo</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <Label>Tipo de horário</Label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring bg-background"
                  value={formDraft.timeType}
                  onChange={(e) => setFormDraft({ ...formDraft, timeType: e.target.value as any })}
                >
                  {TIME_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-4">
                <Label>Justificativa</Label>
                <Input value={formDraft.justification} onChange={e => setFormDraft({ ...formDraft, justification: e.target.value })} placeholder="Descrição" />
              </div>
              <div className="flex items-center gap-2">
                <input id="form-abonable" type="checkbox" checked={formDraft.abonable} onChange={e => setFormDraft(handleFlagChange(formDraft, 'abonable', e.target.checked))} />
                <Label htmlFor="form-abonable">Abonável</Label>
              </div>

              <div className="flex items-center gap-2">
                <input id="form-absence" type="checkbox" checked={formDraft.absence} onChange={e => setFormDraft(handleFlagChange(formDraft, 'absence', e.target.checked))} />
                <Label htmlFor="form-absence">Ausência</Label>
              </div>

              <div className="flex items-center gap-2">
                <input id="form-discountable" type="checkbox" checked={formDraft.discountable} onChange={e => setFormDraft(handleFlagChange(formDraft, 'discountable', e.target.checked))} />
                <Label htmlFor="form-discountable">Descontável</Label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)} disabled={saving}>Cancelar</Button>
              <Button onClick={submitForm} disabled={saving}>{formMode === 'create' ? 'Criar' : 'Salvar'}</Button>
            </div>
          </div>
        </div>
      )}

      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !saving && setConfirmState({ open: false, id: null, label: '' })}></div>
          <div className="relative w-full max-w-md rounded-md border bg-background p-5 shadow-lg">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">Remover tipo</h3>
              <p className="text-sm text-muted-foreground">Tem certeza que deseja remover "{confirmState.label}"?</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmState({ open: false, id: null, label: '' })} disabled={saving}>Cancelar</Button>
              <Button variant="destructive" onClick={() => { if (confirmState.id) { remove(confirmState.id).then(() => setConfirmState({ open: false, id: null, label: '' })) } }} disabled={saving}>Remover</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JustificationTypesAdmin;