import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  Input,
  Loader,
  SegmentedControl,
  Switch,
  Textarea
} from '@hermes/plugin-sdk'
import { ApiError, isOfflineError } from '../../api/client'
import {
  listAdRules,
  listAlerts,
  patchAdRule,
  patchAlert,
  runAdRules,
  type AdRule,
  type AdRuleParams,
  type Alert
} from '../../api/overview'
import { SideDrawer } from '../products/Drawer'
import { formatTime, levelLabel } from '../products/labels'

type Tab = 'alerts' | 'rules'

export function AlertDrawer({
  open,
  shopId,
  onClose,
  onChanged
}: {
  open: boolean
  shopId?: number
  onClose: () => void
  onChanged: () => void
}) {
  const [tab, setTab] = useState<Tab>('alerts')
  useEffect(() => {
    if (open) setTab('alerts')
  }, [open])

  return (
    <SideDrawer
      open={open}
      title="投放提醒"
      description="只提醒，不会去平台改出价或暂停计划。处理完在这里标一下。"
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <SegmentedControl
          options={[
            { id: 'alerts', label: '未处理' },
            { id: 'rules', label: '投放规则' }
          ]}
          value={tab}
          sizing="content"
          onChange={value => setTab(value as Tab)}
        />
        {tab === 'alerts' ? (
          <AlertList open={open} shopId={shopId} onChanged={onChanged} />
        ) : (
          <AdRulesEditor open={open} onChanged={onChanged} />
        )}
      </div>
    </SideDrawer>
  )
}

