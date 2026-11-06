import { useEffect, useRef, useState } from 'react'
import { Badge, Codicon, EmptyState, Tip, cn } from '@hermes/plugin-sdk'
import { useRunningCampaignCount } from './api/campaign-count'
import { useInReviewCount } from './api/content-count'
import { useOpenInquiryCount } from './api/inquiry-count'
import { useNeedsActionCount } from './api/install-count'
import { useOpenIssueCount } from './api/open-count'
import { openPage, useLocation, useWorkbenches } from './registry'
import type { WorkbenchDef, WorkbenchPageDef } from './types'

const STORAGE_KEY = 'hermes-workbench:expanded-v1'

function loadExpandedMap(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, boolean>
    }
  } catch {
    // 忽略受限环境下的 localStorage 异常
  }
  return {}
}

function saveExpandedMap(map: Record<string, boolean>): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // 忽略受限环境下的 localStorage 异常
  }
}

const PANE_STYLE = `
.wb-pane-row {
  font-size: 0.8125rem;
  line-height: 1.35;
  min-height: 1.625rem;
  cursor: pointer;
  transition: background-color 100ms ease-out, color 100ms ease-out;
}
.wb-pane-row:hover {
  transition: none;
  background-color: var(--ui-bg-quinary);
  color: var(--ui-text-primary);
}
.wb-pane-row[data-active="true"] {
  background-color: var(--ui-bg-quinary);
  color: var(--ui-text-primary);
  font-weight: 500;
}
.wb-pane-lead {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.wb-caret-btn {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  cursor: pointer;
  color: var(--ui-text-tertiary);
}
.wb-caret-btn:hover {
  color: var(--ui-text-primary);
}
.wb-caret-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1);
}
.wb-caret-icon[data-expanded="true"] {
  transform: rotate(90deg);
}
.wb-badge {
  font-size: 0.6875rem;
  line-height: 1;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: reduce) {
  .wb-pane-row,
  .wb-caret-icon {
    transition: none !important;
  }
}
`

function TruncatedLabel({
  text,
  className
}: {
  text: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)

  const checkTruncation = () => {
    const el = ref.current
    if (!el) return
    const next = el.scrollWidth > el.clientWidth + 1
    setTruncated(prev => (prev === next ? prev : next))
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    checkTruncation()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      checkTruncation()
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [text])

  const span = (
    <span
      ref={ref}
      onPointerEnter={checkTruncation}
      className={cn('min-w-0 flex-1 truncate text-left', className)}
    >
      {text}
    </span>
  )

  if (!truncated) {
    return span
  }

  return (
    <Tip label={text} side="right">
      {span}
    </Tip>
  )
}

function WorkbenchPageRow({
  workbenchId,
  page,
  active
}: {
  workbenchId: string
  page: WorkbenchPageDef
  active: boolean
}) {
  const rawBadge = page.badge?.()
  const showBadge = typeof rawBadge === 'number' && rawBadge > 0

  return (
    <button
      type="button"
      data-active={active ? 'true' : undefined}
      onClick={() => openPage({ workbench: workbenchId, page: page.id })}
      className={cn(
        'wb-pane-row group flex w-full items-center gap-1.5 rounded-lg py-1 pr-2 pl-6 text-left outline-none select-none',
        active ? 'text-(--ui-text-primary)' : 'text-(--ui-text-secondary)',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)'
      )}
    >
      <span
        className={cn(
          'wb-pane-lead',
          active
            ? 'text-(--ui-text-primary)'
            : 'text-(--ui-text-tertiary) group-hover:text-(--ui-text-secondary)'
        )}
      >
        <Codicon name={page.codicon} size="0.875rem" />
      </span>
      <TruncatedLabel text={page.label} />
      {showBadge && (
        <Badge
          variant="outline"
          className="wb-badge ml-auto shrink-0 border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)"
        >
          {rawBadge}
        </Badge>
      )}
    </button>
  )
}

