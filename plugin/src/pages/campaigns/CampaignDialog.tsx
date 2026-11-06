import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea
} from '@hermes/plugin-sdk'
import { createCampaign, listCampaignTemplates, type CampaignKind, type CampaignTemplate } from '../../api/brand'
import { useApiBase } from '../../settings'
import { CAMPAIGN_KINDS, KIND_LABEL, TASK_KIND_LABEL } from '../brand-labels'
import { isoDate } from './calendar'

export function CampaignDialog({
  open,
  brands,
  onClose,
  onCreated
}: {
  open: boolean
  brands: string[]
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const apiBase = useApiBase()
  const today = isoDate(new Date())
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [kind, setKind] = useState<CampaignKind>('big_promo')
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(today)
  const [targetSales, setTargetSales] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [useTemplate, setUseTemplate] = useState(true)
  const [templates, setTemplates] = useState<CampaignTemplate[]>([])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setName('')
    setBrand(brands[0] ?? '')
    setKind('big_promo')
    setStart(today)
    setEnd(today)
    setTargetSales('')
    setBudget('')
    setGoal('')
    setUseTemplate(true)
    setError(null)
    // 只在打开时重置。品牌列表随后到达时，空品牌再补上第一项。
  }, [open])

  useEffect(() => {
    if (open && !brand && brands[0]) setBrand(brands[0])
  }, [open, brand, brands])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    listCampaignTemplates()
      .then(rows => {
        if (!cancelled) setTemplates(rows)
      })
      .catch(() => {
        if (!cancelled) setTemplates([])
      })
    return () => {
      cancelled = true
    }
  }, [open, apiBase])

  const tasks = templates.find(item => item.kind === kind)?.tasks ?? []

  const submit = async () => {
    if (!name.trim() || !brand.trim()) {
      setError('名称和品牌都要填')
      return
    }
    if (end < start) {
      setError('结束日期不能早于开始日期')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const created = await createCampaign({
        name: name.trim(),
        brand: brand.trim(),
        kind,
        start_date: start,
        end_date: end,
        goal: goal.trim() || null,
        target_sales: targetSales.trim() ? Number(targetSales) : null,
        budget: budget.trim() ? Number(budget) : null,
        use_template: useTemplate
      })
      onCreated(created.id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '创建失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建活动</DialogTitle>
          <DialogDescription>套用任务清单会按类型带上默认任务，之后仍能增删。</DialogDescription>
        </DialogHeader>
        <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
          名称
          <Input aria-label="活动名称" value={name} onChange={event => setName(event.target.value)} />
        </label>
        <div className="grid grid-cols-[8rem_minmax(0,1fr)] gap-2">
          <Select value={brands.includes(brand) ? brand : 'custom'} onValueChange={value => { if (value !== 'custom') setBrand(value) }}>
            <SelectTrigger aria-label="已有品牌">
              <SelectValue placeholder="品牌" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">手填</SelectItem>
              {brands.map(item => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input aria-label="品牌" value={brand} onChange={event => setBrand(event.target.value)} placeholder="品牌" />
        </div>
        <Select value={kind} onValueChange={value => setKind(value as CampaignKind)}>
          <SelectTrigger aria-label="活动类型">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CAMPAIGN_KINDS.map(item => (
              <SelectItem key={item} value={item}>
                {KIND_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
            开始
            <Input aria-label="开始日期" type="date" value={start} onChange={event => setStart(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
            结束
            <Input aria-label="结束日期" type="date" value={end} onChange={event => setEnd(event.target.value)} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input aria-label="目标销售额" inputMode="decimal" placeholder="目标销售额" value={targetSales} onChange={event => setTargetSales(event.target.value)} />
          <Input aria-label="预算" inputMode="decimal" placeholder="预算" value={budget} onChange={event => setBudget(event.target.value)} />
        </div>
        <Textarea aria-label="目标说明" placeholder="目标说明" value={goal} onChange={event => setGoal(event.target.value)} />
        <div className="flex items-center justify-between gap-3 text-xs">
          <span>按类型套用任务清单</span>
          <Switch checked={useTemplate} onCheckedChange={setUseTemplate} aria-label="按类型套用任务清单" />
        </div>
        {useTemplate ? (
          <ul className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
            {tasks.length === 0 ? <li>这个类型没有预设任务。</li> : null}
            {tasks.map(task => (
              <li key={task.title}>
                {TASK_KIND_LABEL[task.kind] ?? task.kind} · {task.title}
              </li>
            ))}
          </ul>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" disabled={saving} onClick={() => void submit()}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
