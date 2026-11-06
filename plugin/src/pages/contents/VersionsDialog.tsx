import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@hermes/plugin-sdk'
import { diffContent, type ContentDiff, type ContentVersion } from '../../api/contents'
import { formatTime } from '../products/labels'
import { platformLabel } from './labels'

export function VersionsDialog({
  open,
  contentId,
  versions,
  platforms,
  onClose
}: {
  open: boolean
  contentId: number
  versions: ContentVersion[]
  platforms: string[]
  onClose: () => void
}) {
  const ordered = versions.slice().sort((a, b) => a.version - b.version)
  const oldest = ordered[0]?.version ?? 1
  const latest = ordered[ordered.length - 1]?.version ?? 1
  const [fromVersion, setFromVersion] = useState(oldest)
  const [toVersion, setToVersion] = useState(latest)
  const [platform, setPlatform] = useState('')
  const [diff, setDiff] = useState<ContentDiff | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setFromVersion(oldest)
    setToVersion(latest)
    setPlatform('')
  }, [open, oldest, latest])

  useEffect(() => {
    if (!open) return
    if (fromVersion === toVersion) {
      setDiff(null)
      setError(ordered.length < 2 ? '只有一个版本，还不能对比。' : '请选择两个不同的版本。')
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    diffContent(contentId, {
      from_version: fromVersion,
      to_version: toVersion,
      platform: platform || undefined
    }).then(
      value => {
        if (cancelled) return
        setDiff(value)
        setLoading(false)
      },
      (reason: unknown) => {
        if (cancelled) return
        setDiff(null)
        setError(reason instanceof Error ? reason.message : '对比失败')
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [open, contentId, fromVersion, toVersion, platform, ordered.length])

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>版本历史</DialogTitle>
        </DialogHeader>
        <ul className="max-h-36 overflow-y-auto border border-(--ui-stroke-secondary) text-xs">
          {ordered.length === 0 ? <li className="px-2 py-1.5 text-(--ui-text-tertiary)">还没有版本。</li> : null}
          {ordered
            .slice()
            .reverse()
            .map(item => (
              <li key={item.version} className="border-b border-(--ui-stroke-secondary) px-2 py-1.5">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setFromVersion(item.version)}
                >
                  <span className="font-medium">v{item.version}</span>
                  <span className="text-(--ui-text-tertiary)">
                    {' '}
                    · {item.author || '未署名'} · {formatTime(item.created_at)}
                    {item.note ? ` · ${item.note}` : ''}
                  </span>
                </button>
              </li>
            ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <VersionSelect label="从" value={fromVersion} versions={ordered} onChange={setFromVersion} />
          <VersionSelect label="到" value={toVersion} versions={ordered} onChange={setToVersion} />
          <label className="flex flex-col gap-1 text-[0.6875rem] text-(--ui-text-tertiary)">
            平台
            <Select value={platform || 'main'} onValueChange={value => setPlatform(value === 'main' ? '' : value)}>
              <SelectTrigger aria-label="对比哪个版本">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">主稿</SelectItem>
                {platforms.map(item => (
                  <SelectItem key={item} value={item}>
                    {platformLabel(item)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <p className="text-[0.6875rem] text-(--ui-text-tertiary)">划掉的是旧稿里删掉的，底色是新稿加上的。</p>
        {loading ? <p className="text-xs text-(--ui-text-tertiary)">正在对比…</p> : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        {diff ? (
          <div className="flex flex-col gap-2 text-xs leading-6">
            {diff.title_from !== diff.title_to ? (
              <p>
                标题：<span className="line-through text-destructive">{diff.title_from || '（空）'}</span>
                {' → '}
                {diff.title_to || '（空）'}
              </p>
            ) : null}
            <p className="whitespace-pre-wrap">
              {diff.segments.length === 0 ? <span className="text-(--ui-text-tertiary)">两版正文一样。</span> : null}
              {diff.segments.map((segment, index) => {
                if (segment.op === 'delete') {
                  return (
                    <span key={index} className="bg-destructive/15 text-destructive line-through">
                      {segment.text}
                    </span>
                  )
                }
                if (segment.op === 'insert') {
                  return (
                    <span
                      key={index}
                      style={{ background: 'color-mix(in srgb, var(--ui-accent) 24%, transparent)' }}
                    >
                      {segment.text}
                    </span>
                  )
                }
                return <span key={index}>{segment.text}</span>
              })}
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function VersionSelect({
  label,
  value,
  versions,
  onChange
}: {
  label: string
  value: number
  versions: ContentVersion[]
  onChange: (version: number) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-[0.6875rem] text-(--ui-text-tertiary)">
      {label}
      <Select value={String(value)} onValueChange={next => onChange(Number(next))}>
        <SelectTrigger aria-label={`${label}哪一版`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {versions.map(item => (
            <SelectItem key={item.version} value={String(item.version)}>
              v{item.version}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  )
}
