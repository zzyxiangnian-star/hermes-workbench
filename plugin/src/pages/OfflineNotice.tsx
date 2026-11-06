import { useState } from 'react'
import { Button, EmptyState, Input } from '@hermes/plugin-sdk'
import { setApiBase, useApiBase } from '../settings'

export function OfflineNotice({ detail, onRetry }: { detail?: string; onRetry: () => void }) {
  const apiBase = useApiBase()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(apiBase)
  const [addressError, setAddressError] = useState<string | null>(null)
  const description =
    detail && detail !== '没有连上工作台服务' ? `${detail}。当前地址 ${apiBase}` : `当前地址 ${apiBase}`

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
      <EmptyState title="没有连上工作台服务" description={description}>
        <Button size="sm" variant="outline" onClick={onRetry}>
          重试
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setDraft(apiBase)
            setAddressError(null)
            setEditing(true)
          }}
        >
          更改地址
        </Button>
      </EmptyState>
      {editing ? (
        <form
          className="flex w-full max-w-sm items-center gap-2"
          onSubmit={event => {
            event.preventDefault()
            const ok = setApiBase(draft)
            if (!ok) {
              setAddressError('地址需要以 http:// 或 https:// 开头')
              return
            }
            setEditing(false)
            setAddressError(null)
            onRetry()
          }}
        >
          <Input aria-label="工作台服务地址" value={draft} onChange={event => setDraft(event.target.value)} />
          <Button size="sm" type="submit">
            保存
          </Button>
        </form>
      ) : null}
      {addressError ? <p className="text-center text-xs text-destructive">{addressError}</p> : null}
    </div>
  )
}
