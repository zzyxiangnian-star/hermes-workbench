import { useState } from 'react'
import { Button, SegmentedControl, Textarea, cn } from '@hermes/plugin-sdk'
import { createComment, patchComment, type ContentComment } from '../../api/contents'
import { formatTime } from '../products/labels'
import { platformLabel } from './labels'

interface PendingQuote {
  quote: string
  start: number
  end: number
}

export function CommentsPanel({
  contentId,
  comments,
  platform,
  actor,
  pending,
  width,
  onWidthChange,
  onClearPending,
  onBeforeSend,
  onChanged,
  onClose,
  docked = true
}: {
  contentId: number
  comments: ContentComment[]
  platform: string | null
  actor: string
  pending: PendingQuote | null
  width: number
  onWidthChange: (width: number) => void
  onClearPending: () => void
  onBeforeSend?: () => Promise<void>
  onChanged: () => Promise<void>
  onClose?: () => void
  docked?: boolean
}) {
  const [filter, setFilter] = useState<'current' | 'all'>('current')
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const visible = comments
    .filter(item => (filter === 'all' ? true : item.platform === platform))
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
  const openCount = comments.filter(item => item.kind !== 'review' && !item.resolved).length

  const send = async () => {
    const body = draft.trim()
    if (!body) return
    setBusy(true)
    setError(null)
    try {
      if (onBeforeSend) await onBeforeSend()
      await createComment(contentId, {
        body,
        platform,
        quote: pending?.quote ?? null,
        start: pending?.start ?? null,
        end: pending?.end ?? null,
        author: actor.trim() || null
      })
      setDraft('')
      onClearPending()
      await onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '批注失败')
    } finally {
      setBusy(false)
    }
  }

  const resolve = async (id: number) => {
    setError(null)
    try {
      await patchComment(id, true)
      await onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '操作失败')
    }
  }

  return (
    <aside
      style={{ width }}
      className={cn(
        'relative flex shrink-0 flex-col border-l border-(--ui-stroke-secondary) bg-(--ui-bg-editor)',
        docked ? 'sticky top-0 self-start' : 'h-full'
      )}
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="调整批注栏宽度"
        className="absolute inset-y-0 left-0 z-10 w-1 cursor-col-resize hover:bg-(--ui-accent)"
        onPointerDown={event => {
          const startX = event.clientX
          const startWidth = width
          const move = (ev: PointerEvent) => {
            onWidthChange(Math.min(480, Math.max(220, startWidth - (ev.clientX - startX))))
          }
          const up = () => {
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
          }
          window.addEventListener('pointermove', move)
          window.addEventListener('pointerup', up)
        }}
      />
      <div className="flex items-center justify-between gap-2 border-b border-(--ui-stroke-secondary) px-3 py-2">
        <span className="text-xs font-medium">批注{openCount ? ` ${openCount}` : ''}</span>
        <div className="flex items-center gap-1">
          <SegmentedControl
            options={[
              { id: 'current', label: '当前' },
              { id: 'all', label: '全部' }
            ]}
            value={filter}
            onChange={setFilter}
          />
          {onClose ? (
            <Button size="xs" variant="ghost" onClick={onClose}>
              收起
            </Button>
          ) : null}
        </div>
      </div>
      <div className={cn('px-3 py-2', docked ? 'max-h-72 overflow-y-auto' : 'min-h-0 flex-1 overflow-y-auto')}>
        {visible.length === 0 ? (
          <p className="text-xs text-(--ui-text-tertiary)">
            {filter === 'current' ? `${platform ? platformLabel(platform) : '主稿'}还没有批注。` : '还没有批注。'}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visible.map(item =>
              item.kind === 'review' ? (
                <li key={item.id} className="text-[0.6875rem] leading-5 text-(--ui-text-tertiary)">
                  {item.author || '有人'} · {formatTime(item.created_at)} · {item.body}
                </li>
              ) : (
                <li key={item.id} className={item.resolved ? 'opacity-60' : undefined}>
                  {item.quote ? (
                    <blockquote className="border-l-2 border-(--ui-stroke-secondary) pl-2 text-[0.6875rem] text-(--ui-text-tertiary)">
                      {item.quote}
                    </blockquote>
                  ) : null}
                  <p className="mt-1 text-xs leading-5">{item.body}</p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[0.6875rem] text-(--ui-text-tertiary)">
                    <span>
                      {item.author || '未署名'} · {formatTime(item.created_at)}
                      {item.platform ? ` · ${platformLabel(item.platform)}` : ''}
                    </span>
                    {item.resolved ? (
                      <span>已解决</span>
                    ) : (
                      <Button size="xs" variant="ghost" onClick={() => void resolve(item.id)}>
                        标为已解决
                      </Button>
                    )}
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
      <div className="flex flex-col gap-2 border-t border-(--ui-stroke-secondary) p-3">
        {pending ? (
          <div className="flex items-start justify-between gap-2 text-[0.6875rem] text-(--ui-text-tertiary)">
            <span className="max-h-8 overflow-hidden">引用：{pending.quote}</span>
            <button type="button" className="shrink-0 underline" onClick={onClearPending}>
              取消
            </button>
          </div>
        ) : null}
        <Textarea
          aria-label="批注内容"
          placeholder={actor.trim() ? `以${actor.trim()}的名字写批注` : '写批注'}
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <div className="flex justify-end">
          <Button size="xs" disabled={busy || !draft.trim()} onClick={() => void send()}>
            发送
          </Button>
        </div>
      </div>
    </aside>
  )
}
