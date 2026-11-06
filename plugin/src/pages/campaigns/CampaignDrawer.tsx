import { useEffect, useState } from 'react'
import {
  Button,
  ConfirmDialog,
  ErrorState,
  Input,
  Loader,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@hermes/plugin-sdk'
import { platformName } from '../products/labels'
import {
  createCampaignTask,
  deleteCampaignTask,
  getCampaign,
  getCampaignReview,
  patchCampaign,
  patchCampaignTask,
  type CampaignDetail,
  type CampaignReview,
  type CampaignStatus,
  type CampaignTask
} from '../../api/brand'
import {
  CAMPAIGN_KINDS,
  CAMPAIGN_STATUSES,
  KIND_LABEL,
  METRIC_LABEL,
  STATUS_LABEL,
  TASK_KIND_LABEL,
  TASK_KINDS
} from '../brand-labels'
import { SideDrawer, FieldText } from '../products/Drawer'

type Tab = 'info' | 'tasks' | 'review'

const METRIC_ORDER = ['visitors', 'orders', 'sales_amount', 'conversion_rate', 'ad_spend', 'ad_gmv', 'roi']

export function CampaignDrawer({
  campaignId,
  onClose,
  onChanged
}: {
  campaignId: number | null
  onClose: () => void
  onChanged: () => void
}) {
  const [tab, setTab] = useState<Tab>('info')
  const [detail, setDetail] = useState<CampaignDetail | null>(null)
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    setTab('info')
    setDetail(null)
    setLoadedFor(null)
  }, [campaignId])

  useEffect(() => {
    if (campaignId == null) return
    let cancelled = false
    setError(null)
    getCampaign(campaignId)
      .then(value => {
        if (cancelled) return
        setDetail(value)
        setLoadedFor(campaignId)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoadedFor(campaignId)
      })
    return () => {
      cancelled = true
    }
  }, [campaignId, revision])

  const refresh = () => {
    setRevision(value => value + 1)
    onChanged()
  }

  return (
    <SideDrawer
      open={campaignId != null}
      title={detail?.name ?? '活动'}
      description={detail ? `${detail.brand} · ${detail.start_date} 至 ${detail.end_date}` : undefined}
      onClose={onClose}
      widthClass="max-w-xl"
    >
      {loadedFor !== campaignId || !detail ? (
        error ? (
          <ErrorState title="活动单加载失败" description={error instanceof Error ? error.message : '请重试'}>
            <Button size="sm" variant="outline" onClick={refresh}>
              重试
            </Button>
          </ErrorState>
        ) : (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <SegmentedControl
            sizing="content"
            value={tab}
            onChange={setTab}
            options={[
              { id: 'info', label: '基本信息' },
              { id: 'tasks', label: '任务' },
              { id: 'review', label: '复盘' }
            ]}
          />
          {tab === 'info' ? <InfoForm detail={detail} onSaved={refresh} /> : null}
          {tab === 'tasks' ? <TaskList detail={detail} onChanged={refresh} /> : null}
          {tab === 'review' ? <ReviewPane campaignId={detail.id} name={detail.name} /> : null}
        </div>
      )}
    </SideDrawer>
  )
}

function InfoForm({ detail, onSaved }: { detail: CampaignDetail; onSaved: () => void }) {
  const [name, setName] = useState(detail.name)
  const [kind, setKind] = useState(detail.kind)
  const [status, setStatus] = useState(detail.status)
  const [start, setStart] = useState(detail.start_date)
  const [end, setEnd] = useState(detail.end_date)
  const [goal, setGoal] = useState(detail.goal ?? '')
  const [targetSales, setTargetSales] = useState(detail.target_sales == null ? '' : String(detail.target_sales))
  const [budget, setBudget] = useState(detail.budget == null ? '' : String(detail.budget))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(detail.name)
    setKind(detail.kind)
    setStatus(detail.status)
    setStart(detail.start_date)
    setEnd(detail.end_date)
    setGoal(detail.goal ?? '')
    setTargetSales(detail.target_sales == null ? '' : String(detail.target_sales))
    setBudget(detail.budget == null ? '' : String(detail.budget))
  }, [detail])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await patchCampaign(detail.id, {
        name: name.trim(),
        kind,
        status: status as CampaignStatus,
        start_date: start,
        end_date: end,
        goal: goal.trim() || null,
        target_sales: targetSales.trim() ? Number(targetSales) : null,
        budget: budget.trim() ? Number(budget) : null
      })
      onSaved()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <FieldText label="品牌">{detail.brand}</FieldText>
      <Input aria-label="活动名称" value={name} onChange={event => setName(event.target.value)} />
      <SegmentedControl
        sizing="content"
        value={status}
        onChange={setStatus}
        options={CAMPAIGN_STATUSES.map(item => ({ id: item, label: STATUS_LABEL[item] ?? item }))}
      />
      <Select value={kind} onValueChange={setKind}>
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
        <Input aria-label="开始日期" type="date" value={start} onChange={event => setStart(event.target.value)} />
        <Input aria-label="结束日期" type="date" value={end} onChange={event => setEnd(event.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input aria-label="目标销售额" value={targetSales} onChange={event => setTargetSales(event.target.value)} placeholder="目标销售额" />
        <Input aria-label="预算" value={budget} onChange={event => setBudget(event.target.value)} placeholder="预算" />
      </div>
      <Textarea aria-label="目标说明" value={goal} onChange={event => setGoal(event.target.value)} placeholder="目标说明" />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex justify-end">
        <Button size="sm" disabled={saving} onClick={() => void save()}>
          保存
        </Button>
      </div>
    </div>
  )
}

