import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ErrorState,
  Input,
  Loader,
  Textarea
} from '@hermes/plugin-sdk'
import { listLibraryAssets, assetSrc } from '../../api/design'
import { ApiError, isOfflineError } from '../../api/client'
import {
  approveVideo,
  cancelVideo,
  getVideoProject,
  packageUrl,
  rejectVideo,
  saveShots,
  submitVideo,
  subtitlesUrl,
  uploadBgm,
  uploadFinal,
  uploadShotMedia,
  withdrawVideo,
  type ShotInput,
  type VideoMedia,
  type VideoProjectDetail,
  type VideoShot
} from '../../api/video'
import { refreshVideoNeedsActionCount } from '../../api/video-count'
import { useQuery } from '../../api/useQuery'
import { Preview } from './Preview'
import { ShotRow, type ShotDraft } from './ShotRow'
import { errorText, formatSeconds, isImage, loadActor, saveActor, statusLabel, statusVariant } from './labels'

export function ScriptEditor({ id, onBack }: { id: number; onBack: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const query = useQuery(() => getVideoProject(id), [id])
  const [project, setProject] = useState<VideoProjectDetail | null>(null)
  const [drafts, setDrafts] = useState<ShotDraft[]>([])
  const [saved, setSaved] = useState('')
  const [narrow, setNarrow] = useState(false)
  const [railWidth, setRailWidth] = useState(260)
  const [actor, setActor] = useState(loadActor)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectNote, setRejectNote] = useState('')
  const [rejectError, setRejectError] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [visualKey, setVisualKey] = useState<string | null>(null)
  const loaded = useRef<number | null>(null)
  const visualInput = useRef<HTMLInputElement>(null)
  const bgmInput = useRef<HTMLInputElement>(null)
  const finalInput = useRef<HTMLInputElement>(null)

  const take = (next: VideoProjectDetail) => {
    const rows = toDrafts(next.shots)
    setProject(next)
    setDrafts(rows)
    setSaved(JSON.stringify(toInputs(rows)))
  }

  useEffect(() => {
    if (!query.data || loaded.current === id) return
    loaded.current = id
    take(query.data)
  }, [query.data, id])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      setNarrow((entries[0]?.contentRect.width ?? 0) < 900)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [project])

  const dirty = JSON.stringify(toInputs(drafts)) !== saved
  const readOnly = project != null && project.status !== 'draft'
  const library = useQuery(() => (visualKey && project ? listLibraryAssets({ brand: project.brand }) : Promise.resolve([])), [
    visualKey,
    project?.brand
  ])

  const run = async (task: () => Promise<VideoProjectDetail>) => {
    setBusy(true)
    setError(null)
    try {
      const next = await task()
      take(next)
      await refreshVideoNeedsActionCount()
      return next
    } catch (reason) {
      setError(errorText(reason, '操作失败'))
      return null
    } finally {
      setBusy(false)
    }
  }

  const save = () => {
    for (const shot of drafts) {
      if (!(shot.duration > 0) || shot.duration > 60) {
        setError('每镜时长要在 0 到 60 秒之间')
        return
      }
    }
    void run(() => saveShots(id, toInputs(drafts)))
  }

  const uploadVoice = (key: string, file: File) => {
    if (dirty) {
      setError('先保存分镜，再上传配音。')
      return
    }
    const seq = drafts.findIndex(item => item.key === key) + 1
    if (seq < 1) return
    void run(() => uploadShotMedia(id, seq, 'voice', file, actor.trim() || null))
  }

  const uploadVisual = (file: File) => {
    if (!visualKey) return
    if (dirty) {
      setError('先保存分镜，再上传画面。')
      return
    }
    const seq = drafts.findIndex(item => item.key === visualKey) + 1
    setVisualKey(null)
    if (seq < 1) return
    void run(() => uploadShotMedia(id, seq, 'visual', file, actor.trim() || null))
  }

  const submit = async () => {
    setSubmitError(null)
    if (dirty) {
      setSubmitError('先保存分镜')
      return
    }
    if (drafts.length === 0) {
      setSubmitError('还没有分镜')
      return
    }
    setBusy(true)
    try {
      const next = await submitVideo(id, actor.trim() || null)
      take(next)
      await refreshVideoNeedsActionCount()
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === 'compliance_failed') setSubmitError(reason.message)
      else setError(errorText(reason, '没有送审'))
    } finally {
      setBusy(false)
    }
  }

  const requestBack = () => {
    if (dirty) setLeaving(true)
    else onBack()
  }

  if (query.error && !project) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <ErrorState
          title={isOfflineError(query.error) ? '没有连上工作台服务' : '视频加载失败'}
          description={errorText(query.error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={onBack}>
            返回
          </Button>
          <Button size="sm" variant="outline" onClick={query.reload}>
            重试
          </Button>
        </ErrorState>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取视频
      </div>
    )
  }

  const open = project.status === 'draft' || project.status === 'in_review' || project.status === 'approved'

  return (
    <div ref={root} className="flex w-full min-w-0 max-w-full flex-1 flex-col gap-3 overflow-x-hidden">
      <div className="flex w-full min-w-0 flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={requestBack}>
          返回
        </Button>
        <h2 className="min-w-0 truncate text-sm font-medium">{project.title}</h2>
        <Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge>
        <span className="text-xs text-(--ui-text-tertiary)">总长 {formatSeconds(project.duration)}</span>
        <div className="ml-auto flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2">
          <Button size="sm" variant="outline" disabled={project.shots.length === 0} onClick={() => setPreviewing(value => !value)}>
            {previewing ? '分镜' : '预览'}
          </Button>
          {project.status === 'draft' ? (
            <Button size="sm" disabled={busy} onClick={() => void submit()}>
              送审
            </Button>
          ) : null}
          {project.status === 'in_review' ? (
            <>
              <Button size="sm" disabled={busy} onClick={() => void run(() => approveVideo(id, actor.trim() || null))}>
                通过
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => setRejecting(true)}>
                退回
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void run(() => withdrawVideo(id, actor.trim() || null))}>
                撤回
              </Button>
            </>
          ) : null}
          {project.status === 'approved' || project.status === 'done' ? (
            <>
              <Button size="sm" variant="outline" onClick={() => openDownload(packageUrl(id))}>
                下载初剪包
              </Button>
              <Button size="sm" variant="outline" onClick={() => openDownload(subtitlesUrl(id))}>
                下载字幕
              </Button>
            </>
          ) : null}
          {project.status === 'approved' ? (
            <Button size="sm" disabled={busy} onClick={() => finalInput.current?.click()}>
              交成片
            </Button>
          ) : null}
          {open ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setCanceling(true)}>
              取消
            </Button>
          ) : null}
        </div>
      </div>
      {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {previewing ? (
        <Preview projectId={id} dirty={dirty} onBack={() => setPreviewing(false)} />
      ) : (
        <div className={narrow ? 'flex w-full min-w-0 flex-col gap-4' : 'flex w-full min-w-0 items-start'}>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full min-w-[42rem] table-fixed border-collapse text-xs">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-14" />
                  <col />
                  <col />
                  <col />
                  <col className="w-[4.5rem]" />
                  <col className="w-28" />
                  <col />
                  <col className="w-14" />
                </colgroup>
                <thead>
                  <tr className="border-b border-(--ui-stroke-secondary) text-left text-(--ui-text-tertiary)">
                    <th className="px-1 py-1 font-medium">镜号</th>
                    <th className="px-1 py-1 font-medium">画面</th>
                    <th className="px-1 py-1 font-medium">画面说明</th>
                    <th className="px-1 py-1 font-medium">口播</th>
                    <th className="px-1 py-1 font-medium">字幕</th>
                    <th className="px-1 py-1 font-medium">时长</th>
                    <th className="px-1 py-1 font-medium">配音</th>
                    <th className="px-1 py-1 font-medium">备注</th>
                    <th className="px-1 py-1 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((shot, index) => (
                    <ShotRow
                      key={shot.key}
                      seq={index + 1}
                      shot={shot}
                      aspect={project.aspect}
                      readOnly={readOnly}
                      onChange={patch =>
                        setDrafts(rows => rows.map(item => (item.key === shot.key ? { ...item, ...patch } : item)))
                      }
                      onInsert={() =>
                        setDrafts(rows => {
                          if (rows.length >= 60) return rows
                          const next = rows.slice()
                          next.splice(index + 1, 0, blankShot())
                          return next
                        })
                      }
                      onDelete={() => setDrafts(rows => rows.filter(item => item.key !== shot.key))}
                      onDragStart={() => undefined}
                      onDrop={fromKey => {
                        if (!fromKey || fromKey === shot.key) return
                        setDrafts(rows => moveShot(rows, fromKey, shot.key))
                      }}
                      onChooseVisual={() => setVisualKey(shot.key)}
                      onUploadVoice={file => uploadVoice(shot.key, file)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {drafts.length === 0 ? <p className="text-xs text-(--ui-text-tertiary)">还没有分镜。</p> : null}
            {readOnly ? null : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={drafts.length >= 60}
                  onClick={() => setDrafts(rows => [...rows, blankShot()])}
                >
                  加一镜
                </Button>
                <Button size="sm" disabled={!dirty || busy} onClick={save}>
                  保存分镜
                </Button>
                {dirty ? <span className="text-xs text-(--ui-text-tertiary)">还有没保存的改动</span> : null}
              </div>
            )}
          </div>
          {narrow ? null : (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="调整侧栏宽度"
              className="mx-2 w-1 shrink-0 cursor-col-resize self-stretch hover:bg-(--ui-accent)"
              onPointerDown={event => {
                const startX = event.clientX
                const startWidth = railWidth
                const move = (ev: PointerEvent) => {
                  setRailWidth(Math.min(480, Math.max(220, startWidth - (ev.clientX - startX))))
                }
                const up = () => {
                  window.removeEventListener('pointermove', move)
                  window.removeEventListener('pointerup', up)
                }
                window.addEventListener('pointermove', move)
                window.addEventListener('pointerup', up)
              }}
            />
          )}
          <aside
            style={narrow ? undefined : { width: railWidth }}
            className="flex w-full min-w-0 shrink-0 flex-col gap-3 break-words"
          >
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-medium">审核记录</h3>
              {project.events.length === 0 ? (
                <p className="text-xs text-(--ui-text-tertiary)">还没有记录。</p>
              ) : (
                <ul>
                  {project.events.map((event, index) => (
                    <li
                      key={`${event.at}-${index}`}
                      className={
                        event.text.includes('退回')
                          ? 'border-b border-(--ui-stroke-secondary) py-1.5 text-xs font-medium text-destructive'
                          : 'border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)'
                      }
                    >
                      {event.by || '有人'} · {event.text}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-medium">违禁词</h3>
              {dirty ? <p className="text-xs text-(--ui-text-tertiary)">保存分镜后重新检查。</p> : null}
              {project.compliance.hits.length === 0 ? (
                <p className="text-xs text-(--ui-text-tertiary)">没有发现违禁词。</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {project.compliance.hits.map(hit => (
                    <li key={`${hit.word}-${hit.level}`} className={hit.level === 'must' ? 'text-xs text-destructive' : 'text-xs'}>
                      {hit.word} · {hit.level === 'must' ? '必须修改' : '提醒'}
                      {hit.suggestion ? `，可改成「${hit.suggestion}」` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="flex flex-col gap-1">
              <h3 className="text-xs font-medium">背景音乐</h3>
              {project.bgm ? (
                <>
                  <p className="truncate text-xs">{project.bgm.file_name}</p>
                  <audio controls src={assetSrc(project.bgm.url)} className="h-8 w-full" />
                </>
              ) : (
                <p className="text-xs text-(--ui-text-tertiary)">还没有背景音乐。</p>
              )}
              {readOnly ? null : (
                <Button size="xs" variant="outline" disabled={busy} onClick={() => bgmInput.current?.click()}>
                  上传背景音乐
                </Button>
              )}
            </section>
            <label className="flex items-center gap-2 text-xs">
              署名
              <Input
                aria-label="署名"
                value={actor}
                style={{ width: '7rem' }}
                onChange={event => {
                  setActor(event.target.value)
                  saveActor(event.target.value)
                }}
              />
            </label>
          </aside>
        </div>
      )}

      <Dialog open={visualKey !== null} onOpenChange={open => { if (!open) setVisualKey(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>换画面</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => visualInput.current?.click()}>
              上传
            </Button>
          </div>
          <p className="text-xs text-(--ui-text-tertiary)">或从素材库选一张。素材库里是定稿和直接上传的图。</p>
          <ul className="grid max-h-64 grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2 overflow-y-auto">
            {(library.data ?? []).map(asset => (
              <li key={asset.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 text-left"
                  onClick={() => {
                    const media = toMedia(asset)
                    setDrafts(rows => rows.map(item => (item.key === visualKey ? { ...item, media } : item)))
                    setVisualKey(null)
                  }}
                >
                  <span className="flex aspect-square items-center justify-center overflow-hidden bg-(--ui-bg-secondary)">
                    {isImage(asset.mime) ? (
                      <img src={assetSrc(asset.url)} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="px-1 text-[0.625rem] text-(--ui-text-tertiary)">{asset.file_name}</span>
                    )}
                  </span>
                  <span className="truncate text-[0.6875rem]">{asset.file_name}</span>
                </button>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      {rejecting ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="关闭浮层" className="absolute inset-0 bg-black/22" onClick={() => setRejecting(false)} />
          <form
            className="relative z-10 flex w-full max-w-md flex-col gap-2 rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-4"
            onSubmit={event => {
              event.preventDefault()
              if (!rejectNote.trim()) {
                setRejectError('请填写要改什么')
                return
              }
              setRejecting(false)
              void run(() => rejectVideo(id, actor.trim() || null, rejectNote.trim()))
            }}
          >
            <h2 className="text-sm font-medium">退回</h2>
            <Textarea aria-label="退回意见" rows={3} value={rejectNote} onChange={event => setRejectNote(event.target.value)} />
            {rejectError ? <p className="text-xs text-destructive">{rejectError}</p> : null}
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setRejecting(false)}>
                留下
              </Button>
              <Button type="submit" size="sm">
                退回
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDialog
        open={leaving}
        title="分镜还没保存"
        description="离开后，这次没保存的改动会丢掉。"
        confirmLabel="离开"
        cancelLabel="继续编辑"
        onClose={() => setLeaving(false)}
        onConfirm={() => onBack()}
      />
      <ConfirmDialog
        open={canceling}
        title="取消这个视频？"
        confirmLabel="取消视频"
        cancelLabel="留下"
        onClose={() => setCanceling(false)}
        onConfirm={async () => {
          await run(() => cancelVideo(id, actor.trim() || null))
        }}
      />
      <input
        ref={visualInput}
        type="file"
        accept="image/*,video/*"
        aria-label="上传画面"
        className="absolute h-px w-px opacity-0"
        onChange={event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) uploadVisual(file)
        }}
      />
      <input
        ref={bgmInput}
        type="file"
        accept="audio/*"
        aria-label="上传背景音乐"
        className="absolute h-px w-px opacity-0"
        onChange={event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          if (dirty) {
            setError('先保存分镜，再上传背景音乐。')
            return
          }
          void run(() => uploadBgm(id, file, actor.trim() || null))
        }}
      />
      <input
        ref={finalInput}
        type="file"
        accept="video/mp4,video/quicktime"
        aria-label="交成片"
        className="absolute h-px w-px opacity-0"
        onChange={event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void run(() => uploadFinal(id, file, actor.trim() || null))
        }}
      />
    </div>
  )
}

function openDownload(url: string): void {
  const link = document.createElement('a')
  link.href = url
  link.target = '_blank'
  link.rel = 'noreferrer'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function blankShot(): ShotDraft {
  return {
    key: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    duration: 3,
    visual: '',
    voiceover: '',
    subtitle: null,
    media: null,
    voice: null,
    note: '',
    voiceSeconds: null
  }
}

function toDrafts(shots: VideoShot[]): ShotDraft[] {
  return shots.map(shot => ({
    key: `s-${shot.seq}-${shot.media?.id ?? 0}-${shot.voice?.id ?? 0}-${Math.random().toString(36).slice(2, 6)}`,
    duration: shot.duration,
    visual: shot.visual ?? '',
    voiceover: shot.voiceover ?? '',
    subtitle: shot.subtitle,
    media: shot.media,
    voice: shot.voice,
    note: shot.note ?? '',
    voiceSeconds: shot.voice && shot.length > shot.duration + 0.001 ? shot.length : null
  }))
}

function toInputs(shots: ShotDraft[]): ShotInput[] {
  return shots.map(shot => ({
    duration: shot.duration,
    visual: shot.visual.trim() || null,
    voiceover: shot.voiceover.trim() || null,
    subtitle: shot.subtitle,
    media_asset_id: shot.media?.id ?? null,
    voice_asset_id: shot.voice?.id ?? null,
    note: shot.note.trim() || null
  }))
}

function toMedia(asset: { id: number; url: string; mime: string; file_name: string; width: number | null; height: number | null }): VideoMedia {
  return {
    id: asset.id,
    url: asset.url,
    mime: asset.mime,
    file_name: asset.file_name,
    width: asset.width,
    height: asset.height
  }
}

function moveShot(rows: ShotDraft[], fromKey: string, toKey: string): ShotDraft[] {
  const from = rows.findIndex(item => item.key === fromKey)
  const to = rows.findIndex(item => item.key === toKey)
  if (from < 0 || to < 0) return rows
  const next = rows.slice()
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}
