import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  SearchField,
  SegmentedControl,
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
import { refreshOpenIssueCount } from '../../api/open-count'
import {
  listIssues,
  listProductsForView,
  listShops,
  type Issue,
  type Product,
  type ProductSegment
} from '../../api/products'
import { useQuery } from '../../api/useQuery'
import { setApiBase, useApiBase } from '../../settings'
import { ImportDialog } from './ImportDialog'
import { IssueDrawer } from './IssueDrawer'
import { formatAmount, levelLabel, platformMark, platformName } from './labels'
import { RulesDrawer } from './RulesDrawer'

const PAGE_SIZE = 20

const SEGMENTS: ReadonlyArray<{ id: ProductSegment; label: string }> = [
  { id: 'all', label: '全部' },
  { id: 'issue', label: '有问题' },
  { id: 'must', label: '必须处理' },
  { id: 'warn', label: '提醒' }
]

export function ProductsPage() {
  const apiBase = useApiBase()
  const [segment, setSegment] = useState<ProductSegment>('all')
  const [shopId, setShopId] = useState<number | undefined>(undefined)
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [importOpen, setImportOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)
  const [active, setActive] = useState<Product | null>(null)
  const [addressDraft, setAddressDraft] = useState(apiBase)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  const skipQReset = useRef(true)
  useEffect(() => {
    if (skipQReset.current) {
      skipQReset.current = false
      return
    }
    setPage(1)
  }, [q])

  const shopsQuery = useQuery(() => listShops(), [apiBase])
  const issuesQuery = useQuery(
    () => listIssues({ status: 'open', shop_id: shopId }),
    [apiBase, shopId]
  )
  const productsQuery = useQuery(
    () => listProductsForView({ segment, shopId, q, page, pageSize: PAGE_SIZE }),
    [apiBase, segment, shopId, q, page]
  )

  useEffect(() => {
    if (!active || !productsQuery.data) return
    const next = productsQuery.data.items.find(item => item.id === active.id)
    if (next && next !== active) setActive(next)
  }, [productsQuery.data, active])

  const reloadAll = () => {
    shopsQuery.reload()
    issuesQuery.reload()
    productsQuery.reload()
    void refreshOpenIssueCount()
  }

  const shops = shopsQuery.data ?? []
  const pageData = productsQuery.data
  const flags = useMemo(() => flagsByProduct(issuesQuery.data ?? []), [issuesQuery.data])
  const summary = useMemo(() => summarize(issuesQuery.data ?? []), [issuesQuery.data])
  const error = productsQuery.error ?? issuesQuery.error ?? shopsQuery.error
  const offline = isOfflineError(error)
  const loading = !error && (productsQuery.loading || issuesQuery.loading) && !pageData
  const pageCount = Math.max(1, Math.ceil((pageData?.total ?? 0) / PAGE_SIZE))

  useEffect(() => {
    if (!pageData) return
    const count = Math.max(1, Math.ceil(pageData.total / PAGE_SIZE))
    if (page > count) setPage(count)
  }, [pageData, page])

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" variant="outline" onClick={() => setRulesOpen(true)}>
          规则
        </Button>
        <Button size="sm" onClick={() => setImportOpen(true)}>
          导入报表
        </Button>
      </HeaderActions>

      {offline ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <EmptyState
            title="没有连上工作台服务"
            description={
              error instanceof Error && error.message && error.message !== '没有连上工作台服务'
                ? `${error.message}。当前地址 ${apiBase}`
                : `当前地址 ${apiBase}`
            }
          >
            <Button size="sm" variant="outline" onClick={reloadAll}>
              重试
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setAddressDraft(apiBase)
              setAddressError(null)
              setEditingAddress(true)
            }}>
              更改地址
            </Button>
          </EmptyState>
        </div>
      ) : null}

      {offline && editingAddress ? (
        <form
          className="mx-auto flex w-full max-w-sm items-center gap-2"
          onSubmit={event => {
            event.preventDefault()
            const ok = setApiBase(addressDraft)
            if (!ok) {
              setAddressError('地址需要以 http:// 或 https:// 开头')
              return
            }
            setEditingAddress(false)
            setAddressError(null)
          }}
        >
          <Input
            aria-label="工作台服务地址"
            value={addressDraft}
            onChange={event => setAddressDraft(event.target.value)}
          />
          <Button size="sm" type="submit">
            保存
          </Button>
        </form>
      ) : null}
      {offline && addressError ? (
        <p className="text-center text-xs text-(--ui-error)">{addressError}</p>
      ) : null}

      {!offline && error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState
            title="商品加载失败"
            description={error instanceof Error ? error.message : '请重试'}
          >
            <Button size="sm" variant="outline" onClick={reloadAll}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !error ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs text-(--ui-text-secondary)">
            <SummaryChip label="必须处理" value={issuesQuery.loading && !issuesQuery.data ? undefined : summary.must} tone="destructive" />
            <SummaryChip label="提醒" value={issuesQuery.loading && !issuesQuery.data ? undefined : summary.warn} tone="warn" />
            <SummaryChip label="涉及商品" value={issuesQuery.loading && !issuesQuery.data ? undefined : summary.products} tone="outline" />
            {productsQuery.loading && pageData ? <Loader /> : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              options={SEGMENTS}
              value={segment}
              sizing="content"
              onChange={value => {
                setSegment(value)
                setPage(1)
              }}
            />
            <Select
              value={shopId == null ? 'all' : String(shopId)}
              onValueChange={value => {
                setShopId(value === 'all' ? undefined : Number(value))
                setPage(1)
              }}
            >
              <SelectTrigger aria-label="店铺" className="w-44">
                <SelectValue placeholder="全部店铺" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部店铺</SelectItem>
                {shops.map(shop => (
                  <SelectItem key={shop.id} value={String(shop.id)}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <SearchField
              aria-label="搜索商品"
              placeholder="标题、编码、货号"
              value={qInput}
              onChange={setQInput}
            />
          </div>

          {loading ? <ProductSkeleton /> : null}

          {!loading && pageData && pageData.items.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <EmptyState title="没有符合条件的商品" description="换个筛选，或先导入一张报表。" />
            </div>
          ) : null}

          {!loading && pageData && pageData.items.length > 0 ? (
            <div className="min-h-0 flex-1">
              <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(7rem,0.9fr)_7.5rem_3.5rem_5.5rem_auto] gap-3 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)">
                <span>商品</span>
                <span>店铺</span>
                <span>价格 / 底价</span>
                <span>库存</span>
                <span>活动</span>
                <span>问题</span>
              </div>
              <ul>
                {pageData.items.map(product => (
                  <li key={product.id}>
                    <ProductRow
                      product={product}
                      flags={flags.get(product.id)}
                      onOpen={() => setActive(product)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {pageData ? (
            <div className="flex items-center justify-between gap-3 pt-1 text-xs text-(--ui-text-secondary)">
              <span className="tabular-nums">
                共 {pageData.total} 件，第 {pageData.total === 0 ? 1 : page} / {pageCount} 页
              </span>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                  上一页
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={page >= pageCount || pageData.total === 0}
                  onClick={() => setPage(value => value + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      <IssueDrawer product={active} onClose={() => setActive(null)} onChanged={reloadAll} />
      <ImportDialog
        open={importOpen}
        shops={shops}
        onClose={() => setImportOpen(false)}
        onDone={reloadAll}
      />
      <RulesDrawer open={rulesOpen} onClose={() => setRulesOpen(false)} onChanged={reloadAll} />
    </div>
  )
}

function HeaderActions({ children }: { children: ReactNode }) {
  // Hermes 插件运行时没有 react-dom，不能用 createPortal。
  // 把这一行挂进 W01 的页头操作区；卸载前先放回来，避免 React 删节点失败。
  const holder = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const node = holder.current
    const slot = document.querySelector('[data-slot="actions"]')
    if (!node || !(slot instanceof HTMLElement)) return
    const parent = node.parentNode
    const next = node.nextSibling
    slot.appendChild(node)
    return () => {
      if (parent?.isConnected) parent.insertBefore(node, next)
    }
  }, [])
  return (
    <div ref={holder} className="flex shrink-0 items-center gap-2">
      {children}
    </div>
  )
}

function SummaryChip({
  label,
  value,
  tone
}: {
  label: string
  value: number | undefined
  tone: 'destructive' | 'warn' | 'outline'
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {label}
      {value === undefined ? (
        <Skeleton className="h-4 w-6" />
      ) : (
        <Badge variant={tone}>{value}</Badge>
      )}
    </span>
  )
}

function ProductRow({
  product,
  flags,
  onOpen
}: {
  product: Product
  flags: { must: boolean; warn: boolean } | undefined
  onOpen: () => void
}) {
  const low = product.floor_price != null && product.price < product.floor_price
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'grid w-full grid-cols-[minmax(0,1.8fr)_minmax(7rem,0.9fr)_7.5rem_3.5rem_5.5rem_auto] items-center gap-3 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs',
        'cursor-pointer hover:bg-(--ui-bg-quinary) focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--ui-accent)'
      )}
    >
      <Tip label={product.title}>
        <span className="block min-w-0 truncate">{product.title}</span>
      </Tip>
      <span className="flex min-w-0 items-center gap-1.5 text-(--ui-text-secondary)">
        <span
          title={platformName(product.platform)}
          className="inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5 text-[0.625rem]"
        >
          {platformMark(product.platform)}
        </span>
        <span className="truncate">{product.shop_name}</span>
      </span>
      <span className="tabular-nums">
        <span className={low ? 'text-(--ui-error)' : undefined}>{formatAmount(product.price)}</span>
        <span className="text-(--ui-text-tertiary)">
          {' / '}
          {product.floor_price == null ? '—' : formatAmount(product.floor_price)}
        </span>
      </span>
      <span className="tabular-nums">{product.stock}</span>
      <span className="truncate text-(--ui-text-secondary)">{product.activity || '—'}</span>
      <span className="flex items-center gap-1">
        {flags?.must ? <Badge variant="destructive">{levelLabel('must')}</Badge> : null}
        {flags?.warn ? <Badge variant="warn">{levelLabel('warn')}</Badge> : null}
        {!flags && product.open_issue_count > 0 ? (
          <Badge variant="outline">{product.open_issue_count}</Badge>
        ) : null}
      </span>
    </button>
  )
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2 py-2">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-8 w-full" />
      ))}
    </div>
  )
}

function flagsByProduct(issues: Issue[]): Map<number, { must: boolean; warn: boolean }> {
  const map = new Map<number, { must: boolean; warn: boolean }>()
  for (const issue of issues) {
    const current = map.get(issue.product_id) ?? { must: false, warn: false }
    if (issue.level === 'must') current.must = true
    if (issue.level === 'warn') current.warn = true
    map.set(issue.product_id, current)
  }
  return map
}

function summarize(issues: Issue[]): { must: number; warn: number; products: number } {
  const products = new Set<number>()
  let must = 0
  let warn = 0
  for (const issue of issues) {
    products.add(issue.product_id)
    if (issue.level === 'must') must += 1
    if (issue.level === 'warn') warn += 1
  }
  return { must, warn, products: products.size }
}
