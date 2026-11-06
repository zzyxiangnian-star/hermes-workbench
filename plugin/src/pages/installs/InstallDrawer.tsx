import { useEffect, useState } from 'react'
import { Button, ConfirmDialog, ErrorState, Input, Loader, Textarea } from '@hermes/plugin-sdk'
import { ApiError, isOfflineError } from '../../api/client'
import {
  addInstallNote,
  getInstall,
  getInstallNotice,
  setInstallStatus,
  type InstallDetail,
  type InstallStatus
} from '../../api/installs'
import { SideDrawer, FieldText } from '../products/Drawer'
import { BookDialog } from './BookDialog'
import { appointmentInputValue, appointmentPayload, formatAmount, formatShanghai, statusLabel } from './labels'

const ACTOR_KEY = 'hermes-workbench:actor'

function readActor(): string {
  try {
    return window.localStorage.getItem(ACTOR_KEY) ?? ''
  } catch {
    return ''
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', 'true')
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function InstallDrawer({
  installId,
  onClose,
  onChanged
}: {
  installId: number | null
  onClose: () => void
  onChanged: () => void
}) {
  const [detail, setDetail] = useState<InstallDetail | null>(null)
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [actor, setActor] = useState(readActor)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [flagging, setFlagging] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTOR_KEY, actor)
    } catch {
      // 忽略受限环境。
    }
  }, [actor])

  useEffect(() => {
    if (installId == null) return
    let cancelled = false
    setLoadedFor(null)
    setError(null)
    setNotice(null)
    setActionError(null)
    setBooking(false)
    setFlagging(false)
    setCancelling(false)
    getInstall(installId)
      .then(value => {
        if (cancelled) return
        setDetail(value)
        setLoadedFor(installId)
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoadedFor(installId)
      })
    return () => {
      cancelled = true
    }
  }, [installId, revision])

  const by = actor.trim() || null

  const apply = async (action: () => Promise<InstallDetail>) => {
    setBusy(true)
    setActionError(null)
    try {
      const next = await action()
      setDetail(next)
      setLoadedFor(next.id)
      onChanged()
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : '操作失败')
      throw reason
    } finally {
      setBusy(false)
    }
  }

  const runStatus = (status: InstallStatus, extra?: { appointment_at?: string; engineer?: string; provider_ref?: string; reason?: string }) =>
    apply(() => {
      if (installId == null) throw new Error('工单还没加载')
      return setInstallStatus(installId, { status, by, ...extra })
    })

  const copyNotice = async () => {
    if (installId == null) return
    setBusy(true)
    setActionError(null)
    setNotice(null)
    try {
      const payload = await getInstallNotice(installId)
      const ok = await copyText(payload.text)
      setNotice(ok ? '已复制，请粘贴到旺旺/京东咚咚发给顾客' : payload.text)
      if (!ok) setActionError('复制失败，请手动选择下面的文字')
    } catch (reason) {
      setActionError(reason instanceof ApiError ? reason.message : '复制失败')
    } finally {
      setBusy(false)
    }
  }

  const ready = detail != null && loadedFor === installId ? detail : null
  const status = ready?.status
  const footer = ready ? (
    <div className="flex w-full flex-wrap items-center justify-end gap-2">
      {status === 'pending' ? (
        <>
          <Button size="xs" disabled={busy} onClick={() => setBooking(true)}>
            填预约
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setFlagging(true)}>
            标异常
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setCancelling(true)}>
            取消
          </Button>
        </>
      ) : null}
      {status === 'booked' ? (
        <>
          <Button size="xs" disabled={busy} onClick={() => void runStatus('done').catch(() => undefined)}>
            已完工
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setBooking(true)}>
            改预约
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setFlagging(true)}>
            标异常
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => void copyNotice()}>
            复制预约通知
          </Button>
        </>
      ) : null}
      {status === 'exception' ? (
        <>
          <Button size="xs" disabled={busy} onClick={() => setBooking(true)}>
            重新预约
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => void runStatus('pending').catch(() => undefined)}>
            退回待预约
          </Button>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => setCancelling(true)}>
            取消
          </Button>
        </>
      ) : null}
    </div>
  ) : null

  return (
    <SideDrawer
      open={installId != null}
      title={ready ? `${ready.code} · ${ready.title}` : '安装工单'}
      description={ready ? `${ready.shop_name} · ${statusLabel(ready.status)}` : undefined}
      onClose={onClose}
      footer={footer}
      widthClass="max-w-lg"
    >
      {installId != null && loadedFor !== installId && !error ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <Loader />
          正在读取工单
        </div>
      ) : null}
      {error ? (
        <ErrorState
          title={isOfflineError(error) ? '没有连上工作台服务' : '工单加载失败'}
          description={error instanceof Error ? error.message : '请重试'}
        >
          <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
            重试
          </Button>
        </ErrorState>
      ) : null}
      {detail && loadedFor === installId ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-(--ui-text-secondary)">署名</span>
            <Input
              aria-label="署名"
              value={actor}
              placeholder="你的名字"
              onChange={event => setActor(event.target.value)}
              style={{ width: '7rem' }}
            />
          </div>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">订单</h3>
            <div className="grid grid-cols-2 gap-3">
              <FieldText label="工单号">{detail.code}</FieldText>
              <FieldText label="订单号">{detail.order_no}</FieldText>
              <FieldText label="商品" className="col-span-2">
                {detail.title}
              </FieldText>
              <FieldText label="数量 / 金额">
                {detail.quantity} / {formatAmount(detail.amount)}
              </FieldText>
              <FieldText label="付款时间">{formatShanghai(detail.paid_at)}</FieldText>
              <FieldText label="服务商">{detail.provider}</FieldText>
              <FieldText label="服务商单号">{detail.provider_ref || '—'}</FieldText>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">收货</h3>
            <FieldText label="收货人">{detail.buyer_name || '—'}</FieldText>
            <div className="flex flex-wrap items-end gap-2">
              <FieldText label="手机">{detail.phone || '—'}</FieldText>
              {detail.phone ? (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    void copyText(detail.phone ?? '').then(ok => {
                      setNotice(ok ? '手机号已复制' : null)
                      if (!ok) setActionError('复制失败，请手动选择手机号')
                    })
                  }}
                >
                  复制
                </Button>
              ) : null}
            </div>
            <FieldText label="地址">{detail.address || '—'}</FieldText>
          </section>

          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">买家留言</h3>
            <p className="text-xs leading-relaxed text-(--ui-text-secondary)">{detail.remark || '没有留言'}</p>
          </section>

          {detail.appointment_at ? (
            <FieldText label="预约">
              {formatShanghai(detail.appointment_at)}
              {detail.engineer ? ` · ${detail.engineer}` : ''}
            </FieldText>
          ) : null}
          {detail.exception_reason ? (
            <p className="text-xs text-destructive">异常：{detail.exception_reason}</p>
          ) : null}

          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">备注</h3>
            {detail.note ? <p className="text-xs leading-relaxed text-(--ui-text-secondary)">{detail.note}</p> : null}
            <Textarea
              aria-label="备注"
              value={note}
              placeholder="追加一条备注"
              onChange={event => setNote(event.target.value)}
            />
            <div>
              <Button
                size="xs"
                variant="outline"
                disabled={busy || !note.trim()}
                onClick={() => {
                  if (installId == null) return
                  void apply(() => addInstallNote(installId, note.trim(), by))
                    .then(() => setNote(''))
                    .catch(() => undefined)
                }}
              >
                添加备注
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">处理记录</h3>
            {detail.events.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有处理记录。</p>
            ) : (
              <ul className="flex flex-col">
                {detail.events.map((event, index) => (
                  <li key={`${event.at}-${index}`} className="border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)">
                    {formatShanghai(event.at)} · {event.by || '有人'} · {event.text}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
          {notice ? <p className="text-xs leading-relaxed text-(--ui-text-secondary)">{notice}</p> : null}
        </div>
      ) : null}

      <BookDialog
        open={booking}
        mode="book"
        appointment={appointmentInputValue(detail?.appointment_at ?? null)}
        engineer={detail?.engineer ?? ''}
        providerRef={detail?.provider_ref ?? ''}
        onClose={() => setBooking(false)}
        onConfirm={async value => {
          await runStatus('booked', {
            appointment_at: appointmentPayload(value.appointment),
            engineer: value.engineer || undefined,
            provider_ref: value.providerRef || undefined
          })
        }}
      />
      <BookDialog
        open={flagging}
        mode="exception"
        appointment=""
        engineer=""
        providerRef=""
        onClose={() => setFlagging(false)}
        onConfirm={async value => {
          await runStatus('exception', { reason: value.reason })
        }}
      />
      <ConfirmDialog
        open={cancelling}
        title="取消这张工单"
        description="取消后不再安排上门。"
        confirmLabel="取消工单"
        onClose={() => setCancelling(false)}
        onConfirm={async () => {
          await runStatus('cancelled')
        }}
      />
    </SideDrawer>
  )
}
