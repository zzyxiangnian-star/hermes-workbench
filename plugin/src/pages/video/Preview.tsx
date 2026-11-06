import { useEffect, useRef, useState } from 'react'
import { Button, ErrorState, Loader } from '@hermes/plugin-sdk'
import { getTimeline, mediaSrc, type Timeline, type TimelineShot } from '../../api/video'
import { useQuery } from '../../api/useQuery'
import { aspectRatio, errorText, formatSeconds, isImage, isVideo } from './labels'

export function Preview({
  projectId,
  dirty,
  onBack
}: {
  projectId: number
  dirty: boolean
  onBack: () => void
}) {
  const query = useQuery(() => getTimeline(projectId), [projectId])
  if (query.error && !query.data) {
    return (
      <ErrorState title="时间线加载失败" description={errorText(query.error, '请重试')}>
        <Button size="sm" variant="outline" onClick={onBack}>
          返回
        </Button>
        <Button size="sm" variant="outline" onClick={query.reload}>
          重试
        </Button>
      </ErrorState>
    )
  }
  if (!query.data) {
    return (
      <div className="flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取时间线
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onBack}>
          返回
        </Button>
        <h2 className="text-sm font-medium">{query.data.title}</h2>
        <span className="text-xs text-(--ui-text-tertiary)">总长 {formatSeconds(query.data.duration)}</span>
      </div>
      {dirty ? <p className="text-xs text-(--ui-text-tertiary)">有未保存的分镜，预览的是已保存的版本。</p> : null}
      <Player timeline={query.data} />
    </div>
  )
}

function Player({ timeline }: { timeline: Timeline }) {
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const timeRef = useRef(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const shot = shotAt(timeline.shots, time)
  const shotSeq = shot?.seq ?? 0

  useEffect(() => {
    if (!playing) {
      audioRef.current?.pause()
      videoRef.current?.pause()
      return
    }
    const origin = timeRef.current
    const started = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const next = origin + (now - started) / 1000
      if (next >= timeline.duration) {
        timeRef.current = timeline.duration
        setTime(timeline.duration)
        setPlaying(false)
        return
      }
      timeRef.current = next
      setTime(next)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    const offset = Math.max(0, origin - (shot?.start ?? 0))
    if (audioRef.current) audioRef.current.currentTime = offset
    if (videoRef.current) videoRef.current.currentTime = offset
    void audioRef.current?.play()
    void videoRef.current?.play()
    return () => cancelAnimationFrame(frame)
  }, [playing, shotSeq, timeline.duration, shot?.start])

  const seek = (next: number) => {
    const clamped = Math.min(timeline.duration, Math.max(0, next))
    timeRef.current = clamped
    setTime(clamped)
    setPlaying(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative overflow-hidden bg-(--ui-bg-secondary)"
        style={{ aspectRatio: aspectRatio(timeline.aspect), height: 'min(68vh, 32rem)', maxWidth: '100%' }}
      >
        {shot?.media && isImage(shot.media.mime) ? (
          <img src={mediaSrc(shot.media.url)} alt="" className="h-full w-full object-cover" />
        ) : shot?.media && isVideo(shot.media.mime) ? (
          <video ref={videoRef} src={mediaSrc(shot.media.url)} muted className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-(--ui-text-tertiary)">
            {shot ? `第 ${shot.seq} 镜还没有画面` : '没有镜头'}
          </div>
        )}
        {shot?.subtitle ? (
          <p className="absolute inset-x-2 bottom-3 rounded-md bg-(--ui-bg-editor)/80 px-2 py-1 text-center text-sm text-(--ui-text-primary)">
            {shot.subtitle}
          </p>
        ) : null}
        {shot?.voice ? <audio ref={audioRef} src={mediaSrc(shot.voice.url)} /> : null}
      </div>
      <div className="flex w-full max-w-xl items-center gap-2">
        <Button
          size="sm"
          onClick={() => {
            const atEnd = timeRef.current >= timeline.duration
            if (atEnd) {
              timeRef.current = 0
              setTime(0)
            }
            if (playing) {
              audioRef.current?.pause()
              videoRef.current?.pause()
              setPlaying(false)
              return
            }
            const offset = Math.max(0, (atEnd ? 0 : timeRef.current) - (shot?.start ?? 0))
            if (audioRef.current) {
              audioRef.current.currentTime = offset
              void audioRef.current.play()
            }
            if (videoRef.current) {
              videoRef.current.currentTime = offset
              void videoRef.current.play()
            }
            setPlaying(true)
          }}
        >
          {playing ? '暂停' : '播放'}
        </Button>
        <span className="text-xs tabular-nums text-(--ui-text-secondary)">
          {formatSeconds(time)} / {formatSeconds(timeline.duration)}
          {shot ? ` · 第 ${shot.seq} 镜` : ''}
        </span>
      </div>
      <div className="flex h-6 w-full max-w-xl gap-0.5">
        {timeline.shots.map(item => (
          <button
            key={item.seq}
            type="button"
            aria-label={`第 ${item.seq} 镜`}
            className={item.seq === shot?.seq ? 'min-w-2 rounded-sm bg-(--ui-accent)' : 'min-w-2 rounded-sm bg-(--ui-bg-quinary)'}
            style={{ flexGrow: Math.max(item.duration, 0.1) }}
            onClick={() => seek(item.start)}
          />
        ))}
      </div>
    </div>
  )
}

function shotAt(shots: TimelineShot[], time: number): TimelineShot | null {
  if (shots.length === 0) return null
  return shots.find(item => time >= item.start && time < item.end) ?? shots[shots.length - 1]
}
