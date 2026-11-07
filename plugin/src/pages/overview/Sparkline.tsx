import { useState, type PointerEvent } from 'react'
import { cn } from '@hermes/plugin-sdk'
import type { TrendPoint } from '../../api/overview'

/**
 * 手画的折线。不引图表库：插件运行时只有 react 和 @hermes/plugin-sdk。
 * SVG 用 0..100 的坐标系拉伸到容器，线宽用 non-scaling-stroke 保持 1.5px。
 * 比率为 null 的日子断开，不按 0 画。
 */
export function Sparkline({
  points,
  height = '2rem',
  large = false,
  format = value => String(value),
  label
}: {
  points: TrendPoint[]
  height?: string
  large?: boolean
  format?: (value: number) => string
  label?: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const values = points.map(point => point.value).filter((value): value is number => value != null)
  if (points.length === 0 || values.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-[0.6875rem] text-(--ui-text-tertiary)"
      >
        {large ? '这段时间没有数据' : null}
      </div>
    )
  }

  const max = Math.max(...values)
  const min = Math.min(0, ...values)
  const span = max - min || 1
  const pad = large ? 8 : 6
  const x = (index: number) => (points.length === 1 ? 50 : (index / (points.length - 1)) * 100)
  const y = (value: number) => pad + (1 - (value - min) / span) * (100 - pad * 2)

  const segments: string[] = []
  let current = ''
  points.forEach((point, index) => {
    if (point.value == null) {
      if (current) segments.push(current)
      current = ''
      return
    }
    current += `${current ? 'L' : 'M'}${x(index).toFixed(2)},${y(point.value).toFixed(2)}`
  })
  if (current) segments.push(current)

  const last = [...points].reverse().find(point => point.value != null)
  const lastIndex = last ? points.lastIndexOf(last) : -1
  const peakIndex = points.findIndex(point => point.value === max)
  const hovered = hover != null ? points[hover] : null

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width <= 0) return
    const ratio = (event.clientX - rect.left) / rect.width
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1)))))
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div
        role="img"
        aria-label={label}
        className={cn('relative w-full', large && 'cursor-crosshair')}
        style={{ height }}
        onPointerMove={large ? onMove : undefined}
        onPointerLeave={large ? () => setHover(null) : undefined}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          {large ? (
            <line
              x1="0"
              x2="100"
              y1={y(min)}
              y2={y(min)}
              stroke="var(--ui-stroke-secondary)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}
          {segments.map(d => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke="var(--ui-accent)"
              strokeWidth={large ? 1.75 : 1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        {/* 圆点用 HTML 画，SVG 被拉伸后圆会变椭圆。 */}
        {last && lastIndex >= 0 && hover == null ? (
          <Dot left={x(lastIndex)} top={y(last.value as number)} />
        ) : null}
        {large && peakIndex >= 0 && hover == null ? (
          <span
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full pb-1 text-[0.6875rem] whitespace-nowrap text-(--ui-text-secondary) tabular-nums"
            style={{ left: `${clamp(x(peakIndex), 6, 94)}%`, top: `${y(max)}%` }}
          >
            最高 {format(max)}
          </span>
        ) : null}
        {large && hover != null && hovered ? (
          <>
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-(--ui-stroke-secondary)"
              style={{ left: `${x(hover)}%` }}
            />
            {hovered.value != null ? <Dot left={x(hover)} top={y(hovered.value)} /> : null}
            <span
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) px-1.5 py-0.5 text-[0.6875rem] whitespace-nowrap text-(--ui-text-primary) tabular-nums"
              style={{ left: `${clamp(x(hover), 8, 92)}%` }}
            >
              {shortDate(hovered.date)} · {hovered.value == null ? '—' : format(hovered.value)}
            </span>
          </>
        ) : null}
      </div>
      {large ? (
        <div className="flex justify-between text-[0.6875rem] text-(--ui-text-tertiary) tabular-nums">
          <span>{shortDate(points[0].date)}</span>
          <span>{shortDate(points[points.length - 1].date)}</span>
        </div>
      ) : null}
    </div>
  )
}

function Dot({ left, top }: { left: number; top: number }) {
  return (
    <span
      className="pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--ui-accent)"
      style={{ left: `${left}%`, top: `${top}%` }}
    />
  )
}

function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value))
}

export function shortDate(iso: string): string {
  const [, month, day] = iso.split('-')
  return month && day ? `${Number(month)}-${Number(day)}` : iso
}
