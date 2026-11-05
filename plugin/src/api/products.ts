import { apiFetch } from './client'

export type Platform = 'tmall' | 'jd' | 'pdd' | 'douyin'
export type IssueLevel = 'must' | 'warn'
export type IssueStatus = 'open' | 'resolved' | 'ignored'
export type RuleKind = 'below_floor' | 'cross_shop_gap' | 'low_stock' | 'missing_activity'

export interface Shop {
  id: number
  platform: Platform | string
  name: string
  brand: string
}

export interface Product {
  id: number
  shop_id: number
  shop_name: string
  platform: string
  brand: string
  sku: string
  product_code: string | null
  title: string
  price: number
  floor_price: number | null
  stock: number
  activity: string | null
  updated_at: string
  open_issue_count: number
}

export interface ProductPage {
  items: Product[]
  total: number
  page: number
  page_size: number
}

export interface Issue {
  id: number
  product_id: number
  rule_id: number
  rule_kind: RuleKind | string
  level: IssueLevel
  message: string
  status: IssueStatus
  found_at: string
  resolved_at: string | null
  note: string | null
  shop_id: number
  shop_name: string
  sku: string
  product_code: string | null
  title: string
}

export interface IssueSummary {
  shops: Array<{
    shop_id: number
    name: string
    platform: string
    brand: string
    open_count: number
  }>
  total_open: number
}

export interface RuleParams {
  max_gap_pct?: number
  min_stock?: number
  required_activity?: string | null
}

export interface Rule {
  id: number
  kind: RuleKind | string
  name: string
  params: RuleParams
  level: IssueLevel
  enabled: boolean
}

export interface ImportErrorRow {
  row: number
  reason: string
}

export interface RulesRunResult {
  rules_run: number
  opened: number
  updated: number
  resolved: number
  open_remaining: number
}

export interface ImportResult {
  id: number
  file_name: string
  shop_id: number
  rows_ok: number
  rows_failed: number
  errors: ImportErrorRow[]
  created_at: string
  rules: RulesRunResult | null
}

export interface ProductQuery {
  shop_id?: number
  brand?: string
  q?: string
  has_issue?: boolean
  page?: number
  pageSize?: number
}

export interface IssueQuery {
  status?: IssueStatus
  level?: IssueLevel
  shop_id?: number
}

function queryString(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

export function listShops(): Promise<Shop[]> {
  return apiFetch<Shop[]>('/api/shops')
}

export function createShop(input: { platform: string; name: string; brand: string }): Promise<Shop> {
  return apiFetch<Shop>('/api/shops', { method: 'POST', body: JSON.stringify(input) })
}

export function listProducts(query: ProductQuery = {}): Promise<ProductPage> {
  return apiFetch<ProductPage>(
    `/api/products${queryString({
      shop_id: query.shop_id,
      brand: query.brand,
      q: query.q,
      has_issue: query.has_issue,
      page: query.page,
      page_size: query.pageSize
    })}`
  )
}

export function listIssues(query: IssueQuery = {}): Promise<Issue[]> {
  return apiFetch<Issue[]>(
    `/api/issues${queryString({
      status: query.status,
      level: query.level,
      shop_id: query.shop_id
    })}`
  )
}

export function getIssueSummary(): Promise<IssueSummary> {
  return apiFetch<IssueSummary>('/api/issues/summary')
}

export function patchIssue(
  id: number,
  patch: { status?: IssueStatus; note?: string }
): Promise<Issue> {
  return apiFetch<Issue>(`/api/issues/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  })
}

export function listRules(): Promise<Rule[]> {
  return apiFetch<Rule[]>('/api/rules')
}

export function patchRule(
  id: number,
  patch: { params?: RuleParams; enabled?: boolean }
): Promise<Rule> {
  return apiFetch<Rule>(`/api/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch)
  })
}

export function runRules(): Promise<RulesRunResult> {
  return apiFetch<RulesRunResult>('/api/rules/run', { method: 'POST' })
}

export function importProducts(shopId: number, file: File): Promise<ImportResult> {
  const body = new FormData()
  body.set('shop_id', String(shopId))
  body.set('file', file)
  return apiFetch<ImportResult>('/api/import/products', {
    method: 'POST',
    body,
    timeoutMs: 60_000
  })
}

export type ProductSegment = 'all' | 'issue' | 'must' | 'warn'

export async function listProductsForView(args: {
  segment: ProductSegment
  shopId?: number
  q?: string
  page: number
  pageSize: number
}): Promise<ProductPage> {
  const q = args.q?.trim() || undefined
  const shop_id = args.shopId
  if (args.segment === 'must' || args.segment === 'warn') {
    const issues = await listIssues({ status: 'open', level: args.segment, shop_id })
    const ids = new Set(issues.map(issue => issue.product_id))
    const all = await listAllProducts({ shop_id, q, has_issue: true })
    const filtered = all.filter(product => ids.has(product.id))
    const start = (args.page - 1) * args.pageSize
    return {
      items: filtered.slice(start, start + args.pageSize),
      total: filtered.length,
      page: args.page,
      page_size: args.pageSize
    }
  }
  return listProducts({
    shop_id,
    q,
    has_issue: args.segment === 'issue' ? true : undefined,
    page: args.page,
    pageSize: args.pageSize
  })
}

async function listAllProducts(query: Omit<ProductQuery, 'page' | 'pageSize'>): Promise<Product[]> {
  const pageSize = 100
  const first = await listProducts({ ...query, page: 1, pageSize })
  if (first.items.length >= first.total) return first.items
  const items = [...first.items]
  const pages = Math.min(50, Math.ceil(first.total / pageSize))
  for (let page = 2; page <= pages; page += 1) {
    const next = await listProducts({ ...query, page, pageSize })
    items.push(...next.items)
    if (items.length >= first.total) break
  }
  return items
}
