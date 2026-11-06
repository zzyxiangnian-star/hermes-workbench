import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  EmptyState,
  ErrorState,
  Loader,
  SearchField,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Switch,
  Tip
} from '@hermes/plugin-sdk'
import { isOfflineError } from '../../api/client'
import { refreshNeedsActionCount } from '../../api/install-count'
import { exportInstalls, listInstalls, type InstallOrder } from '../../api/installs'
import { getInstallSummary } from '../../api/installs'
import { listShops, type Shop } from '../../api/products'
import { useQuery } from '../../api/useQuery'
import { useApiBase } from '../../settings'
import { HeaderActions } from '../HeaderActions'
import { OfflineNotice } from '../OfflineNotice'
import { ImportDialog } from '../products/ImportDialog'
import { InstallDrawer } from './InstallDrawer'
import {
  formatShanghai,
  isActionStatus,
  segmentStatus,
  statusLabel,
  statusVariant,
  type InstallSegment
} from './labels'

const SEGMENTS: ReadonlyArray<{ id: InstallSegment; label: string }> = [
  { id: 'action', label: '待处理' },
  { id: 'booked', label: '已预约' },
  { id: 'done', label: '已完工' },
  { id: 'all', label: '全部' }
]

export function InstallsPage() {
  const apiBase = useApiBase()
  const [segment, setSegment] = useState<InstallSegment>('action')
  const [shopId, setShopId] = useState<number | undefined>(undefined)
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  const shopsQuery = useQuery(() => listShops(), [apiBase])
  const summaryQuery = useQuery(() => getInstallSummary(shopId), [apiBase, shopId])
  const listQuery = useQuery(
    () =>
      listInstalls({
        status: segmentStatus(segment),
        shop_id: shopId,
        q: q || undefined,
        overdue: overdueOnly ? true : undefined
      }),
    [apiBase, segment, shopId, q, overdueOnly]
  )

  const reload = () => {
    shopsQuery.reload()
    summaryQuery.reload()
    listQuery.reload()
    void refreshNeedsActionCount()
  }

  const error = listQuery.error ?? summaryQuery.error ?? shopsQuery.error
  const offline = isOfflineError(error)
  const summary = summaryQuery.data
  const rows = (listQuery.data ?? []).filter(item => {
    if (segment === 'action') return isActionStatus(item.status)
    if (segment === 'booked' || segment === 'done') return item.status === segment
    return true
  })
  const loading = !error && listQuery.loading && !listQuery.data

  const toggle = (id: number, on: boolean) => {
    setSelected(current => (on ? [...current, id] : current.filter(item => item !== id)))
  }

  const exportCsv = async () => {
    setExporting(true)
    setExportError(null)
    try {
      if (selected.length > 0) await exportInstalls({ ids: selected })
      else await exportInstalls({ status: 'pending' })
    } catch (reason) {
      setExportError(reason instanceof Error ? reason.message : '导出失败')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" variant="outline" disabled={exporting} onClick={() => void exportCsv()}>
          {exporting ? '正在导出' : selected.length > 0 ? `导出勾选的 ${selected.length} 张` : '导出待预约'}
        </Button>
        <Button size="sm" onClick={() => setImportOpen(true)}>
          导入订单
        </Button>
      </HeaderActions>

      {offline ? (
        <OfflineNotice detail={error instanceof Error ? error.message : undefined} onRetry={reload} />
      ) : null}

      {!offline && error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState title="工单加载失败" description={error instanceof Error ? error.message : '请重试'}>
            <Button size="sm" variant="outline" onClick={reload}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !error ? (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--ui-text-secondary)">
            <span className="inline-flex flex-wrap items-center gap-1.5">
              待预约
              {summaryQuery.loading && !summary ? <Skeleton className="h-4 w-6" /> : <Badge variant="outline">{summary?.pending ?? 0}</Badge>}
              <span className="text-(--ui-text-tertiary)">（其中超时</span>
              {summaryQuery.loading && !summary ? <Skeleton className="h-4 w-6" /> : <Badge variant="warn">{summary?.overdue ?? 0}</Badge>}
              <span className="text-(--ui-text-tertiary)">）</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              已预约
              {summaryQuery.loading && !summary ? <Skeleton className="h-4 w-6" /> : <Badge variant="outline">{summary?.booked ?? 0}</Badge>}
            </span>
            <span className="inline-flex items-center gap-1.5">
              异常
              {summaryQuery.loading && !summary ? (
                <Skeleton className="h-4 w-6" />
              ) : (
                <Badge variant="destructive">{summary?.exception ?? 0}</Badge>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              今日完工
              {summaryQuery.loading && !summary ? <Skeleton className="h-4 w-6" /> : <Badge variant="outline">{summary?.done_today ?? 0}</Badge>}
            </span>
            {listQuery.loading && listQuery.data ? <Loader /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              options={SEGMENTS}
              value={segment}
              sizing="content"
              onChange={value => {
                setSegment(value)
                setSelected([])
              }}
            />
            <Select
              value={shopId == null ? 'all' : String(shopId)}
              onValueChange={value => {
                setShopId(value === 'all' ? undefined : Number(value))
                setSelected([])
              }}
            >
              <SelectTrigger aria-label="店铺" className="w-44 max-w-full">
                <SelectValue placeholder="全部店铺" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部店铺</SelectItem>
                {(shopsQuery.data ?? []).map((shop: Shop) => (
                  <SelectItem key={shop.id} value={String(shop.id)}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="inline-flex items-center gap-1.5 text-xs text-(--ui-text-secondary)">
              <Switch size="xs" checked={overdueOnly} onCheckedChange={setOverdueOnly} aria-label="只看超时" />
              只看超时
            </span>
            <SearchField aria-label="搜索工单" placeholder="订单号、商品、收货人、手机" value={qInput} onChange={setQInput} />
          </div>

          {exportError ? <p className="text-xs text-destructive">{exportError}</p> : null}

          {loading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
              ))}
            </div>
          ) : null}

          {!loading && rows.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <EmptyState title="没有符合条件的工单" description="换个筛选，或先导入一张订单表。" />
            </div>
          ) : null}

          {!loading && rows.length > 0 ? (
            <ul className="min-w-0">
              {rows.map(item => (
                <InstallRow
                  key={item.id}
                  item={item}
                  checked={selected.includes(item.id)}
                  onToggle={on => toggle(item.id, on)}
                  onOpen={() => setActiveId(item.id)}
                />
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      <InstallDrawer installId={activeId} onClose={() => setActiveId(null)} onChanged={reload} />
      <ImportDialog
        open={importOpen}
        shops={shopsQuery.data ?? []}
        initialKind="orders"
        onClose={() => setImportOpen(false)}
        onDone={reload}
      />
    </div>
  )
}

function InstallRow({
  item,
  checked,
  onToggle,
  onOpen
}: {
  item: InstallOrder
  checked: boolean
  onToggle: (on: boolean) => void
  onOpen: () => void
}) {
  return (
    <li className="flex items-start gap-2 border-b border-(--ui-stroke-secondary) px-1 py-2">
      <Checkbox checked={checked} aria-label={`选择 ${item.code}`} onCheckedChange={onToggle} />
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 flex-col gap-1 text-left hover:bg-(--ui-bg-quinary)">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-(--ui-text-tertiary)">{item.code}</span>
          <span className="min-w-0 truncate text-sm font-medium">{item.title}</span>
          <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
          {item.overdue ? <Badge variant="warn">超时</Badge> : null}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-(--ui-text-secondary)">
          <span>
            {item.buyer_name || '未填收货人'} {item.phone || ''}
          </span>
          {item.address ? (
            <Tip label={item.address}>
              <span className="max-w-48 truncate text-(--ui-text-tertiary)">{item.address}</span>
            </Tip>
          ) : null}
          {item.remark ? (
            <Tip label={item.remark}>
              <span className="inline-flex h-4 items-center rounded-sm border border-(--ui-stroke-secondary) px-1 text-(--ui-text-tertiary)">
                留言
              </span>
            </Tip>
          ) : null}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-(--ui-text-tertiary)">
          <span>付款 {formatShanghai(item.paid_at)}</span>
          <span>预约 {formatShanghai(item.appointment_at)}</span>
        </span>
      </button>
    </li>
  )
}
