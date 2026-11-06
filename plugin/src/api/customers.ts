import type { ProductCard } from './brand'
import { ApiError, apiFetch } from './client'
import { getApiBase } from '../settings'

export type CustomerKind = 'member' | 'business'
export type SegmentId = 'new' | 'repeat' | 'dormant' | 'inquiry_open'
export type InquiryStatus = 'new' | 'replied' | 'quoted' | 'won' | 'lost'
export type InquiryChannel = 'wecom' | 'phone' | 'tmall' | 'jd' | 'pdd' | 'douyin' | 'email' | 'other'
export type FollowupChannel = 'wecom' | 'platform' | 'sms' | 'phone'
export type FollowupStatus = 'draft' | 'approved' | 'done' | 'cancelled'
export type TargetStatus = 'pending' | 'sent' | 'skipped'

export interface Customer {
  id: number
  kind: CustomerKind | string
  name: string | null
  phone: string | null
  company: string | null
  wecom_added: boolean
  tags: string[]
  note: string | null
  segments: string[]
  order_count: number
  total: number
  first_paid_at: string | null
  last_paid_at: string | null
  last_title: string | null
  shops: string[]
  open_inquiries: number
  created_at: string
}

export interface CustomerOrder {
  id: number
  shop_name: string
  order_no: string
  paid_at: string
  title: string
  quantity: number
  amount: number
  platform_status: string | null
}

export interface CustomerDetail extends Customer {
  orders: CustomerOrder[]
  inquiries: Inquiry[]
}

export interface CustomerPage {
  items: Customer[]
  total: number
  page: number
  page_size: number
}

export interface SegmentCount {
  segment: string
  label: string
  count: number
  rule: string
}

export interface SegmentSummary {
  total: number
  members: number
  businesses: number
  wecom_added: number
  segments: SegmentCount[]
  open_inquiries: number
}

export interface TimelineEvent {
  at: string
  by: string | null
  text: string
}

export interface Inquiry {
  id: number
  customer_id: number | null
  channel: string
  company: string | null
  contact: string | null
  phone: string | null
  content: string
  product_codes: string[]
  status: InquiryStatus | string
  assignee: string | null
  lost_reason: string | null
  note: string | null
  stale: boolean
  quote_count: number
  created_at: string
  updated_at: string
}

export interface QuoteItem {
  product_code: string | null
  name: string
  quantity: number
  unit_price: number
  amount: number
  note: string | null
}

export interface Quote {
  id: number
  inquiry_id: number
  number: string
  items: QuoteItem[]
  total: number
  valid_until: string | null
  terms: string | null
  created_by: string | null
  created_at: string
}

export interface InquiryDetail extends Inquiry {
  events: TimelineEvent[]
  quotes: Quote[]
}

export interface InquiryProducts {
  cards: ProductCard[]
  missing: Array<{ product_code: string; listed: boolean }>
}

export interface QuoteDocument {
  number: string
  markdown: string
}

export interface FollowupCounts {
  pending: number
  sent: number
  skipped: number
}

export interface Followup {
  id: number
  name: string
  segment: string
  channel: string
  template: string
  status: FollowupStatus | string
  created_by: string | null
  approved_by: string | null
  counts: FollowupCounts
  created_at: string
  updated_at: string
}

export interface FollowupTarget {
  id: number
  customer_id: number
  customer_name: string | null
  phone: string | null
  wecom_added: boolean
  message: string
  status: TargetStatus | string
  sent_at: string | null
  note: string | null
}

export interface FollowupDetail extends Followup {
  targets: FollowupTarget[]
}