function WorkbenchGroup({
  workbench,
  expanded,
  onToggleExpand,
  activePageId
}: {
  workbench: WorkbenchDef
  expanded: boolean
  onToggleExpand: () => void
  activePageId: string | undefined
}) {
  const firstPage = workbench.pages[0]
  const hasActivePage = Boolean(activePageId)
  const collapsedBadgeTotal = !expanded
    ? workbench.pages.reduce((sum, p) => {
        const val = p.badge?.()
        return sum + (typeof val === 'number' && val > 0 ? val : 0)
      }, 0)
    : 0

  const handleOpenDefaultPage = () => {
    if (firstPage) {
      openPage({ workbench: workbench.id, page: firstPage.id })
    }
  }

  return (
    <section className="flex flex-col gap-0.5" aria-label={workbench.name}>
      <div
        data-active={!expanded && hasActivePage ? 'true' : undefined}
        className={cn(
          'wb-pane-row group flex w-full items-center gap-1 rounded-lg px-2 py-1 select-none',
          'text-(--ui-text-primary)'
        )}
      >
        <button
          type="button"
          onClick={handleOpenDefaultPage}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)"
        >
          <span
            className={cn(
              'wb-pane-lead',
              hasActivePage
                ? 'text-(--ui-text-primary)'
                : 'text-(--ui-text-secondary) group-hover:text-(--ui-text-primary)'
            )}
          >
            <Codicon name={workbench.codicon} size="0.875rem" />
          </span>
          <TruncatedLabel text={workbench.name} className="font-medium" />
        </button>
        {!expanded && collapsedBadgeTotal > 0 && (
          <Badge
            variant="outline"
            className="wb-badge shrink-0 border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) text-(--ui-text-secondary)"
          >
            {collapsedBadgeTotal}
          </Badge>
        )}
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? `收起${workbench.name}` : `展开${workbench.name}`}
          onClick={e => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="wb-caret-btn outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)"
        >
          <span className="wb-caret-icon" data-expanded={expanded ? 'true' : 'false'}>
            <Codicon name="chevron-right" size="0.75rem" />
          </span>
        </button>
      </div>

      {expanded && workbench.pages.length > 0 && (
        <div className="flex flex-col gap-0.5" role="group">
          {workbench.pages.map(page => (
            <WorkbenchPageRow
              key={page.id}
              workbenchId={workbench.id}
              page={page}
              active={activePageId === page.id}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export function WorkbenchPane() {
  const workbenches = useWorkbenches()
  const location = useLocation()
  useOpenIssueCount()
  useNeedsActionCount()
  useOpenInquiryCount()
  useRunningCampaignCount()
  useInReviewCount()
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>(() => loadExpandedMap())

  const isExpanded = (id: string): boolean => {
    // 默认全部展开
    return expandedMap[id] ?? true
  }

  const toggleExpand = (id: string) => {
    setExpandedMap(prev => {
      const current = prev[id] ?? true
      const next = { ...prev, [id]: !current }
      saveExpandedMap(next)
      return next
    })
  }

  if (workbenches.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center p-4">
        <style>{PANE_STYLE}</style>
        <EmptyState
          icon={<Codicon name="extensions" size="1.25rem" />}
          title="还没有安装工作台"
          description="启用工作台模块后，将在这里列出对应的业务分页。"
        />
      </div>
    )
  }

  return (
    <nav
      aria-label="工作台导航"
      className="flex h-full w-full flex-col gap-3 overflow-y-auto px-2 py-2.5"
    >
      <style>{PANE_STYLE}</style>
      {workbenches.map(wb => (
        <WorkbenchGroup
          key={wb.id}
          workbench={wb}
          expanded={isExpanded(wb.id)}
          onToggleExpand={() => toggleExpand(wb.id)}
          activePageId={location?.workbench === wb.id ? location.page : undefined}
        />
      ))}
    </nav>
  )
}
