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
  Textarea
} from '@hermes/plugin-sdk'

export function BookDialog({
  open,
  mode,
  appointment,
  engineer,
  providerRef,
  onClose,
  onConfirm
}: {
  open: boolean
  mode: 'book' | 'exception'
  appointment: string
  engineer: string
  providerRef: string
  onClose: () => void
  onConfirm: (value: {
    appointment: string
    engineer: string
    providerRef: string
    reason: string
  }) => Promise<void>
}) {
  const [when, setWhen] = useState(appointment)
  const [who, setWho] = useState(engineer)
  const [refNo, setRefNo] = useState(providerRef)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setWhen(appointment)
    setWho(engineer)
    setRefNo(providerRef)
    setReason('')
    setError(null)
    setBusy(false)
  }, [open, appointment, engineer, providerRef])

  const submit = async () => {
    if (mode === 'book' && !when) {
      setError('请填写预约时间')
      return
    }
    if (mode === 'exception' && !reason.trim()) {
      setError('请填写异常原因')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await onConfirm({
        appointment: when,
        engineer: who.trim(),
        providerRef: refNo.trim(),
        reason: reason.trim()
      })
      onClose()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '操作失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'book' ? '填预约' : '标异常'}</DialogTitle>
          <DialogDescription>
            {mode === 'book' ? '时间按北京时间提交。' : '写明这次约不上或需要跟进的原因。'}
          </DialogDescription>
        </DialogHeader>
        {mode === 'book' ? (
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              预约时间
              <Input
                aria-label="预约时间"
                type="datetime-local"
                value={when}
                onChange={event => setWhen(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              师傅
              <Input aria-label="师傅" value={who} placeholder="刘师傅" onChange={event => setWho(event.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              服务商单号
              <Input
                aria-label="服务商单号"
                value={refNo}
                placeholder="啄木鸟单号，可以不填"
                onChange={event => setRefNo(event.target.value)}
              />
            </label>
          </div>
        ) : (
          <Textarea
            aria-label="异常原因"
            value={reason}
            placeholder="异常原因"
            onChange={event => setReason(event.target.value)}
          />
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button disabled={busy} onClick={() => void submit()}>
            {busy ? '正在提交' : mode === 'book' ? '保存预约' : '标为异常'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