export interface CustomerQuery {
  segment?: SegmentId
  kind?: CustomerKind
  q?: string
  page?: number
  page_size?: number
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

export function getSegmentSummary(): Promise<SegmentSummary> {
  return apiFetch<SegmentSummary>('/api/customers/segments')
}

export function listCustomers(query: CustomerQuery = {}): Promise<CustomerPage> {
  return apiFetch<CustomerPage>(
    `/api/customers${queryString({
      segment: query.segment,
      kind: query.kind,
      q: query.q,
      page: query.page,
      page_size: query.page_size
    })}`
  )
}

export function getCustomer(id: number): Promise<CustomerDetail> {
  return apiFetch<CustomerDetail>(`/api/customers/${id}`)
}

export function createBusinessCustomer(body: {
  name?: string | null
  phone?: string | null
  company: string
  wecom_added: boolean
  tags: string[]
  note?: string | null
}): Promise<CustomerDetail> {
  return apiFetch<CustomerDetail>('/api/customers', {
    method: 'POST',
    body: JSON.stringify({ kind: 'business', ...body })
  })
}

export function patchCustomer(
  id: number,
  body: {
    name?: string | null
    company?: string | null
    wecom_added?: boolean
    tags?: string[]
    note?: string | null
  }
): Promise<CustomerDetail> {
  return apiFetch<CustomerDetail>(`/api/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function listInquiries(query: { status?: string; q?: string } = {}): Promise<Inquiry[]> {
  return apiFetch<Inquiry[]>(`/api/inquiries${queryString({ status: query.status, q: query.q })}`)
}

export function createInquiry(body: {
  channel: InquiryChannel
  content: string
  company?: string | null
  contact?: string | null
  phone?: string | null
  product_codes: string[]
  assignee?: string | null
  by?: string | null
}): Promise<InquiryDetail> {
  return apiFetch<InquiryDetail>('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function getInquiry(id: number): Promise<InquiryDetail> {
  return apiFetch<InquiryDetail>(`/api/inquiries/${id}`)
}

export function setInquiryStatus(
  id: number,
  body: { status: InquiryStatus; by?: string | null; reason?: string | null }
): Promise<InquiryDetail> {
  return apiFetch<InquiryDetail>(`/api/inquiries/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function addInquiryNote(id: number, note: string, by?: string | null): Promise<InquiryDetail> {
  return apiFetch<InquiryDetail>(`/api/inquiries/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note, by: by ?? null })
  })
}

export function getInquiryProducts(id: number): Promise<InquiryProducts> {
  return apiFetch<InquiryProducts>(`/api/inquiries/${id}/products`)
}

export function createQuote(
  inquiryId: number,
  body: {
    items: Array<{
      product_code?: string | null
      name: string
      quantity: number
      unit_price: number
      note?: string | null
    }>
    valid_until?: string | null
    terms?: string | null
    by?: string | null
  }
): Promise<Quote> {
  return apiFetch<Quote>(`/api/inquiries/${inquiryId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function getQuoteDocument(id: number): Promise<QuoteDocument> {
  return apiFetch<QuoteDocument>(`/api/quotes/${id}/document`)
}

export function listFollowups(): Promise<Followup[]> {
  return apiFetch<Followup[]>('/api/followups')
}

export function createFollowup(body: {
  name: string
  segment: SegmentId
  channel: FollowupChannel
  template: string
  by?: string | null
}): Promise<FollowupDetail> {
  return apiFetch<FollowupDetail>('/api/followups', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function getFollowup(id: number): Promise<FollowupDetail> {
  return apiFetch<FollowupDetail>(`/api/followups/${id}`)
}

export function patchFollowup(id: number, body: { name?: string; template?: string }): Promise<FollowupDetail> {
  return apiFetch<FollowupDetail>(`/api/followups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function approveFollowup(id: number, by?: string | null): Promise<FollowupDetail> {
  return apiFetch<FollowupDetail>(`/api/followups/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ by: by ?? null })
  })
}

export function cancelFollowup(id: number): Promise<FollowupDetail> {
  return apiFetch<FollowupDetail>(`/api/followups/${id}/cancel`, { method: 'POST' })
}

export function deleteFollowup(id: number): Promise<void> {
  return apiFetch<void>(`/api/followups/${id}`, { method: 'DELETE' })
}

export function markFollowupTarget(
  id: number,
  body: { status: 'sent' | 'skipped'; note?: string | null }
): Promise<FollowupDetail> {
  return apiFetch<FollowupDetail>(`/api/followup-targets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export async function exportFollowup(id: number): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60_000)
  try {
    const response = await fetch(`${getApiBase().replace(/\/$/, '')}/api/followups/${id}/export`, {
      signal: controller.signal
    })
    if (!response.ok) {
      const text = await response.text()
      let message = `请求失败（${response.status}）`
      try {
        const parsed = JSON.parse(text) as { error?: { message?: string } }
        if (parsed.error?.message) message = parsed.error.message
      } catch {
        // 保留状态码说明
      }
      throw new ApiError(message, 'http', response.status)
    }
    const blob = await response.blob()
    const header = response.headers.get('Content-Disposition') ?? ''
    const match = /filename\*=UTF-8''([^;]+)/i.exec(header)
    const name = match ? decodeURIComponent(match[1]) : 'followup.csv'
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('没有连上工作台服务', 'network')
  } finally {
    clearTimeout(timer)
  }
}
