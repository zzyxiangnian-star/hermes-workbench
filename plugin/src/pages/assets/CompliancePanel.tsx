import { useMemo, useState } from 'react'
import { Button, Textarea, Tip, cn } from '@hermes/plugin-sdk'
import { checkCompliance, type ComplianceHit, type ComplianceResult } from '../../api/brand'

interface Mark {
  hit: ComplianceHit
  start: number
  end: number
}

export function CompliancePanel() {
  const [text, setText] = useState('这是最佳选择，第一次购买送礼')
  const [result, setResult] = useState<ComplianceResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const check = async () => {
    setChecking(true)
    setError(null)
    try {
      setResult(await checkCompliance(text))
    } catch (reason) {
      setResult(null)
      setError(reason instanceof Error ? reason.message : '检查失败')
    } finally {
      setChecking(false)
    }
  }

  const marks = useMemo(() => (result ? marksFor(text, result.hits) : []), [result, text])

  return (
    <div className="flex flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) p-3">
      <div className="text-xs text-(--ui-text-secondary)">文案检查</div>
      <Textarea aria-label="待检查文案" value={text} onChange={event => setText(event.target.value)} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-[0.6875rem] text-(--ui-text-tertiary)">
          {result ? `必须处理 ${result.must_count}，提醒 ${result.warn_count}` : '检查启用中的违禁词'}
        </span>
        <Button size="sm" disabled={checking || !text.trim()} onClick={() => void check()}>
          检查
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {result ? (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.8fr)]">
          <p className="whitespace-pre-wrap text-xs leading-6">
            {renderMarked(text, marks)}
          </p>
          <ul className="flex flex-col gap-1 text-xs">
            {result.hits.length === 0 ? <li className="text-(--ui-text-tertiary)">没有命中。</li> : null}
            {result.hits.map(hit => (
              <li key={`${hit.word}-${hit.positions[0] ?? 0}`} className="border-b border-(--ui-stroke-secondary) py-1">
                <span className={hit.level === 'must' ? 'text-destructive' : 'text-amber-600 dark:text-amber-300'}>
                  {hit.word}
                </span>
                <span className="text-(--ui-text-tertiary)"> · {hit.category}</span>
                {hit.suggestion ? <div className="text-(--ui-text-secondary)">建议：{hit.suggestion}</div> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function marksFor(text: string, hits: ComplianceHit[]): Mark[] {
  const owners: Array<ComplianceHit | null> = Array.from({ length: text.length }, () => null)
  for (const hit of hits) {
    for (const position of hit.positions) {
      const end = Math.min(text.length, position + hit.word.length)
      for (let index = position; index < end; index += 1) {
        const current = owners[index]
        if (!current || (hit.level === 'must' && current.level !== 'must')) owners[index] = hit
      }
    }
  }
  const marks: Mark[] = []
  let index = 0
  while (index < owners.length) {
    const hit = owners[index]
    if (!hit) {
      index += 1
      continue
    }
    const start = index
    while (index < owners.length && owners[index] === hit) index += 1
    marks.push({ hit, start, end: index })
  }
  return marks
}

function renderMarked(text: string, marks: Mark[]) {
  const nodes = []
  let cursor = 0
  marks.forEach((mark, index) => {
    if (mark.start > cursor) nodes.push(text.slice(cursor, mark.start))
    const must = mark.hit.level === 'must'
    nodes.push(
      <Tip
        key={`${mark.start}-${index}`}
        label={`${mark.hit.category}${mark.hit.suggestion ? ` · 建议改为${mark.hit.suggestion}` : ''}`}
      >
        <span
          className={cn(
            'underline decoration-2 underline-offset-2',
            must ? 'text-destructive decoration-destructive' : 'text-amber-600 decoration-amber-600 dark:text-amber-300 dark:decoration-amber-300'
          )}
        >
          {text.slice(mark.start, mark.end)}
        </span>
      </Tip>
    )
    cursor = mark.end
  })
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}