function TaskList({ detail, onChanged }: { detail: CampaignDetail; onChanged: () => void }) {
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState('other')
  const [owner, setOwner] = useState('')
  const [due, setDue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<number | null>(null)

  const add = async () => {
    if (!title.trim()) return
    setError(null)
    try {
      await createCampaignTask(detail.id, {
        title: title.trim(),
        kind,
        owner: owner.trim() || null,
        due_date: due || null
      })
      setTitle('')
      setOwner('')
      setDue('')
      onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '添加失败')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col">
        {detail.tasks.length === 0 ? (
          <li className="py-2 text-xs text-(--ui-text-tertiary)">还没有任务。</li>
        ) : null}
        {detail.tasks.map(task => (
          <TaskRow key={task.id} task={task} pending={pending === task.id} onChanged={onChanged} onError={setError} setPending={setPending} />
        ))}
      </ul>
      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2">
        <Input aria-label="新任务" placeholder="新任务" value={title} onChange={event => setTitle(event.target.value)} />
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger aria-label="任务类型">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TASK_KINDS.map(item => (
              <SelectItem key={item} value={item}>
                {TASK_KIND_LABEL[item]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input aria-label="负责人" placeholder="负责人" value={owner} onChange={event => setOwner(event.target.value)} />
        <Input aria-label="截止日期" type="date" value={due} onChange={event => setDue(event.target.value)} />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => void add()}>
          加任务
        </Button>
      </div>
    </div>
  )
}

function TaskRow({
  task,
  pending,
  onChanged,
  onError,
  setPending
}: {
  task: CampaignTask
  pending: boolean
  onChanged: () => void
  onError: (message: string | null) => void
  setPending: (id: number | null) => void
}) {
  const [owner, setOwner] = useState(task.owner ?? '')
  const [due, setDue] = useState(task.due_date ?? '')
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setOwner(task.owner ?? '')
    setDue(task.due_date ?? '')
  }, [task])

  const saveField = async (patch: { owner?: string | null; due_date?: string | null; done?: boolean }) => {
    setPending(task.id)
    onError(null)
    try {
      await patchCampaignTask(task.id, patch)
      onChanged()
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : '保存失败')
    } finally {
      setPending(null)
    }
  }

  return (
    <li className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-2 border-b border-(--ui-stroke-secondary) py-2">
      <input
        type="checkbox"
        className="mt-0.5"
        aria-label={`${task.title}已完成`}
        checked={task.done}
        disabled={pending}
        onChange={event => void saveField({ done: event.target.checked })}
      />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={task.done ? 'text-xs text-(--ui-text-tertiary) line-through' : 'text-xs'}>{task.title}</span>
          <Button size="xs" variant="ghost" onClick={() => setConfirming(true)}>
            删除
          </Button>
        </div>
        <div className="mt-1 text-[0.6875rem] text-(--ui-text-tertiary)">{TASK_KIND_LABEL[task.kind] ?? task.kind}</div>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <Input
            aria-label={`${task.title}负责人`}
            value={owner}
            placeholder="负责人"
            onChange={event => setOwner(event.target.value)}
            onBlur={() => {
              if (owner.trim() !== (task.owner ?? '')) void saveField({ owner: owner.trim() || null })
            }}
          />
          <Input
            aria-label={`${task.title}截止日期`}
            type="date"
            value={due}
            onChange={event => setDue(event.target.value)}
            onBlur={() => {
              if (due !== (task.due_date ?? '')) void saveField({ due_date: due || null })
            }}
          />
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title="删除这个任务"
        description={`删除「${task.title}」后不能恢复。`}
        confirmLabel="删除"
        onClose={() => setConfirming(false)}
        onConfirm={async () => {
          await deleteCampaignTask(task.id)
          setConfirming(false)
          onChanged()
        }}
      />
    </li>
  )
}

