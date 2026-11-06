import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import {
  Badge,
  Button,
  ConfirmDialog,
  ErrorState,
  Input,
  Loader,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tip
} from '@hermes/plugin-sdk'
import { ApiError } from '../../api/client'
import { refreshInReviewCount } from '../../api/content-count'
import {
  approveContent,
  getContent,
  publishContent,
  rejectContent,
  submitContent,
  updateContent,
  withdrawContent,
  type ContentDetail,
  type ContentVariant
} from '../../api/contents'
import { CompliancePanel } from '../assets/CompliancePanel'
import { HeaderActions } from '../HeaderActions'
import { CommentsPanel } from './CommentsPanel'
import {
  CONTENT_PLATFORMS,
  bodyLimit,
  isLockedStatus,
  platformLabel,
  platformMark,
  statusLabel,
  statusVariant
} from './labels'
import { VersionsDialog } from './VersionsDialog'

const ACTOR_KEY = 'hermes-workbench:actor'
const NARROW_PX = 760

interface DraftVariant {
  platform: string
  title: string
  body: string
}

interface QuoteSelection {
  quote: string
  start: number
  end: number
}

function loadActor(): string {
  try {
    return window.localStorage.getItem(ACTOR_KEY) ?? ''
  } catch {
    return ''
  }
}

function toDraft(variants: ContentVariant[]): DraftVariant[] {
  return variants.map(item => ({
    platform: item.platform,
    title: item.title ?? '',
    body: item.body
  }))
}

function draftSignature(title: string, body: string, variants: DraftVariant[], note: string): string {
  return JSON.stringify({
    title,
    body,
    note,
    variants: variants.map(item => ({ platform: item.platform, title: item.title, body: item.body }))
  })
}

function messageOf(reason: unknown, fallback: string): string {
  if (reason instanceof ApiError) return reason.message
  if (reason instanceof Error) return reason.message
  return fallback
}

