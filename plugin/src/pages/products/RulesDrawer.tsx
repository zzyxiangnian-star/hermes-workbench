import { useEffect, useState } from 'react'
import { Badge, Button, ErrorState, Input, Loader, Switch } from '@hermes/plugin-sdk'
import { ApiError, isOfflineError } from '../../api/client'
import { listRules, patchRule, runRules, type Rule, type RuleParams } from '../../api/products'
import { SideDrawer } from './Drawer'
import { levelLabel } from './labels'

export function RulesDrawer({
  open,
  onClose,
  onChanged
}: {
  open: boolean
  onClose: () => void
  onChanged: () => void
}) {
  const [drafts, setDrafts] = useState<Rule[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const [saving, setSaving] = useState(false)
  const [running, setRunning] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setLoaded(false)
    setError(null)
    listRules()
      .then(rules => {
        if (cancelled) return
        setDrafts(rules)
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

  const update = (id: number, patch: Partial<Rule>) => {
    setDrafts(current => current.map(rule => (rule.id === id ? { ...rule, ...patch } : rule)))
    setNotice(null)
  }

  const save = async () => {
    setSaving(true)
    setActionError(null)
    setNotice(null)
    try {
      const saved = []
      for (const rule of drafts) {
        saved.push(await patchRule(rule.id, { enabled: rule.enabled, params: paramsOf(rule) }))
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
      const result = await runRules()
      setNotice(`新增 ${result.opened} 条，已处理 ${result.resolved} 条`)
      onChanged()
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : '检查失败')
    } finally {
      setRunning(false)
    }
  }

  return (
    <SideDrawer
      open={open}
      title="规则"
      description="改完保存后再立即检查。未保存的修改不会参与这次检查。"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" disabled={saving || running || !loaded || Boolean(error)} onClick={() => void run()}>
            {running ? '正在检查' : '立即检查'}
          </Button>
          <Button disabled={saving || running || !loaded || Boolean(error)} onClick={() => void save()}>
            {saving ? '正在保存' : '保存'}
          </Button>
        </>
      }
    >
      {!loaded && !error ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <Loader />
          正在读取规则
        </div>
      ) : null}

      {error ? (
        <ErrorState
          title={isOfflineError(error) ? '没有连上工作台服务' : '规则加载失败'}
          description={error instanceof Error ? error.message : '请重试'}
        >
          <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
            重试
          </Button>
        </ErrorState>
      ) : null}

      {loaded && !error ? (
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
              <RuleParamsEditor rule={rule} onChange={params => update(rule.id, { params })} />
            </li>
          ))}
        </ul>
      ) : null}

      {notice ? <p className="mt-3 text-xs text-(--ui-text-secondary)">{notice}</p> : null}
      {actionError ? <p className="mt-3 text-xs text-(--ui-error)">{actionError}</p> : null}
    </SideDrawer>
  )
}

function RuleParamsEditor({
  rule,
  onChange
}: {
  rule: Rule
  onChange: (params: RuleParams) => void
}) {
  if (rule.kind === 'cross_shop_gap') {
    return (
      <label className="flex items-center gap-2 text-xs text-(--ui-text-secondary)">
        价差 %
        <Input
          aria-label="价差百分比"
          type="number"
          min={0}
          value={rule.params.max_gap_pct ?? 5}
          onChange={event => onChange({ max_gap_pct: numberOr(event.target.value, 5) })}
        />
      </label>
    )
  }
  if (rule.kind === 'low_stock') {
    return (
      <label className="flex items-center gap-2 text-xs text-(--ui-text-secondary)">
        最低库存
        <Input
          aria-label="最低库存"
          type="number"
          min={0}
          value={rule.params.min_stock ?? 10}
          onChange={event => onChange({ min_stock: numberOr(event.target.value, 10) })}
        />
      </label>
    )
  }
  if (rule.kind === 'missing_activity') {
    return (
      <label className="flex items-center gap-2 text-xs text-(--ui-text-secondary)">
        指定活动名
        <Input
          aria-label="指定活动名"
          placeholder="空着则不检查"
          value={rule.params.required_activity ?? ''}
          onChange={event =>
            onChange({ required_activity: event.target.value.trim() ? event.target.value : null })
          }
        />
      </label>
    )
  }
  return <p className="text-xs text-(--ui-text-tertiary)">这条规则没有参数。</p>
}

function paramsOf(rule: Rule): RuleParams {
  if (rule.kind === 'cross_shop_gap') return { max_gap_pct: numberOr(rule.params.max_gap_pct, 5) }
  if (rule.kind === 'low_stock') return { min_stock: numberOr(rule.params.min_stock, 10) }
  if (rule.kind === 'missing_activity') {
    const name = rule.params.required_activity?.trim()
    return { required_activity: name ? name : null }
  }
  return {}
}

function numberOr(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return parsed
}
