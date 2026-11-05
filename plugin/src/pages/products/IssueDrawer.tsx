import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  Loader,
  Textarea
} from '@hermes/plugin-sdk'
import { ApiError, isOfflineError } from '../../api/client'
import {
  listIssues,
  listRules,
  patchIssue,
  type Issue,
  type Product,
  type Rule
} from '../../api/products'
import { SideDrawer, FieldText } from './Drawer'
import { formatAmount, formatTime, levelLabel, platformName, statusLabel } from './labels'

export function IssueDrawer({
  product,
  onClose,
  onChanged
}: {
  product: Product | null
  onClose: () => void
  onChanged: () => void
}) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [rules, setRules] = useState<Rule[]>([])
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [notes, setNotes] = useState<Record<number, string>>({})
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [ignoreTarget, setIgnoreTarget] = useState<Issue | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (!product) return
    let cancelled = false
    setLoadedFor(null)
    setError(null)
    Promise.all([listIssues({ shop_id: product.shop_id }), listRules()])
      .then(([issueRows, ruleRows]) => {
        if (cancelled) return
        const mine = issueRows.filter(issue => issue.product_id === product.id)
        setIssues(mine)
        setRules(ruleRows)
        setNotes(Object.fromEntries(mine.map(issue => [issue.id, issue.note ?? ''])))
        setLoadedFor(product.id)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoadedFor(product.id)
      })
    return () => {
      cancelled = true
    }
  }, [product, revision])

  const ruleName = (issue: Issue): string => {
    return rules.find(rule => rule.id === issue.rule_id)?.name ?? issue.rule_kind
  }

  const markResolved = async (issue: Issue) => {
    setPendingId(issue.id)
    setActionError(null)
    try {
      await patchIssue(issue.id, { status: 'resolved', note: notes[issue.id] ?? '' })
      onChanged()
      setRevision(value => value + 1)
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '操作失败')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <SideDrawer
      open={product != null}
      title={product?.title ?? '商品问题'}
      description={product ? `${platformName(product.platform)} · ${product.shop_name}` : undefined}
      onClose={onClose}
    >
      {product ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldText label="编码">{product.product_code || '—'}</FieldText>
            <FieldText label="货号">{product.sku || '—'}</FieldText>
            <FieldText label="价格 / 底价">
              <span className={belowFloor(product) ? 'text-(--ui-error)' : undefined}>
                {formatAmount(product.price)}
              </span>
              {' / '}
              {product.floor_price == null ? '—' : formatAmount(product.floor_price)}
            </FieldText>
            <FieldText label="库存">{product.stock}</FieldText>
            <FieldText label="活动" className="col-span-2">
              {product.activity || '—'}
            </FieldText>
          </div>

          {loadedFor !== product.id && !error ? (
            <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
              <Loader />
              正在读取问题
            </div>
          ) : null}

          {error ? (
            <ErrorState
              title={isOfflineError(error) ? '没有连上工作台服务' : '问题加载失败'}
              description={error instanceof Error ? error.message : '请重试'}
            >
              <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
                重试
              </Button>
            </ErrorState>
          ) : null}

          {loadedFor === product.id && !error && issues.length === 0 ? (
            <p className="text-xs text-(--ui-text-tertiary)">这个商品没有问题记录。</p>
          ) : null}

          {actionError ? <p className="text-xs text-(--ui-error)">{actionError}</p> : null}

          {loadedFor === product.id && !error ? (
          <ul className="flex flex-col gap-3">
            {issues.map(issue => (
              <li
                key={issue.id}
                className="flex flex-col gap-2 border-b border-(--ui-stroke-secondary) pb-3"
              >
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium">{ruleName(issue)}</span>
                  <Badge variant={issue.level === 'must' ? 'destructive' : 'warn'}>
                    {levelLabel(issue.level)}
                  </Badge>
                  <Badge variant="outline">{statusLabel(issue.status)}</Badge>
                </div>
                <p className="text-xs leading-relaxed text-(--ui-text-secondary)">{issue.message}</p>
                <p className="text-[0.6875rem] text-(--ui-text-tertiary)">
                  发现于 {formatTime(issue.found_at)}
                </p>
                <Textarea
                  aria-label={`${ruleName(issue)}的备注`}
                  value={notes[issue.id] ?? ''}
                  placeholder="备注（可选）"
                  onChange={event =>
                    setNotes(current => ({ ...current, [issue.id]: event.target.value }))
                  }
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    disabled={pendingId === issue.id || issue.status === 'resolved'}
                    onClick={() => void markResolved(issue)}
                  >
                    标为已处理
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={pendingId === issue.id || issue.status === 'ignored'}
                    onClick={() => setIgnoreTarget(issue)}
                  >
                    忽略
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          ) : null}
        </div>
      ) : null}

      <ConfirmDialog
        open={ignoreTarget != null}
        title="忽略这个问题"
        description="忽略后，只要情况没变，下次检查不会再把它打开。"
        confirmLabel="忽略"
        onClose={() => setIgnoreTarget(null)}
        onConfirm={async () => {
          if (!ignoreTarget) return
          try {
            await patchIssue(ignoreTarget.id, {
              status: 'ignored',
              note: notes[ignoreTarget.id] ?? ''
            })
          } catch (reason) {
            const message = reason instanceof ApiError ? reason.message : '忽略失败'
            throw new Error(message)
          }
          onChanged()
          setRevision(value => value + 1)
        }}
      />
    </SideDrawer>
  )
}

function belowFloor(product: Product): boolean {
  return product.floor_price != null && product.price < product.floor_price
}
