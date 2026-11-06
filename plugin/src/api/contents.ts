import { apiFetch } from './client'

export type ContentStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'published'
export type ContentKind = 'article' | 'note' | 'video_script' | 'poster_copy' | 'product_copy'

export interface ContentVariant {
  platform: string
  title: string | null
  body: string
  published_url: string | null
}

export interface ContentComment {
  id: number
  content_id: number
  platform: string | null
  quote: string | null
  start: number | null
  end: number | null
  body: string
  author: string | null
  kind: string
  resolved: boolean
  created_at: string
}

export interface ContentVersion {
  version: number
  author: string | null
  note: string | null
  created_at: string
}

export interface ContentItem {
  id: number
  title: string
  brand: string
  kind: string
  campaign_id: number | null
  campaign_name: string | null
  status: ContentStatus | string
  author: string | null
  reviewer: string | null
  planned_at: string | null
  published_at: string | null
  version: number
  platforms: string[]
  open_comments: number
  created_at: string
  updated_at: string
}

export interface ContentDetail extends ContentItem {
  body: string
  variants: ContentVariant[]
  comments: ContentComment[]
  versions: ContentVersion[]
}

export interface DiffSegment {
  op: 'equal' | 'insert' | 'delete' | string
  text: string
}

export interface ContentDiff {
  content_id: number
  from_version: number
  to_version: number
  platform: string | null
  title_from: string | null
  title_to: string | null
  segments: DiffSegment[]
}

export interface VersionSnapshot {
  version: number
  author: string | null
  note: string | null
  created_at: string
  snapshot: {
    title?: string
    kind?: string
    body?: string
    variants?: ContentVariant[]
  }
}

export interface ContentInput {
  title: string
  brand: string
  kind?: string
  campaign_id?: number | null
  body?: string
  author?: string | null
  planned_at?: string | null
  variants?: Array<{ platform: string; title?: string | null; body?: string }>
  note?: string | null
}

export interface ContentPatch {
  title?: string
  kind?: string
  campaign_id?: number | null
  body?: string
  planned_at?: string | null
  variants?: Array<{ platform: string; title?: string | null; body?: string }>
  author?: string | null
  note?: string | null
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

export function listContents(query: {
  status?: string
  brand?: string
  campaign_id?: number
  platform?: string
  q?: string
} = {}): Promise<ContentItem[]> {
  return apiFetch<ContentItem[]>(`/api/contents${queryString(query)}`)
}

export function getContent(id: number): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}`)
}

export function createContent(body: ContentInput): Promise<ContentDetail> {
  return apiFetch<ContentDetail>('/api/contents', { method: 'POST', body: JSON.stringify(body) })
}

export function updateContent(id: number, patch: ContentPatch): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}`, { method: 'PUT', body: JSON.stringify(patch) })
}

export function deleteContent(id: number): Promise<void> {
  return apiFetch<void>(`/api/contents/${id}`, { method: 'DELETE' })
}

export function submitContent(id: number, body: { by?: string | null; note?: string | null } = {}): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}/submit`, { method: 'POST', body: JSON.stringify(body) })
}

export function withdrawContent(id: number, body: { by?: string | null; note?: string | null } = {}): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}/withdraw`, { method: 'POST', body: JSON.stringify(body) })
}

export function approveContent(id: number, body: { by?: string | null; note?: string | null } = {}): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}/approve`, { method: 'POST', body: JSON.stringify(body) })
}

export function rejectContent(
  id: number,
  body: { by?: string | null; note?: string | null }
): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}/reject`, { method: 'POST', body: JSON.stringify(body) })
}

export function publishContent(
  id: number,
  body: { by?: string | null; platform?: string | null; url?: string | null }
): Promise<ContentDetail> {
  return apiFetch<ContentDetail>(`/api/contents/${id}/publish`, { method: 'POST', body: JSON.stringify(body) })
}

export function createComment(
  id: number,
  body: {
    body: string
    platform?: string | null
    quote?: string | null
    start?: number | null
    end?: number | null
    author?: string | null
  }
): Promise<ContentComment> {
  return apiFetch<ContentComment>(`/api/contents/${id}/comments`, { method: 'POST', body: JSON.stringify(body) })
}

export function patchComment(id: number, resolved: boolean): Promise<ContentComment> {
  return apiFetch<ContentComment>(`/api/content-comments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ resolved })
  })
}

export function deleteComment(id: number): Promise<void> {
  return apiFetch<void>(`/api/content-comments/${id}`, { method: 'DELETE' })
}

export function getContentVersion(id: number, version: number): Promise<VersionSnapshot> {
  return apiFetch<VersionSnapshot>(`/api/contents/${id}/versions/${version}`)
}

export function diffContent(
  id: number,
  query: { from_version: number; to_version?: number; platform?: string }
): Promise<ContentDiff> {
  return apiFetch<ContentDiff>(`/api/contents/${id}/diff${queryString(query)}`)
}
