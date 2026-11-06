import { useEffect, useState } from 'react'
import { Badge, Button, ConfirmDialog, ErrorState, Loader, Textarea } from '@hermes/plugin-sdk'
import { ApiError, isOfflineError } from '../../api/client'
import {
  approveFollowup,
  cancelFollowup,
  deleteFollowup,
  exportFollowup,
  getFollowup,
  markFollowupTarget,
  patchFollowup,
  type FollowupDetail
} from '../../api/customers'
import {
  channelLabel,
  copyText,
  errorText,
  followupStatusLabel,
  followupStatusVariant,
  loadActor,
  saveActor,
  segmentLabel
} from './labels'

export function FollowupView({ id, onBack }: { id: number; onBack: () => void }) {
  const [detail, setDetail] = useState<FollowupDetail | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [template, setTemplate] = useState('')
  const [actor, setActor] = useState(loadActor)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [complianceError, setComplianceError] = useState<string | null>(null)
  const [copyHint, setCopyHint] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let cancelled = false
    setError(null)
    getFollowup(id).then(
      value => {
        if (cancelled) return
        setDetail(value)
        setTemplate(value.template)
      },
      (reason: unknown) => {
        if (!cancelled) setError(reason)
      }
    )
    return () => {
      cancelled = true
    }
  }, [id, revision])

  const apply = async (task: () => Promise<FollowupDetail>) => {
    setBusy(true)
    setActionError(null)
    setComplianceError(null)
    saveActor(actor)
    try {
      const next = await task()
      setDetail(next)
      setTemplate(next.template)
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === 'compliance_failed') {
        setComplianceError(reason.message)
      } else {
        setActionError(errorText(reason, '操作失败'))
      }
      throw reason
    } finally {
      setBusy(false)
    }
  }

  const saveTemplate = () => {
    if (!detail || template.trim() === detail.template) return Promise.resolve(detail)
    return apply(() => patchFollowup(id, { template: template.trim() }))
  }

  const approve = async () => {
    if (detail && template.trim() !== detail.template) {
      await saveTemplate()
    }
    await apply(() => approveFollowup(id, actor.trim() || null))
  }

  const copyMessage = async (targetId: number, message: string) => {
    const ok = await copyText(message)
    setCopyHint(ok ? `已复制 #${targetId}` : message)
    if (!ok) setActionError('复制失败，请手动选择下面的文字')
    else setActionError(null)
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <ErrorState
          title={isOfflineError(error) ? '没有连上工作台服务' : '跟进任务加载失败'}
          description={errorText(error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={onBack}>
            返回
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
            重试
          </Button>
        </ErrorState>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取跟进任务
      </div>
    )
  }

  const draft = detail.status === 'draft'
  const approved = detail.status === 'approved'
  const counts = detail.counts

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" variant="outline" onClick={onBack}>
          返回
        </Button>
        <h2 className="min-w-0 text-sm font-medium">{detail.name}</h2>
        <Badge variant={followupStatusVariant(detail.status)}>{followupStatusLabel(detail.status)}</Badge>
        <span className="text-xs text-(--ui-text-tertiary)">
          {segmentLabel(detail.segment)} · {channelLabel(detail.channel)} · 待发 {counts.pending} / 已发 {counts.sent} / 跳过{' '}
          {counts.skipped}
        </span>
      </div>

      <p className="rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) px-3 py-2 text-xs text-(--ui-text-secondary)">
        系统不会自动发送，请复制到企业微信 / 平台客服里发，发完点已发。
      </p>

      {draft ? (
        <div className="flex flex-col gap-2">
          <Textarea aria-label="话术" value={template} onChange={event => setTemplate(event.target.value)} />
          {complianceError ? <p className="text-xs text-destructive">{complianceError}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button size="xs" variant="outline" disabled={busy || !template.trim()} onClick={() => void saveTemplate().catch(() => undefined)}>
              保存话术
            </Button>
            <Button size="xs" disabled={busy || !template.trim()} onClick={() => void approve().catch(() => undefined)}>
              审核通过
            </Button>
            <Button size="xs" variant="outline" disabled={busy} onClick={() => setConfirmDelete(true)}>
              删除
            </Button>
          </div>
        </div>
      ) : null}

      {approved || detail.status === 'done' ? (
        <div className="flex flex-wrap gap-2">
          {approved ? (
            <Button
              size="xs"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setBusy(true)
                setActionError(null)
                void exportFollowup(id)
                  .catch((reason: unknown) => setActionError(errorText(reason, '导出失败')))
                  .finally(() => setBusy(false))
              }}
            >
              导出名单
            </Button>
          ) : null}
          {approved ? (
            <Button size="xs" variant="outline" disabled={busy} onClick={() => setConfirmCancel(true)}>
              取消任务
            </Button>
          ) : null}
        </div>
      ) : null}

      <ul className="min-w-0">
        {detail.targets.map(target => (
          <li
            key={target.id}
            className={
              target.status === 'skipped'
                ? 'flex flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-xs opacity-60'
                : 'flex flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-xs'
            }
          >
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-(--ui-text-primary)">{target.customer_name || '未留姓名'}</span>
              <span className="text-(--ui-text-secondary)">{target.phone || '无手机号'}</span>
              {target.status === 'sent' ? <Badge variant="outline">已发</Badge> : null}
              {target.status === 'skipped' ? <Badge variant="outline">跳过</Badge> : null}
            </span>
            <p className="leading-relaxed text-(--ui-text-secondary)">{target.message}</p>
            {target.status === 'skipped' && target.note ? (
              <p className="text-(--ui-text-tertiary)">{target.note}</p>
            ) : null}
            {approved && target.status === 'pending' ? (
              <div className="flex flex-wrap gap-2">
                <Button size="xs" variant="outline" disabled={busy} onClick={() => void copyMessage(target.id, target.message)}>
                  复制
                </Button>
                <Button
                  size="xs"
                  disabled={busy}
                  onClick={() => void apply(() => markFollowupTarget(target.id, { status: 'sent' })).catch(() => undefined)}
                >
                  已发
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void apply(() => markFollowupTarget(target.id, { status: 'skipped' })).catch(() => undefined)}
                >
                  跳过
                </Button>
              </div>
            ) : null}
            {(approved || detail.status === 'done') && target.status !== 'pending' ? (
              <div>
                <Button size="xs" variant="outline" onClick={() => void copyMessage(target.id, target.message)}>
                  复制
                </Button>
              </div>
            ) : null}
          </li>
        ))}
      </ul>
      {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
      {copyHint ? <p className="text-xs leading-relaxed text-(--ui-text-secondary)">{copyHint}</p> : null}

      <ConfirmDialog
        open={confirmDelete}
        title="删除这个草稿"
        description="名单会一起删掉。"
        confirmLabel="删除"
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteFollowup(id)
          onBack()
        }}
      />
      <ConfirmDialog
        open={confirmCancel}
        title="取消这个跟进任务"
        description="取消后不能再标记已发。"
        confirmLabel="取消任务"
        onClose={() => setConfirmCancel(false)}
        onConfirm={async () => {
          await apply(() => cancelFollowup(id))
          setConfirmCancel(false)
        }}
      />
    </div>
  )
}
