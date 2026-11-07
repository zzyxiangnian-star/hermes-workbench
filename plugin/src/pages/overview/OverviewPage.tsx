import { useMemo, useState } from 'react'
import {
  Button,
  Codicon,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  cn
} from '@hermes/plugin-sdk'
import { refreshOpenAlertCount } from '../../api/alert-count'
import { isOfflineError } from '../../api/client'
import {
  getOverview,
  getTrend,
  listAdSpend,
  listAlerts,
  type AdSpendRow,
  type MetricKey,
  type MetricValue,
  type Overview,
  type TrendPoint
} from '../../api/overview'
import { listShops } from '../../api/products'
import { useQuery } from '../../api/useQuery'
import { useApiBase } from '../../settings'
import { HeaderActions } from '../HeaderActions'
import { OfflineNotice } from '../OfflineNotice'
import { ImportDialog } from '../products/ImportDialog'
import { platformMark, platformName } from '../products/labels'
import { AlertDrawer } from './AlertDrawer'
import { ReportDialog } from './ReportDialog'
import { Sparkline, shortDate } from './Sparkline'

type Kind = 'count' | 'money' | 'ratio' | 'roi'

const CARDS: ReadonlyArray<{ key: MetricKey; label: string; kind: Kind }> = [
  { key: 'sales_amount', label: '销售额', kind: 'money' },
  { key: 'orders', label: '订单', kind: 'count' },
  { key: 'visitors', label: '访客', kind: 'count' },
  { key: 'conversion_rate', label: '转化率', kind: 'ratio' },
  { key: 'avg_order_value', label: '客单价', kind: 'money' },
  { key: 'ad_spend', label: '投放花费', kind: 'money' },
  { key: 'ad_gmv', label: '投放 GMV', kind: 'money' },
  { key: 'roi', label: 'ROI', kind: 'roi' }
]

const KIND_OF = Object.fromEntries(CARDS.map(card => [card.key, card.kind])) as Record<MetricKey, Kind>
const LABEL_OF = Object.fromEntries(CARDS.map(card => [card.key, card.label])) as Record<MetricKey, string>

const TREND_METRICS: ReadonlyArray<{ id: MetricKey; label: string }> = [
  { id: 'sales_amount', label: '销售额' },
  { id: 'orders', label: '订单' },
  { id: 'visitors', label: '访客' },
  { id: 'ad_spend', label: '投放花费' },
  { id: 'roi', label: 'ROI' }
]

/** 这两个指标跌超过 20% 用 destructive 色，其余下跌用 warn 色。 */
const SENSITIVE: ReadonlySet<MetricKey> = new Set(['roi', 'conversion_rate'])

