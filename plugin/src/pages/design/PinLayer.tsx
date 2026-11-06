import { useState } from 'react'
import { Button, Input, cn } from '@hermes/plugin-sdk'
import { assetSrc, type DesignAsset, type DesignComment } from '../../api/design'
import { errorText } from './labels'

export function PinLayer({
  asset,
  comments,
  disabled,
  onAdd,
  onResolve
}: {
  asset: DesignAsset
  comments: DesignComment[]
  disabled?: boolean
  onAdd: (x: number, y: number, body: string) => Promise<void>
  onResolve: (id: number) => Promise<void>
}) {
  const [draft, setDraft] = useState<{ x: number; y: number; body: string } | null>(null)
  const [hoverId, setHoverId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pins = comments
    .filter(item => item.asset_id === asset.id && item.x != null && item.y != null)
    .slice()
    .sort((a, b) => a.id - b.id)

  return (
    <div className="relative inline-block max-w-full bg-(--ui-bg-secondary)">
      <img
        src={assetSrc(asset.url)}
        alt={asset.file_name}
        draggable={false}
        className="block max-h-[70vh] max-w-full"
        onClick={event => {
          if (disabled || saving) return
          const rect = event.currentTarget.getBoundingClientRect()
          if (rect.width <= 0 || rect.height <= 0) return
          const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
          const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
          setDraft({ x, y, body: '' })
          setError(null)
        }}
      />
      {pins.map((pin, index) => (
        <button
          key={pin.id}
          type="button"
          aria-label={`批注 ${index + 1}：${pin.body}`}
          className={cn(
            'absolute z-10 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-(--ui-accent) text-[0.625rem] font-medium text-white',
            pin.resolved && 'opacity-45'
          )}
          style={{ left: `${(pin.x ?? 0) * 100}%`, top: `${(pin.y ?? 0) * 100}%` }}
          onMouseEnter={() => setHoverId(pin.id)}
          onMouseLeave={() => setHoverId(current => (current === pin.id ? null : current))}
          onClick={event => {
            event.stopPropagation()
            if (!pin.resolved) void onResolve(pin.id)
          }}
        >
          {index + 1}
          {hoverId === pin.id ? (
            <span className="pointer-events-none absolute top-6 left-1/2 z-20 w-40 -translate-x-1/2 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) px-2 py-1 text-left text-xs font-normal whitespace-normal text-(--ui-text-primary) shadow-sm">
              {pin.body}
            </span>
          ) : null}
        </button>
      ))}
      {draft ? (
        <form
          className="absolute z-20 flex w-44 flex-col gap-1 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-2 shadow-md"
          style={{
            left: `${draft.x * 100}%`,
            top: `${draft.y * 100}%`,
            transform: draft.x > 0.65 ? 'translate(-100%, 0.5rem)' : 'translate(0.5rem, 0.5rem)'
          }}
          onSubmit={event => {
            event.preventDefault()
            const body = draft.body.trim()
            if (!body || saving) return
            setSaving(true)
            setError(null)
            void onAdd(draft.x, draft.y, body)
              .then(() => setDraft(null))
              .catch((reason: unknown) => setError(errorText(reason, '批注没有保存')))
              .finally(() => setSaving(false))
          }}
          onClick={event => event.stopPropagation()}
        >
          <Input
            aria-label="批注"
            value={draft.body}
            placeholder="写在这张图上"
            autoFocus
            onChange={event => setDraft({ ...draft, body: event.target.value })}
          />
          <div className="flex justify-end gap-1">
            <Button type="button" size="xs" variant="ghost" onClick={() => setDraft(null)}>
              取消
            </Button>
            <Button type="submit" size="xs" disabled={saving || !draft.body.trim()}>
              保存
            </Button>
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </form>
      ) : null}
    </div>
  )
}