export function ContentEditor({ id, onBack }: { id: number; onBack: () => void }) {
  const frame = useRef<HTMLDivElement>(null)
  const bypassRef = useRef(false)
  const saveRef = useRef<() => Promise<ContentDetail | null>>(async () => null)
  const [detail, setDetail] = useState<ContentDetail | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [variants, setVariants] = useState<DraftVariant[]>([])
  const [note, setNote] = useState('')
  const [baseline, setBaseline] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [tab, setTab] = useState('main')
  const [actor, setActor] = useState(loadActor)
  const [flowError, setFlowError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [wide, setWide] = useState(true)
  const [railWidth, setRailWidth] = useState(280)
  const [railOpen, setRailOpen] = useState(false)
  const [selection, setSelection] = useState<QuoteSelection | null>(null)
  const [pending, setPending] = useState<QuoteSelection | null>(null)
  const [pendingLeave, setPendingLeave] = useState<HTMLElement | 'back' | null>(null)
  const [rejecting, setRejecting] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [publishPlatform, setPublishPlatform] = useState('')
  const [publishUrl, setPublishUrl] = useState('')
  const [versionsOpen, setVersionsOpen] = useState(false)

  const locked = detail ? isLockedStatus(detail.status) : true
  const dirty = ready && draftSignature(title, body, variants, note) !== baseline
  const current = tab === 'main' ? null : variants.find(item => item.platform === tab) ?? null
  const currentBody = current ? current.body : body
  const currentTitle = current ? current.title : title
  const limit = bodyLimit(current ? current.platform : null)

  const adopt = (next: ContentDetail) => {
    const draft = toDraft(next.variants)
    setDetail(next)
    setTitle(next.title)
    setBody(next.body)
    setVariants(draft)
    setNote('')
    setBaseline(draftSignature(next.title, next.body, draft, ''))
    setReady(true)
    setTab(value => (value !== 'main' && !draft.some(item => item.platform === value) ? 'main' : value))
    setFlowError(null)
  }

  const adoptRef = useRef(adopt)
  adoptRef.current = adopt

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setReady(false)
    getContent(id).then(
      value => {
        if (cancelled) return
        adoptRef.current(value)
        setLoading(false)
      },
      (reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoading(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    try {
      window.localStorage.setItem(ACTOR_KEY, actor)
    } catch {
      // 忽略受限环境下的 localStorage 异常
    }
  }, [actor])

  useEffect(() => {
    setSelection(null)
    setPending(null)
  }, [tab])

  useEffect(() => {
    const node = frame.current
    if (!node) return
    const apply = (width: number) => setWide(width >= NARROW_PX)
    apply(node.clientWidth)
    const observer = new ResizeObserver(entries => {
      apply(entries[0]?.contentRect.width ?? node.clientWidth)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [ready])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 's' || !(event.ctrlKey || event.metaKey)) return
      event.preventDefault()
      void saveRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const onClick = (event: MouseEvent) => {
      if (bypassRef.current) return
      const target = event.target
      if (!(target instanceof Element)) return
      const row = target.closest('.wb-pane-row, [data-preview-nav]')
      if (!(row instanceof HTMLElement)) return
      event.preventDefault()
      event.stopPropagation()
      setPendingLeave(row)
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onClick, true)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onClick, true)
    }
  }, [dirty])

  const save = async (): Promise<ContentDetail | null> => {
    if (!detail || locked || !dirty) return detail
    setSaving(true)
    setFlowError(null)
    try {
      const next = await updateContent(detail.id, {
        title: title.trim(),
        body,
        variants: variants.map(item => ({
          platform: item.platform,
          title: item.title.trim() || null,
          body: item.body
        })),
        note: note.trim() || null
      })
      adopt(next)
      return next
    } catch (reason) {
      setFlowError(messageOf(reason, '保存失败'))
      return null
    } finally {
      setSaving(false)
    }
  }
  saveRef.current = save

  const reload = async () => {
    const next = await getContent(id)
    if (draftSignature(title, body, variants, note) !== baseline) {
      setDetail(next)
      return
    }
    adopt(next)
  }

  const run = async (action: (current: ContentDetail) => Promise<ContentDetail>, saveFirst = false) => {
    if (!detail) return
    setBusy(true)
    setFlowError(null)
    try {
      let current = detail
      if (saveFirst && dirty) {
        const saved = await save()
        if (!saved) return
        current = saved
      }
      const next = await action(current)
      adopt(next)
      void refreshInReviewCount()
    } catch (reason) {
      setFlowError(messageOf(reason, '操作失败'))
    } finally {
      setBusy(false)
    }
  }

  const setCurrentBody = (value: string) => {
    setSelection(null)
    if (!current) {
      setBody(value)
      return
    }
    const platform = current.platform
    setVariants(items => items.map(item => (item.platform === platform ? { ...item, body: value } : item)))
  }

  const setCurrentTitle = (value: string) => {
    if (!current) {
      setTitle(value)
      return
    }
    const platform = current.platform
    setVariants(items => items.map(item => (item.platform === platform ? { ...item, title: value } : item)))
  }

  const readSelection = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget
    if (el.selectionStart === el.selectionEnd) {
      setSelection(null)
      return
    }
    setSelection({
      start: el.selectionStart,
      end: el.selectionEnd,
      quote: el.value.slice(el.selectionStart, el.selectionEnd)
    })
  }

  const addPlatform = (platform: string) => {
    if (variants.some(item => item.platform === platform)) return
    setVariants(items => [...items, { platform, title: '', body: '' }])
    setTab(platform)
  }

  const removePlatform = (platform: string) => {
    setVariants(items => items.filter(item => item.platform !== platform))
    setTab('main')
  }

  const leave = () => {
    const target = pendingLeave
    bypassRef.current = true
    setPendingLeave(null)
    window.setTimeout(() => {
      if (target === 'back' || target === null) onBack()
      else target.click()
    }, 0)
  }

  const tabOptions = [
    { id: 'main', label: '主稿' },
    ...variants.map(item => ({ id: item.platform, label: platformLabel(item.platform) }))
  ]
  const remaining = CONTENT_PLATFORMS.filter(item => !variants.some(variant => variant.platform === item))
  const checkText = `${currentTitle}\n${currentBody}`
  const published = current?.platform
    ? detail?.variants.find(item => item.platform === current.platform)?.published_url
    : null

  const rail = detail ? (
    <CommentsPanel
      contentId={detail.id}
      comments={detail.comments}
      platform={current ? current.platform : null}
      actor={actor}
      pending={pending}
      width={railWidth}
      onWidthChange={setRailWidth}
      onClearPending={() => setPending(null)}
      onBeforeSend={async () => {
        if (!dirty) return
        const saved = await save()
        if (!saved) throw new Error('先保存再批注')
      }}
      onChanged={reload}
      onClose={wide ? undefined : () => setRailOpen(false)}
      docked={wide}
    />
  ) : null

  return (
    <div ref={frame} className="relative flex flex-col">
      <HeaderActions>
        <Button size="sm" variant="outline" onClick={() => setVersionsOpen(true)} disabled={!detail}>
          历史版本
        </Button>
      </HeaderActions>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="flex flex-1 items-center justify-center">
          <ErrorState title="稿件加载失败" description={messageOf(error, '请重试')}>
            <Button size="sm" variant="outline" onClick={onBack}>
              返回列表
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {detail && ready ? (
        <div className="flex min-h-0 items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-auto pr-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button size="xs" variant="ghost" onClick={() => (dirty ? setPendingLeave('back') : onBack())}>
                返回
              </Button>
              <Input
                aria-label="标题"
                value={title}
                disabled={locked}
                onChange={event => setTitle(event.target.value)}
                className="max-w-md"
              />
              <Badge variant={statusVariant(detail.status)}>{statusLabel(detail.status)}</Badge>
              <span className="text-xs text-(--ui-text-tertiary)">v{detail.version}</span>
              {!wide ? (
                <Button size="xs" variant="outline" onClick={() => setRailOpen(true)}>
                  批注
                  {detail.comments.filter(item => item.kind !== 'review' && !item.resolved).length
                    ? ` ${detail.comments.filter(item => item.kind !== 'review' && !item.resolved).length}`
                    : ''}
                </Button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-(--ui-text-secondary)">署名</span>
              <Input
                aria-label="署名"
                value={actor}
                placeholder="你的名字"
                onChange={event => setActor(event.target.value)}
                style={{ width: '7rem' }}
              />
              {detail.status === 'draft' || detail.status === 'rejected' ? (
                <Button size="xs" disabled={busy || saving} onClick={() => void run(current => submitContent(current.id, { by: actor.trim() || null }), true)}>
                  送审
                </Button>
              ) : null}
              {detail.status === 'in_review' || detail.status === 'approved' ? (
                <Button
                  size="xs"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void run(current => withdrawContent(current.id, { by: actor.trim() || null }))}
                >
                  撤回
                </Button>
              ) : null}
              {detail.status === 'in_review' ? (
                <>
                  <Button
                    size="xs"
                    disabled={busy}
                    onClick={() => void run(current => approveContent(current.id, { by: actor.trim() || null }))}
                  >
                    通过
                  </Button>
                  <Button size="xs" variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
                    退回
                  </Button>
                </>
              ) : null}
              {detail.status === 'approved' || detail.status === 'published' ? (
                <Button
                  size="xs"
                  disabled={busy}
                  onClick={() => {
                    setPublishPlatform(variants[0]?.platform ?? '')
                    setPublishUrl('')
                    setPublishing(true)
                  }}
                >
                  标记已发布
                </Button>
              ) : null}
              {flowError ? <span className="text-xs text-destructive">{flowError}</span> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl options={tabOptions} value={tab} onChange={setTab} />
              {!locked && remaining.length > 0 ? (
                <Select value="add" onValueChange={value => { if (value !== 'add') addPlatform(value) }}>
                  <SelectTrigger aria-label="加平台">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">加平台</SelectItem>
                    {remaining.map(item => (
                      <SelectItem key={item} value={item}>
                        {platformLabel(item)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {!locked && current ? (
                <Button size="xs" variant="ghost" onClick={() => removePlatform(current.platform)}>
                  移出这个平台
                </Button>
              ) : null}
            </div>

            {locked ? <p className="text-xs text-(--ui-text-tertiary)">先撤回才能改。</p> : null}

            {current ? (
              <Input
                aria-label="平台标题"
                placeholder={`${platformLabel(current.platform)}标题`}
                value={current.title}
                disabled={locked}
                onChange={event => setCurrentTitle(event.target.value)}
              />
            ) : null}

            <div className="relative">
              {selection ? (
                <Button
                  size="xs"
                  className="absolute top-2 right-2 z-10"
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    setPending(selection)
                    setSelection(null)
                    setRailOpen(true)
                  }}
                >
                  批注
                </Button>
              ) : null}
              <Textarea
                aria-label="正文"
                readOnly={locked}
                value={currentBody}
                onChange={event => setCurrentBody(event.target.value)}
                onSelect={readSelection}
                onKeyUp={readSelection}
                onMouseUp={readSelection}
                className="min-h-48"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-(--ui-text-tertiary)">
              {current ? (
                <Tip label={platformLabel(current.platform)}>
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5">
                    {platformMark(current.platform)}
                  </span>
                </Tip>
              ) : (
                <span>主稿</span>
              )}
              <span className={limit !== null && currentBody.length > limit ? 'text-destructive' : undefined}>
                {currentBody.length} 字
                {limit !== null ? ` / ${limit}，超出只是提醒` : ''}
              </span>
              {published ? <span>已发布：{published}</span> : null}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Input
                aria-label="改动说明"
                placeholder="改动说明，可以不填"
                value={note}
                disabled={locked}
                onChange={event => setNote(event.target.value)}
                className="max-w-sm"
              />
              <Button size="sm" disabled={locked || saving || !dirty} onClick={() => void save()}>
                {saving ? '正在保存' : '保存'}
              </Button>
            </div>

            <CompliancePanel text={checkText} auto />
          </div>
          {wide ? rail : null}
        </div>
      ) : null}

      {!wide && railOpen ? (
        <div className="absolute inset-0 z-20 flex justify-end bg-black/22">
          <button type="button" aria-label="关闭批注" className="absolute inset-0" onClick={() => setRailOpen(false)} />
          <div className="relative z-10 h-full">{rail}</div>
        </div>
      ) : null}

      <ConfirmDialog
        open={pendingLeave !== null}
        title="还有没保存的修改"
        description="离开后这次修改不会留下来。"
        confirmLabel="离开"
        onClose={() => setPendingLeave(null)}
        onConfirm={leave}
      />

      <ConfirmDialog
        open={rejecting}
        title="退回这篇稿件"
        description="退回要写明原因。"
        confirmLabel="退回"
        onClose={() => setRejecting(false)}
        onConfirm={async () => {
          const reason = rejectNote.trim()
          if (!reason) throw new Error('退回时请写明原因')
          if (!detail) throw new Error('稿件还没加载')
          const next = await rejectContent(detail.id, { by: actor.trim() || null, note: reason })
          adopt(next)
          setRejectNote('')
          void refreshInReviewCount()
        }}
      >
        <Textarea aria-label="退回原因" value={rejectNote} onChange={event => setRejectNote(event.target.value)} />
      </ConfirmDialog>

      <ConfirmDialog
        open={publishing}
        title="标记已发布"
        description="在平台上发完后，回来记下链接。"
        confirmLabel="标记已发布"
        onClose={() => setPublishing(false)}
        onConfirm={async () => {
          if (!detail) throw new Error('稿件还没加载')
          const next = await publishContent(detail.id, {
            by: actor.trim() || null,
            platform: publishPlatform || null,
            url: publishUrl.trim() || null
          })
          adopt(next)
          void refreshInReviewCount()
        }}
      >
        <div className="flex flex-col gap-2">
          <Select value={publishPlatform || 'piece'} onValueChange={value => setPublishPlatform(value === 'piece' ? '' : value)}>
            <SelectTrigger aria-label="发布到哪个平台">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="piece">整篇</SelectItem>
              {variants.map(item => (
                <SelectItem key={item.platform} value={item.platform}>
                  {platformLabel(item.platform)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            aria-label="发布链接"
            placeholder="发布链接，可以不填"
            value={publishUrl}
            onChange={event => setPublishUrl(event.target.value)}
          />
        </div>
      </ConfirmDialog>

      {detail ? (
        <VersionsDialog
          open={versionsOpen}
          contentId={detail.id}
          versions={detail.versions}
          platforms={detail.variants.map(item => item.platform)}
          onClose={() => setVersionsOpen(false)}
        />
      ) : null}
    </div>
  )
}