export function OverviewPage() {
  const apiBase = useApiBase()
  const [shopId, setShopId] = useState<number | undefined>(undefined)
  const [date, setDate] = useState<string>('')
  const [trendMetric, setTrendMetric] = useState<MetricKey>('sales_amount')
  const [trendDays, setTrendDays] = useState<7 | 30>(30)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const shopsQuery = useQuery(() => listShops(), [apiBase])
  const overviewQuery = useQuery(
    () => getOverview({ date: date || undefined, shopId }),
    [apiBase, date, shopId]
  )
  const day = overviewQuery.data?.date ?? undefined

  // 小折线和大图都跟总览的日期对齐，总览没回来之前不请求。
  const sparkQuery = useQuery(
    async () => {
      if (!day) return null
      const trends = await Promise.all(
        CARDS.map(card => getTrend({ metric: card.key, days: 7, shopId, date: day }))
      )
      return Object.fromEntries(trends.map(trend => [trend.metric, trend.points])) as Record<MetricKey, TrendPoint[]>
    },
    [apiBase, day, shopId]
  )
  const trendQuery = useQuery(
    async () => (day ? getTrend({ metric: trendMetric, days: trendDays, shopId, date: day }) : null),
    [apiBase, day, shopId, trendMetric, trendDays]
  )
  const adQuery = useQuery(
    async () => (day ? listAdSpend({ dateFrom: day, dateTo: day, shopId }) : null),
    [apiBase, day, shopId]
  )

  const alertsQuery = useQuery(() => listAlerts({ status: 'open', shopId }), [apiBase, shopId])

  const reloadAll = () => {
    alertsQuery.reload()
    shopsQuery.reload()
    overviewQuery.reload()
    sparkQuery.reload()
    trendQuery.reload()
    adQuery.reload()
    void refreshOpenAlertCount()
  }

  const shops = shopsQuery.data ?? []
  const openAlerts = alertsQuery.data?.length
  const overview = overviewQuery.data
  const error = overviewQuery.error ?? shopsQuery.error ?? sparkQuery.error ?? trendQuery.error ?? adQuery.error
  const offline = isOfflineError(error)
  const empty = overview != null && !date && isEmpty(overview)
  const adRows = useMemo(
    () => [...(adQuery.data ?? [])].sort((a, b) => b.spend - a.spend),
    [adQuery.data]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
      <HeaderActions>
        <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          导入经营 / 投放表
        </Button>
        <Button size="sm" onClick={() => setReportOpen(true)}>
          看日报
        </Button>
      </HeaderActions>

      {offline ? (
        <OfflineNotice detail={error instanceof Error ? error.message : undefined} onRetry={reloadAll} />
      ) : null}

      {!offline && error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState title="经营数据加载失败" description={error instanceof Error ? error.message : '请重试'}>
            <Button size="sm" variant="outline" onClick={reloadAll}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !error && empty ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <EmptyState
            icon={<Codicon name="graph" size="1.25rem" />}
            title="还没有经营数据"
            description="导入后台导出的经营表和投放表后显示。也可以在设置里配好报表文件夹，每 10 分钟自动导入。"
          >
            <Button size="sm" onClick={() => setImportOpen(true)}>
              导入经营 / 投放表
            </Button>
          </EmptyState>
        </div>
      ) : null}

      {!offline && !error && !empty ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={shopId == null ? 'all' : String(shopId)}
              onValueChange={value => setShopId(value === 'all' ? undefined : Number(value))}
            >
              <SelectTrigger aria-label="店铺" className="w-48">
                <SelectValue placeholder="全部店铺" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部店铺</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={String(shop.id)}>
                    {platformName(shop.platform)} · {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="w-40 shrink-0">
              <Input
                aria-label="日期"
                type="date"
                value={date || overview?.date || ''}
                onChange={event => setDate(event.target.value)}
              />
            </div>
            {date ? (
              <Button size="xs" variant="ghost" onClick={() => setDate('')}>
                回到最新一天
              </Button>
            ) : null}
            <span className="text-xs text-(--ui-text-tertiary)">
              {overview?.compare_date ? `和 ${shortDate(overview.compare_date)} 比` : null}
            </span>
            {overviewQuery.loading && overview ? <Loader /> : null}
            <span className="flex-1" />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAlertsOpen(true)}
              aria-label={`投放提醒，${openAlerts ?? 0} 条未处理`}
            >
              {openAlerts ? <span className="size-1.5 rounded-full bg-amber-500" aria-hidden /> : null}
              投放提醒 {openAlerts ?? ''}
            </Button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2">
            {CARDS.map(card => (
              <MetricCard
                key={card.key}
                metric={card.key}
                label={card.label}
                value={overview?.metrics[card.key]}
                points={sparkQuery.data?.[card.key]}
                active={trendMetric === card.key}
                onSelect={
                  TREND_METRICS.some(item => item.id === card.key) ? () => setTrendMetric(card.key) : undefined
                }
              />
            ))}
          </div>

          <section className="flex flex-col gap-2 rounded-lg border border-(--ui-stroke-secondary) p-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xs font-medium text-(--ui-text-primary)">趋势</h3>
              <SegmentedControl
                options={TREND_METRICS}
                value={trendMetric}
                sizing="content"
                onChange={value => setTrendMetric(value)}
              />
              <span className="flex-1" />
              <SegmentedControl
                options={[
                  { id: '7', label: '7 天' },
                  { id: '30', label: '30 天' }
                ]}
                value={String(trendDays)}
                sizing="content"
                onChange={value => setTrendDays(value === '7' ? 7 : 30)}
              />
            </div>
            {trendQuery.data ? (
              <Sparkline
                large
                height="10rem"
                label={`${LABEL_OF[trendMetric]}近 ${trendDays} 天`}
                points={trendQuery.data.points}
                format={value => formatMetric(value, KIND_OF[trendMetric])}
              />
            ) : (
              <Skeleton className="h-44 w-full" />
            )}
          </section>

          <section className="flex flex-col gap-1">
            <h3 className="px-1 text-xs font-medium text-(--ui-text-primary)">
              投放计划
              <span className="ml-2 font-normal text-(--ui-text-tertiary)">
                {day ? `${shortDate(day)} 当天，按花费排序` : ''}
              </span>
            </h3>
            <AdTable
              rows={adRows}
              platformOf={id => shops.find(shop => shop.id === id)?.platform ?? ''}
              loading={adQuery.loading && !adQuery.data}
            />
          </section>
        </>
      ) : null}

      {!offline && !error && !overview ? <OverviewSkeleton /> : null}

      <AlertDrawer
        open={alertsOpen}
        shopId={shopId}
        onClose={() => setAlertsOpen(false)}
        onChanged={reloadAll}
      />
      <ReportDialog open={reportOpen} date={day} onClose={() => setReportOpen(false)} />
      <ImportDialog
        open={importOpen}
        shops={shops}
        initialKind="metrics"
        kinds={['metrics', 'ad_spend']}
        onClose={() => setImportOpen(false)}
        onDone={reloadAll}
      />
    </div>
  )
}

