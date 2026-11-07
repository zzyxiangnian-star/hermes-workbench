import { apiFetch } from './client'
import type { ImportResult, IssueLevel, IssueStatus, RulesRunResult } from './products'

export type MetricKey =
  | 'visitors'
  | 'orders'
  | 'sales_amount'
  | 'conversion_rate'
  | 'avg_order_value'
  | 'ad_spend'
  | 'ad_gmv'
  | 'roi'

export interface MetricValue {
  value: number | null
  previous: number | null
  change: number | null
}

export interface Overview {
  date: string | null
  compare_date: string | null
  shop_id: number | null
  brand: string | null
  open_alerts: number
  metrics: Record<MetricKey, MetricValue>
}

export interface TrendPoint {
  date: string
  value: number | null
}

export interface Trend {
  metric: MetricKey
  days: number
  shop_id: number | null
  points: TrendPoint[]
}

export interface AdSpendRow {
  shop_id: number
  shop_name: string
  tool: string
  campaign: string
  spend: number
  gmv: number
  roi: number | null
  has_alert: boolean
}

export interface Alert {
  id: number
  kind: string
  level: IssueLevel
  shop_id: number
  shop_name: string
  tool: string
  campaign: string
  date: string
  message: string
  status: IssueStatus
  found_at: string
  resolved_at: string | null
  note: string | null
}

export interface AlertSummary {
  shops: Array<{ shop_id: number; name: string; platform: string; brand: string; open_count: number }>
  total_open: number
}

export interface AdRuleParams {
  min_roi?: number
  min_spend?: number
  daily_cap?: Record<string, number>
  spike_pct?: number
}

export interface AdRule {
  id: number
  kind: 'roi_below' | 'spend_over_cap' | 'spend_spike' | string
  name: string
  params: AdRuleParams
  level: IssueLevel
  enabled: boolean
}

export interface DailyReport {
  date: string
  markdown: string
}

function qs(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

export function getOverview(args: { date?: string; shopId?: number }): Promise<Overview> {
  return apiFetch<Overview>(`/api/overview${qs({ date: args.date, shop_id: args.shopId })}`)
}

export function getTrend(args: { metric: MetricKey; days: number; shopId?: number; date?: string }): Promise<Trend> {
  return apiFetch<Trend>(
    `/api/overview/trend${qs({ metric: args.metric, days: args.days, shop_id: args.shopId, date: args.date })}`
  )
}

export function listAdSpend(args: { dateFrom?: string; dateTo?: string; shopId?: number }): Promise<AdSpendRow[]> {
  return apiFetch<AdSpendRow[]>(
    `/api/ad-spend${qs({ date_from: args.dateFrom, date_to: args.dateTo, shop_id: args.shopId })}`
  )
}

export function listAlerts(args: { status?: IssueStatus; shopId?: number } = {}): Promise<Alert[]> {
  return apiFetch<Alert[]>(`/api/alerts${qs({ status: args.status, shop_id: args.shopId })}`)
}

export function getAlertSummary(): Promise<AlertSummary> {
  return apiFetch<AlertSummary>('/api/alerts/summary')
}

export function patchAlert(id: number, patch: { status?: IssueStatus; note?: string }): Promise<Alert> {
  return apiFetch<Alert>(`/api/alerts/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function listAdRules(): Promise<AdRule[]> {
  return apiFetch<AdRule[]>('/api/ad-rules')
}

export function patchAdRule(id: number, patch: { params?: AdRuleParams; enabled?: boolean }): Promise<AdRule> {
  return apiFetch<AdRule>(`/api/ad-rules/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function runAdRules(): Promise<RulesRunResult> {
  return apiFetch<RulesRunResult>('/api/ad-rules/run', { method: 'POST' })
}

export function getDailyReport(date?: string): Promise<DailyReport> {
  return apiFetch<DailyReport>(`/api/reports/daily${qs({ date })}`)
}

function upload(path: string, shopId: number, file: File): Promise<ImportResult> {
  const body = new FormData()
  body.set('shop_id', String(shopId))
  body.set('file', file)
  return apiFetch<ImportResult>(path, { method: 'POST', body, timeoutMs: 60_000 })
}

export function importMetrics(shopId: number, file: File): Promise<ImportResult> {
  return upload('/api/import/metrics', shopId, file)
}

export function importAdSpend(shopId: number, file: File): Promise<ImportResult> {
  return upload('/api/import/ad-spend', shopId, file)
}
