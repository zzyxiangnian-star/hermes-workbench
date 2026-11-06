import { useRef, useState } from 'react'
import { Button, Input, Textarea } from '@hermes/plugin-sdk'
import { mediaSrc, type VideoMedia } from '../../api/video'
import { aspectRatio, estimateSeconds, formatSeconds, isImage, isVideo } from './labels'

export interface ShotDraft {
  key: string
  duration: number
  visual: string
  voiceover: string
  subtitle: string | null
  media: VideoMedia | null
  voice: VideoMedia | null
  note: string
  voiceSeconds: number | null
}

export function ShotRow({
  seq,
  shot,
  aspect,
  readOnly,
  onChange,
  onInsert,
  onDelete,
  onDragStart,
  onDrop,
  onChooseVisual,
  onUploadVoice
}: {
  seq: number
  shot: ShotDraft
  aspect: string
  readOnly: boolean
  onChange: (patch: Partial<ShotDraft>) => void
  onInsert: () => void
  onDelete: () => void
  onDragStart: () => void
  onDrop: (fromKey: string) => void
  onChooseVisual: () => void
  onUploadVoice: (file: File) => void
}) {
  const voiceInput = useRef<HTMLInputElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const actual = shot.voiceSeconds != null ? Math.max(shot.duration, shot.voiceSeconds) : shot.duration
  const stretched = shot.voiceSeconds != null && shot.voiceSeconds > shot.duration + 0.05
  const estimate = estimateSeconds(shot.voiceover)

  return (
    <tr
      className="border-b border-(--ui-stroke-secondary) align-top"
      onDragOver={event => {
        if (!readOnly) event.preventDefault()
      }}
      onDrop={event => {
        event.preventDefault()
        onDrop(event.dataTransfer.getData('text/plain'))
      }}
    >
      <td className="px-1 py-1.5">
        <button
          type="button"
          draggable={!readOnly}
          aria-label={`拖动第 ${seq} 镜`}
          className="cursor-grab px-1 text-xs text-(--ui-text-secondary)"
          onDragStart={event => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('text/plain', shot.key)
            onDragStart()
          }}
        >
          {seq}
        </button>
      </td>
      <td className="px-1 py-1.5">
        <button
          type="button"
          aria-label={`第 ${seq} 镜画面`}
          disabled={readOnly}
          className="flex items-center justify-center overflow-hidden bg-(--ui-bg-secondary) disabled:cursor-default"
          style={{ width: 48, aspectRatio: aspectRatio(aspect) }}
          onClick={onChooseVisual}
        >
          {shot.media && isImage(shot.media.mime) ? (
            <img src={mediaSrc(shot.media.url)} alt="" className="h-full w-full object-cover" />
          ) : shot.media && isVideo(shot.media.mime) ? (
            <video src={mediaSrc(shot.media.url)} muted className="h-full w-full object-cover" />
          ) : (
            <span className="text-[0.625rem] text-(--ui-text-tertiary)">换图</span>
          )}
        </button>
      </td>
      <td className="min-w-0 px-1 py-1.5">
        <Textarea
          className="min-w-0"
          aria-label={`第 ${seq} 镜画面说明`}
          rows={2}
          value={shot.visual}
          readOnly={readOnly}
          onChange={event => onChange({ visual: event.target.value })}
        />
      </td>
      <td className="min-w-0 px-1 py-1.5">
        <Textarea
          className="min-w-0"
          aria-label={`第 ${seq} 镜口播`}
          rows={2}
          value={shot.voiceover}
          readOnly={readOnly}
          onChange={event => onChange({ voiceover: event.target.value })}
        />
        {shot.voiceover ? (
          <p className="mt-0.5 text-[0.6875rem] text-(--ui-text-tertiary)">约 {formatSeconds(estimate)}</p>
        ) : null}
      </td>
      <td className="min-w-0 px-1 py-1.5">
        <Textarea
          className="min-w-0"
          aria-label={`第 ${seq} 镜字幕`}
          rows={2}
          value={shot.subtitle ?? ''}
          placeholder={shot.subtitle === '' ? '不要字幕' : '同口播'}
          readOnly={readOnly || shot.subtitle === ''}
          onChange={event => onChange({ subtitle: event.target.value })}
        />
        {readOnly ? null : (
          <div className="mt-0.5 flex gap-2">
            {shot.subtitle === '' ? (
              <button type="button" className="text-[0.6875rem] text-(--ui-text-secondary)" onClick={() => onChange({ subtitle: null })}>
                改回同口播
              </button>
            ) : (
              <>
                {shot.subtitle !== null ? (
                  <button type="button" className="text-[0.6875rem] text-(--ui-text-secondary)" onClick={() => onChange({ subtitle: null })}>
                    改回同口播
                  </button>
                ) : null}
                <button type="button" className="text-[0.6875rem] text-(--ui-text-secondary)" onClick={() => onChange({ subtitle: '' })}>
                  不要字幕
                </button>
              </>
            )}
          </div>
        )}
      </td>
      <td className="min-w-0 px-1 py-1.5">
        <Input
          aria-label={`第 ${seq} 镜时长`}
          type="number"
          min={0.1}
          max={60}
          step={0.1}
          value={shot.duration}
          readOnly={readOnly}
          onChange={event => {
            const next = Number(event.target.value)
            if (Number.isFinite(next)) onChange({ duration: next })
          }}
        />
        <p className="mt-0.5 text-[0.6875rem] text-(--ui-text-tertiary)">实际 {formatSeconds(actual)}</p>
        {stretched ? <p className="text-[0.6875rem] text-(--ui-text-secondary)">按配音拉长</p> : null}
      </td>
      <td className="px-1 py-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            size="xs"
            variant="outline"
            disabled={!shot.voice}
            onClick={() => {
              const node = audio.current
              if (!node) return
              if (playing) {
                node.pause()
                setPlaying(false)
                return
              }
              void node.play()
              setPlaying(true)
            }}
          >
            {playing ? '暂停' : '播放'}
          </Button>
          {readOnly ? null : (
            <Button size="xs" variant="outline" onClick={() => voiceInput.current?.click()}>
              上传
            </Button>
          )}
        </div>
        {shot.voice ? <p className="mt-0.5 max-w-24 truncate text-[0.6875rem] text-(--ui-text-tertiary)">{shot.voice.file_name}</p> : null}
        {shot.voice ? (
          <audio
            ref={audio}
            src={mediaSrc(shot.voice.url)}
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
          />
        ) : null}
        <input
          ref={voiceInput}
          type="file"
          accept="audio/*"
          aria-label={`第 ${seq} 镜配音`}
          className="absolute h-px w-px opacity-0"
          onChange={event => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (file) onUploadVoice(file)
          }}
        />
      </td>
      <td className="min-w-0 px-1 py-1.5">
        <Textarea
          className="min-w-0"
          aria-label={`第 ${seq} 镜备注`}
          rows={2}
          value={shot.note}
          readOnly={readOnly}
          onChange={event => onChange({ note: event.target.value })}
        />
      </td>
      <td className="px-1 py-1.5">
        {readOnly ? null : (
          <div className="flex flex-col gap-1">
            <Button size="xs" variant="ghost" onClick={onInsert}>
              插入
            </Button>
            <Button size="xs" variant="ghost" onClick={onDelete}>
              删除
            </Button>
          </div>
        )}
      </td>
    </tr>
  )
}