function ReviewPane({ campaignId, name }: { campaignId: number; name: string }) {
  const [review, setReview] = useState<CampaignReview | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getCampaignReview(campaignId)
      .then(value => {
        if (!cancelled) setReview(value)
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [campaignId])

  const copy = async (text: string, done: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setNotice(done)
      return
    } catch {
      // 预览页有时拿不到剪贴板权限，退回选中后复制。
    }
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    setNotice(ok ? done : '复制失败，请手动选择文字')
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader />
      </div>
    )
  }
  if (error || !review) {
    return <ErrorState title="复盘加载失败" description={error instanceof Error ? error.message : '请重试'} />
  }

  return (
    <div className="flex flex-col gap-3">
      {review.days_with_data < review.days ? (
        <p className="text-xs text-(--ui-text-secondary)">
          这 {review.days} 天里只有 {review.days_with_data} 天有经营数据。对比区间 {review.compare_start} 至 {review.compare_end}。
        </p>
      ) : (
        <p className="text-xs text-(--ui-text-tertiary)">
          对比 {review.compare_start} 至 {review.compare_end}
        </p>
      )}
      <div className="flex flex-col">
        {METRIC_ORDER.map(key => {
          const metric = review.metrics[key]
          if (!metric) return null
          return (
            <div key={key} className="flex items-center justify-between gap-3 border-b border-(--ui-stroke-secondary) py-1.5 text-xs">
              <span className="text-(--ui-text-secondary)">{METRIC_LABEL[key] ?? key}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <span>{formatMetric(key, metric.value)}</span>
                <Change value={metric.change} />
              </span>
            </div>
          )
        })}
      </div>
      <RateRow label="目标完成率" rate={review.target_rate} />
      <RateRow label="预算使用率" rate={review.budget_rate} />
      <div className="text-[0.6875rem] text-(--ui-text-tertiary)">
        任务 {review.tasks_done}/{review.tasks_total}
      </div>
      {review.shops.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.2fr)_4.5rem_3rem_4.5rem_3rem] gap-2 border-b border-(--ui-stroke-secondary) py-1 text-[0.6875rem] text-(--ui-text-tertiary)">
            <span>店铺</span>
            <span>销售额</span>
            <span>订单</span>
            <span>投放</span>
            <span>ROI</span>
          </div>
          {review.shops.map(shop => (
            <div key={shop.shop_id} className="grid grid-cols-[minmax(0,1.2fr)_4.5rem_3rem_4.5rem_3rem] gap-2 border-b border-(--ui-stroke-secondary) py-1.5 text-xs">
              <span className="truncate">{platformName(shop.platform)} · {shop.shop_name}</span>
              <span className="tabular-nums">{formatMetric('sales_amount', shop.sales_amount)}</span>
              <span className="tabular-nums">{shop.orders}</span>
              <span className="tabular-nums">{formatMetric('ad_spend', shop.ad_spend)}</span>
              <span className="tabular-nums">{shop.roi == null ? '—' : shop.roi.toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" variant="outline" onClick={() => void copy(review.markdown, '复盘文字已复制')}>
          复制复盘文字
        </Button>
        <Button
          size="sm"
          onClick={() =>
            void copy(
              `帮我写活动『${name}』的复盘结论，活动 id 是 ${campaignId}`,
              '已复制。到品牌助手对话里粘贴。'
            )
          }
        >
          交给品牌助手
        </Button>
      </div>
      {notice ? <p className="text-right text-xs text-(--ui-text-secondary)">{notice}</p> : null}
    </div>
  )
}

function RateRow({ label, rate }: { label: string; rate: number | null }) {
  const width = rate == null ? 0 : Math.max(0, Math.min(100, rate * 100))
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 shrink-0 text-(--ui-text-secondary)">{label}</span>
      <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-(--ui-bg-quinary)">
        <span className="block h-full bg-(--ui-accent)" style={{ width: `${width}%` }} />
      </span>
      <span className="w-12 text-right tabular-nums">{rate == null ? '未设置' : `${Math.round(rate * 100)}%`}</span>
    </div>
  )
}

function Change({ value }: { value: number | null }) {
  if (value == null) return <span className="text-(--ui-text-tertiary)">—</span>
  const pct = Math.round(value * 1000) / 10
  if (pct === 0) return <span className="text-(--ui-text-tertiary)">0%</span>
  const up = pct > 0
  return <span className={up ? 'text-(--ui-accent)' : 'text-destructive'}>{up ? '↑' : '↓'} {Math.abs(pct)}%</span>
}

function formatMetric(key: string, value: number | null): string {
  if (value == null) return '—'
  if (key === 'conversion_rate') return `${Math.round(value * 1000) / 10}%`
  if (key === 'roi') return value.toFixed(2)
  if (key === 'sales_amount' || key === 'ad_spend' || key === 'ad_gmv') {
    return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100)
  }
  return String(Math.round(value))
}
