import type { ComplianceResult } from './brand'
import { apiFetch } from './client'
import { getApiBase } from '../settings'

export type DesignKind = 'main_image' | 'detail_page' | 'poster' | 'banner' | 'video_cover' | 'other'
export type DesignStatus = 'open' | 'in_progress' | 'reviewing' | 'done' | 'cancelled'
export type AssetRole = 'reference' | 'candidate' | 'final' | 'library'

export interface DesignAsset {
  id: number
  request_id: number | null
  role: AssetRole | string
  file_name: string
  url: string
  mime: string
  size: number
  width: number | null
  height: number | null
  brand: string | null
  product_code: string | null
  campaign_id: number | null
  kind: string | null
  tags: string[]
  source: string
  prompt: string | null
  round: number | null
  label: string | null
  note: string | null
  created_by: string | null
  created_at: string
}

export interface DesignComment {
  id: number
  request_id: number
  asset_id: number | null
  body: string
  x: number | null
  y: number | null
  author: string | null
  resolved: boolean
  created_at: string
}

export interface DesignEvent {
  at: string
  by: string | null
  text: string
}

export interface DesignRequest {
  id: number
  title: string
  kind: DesignKind | string
  brand: string
  campaign_id: number | null
  campaign_name: string | null
  product_code: string | null
  sizes: string[]
  copy_text: string | null
  brief: string | null
  due_date: string | null
  overdue: boolean
  requester: string | null
  assignee: string | null
  status: DesignStatus | string
  round: number
  candidate_count: number
  open_comments: number
  cover: DesignAsset | null
  created_at: string
  updated_at: string
}

export interface DesignRequestDetail extends DesignRequest {
  references: DesignAsset[]
  candidates: DesignAsset[]
  finals: DesignAsset[]
  comments: DesignComment[]
  events: DesignEvent[]
  compliance: ComplianceResult
}

export interface DesignSummary {
  open: number
  in_progress: number
  reviewing: number
  done: number
  cancelled: number
  overdue: number
  needs_action: number
}

export interface DesignQuery {
  status?: string
  brand?: string
  kind?: string
  campaign_id?: number
  q?: string
}

export interface AssetQuery {
  brand?: string
  product_code?: string
  campaign_id?: number
  kind?: string
  q?: string
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

export function assetSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `${getApiBase()}${url.startsWith('/') ? url : `/${url}`}`
}

export function assetDownloadUrl(url: string): string {
  const src = assetSrc(url)
  return `${src}${src.includes('?') ? '&' : '?'}download=true`
}

export function getDesignSummary(brand?: string): Promise<DesignSummary> {
  return apiFetch<DesignSummary>(`/api/design-requests/summary${queryString({ brand })}`)
}

export function listDesignRequests(query: DesignQuery = {}): Promise<DesignRequest[]> {
  return apiFetch<DesignRequest[]>(
    `/api/design-requests${queryString({
      status: query.status,
      brand: query.brand,
      kind: query.kind,
      campaign_id: query.campaign_id,
      q: query.q
    })}`
  )
}

export function getDesignRequest(id: number): Promise<DesignRequestDetail> {
  return apiFetch<DesignRequestDetail>(`/api/design-requests/${id}`)
}

export function createDesignRequest(body: {
  title: string
  kind: DesignKind
  brand: string
  campaign_id?: number | null
  product_code?: string | null
  sizes: string[]
  copy_text?: string | null
  brief?: string | null
  due_date?: string | null
  requester?: string | null
  assignee?: string | null
}): Promise<DesignRequestDetail> {
  return apiFetch<DesignRequestDetail>('/api/design-requests', {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function patchDesignRequest(
  id: number,
  body: {
    title?: string
    kind?: DesignKind
    campaign_id?: number | null
    product_code?: string | null
    sizes?: string[]
    copy_text?: string | null
    brief?: string | null
    due_date?: string | null
    assignee?: string | null
  }
): Promise<DesignRequestDetail> {
  return apiFetch<DesignRequestDetail>(`/api/design-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  })
}

export function setDesignStatus(
  id: number,
  body: { status: 'open' | 'in_progress' | 'reviewing' | 'cancelled'; by?: string | null; note?: string | null }
): Promise<DesignRequestDetail> {
  return apiFetch<DesignRequestDetail>(`/api/design-requests/${id}/status`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function uploadRequestAsset(
  id: number,
  file: File,
  role: 'reference' | 'candidate',
  by?: string | null
): Promise<DesignAsset> {
  const body = new FormData()
  body.set('file', file)
  body.set('role', role)
  if (by) body.set('by', by)
  return apiFetch<DesignAsset>(`/api/design-requests/${id}/assets`, {
    method: 'POST',
    body,
    timeoutMs: 60_000
  })
}

export function finalizeDesign(id: number, assetIds: number[], by?: string | null): Promise<DesignRequestDetail> {
  return apiFetch<DesignRequestDetail>(`/api/design-requests/${id}/finalize`, {
    method: 'POST',
    body: JSON.stringify({ asset_ids: assetIds, by: by ?? null })
  })
}

export function addDesignComment(
  id: number,
  body: { body: string; asset_id: number; x: number; y: number; author?: string | null }
): Promise<DesignComment> {
  return apiFetch<DesignComment>(`/api/design-requests/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function resolveDesignComment(id: number, resolved: boolean): Promise<DesignComment> {
  return apiFetch<DesignComment>(`/api/design-comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ resolved })
  })
}

export function listLibraryAssets(query: AssetQuery = {}): Promise<DesignAsset[]> {
  return apiFetch<DesignAsset[]>(
    `/api/assets${queryString({
      brand: query.brand,
      product_code: query.product_code,
      campaign_id: query.campaign_id,
      kind: query.kind,
      q: query.q
    })}`
  )
}

export function uploadLibraryAsset(
  file: File,
  fields: { brand?: string; product_code?: string; tags?: string; by?: string | null }
): Promise<DesignAsset> {
  const body = new FormData()
  body.set('file', file)
  if (fields.brand) body.set('brand', fields.brand)
  if (fields.product_code) body.set('product_code', fields.product_code)
  if (fields.tags) body.set('tags', fields.tags)
  if (fields.by) body.set('by', fields.by)
  return apiFetch<DesignAsset>('/api/assets', { method: 'POST', body, timeoutMs: 60_000 })
}

export function patchAsset(
  id: number,
  body: { tags?: string[]; note?: string | null; brand?: string | null; product_code?: string | null }
): Promise<DesignAsset> {
  return apiFetch<DesignAsset>(`/api/assets/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export function deleteAsset(id: number): Promise<void> {
  return apiFetch<void>(`/api/assets/${id}`, { method: 'DELETE' })
}
