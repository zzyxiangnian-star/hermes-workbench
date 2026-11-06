import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tip,
  cn
} from '@hermes/plugin-sdk'
import { isOfflineError } from '../../api/client'
import { refreshRunningCampaignCount } from '../../api/campaign-count'
import { listCampaigns, type Campaign } from '../../api/brand'
import { listShops } from '../../api/products'
import { useQuery } from '../../api/useQuery'
import { useApiBase } from '../../settings'
import { KIND_LABEL, PHASE_LABEL, phaseBadge, phaseClass } from '../brand-labels'
import { HeaderActions } from '../HeaderActions'
import { OfflineNotice } from '../OfflineNotice'
import { isoDate, monthBounds, monthWeeks, placeWeekBars, type CalendarDay } from './calendar'
import { CampaignDialog } from './CampaignDialog'
import { CampaignDrawer } from './CampaignDrawer'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']
const NARROW_PX = 760

export function CampaignsPage() {
  const apiBase = useApiBase()
  const [anchor, setAnchor] = useState(() => new Date())
  const [brand, setBrand] = useState('')
  const [creating, setCreating] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)
  const [wide, setWide] = useState(true)
  const frame = useRef<HTMLDivElement>(null)
  const bounds = monthBounds(anchor)

  useEffect(() => {
    const node = frame.current
    if (!node) return
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0
      setWide(width >= NARROW_PX)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const shopsQuery = useQuery(() => listShops(), [apiBase])
  const campaignsQuery = useQuery(
    () => listCampaigns({ date_from: bounds.from, date_to: bounds.to, brand: brand || undefined }),
    [apiBase, bounds.from, bounds.to, brand]
  )

  const reload = () => {
    campaignsQuery.reload()
    shopsQuery.reload()
    void refreshRunningCampaignCount()
  }

  const error = campaignsQuery.error ?? shopsQuery.error
  const offline = isOfflineError(error)
  const campaigns = campaignsQuery.data ?? []
  const brands = uniqueBrands(shopsQuery.data?.map(shop => shop.brand) ?? [], campaigns.map(item => item.brand))
  const weeks = monthWeeks(anchor)
  const today = isoDate(new Date())

  return (
    <div ref={frame} className="flex min-h-0 flex-1 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" onClick={() => setCreating(true)}>
          新建活动
        </Button>
      </HeaderActions>

      {offline ? (
        <OfflineNotice detail={error instanceof Error ? error.message : undefined} onRetry={reload} />
      ) : null}

      {!offline && error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState title="活动加载失败" description={error instanceof Error ? error.message : '请重试'}>
            <Button size="sm" variant="outline" onClick={reload}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !error ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs" variant="outline" aria-label="上个月" onClick={() => setAnchor(shiftMonth(anchor, -1))}>
              上个月
            </Button>
            <div className="min-w-24 text-center text-sm font-medium">
              {anchor.getFullYear()}年{anchor.getMonth() + 1}月
            </div>
            <Button size="xs" variant="outline" aria-label="下个月" onClick={() => setAnchor(shiftMonth(anchor, 1))}>
              下个月
            </Button>
            <Button size="xs" variant="outline" onClick={() => setAnchor(new Date())}>
              今天
            </Button>
            <Select
              value={brand || 'all'}
              onValueChange={value => setBrand(value === 'all' ? '' : value)}
            >
              <SelectTrigger aria-label="品牌" className="w-36">
                <SelectValue placeholder="全部品牌" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部品牌</SelectItem>
                {brands.map(item => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {campaignsQuery.loading && campaignsQuery.data ? <Loader /> : null}
          </div>

          {campaignsQuery.loading && !campaignsQuery.data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className={cn('grid gap-4', wide && 'grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.8fr)]')}>
              {wide ? (
                <MonthGrid
                  weeks={weeks}
                  campaigns={campaigns}
                  today={today}
                  onOpen={setOpenId}
                />
              ) : null}
              <CampaignList campaigns={campaigns} onOpen={setOpenId} />
            </div>
          )}
        </>
      ) : null}

      <CampaignDialog
        open={creating}
        brands={brands}
        onClose={() => setCreating(false)}
        onCreated={id => {
          setCreating(false)
          setOpenId(id)
          reload()
        }}
      />
      <CampaignDrawer
        campaignId={openId}
        onClose={() => setOpenId(null)}
        onChanged={reload}
      />
    </div>
  )
}

function MonthGrid({
  weeks,
  campaigns,
  today,
  onOpen
}: {
  weeks: CalendarDay[][]
  campaigns: Campaign[]
  today: string
  onOpen: (id: number) => void
}) {
  const byId = new Map(campaigns.map(item => [item.id, item]))
  return (
    <div className="min-w-0">
      <div className="grid grid-cols-7 border-b border-(--ui-stroke-secondary) text-center text-[0.6875rem] text-(--ui-text-tertiary)">
        {WEEKDAYS.map(label => (
          <div key={label} className="py-1">
            {label}
          </div>
        ))}
      </div>
      {weeks.map(week => {
        const bars = placeWeekBars(week, campaigns)
        const lanes = bars.reduce((max, bar) => Math.max(max, bar.lane + 1), 0)
        return (
          <div key={week[0]?.iso} className="border-b border-(--ui-stroke-secondary)">
            <div className="grid grid-cols-7">
              {week.map(day => (
                <div
                  key={day.iso}
                  className={cn(
                    'px-1 pt-1 text-[0.6875rem] tabular-nums',
                    day.inMonth ? 'text-(--ui-text-secondary)' : 'text-(--ui-text-quaternary)'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1',
                      day.iso === today && 'bg-(--ui-accent) text-(--ui-bg-editor)'
                    )}
                  >
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="grid grid-cols-7 gap-y-0.5 px-0.5 pb-1"
              style={{ gridTemplateRows: `repeat(${Math.max(lanes, 1)}, 1.25rem)` }}
            >
              {bars.map(bar => {
                const campaign = byId.get(bar.id)
                if (!campaign) return null
                return (
                  <div
                    key={campaign.id}
                    className="flex min-w-0"
                    style={{
                      gridColumn: `${bar.startCol + 1} / ${bar.endCol + 2}`,
                      gridRow: bar.lane + 1
                    }}
                  >
                    <Tip
                      label={`${campaign.brand} · ${campaign.start_date} 至 ${campaign.end_date} · 任务 ${campaign.tasks_done}/${campaign.tasks_total}`}
                    >
                      <button
                        type="button"
                        onClick={() => onOpen(campaign.id)}
                        className={cn(
                          'mx-0.5 min-w-0 flex-1 truncate rounded-sm px-1 text-left text-[0.6875rem] leading-5',
                          phaseClass(campaign.phase)
                        )}
                      >
                        {campaign.name}
                      </button>
                    </Tip>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CampaignList({ campaigns, onOpen }: { campaigns: Campaign[]; onOpen: (id: number) => void }) {
  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <EmptyState title="这个月没有活动" description="新建一个活动后，它会出现在月历和这张表里。" />
      </div>
    )
  }
  return (
    <div className="min-w-0">
      <div className="grid grid-cols-[minmax(0,1.4fr)_4.5rem_5.5rem_4.5rem] gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)">
        <span>活动</span>
        <span>类型</span>
        <span>任务</span>
        <span>阶段</span>
      </div>
      <ul>
        {campaigns.map(item => {
          const rate = item.tasks_total === 0 ? 0 : item.tasks_done / item.tasks_total
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="grid w-full grid-cols-[minmax(0,1.4fr)_4.5rem_5.5rem_4.5rem] items-center gap-2 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)"
              >
                <span className="min-w-0">
                  <span className="block truncate">{item.name}</span>
                  <span className="block truncate text-[0.6875rem] text-(--ui-text-tertiary)">
                    {item.brand} · {item.start_date.slice(5)} 至 {item.end_date.slice(5)}
                  </span>
                </span>
                <span className="truncate text-(--ui-text-secondary)">{KIND_LABEL[item.kind] ?? item.kind}</span>
                <span className="flex items-center gap-1">
                  <span className="h-1 w-10 overflow-hidden rounded-full bg-(--ui-bg-quinary)">
                    <span className="block h-full bg-(--ui-accent)" style={{ width: `${Math.round(rate * 100)}%` }} />
                  </span>
                  <span className="tabular-nums text-(--ui-text-secondary)">
                    {item.tasks_done}/{item.tasks_total}
                  </span>
                </span>
                <Badge variant={phaseBadge(item.phase)}>{PHASE_LABEL[item.phase] ?? item.phase}</Badge>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function shiftMonth(anchor: Date, delta: number): Date {
  return new Date(anchor.getFullYear(), anchor.getMonth() + delta, 1)
}

function uniqueBrands(fromShops: string[], fromCampaigns: string[]): string[] {
  return Array.from(new Set([...fromShops, ...fromCampaigns].map(item => item.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  )
}
