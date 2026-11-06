import { ApiError, apiFetch } from './client'
import type { ImportResult } from './products'
import { getApiBase } from '../settings'

export type InstallStatus = 'pending' | 'booked' | 'done' | 'exception' | 'cancelled'

export interface InstallOrder {
  id: number
  code: string
  status: InstallStatus | string
  overdue: boolean
  shop_id: number
  shop_name: string
  order_id: number
  order_no: string
  paid_at: string
  title: string
  product_code: string | null
  quantity: number
  amount: number
  buyer_name: string | null
  phone: string | null
  address: string | null
  remark: string | null
  provider: string
  provider_ref: string | null
  appointment_at: string | null
  engineer: string | null
  exception_reason: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export interface InstallEvent {
  at: string
  by: string | null
  text: string
}

export interface InstallDetail extends InstallOrder {
  events: InstallEvent[]
}

export interface InstallSummary {
  pending: number
  booked: number
  done: number
  exception: number
  cancelled: number
  overdue: number
  needs_action: number
}

export interface InstallQuery {
  status?: InstallStatus
  shop_id?: number
  q?: string
  overdue?: boolean
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

export function listInstalls(query: InstallQuery = {}): Promise<InstallOrder[]> {
  return apiFetch<InstallOrder[]>(
    `/api/installs${queryString({
      status: query.status,
      shop_id: query.shop_id,
      q: query.q,
      overdue: query.overdue
    })}`
  )
}

export function getInstallSummary(shopId?: number): Promise<InstallSummary> {
  return apiFetch<InstallSummary>(`/api/installs/summary${queryString({ shop_id: shopId })}`)
}

export function getInstall(id: number): Promise<InstallDetail> {
  return apiFetch<InstallDetail>(`/api/installs/${id}`)
}

export function setInstallStatus(
  id: number,
  body: {
    status: InstallStatus
    by?: string | null
    appointment_at?: string | null
    engineer?: string | null
    provider_ref?: string | null
    reason?: string | null
  }
): Promise<InstallDetail> {
  return apiFetch<InstallDetail>(`/api/installs/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function addInstallNote(id: number, note: string, by?: string | null): Promise<InstallDetail> {
  return apiFetch<InstallDetail>(`/api/installs/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note, by: by ?? null })
  })
}

export function getInstallNotice(id: number): Promise<{ text: string }> {
  return apiFetch<{ text: string }>(`/api/installs/${id}/notice`)
}

export function importOrders(shopId: number, file: File): Promise<ImportResult> {
  const body = new FormData()
  body.set('shop_id', String(shopId))
  body.set('file', file)
  return apiFetch<ImportResult>('/api/import/orders', {
    method: 'POST',
    body,
    timeoutMs: 60_000
  })
}

export async function exportInstalls(body: { ids?: number[]; status?: InstallStatus | null }): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 60_000)
  try {
    const response = await fetch(`${getApiBase().replace(/\/$/, '')}/api/installs/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    const name = match ? decodeURIComponent(match[1]) : 'install.csv'
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