function MetricCard({
  metric,
  label,
  value,
  points,
  active,
  onSelect
}: {
  metric: MetricKey
  label: string
  value: MetricValue | undefined
  points: TrendPoint[] | undefined
  active: boolean
  onSelect?: () => void
}) {
  const kind = KIND_OF[metric]
  const body = (
    <>
      <span className="text-[0.6875rem] text-(--ui-text-tertiary)">{label}</span>
      {value ? (
        <span className="text-lg leading-tight font-semibold text-(--ui-text-primary) tabular-nums">
          {value.value == null ? '—' : formatMetric(value.value, kind)}
        </span>
      ) : (
        <Skeleton className="h-6 w-20" />
      )}
      {value ? <Change metric={metric} value={value} /> : <Skeleton className="h-3.5 w-24" />}
      <div className="mt-1">
        {points ? <Sparkline points={points} height="1.75rem" label={`${label}近 7 天`} /> : <Skeleton className="h-7 w-full" />}
      </div>
    </>
  )
  const className = cn(
    'flex min-w-0 flex-col gap-0.5 rounded-lg border border-(--ui-stroke-secondary) p-3 text-left',
    active && onSelect && 'border-(--ui-accent)'
  )
  if (!onSelect) return <div className={className}>{body}</div>
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        className,
        'cursor-pointer hover:bg-(--ui-bg-quinary) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)'
      )}
    >
      {body}
    </button>
  )
}

function Change({ metric, value }: { metric: MetricKey; value: MetricValue }) {
  const kind = KIND_OF[metric]
  const previous = value.previous == null ? '—' : formatMetric(value.previous, kind)
  if (value.change == null) {
    return <span className="text-[0.6875rem] text-(--ui-text-tertiary)">前一天 {previous}</span>
  }
  const pct = Math.round(value.change * 1000) / 10
  const tone =
    value.change === 0
      ? 'text-(--ui-text-tertiary)'
      : value.change > 0
        ? 'text-(--ui-text-secondary)'
        : SENSITIVE.has(metric) && value.change < -0.2
          ? 'text-destructive'
          : 'text-amber-600 dark:text-amber-300'
  const text = value.change === 0 ? '持平' : `${value.change > 0 ? '↑' : '↓'} ${Math.abs(pct)}%`
  return (
    <span className="text-[0.6875rem] text-(--ui-text-tertiary) tabular-nums">
      <span className={tone}>{text}</span>
      <span> · 前一天 {previous}</span>
    </span>
  )
}

function AdTable({
  rows,
  platformOf,
  loading
}: {
  rows: AdSpendRow[]
  platformOf: (shopId: number) => string
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2 py-1">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-7 w-full" />
        ))}
      </div>
    )
  }
  if (rows.length === 0) {
    return <p className="px-1 py-3 text-xs text-(--ui-text-tertiary)">这一天没有投放记录。</p>
  }
  const columns = 'grid-cols-[minmax(8rem,1.2fr)_5.5rem_minmax(7rem,1.4fr)_5.5rem_5.5rem_4rem]'
  return (
    <div className="min-w-0 overflow-x-auto">
      <div className="min-w-[38rem]">
        <div
          className={cn(
            'grid gap-3 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)',
            columns
          )}
        >
          <span>店铺</span>
          <span>工具</span>
          <span>计划</span>
          <span className="text-right">花费</span>
          <span className="text-right">GMV</span>
          <span className="text-right">ROI</span>
        </div>
        <ul>
          {rows.map(row => (
            <li
              key={`${row.shop_id}-${row.tool}-${row.campaign}`}
              className={cn('grid items-center gap-3 border-b border-(--ui-stroke-secondary) px-2 py-2 text-xs', columns)}
            >
              <span className="flex min-w-0 items-center gap-1.5 text-(--ui-text-secondary)">
                {platformOf(row.shop_id) ? (
                  <span
                    title={platformName(platformOf(row.shop_id))}
                    className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5 text-[0.625rem]"
                  >
                    {platformMark(platformOf(row.shop_id))}
                  </span>
                ) : null}
                <span className="truncate">{row.shop_name}</span>
              </span>
              <span className="truncate text-(--ui-text-secondary)">{row.tool}</span>
              <span className="flex min-w-0 items-center gap-1.5">
                {row.has_alert ? (
                  <span
                    role="img"
                    aria-label="有未处理的投放提醒"
                    title="有未处理的投放提醒"
                    className="size-1.5 shrink-0 rounded-full bg-amber-500"
                  />
                ) : (
                  <span className="size-1.5 shrink-0" />
                )}
                <span className="truncate">{row.campaign}</span>
              </span>
              <span className="text-right tabular-nums">{formatMoney(row.spend)}</span>
              <span className="text-right tabular-nums">{formatMoney(row.gmv)}</span>
              <span className="text-right tabular-nums">{row.roi == null ? '—' : row.roi.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
      <Skeleton className="h-52 w-full" />
    </div>
  )
}

function isEmpty(overview: Overview): boolean {
  const m = overview.metrics
  return [m.visitors, m.orders, m.sales_amount, m.ad_spend, m.ad_gmv].every(
    item => !item.value && !item.previous
  )
}

function formatMoney(value: number): string {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMetric(value: number, kind: Kind): string {
  if (!Number.isFinite(value)) return '—'
  if (kind === 'money') return formatMoney(value)
  if (kind === 'ratio') return `${(value * 100).toFixed(2)}%`
  if (kind === 'roi') return value.toFixed(2)
  return value.toLocaleString('zh-CN')
}