function AlertList({
  open,
  shopId,
  onChanged
}: {
  open: boolean
  shopId?: number
  onChanged: () => void
}) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [ignoreTarget, setIgnoreTarget] = useState<Alert | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoaded(false)
    setError(null)
    listAlerts({ status: 'open', shopId })
      .then(rows => {
        if (cancelled) return
        setAlerts(rows)
        setNotes(current => ({ ...Object.fromEntries(rows.map(row => [row.id, row.note ?? ''])), ...current }))
        setLoaded(true)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [open, shopId, revision])

  const resolve = async (alert: Alert) => {
    setPendingId(alert.id)
    setActionError(null)
    try {
      await patchAlert(alert.id, { status: 'resolved', note: notes[alert.id] ?? '' })
      onChanged()
      setRevision(value => value + 1)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '操作失败')
    } finally {
      setPendingId(null)
    }
  }

  if (!loaded && !error) {
    return (
      <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取提醒
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title={isOfflineError(error) ? '没有连上工作台服务' : '提醒加载失败'}
        description={error instanceof Error ? error.message : '请重试'}
      >
        <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
          重试
        </Button>
      </ErrorState>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {alerts.length === 0 ? (
        <p className="text-xs text-(--ui-text-tertiary)">没有未处理的投放提醒。</p>
      ) : null}
      {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
      <ul className="flex flex-col gap-3">
        {alerts.map(alert => (
          <li key={alert.id} className="flex flex-col gap-2 border-b border-(--ui-stroke-secondary) pb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium">
                {alert.tool} · {alert.campaign}
              </span>
              <Badge variant={alert.level === 'must' ? 'destructive' : 'warn'}>{levelLabel(alert.level)}</Badge>
            </div>
            <p className="text-xs leading-relaxed text-(--ui-text-secondary)">{alert.message}</p>
            <p className="text-[0.6875rem] text-(--ui-text-tertiary)">
              {alert.shop_name} · 数据日 {alert.date} · 发现于 {formatTime(alert.found_at)}
            </p>
            <Textarea
              aria-label={`${alert.campaign}的备注`}
              value={notes[alert.id] ?? ''}
              placeholder="备注（可选），例如：已在后台降了出价"
              onChange={event => setNotes(current => ({ ...current, [alert.id]: event.target.value }))}
            />
            <div className="flex items-center gap-2">
              <Button size="xs" disabled={pendingId === alert.id} onClick={() => void resolve(alert)}>
                标为已处理
              </Button>
              <Button
                size="xs"
                variant="outline"
                disabled={pendingId === alert.id}
                onClick={() => setIgnoreTarget(alert)}
              >
                忽略
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={ignoreTarget != null}
        title="忽略这条提醒"
        description="忽略后，只要情况没变，下次检查不会再把它打开。"
        confirmLabel="忽略"
        onClose={() => setIgnoreTarget(null)}
        onConfirm={async () => {
          if (!ignoreTarget) return
          try {
            await patchAlert(ignoreTarget.id, { status: 'ignored', note: notes[ignoreTarget.id] ?? '' })
          } catch (reason) {
            throw new Error(reason instanceof ApiError ? reason.message : '忽略失败')
          }
          onChanged()
          setRevision(value => value + 1)
        }}
      />
    </div>
  )
}

interface RuleDraft extends AdRule {
  capText: string
}

function AdRulesEditor({ open, onChanged }: { open: boolean; onChanged: () => void }) {
  const [drafts, setDrafts] = useState<RuleDraft[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoaded(false)
    setError(null)
    listAdRules()
      .then(rules => {
        if (cancelled) return
        setDrafts(rules.map(toDraft))
        setLoaded(true)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [open, revision])

  const update = (id: number, patch: Partial<RuleDraft>) => {
    setDrafts(current => current.map(rule => (rule.id === id ? { ...rule, ...patch } : rule)))
    setNotice(null)
  }

  const save = async () => {
    setActionError(null)
    setNotice(null)
    const payloads: Array<{ rule: RuleDraft; params: AdRuleParams }> = []
    for (const rule of drafts) {
      const parsed = paramsOf(rule)
      if (typeof parsed === 'string') {
        setActionError(parsed)
        return
      }
      payloads.push({ rule, params: parsed })
    }
    setSaving(true)
    try {
      const saved: RuleDraft[] = []
      for (const { rule, params } of payloads) {
        saved.push(toDraft(await patchAdRule(rule.id, { enabled: rule.enabled, params })))
      }
      setDrafts(saved)
      setNotice('已保存')
      onChanged()
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const run = async () => {
    setRunning(true)
    setActionError(null)
    try {
      const result = await runAdRules()
      setNotice(`新增 ${result.opened} 条，自动转已处理 ${result.resolved} 条，还剩 ${result.open_remaining} 条未处理`)
      onChanged()
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : '检查失败')
    } finally {
      setRunning(false)
    }
  }

  if (!loaded && !error) {
    return (
      <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取规则
      </div>
    )
  }
  if (error) {
    return (
      <ErrorState
        title={isOfflineError(error) ? '没有连上工作台服务' : '规则加载失败'}
        description={error instanceof Error ? error.message : '请重试'}
      >
        <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
          重试
        </Button>
      </ErrorState>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[0.6875rem] text-(--ui-text-tertiary)">改完先保存，再立即检查。未保存的修改不参与检查。</p>
      <ul className="flex flex-col">
        {drafts.map(rule => (
          <li key={rule.id} className="flex flex-col gap-2 border-b border-(--ui-stroke-secondary) py-3">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate text-xs font-medium">{rule.name}</span>
              <Badge variant={rule.level === 'must' ? 'destructive' : 'warn'}>{levelLabel(rule.level)}</Badge>
              <Switch
                checked={rule.enabled}
                aria-label={`${rule.name}开关`}
                onCheckedChange={checked => update(rule.id, { enabled: checked })}
              />
            </div>
            <RuleParams rule={rule} onChange={patch => update(rule.id, patch)} />
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <Button size="sm" variant="outline" disabled={saving || running} onClick={() => void run()}>
          {running ? '正在检查' : '立即检查'}
        </Button>
        <Button size="sm" disabled={saving || running} onClick={() => void save()}>
          {saving ? '正在保存' : '保存'}
        </Button>
      </div>
      {notice ? <p className="text-xs text-(--ui-text-secondary)">{notice}</p> : null}
      {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
    </div>
  )
}

function RuleParams({ rule, onChange }: { rule: RuleDraft; onChange: (patch: Partial<RuleDraft>) => void }) {
  const setParam = (key: keyof AdRuleParams, raw: string) => {
    const value = Number(raw)
    onChange({ params: { ...rule.params, [key]: raw === '' || !Number.isFinite(value) ? undefined : value } })
  }
  if (rule.kind === 'roi_below') {
    return (
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="ROI 低于" value={rule.params.min_roi} step="0.1" onChange={raw => setParam('min_roi', raw)} />
        <NumberField label="且花费至少" value={rule.params.min_spend} onChange={raw => setParam('min_spend', raw)} />
      </div>
    )
  }
  if (rule.kind === 'spend_spike') {
    return (
      <NumberField
        label="高于前 7 天平均的 %"
        value={rule.params.spike_pct}
        onChange={raw => setParam('spike_pct', raw)}
      />
    )
  }
  if (rule.kind === 'spend_over_cap') {
    return (
      <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
        每天花费上限，一行一个计划：计划名 空格 金额
        <Textarea
          aria-label="计划日上限"
          placeholder={'双11预热 600\n品牌词 300'}
          value={rule.capText}
          onChange={event => onChange({ capText: event.target.value })}
        />
        <span className="text-[0.6875rem] text-(--ui-text-tertiary)">没写的计划不查。计划名要和投放表里一字不差。</span>
      </label>
    )
  }
  return <p className="text-xs text-(--ui-text-tertiary)">这条规则没有参数。</p>
}

function NumberField({
  label,
  value,
  step,
  onChange
}: {
  label: string
  value: number | undefined
  step?: string
  onChange: (raw: string) => void
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs text-(--ui-text-secondary)">
      {label}
      <Input
        aria-label={label}
        type="number"
        min={0}
        step={step}
        value={value ?? ''}
        onChange={event => onChange(event.target.value)}
      />
    </label>
  )
}

function toDraft(rule: AdRule): RuleDraft {
  const caps = rule.params.daily_cap ?? {}
  return {
    ...rule,
    capText: Object.entries(caps)
      .map(([name, cap]) => `${name} ${cap}`)
      .join('\n')
  }
}

function paramsOf(rule: RuleDraft): AdRuleParams | string {
  if (rule.kind === 'roi_below') {
    return { min_roi: rule.params.min_roi ?? 2, min_spend: rule.params.min_spend ?? 200 }
  }
  if (rule.kind === 'spend_spike') {
    return { spike_pct: rule.params.spike_pct ?? 150 }
  }
  if (rule.kind === 'spend_over_cap') {
    const caps: Record<string, number> = {}
    for (const [index, line] of rule.capText.split('\n').entries()) {
      const text = line.trim()
      if (!text) continue
      const match = /^(.+?)\s+([\d.]+)$/.exec(text)
      const cap = match ? Number(match[2]) : NaN
      if (!match || !Number.isFinite(cap) || cap < 0) {
        return `日上限第 ${index + 1} 行看不懂：「${text}」。格式是 计划名 空格 金额`
      }
      caps[match[1].trim()] = cap
    }
    return { daily_cap: caps }
  }
  return rule.params
}
