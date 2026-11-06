import type { ComplianceResult } from './brand'
import { apiFetch } from './client'
import { getApiBase } from '../settings'

export type VideoStatus = 'draft' | 'in_review' | 'approved' | 'done' | 'cancelled'
export type VideoAspect = '9:16' | '16:9' | '1:1' | '3:4'
export type VideoPlatform = 'douyin' | 'xiaohongshu' | 'wechat' | 'weibo' | 'tmall' | 'jd' | 'pdd' | 'other'

export interface VideoMedia {
  id: number
  url: string
  mime: string
  file_name: string
  width: number | null
  height: number | null
}

export interface VideoEvent {
  at: string
  by: string | null
  text: string
}

export interface VideoShot {
  seq: number
  duration: number
  length: number
  start: number
  visual: string | null
  voiceover: string | null
  subtitle: string | null
  media: VideoMedia | null
  voice: VideoMedia | null
  note: string | null
}

export interface VideoProject {
  id: number
  title: string
  brand: string
  campaign_id: number | null
  campaign_name: string | null
  product_code: string | null
  platform: string | null
  aspect: string
  brief: string | null
  status: VideoStatus | string
  author: string | null
  reviewer: string | null
  editor: string | null
  shot_count: number
  duration: number
  missing_media: number
  missing_voice: number
  cover: VideoMedia | null
  final: VideoMedia | null
  created_at: string
  updated_at: string
}

export interface VideoProjectDetail extends VideoProject {
  shots: VideoShot[]
  bgm: VideoMedia | null
  events: VideoEvent[]
  compliance: ComplianceResult
}

export interface VideoSummary {
  draft: number
  in_review: number
  approved: number
  done: number
  cancelled: number
  needs_action: number
}

export interface TimelineMedia {
  asset_id: number
  file_name: string
  mime: string
  url: string
  package_name: string | null
}

export interface TimelineShot {
  seq: number
  start: number
  end: number
  duration: number
  visual: string | null
  voiceover: string | null
  subtitle: string | null
  media: TimelineMedia | null
  voice: TimelineMedia | null
}

export interface Timeline {
  project_id: number
  title: string
  aspect: string
  width: number
  height: number
  duration: number
  shots: TimelineShot[]
  bgm: TimelineMedia | null
}

export interface ShotInput {
  duration: number
  visual: string | null
  voiceover: string | null
  subtitle: string | null
  media_asset_id: number | null
  voice_asset_id: number | null
  note: string | null
}

export interface VideoQuery {
  status?: string
  brand?: string
  campaign_id?: number
  q?: string
}

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const text = search.toString()
  return text ? `?${text}` : ''
}

export function mediaSrc(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return `${getApiBase()}${url.startsWith('/') ? url : `/${url}`}`
}

export function packageUrl(id: number): string {
  return `${getApiBase().replace(/\/$/, '')}/api/video-projects/${id}/package`
}

export function subtitlesUrl(id: number): string {
  return `${getApiBase().replace(/\/$/, '')}/api/video-projects/${id}/subtitles.srt`
}

export function getVideoSummary(): Promise<VideoSummary> {
  return apiFetch<VideoSummary>('/api/video-projects/summary')
}

export function listVideoProjects(query: VideoQuery = {}): Promise<VideoProject[]> {
  return apiFetch<VideoProject[]>(
    `/api/video-projects${queryString({
      status: query.status,
      brand: query.brand,
      campaign_id: query.campaign_id,
      q: query.q
    })}`
  )
}

export function getVideoProject(id: number): Promise<VideoProjectDetail> {
  return apiFetch<VideoProjectDetail>(`/api/video-projects/${id}`)
}

export function createVideoProject(body: {
  title: string
  brand: string
  campaign_id: number | null
  product_code: string | null
  platform: string | null
  aspect: VideoAspect
  brief: string | null
  author: string | null
  shots?: ShotInput[]
}): Promise<VideoProjectDetail> {
  return apiFetch<VideoProjectDetail>('/api/video-projects', { method: 'POST', body: JSON.stringify(body) })
}

export function saveShots(id: number, shots: ShotInput[]): Promise<VideoProjectDetail> {
  return apiFetch<VideoProjectDetail>(`/api/video-projects/${id}/shots`, {
    method: 'PUT',
    body: JSON.stringify({ shots })
  })
}

export function uploadShotMedia(
  id: number,
  seq: number,
  slot: 'visual' | 'voice',
  file: File,
  by: string | null
): Promise<VideoProjectDetail> {
  const form = new FormData()
  form.set('file', file)
  form.set('slot', slot)
  if (by) form.set('by', by)
  return apiFetch<VideoProjectDetail>(`/api/video-projects/${id}/shots/${seq}/media`, { method: 'POST', body: form })
}

export function uploadBgm(id: number, file: File, by: string | null): Promise<VideoProjectDetail> {
  const form = new FormData()
  form.set('file', file)
  if (by) form.set('by', by)
  return apiFetch<VideoProjectDetail>(`/api/video-projects/${id}/bgm`, { method: 'POST', body: form })
}

export function uploadFinal(id: number, file: File, by: string | null): Promise<VideoProjectDetail> {
  const form = new FormData()
  form.set('file', file)
  if (by) form.set('by', by)
  return apiFetch<VideoProjectDetail>(`/api/video-projects/${id}/final`, { method: 'POST', body: form })
}

function action(id: number, name: string, body: { by?: string | null; note?: string | null }): Promise<VideoProjectDetail> {
  return apiFetch<VideoProjectDetail>(`/api/video-projects/${id}/${name}`, {
    method: 'POST',
    body: JSON.stringify({ by: body.by ?? null, note: body.note ?? null })
  })
}

export function submitVideo(id: number, by: string | null): Promise<VideoProjectDetail> {
  return action(id, 'submit', { by })
}

export function approveVideo(id: number, by: string | null): Promise<VideoProjectDetail> {
  return action(id, 'approve', { by })
}

export function rejectVideo(id: number, by: string | null, note: string): Promise<VideoProjectDetail> {
  return action(id, 'reject', { by, note })
}

export function withdrawVideo(id: number, by: string | null): Promise<VideoProjectDetail> {
  return action(id, 'withdraw', { by })
}

export function cancelVideo(id: number, by: string | null): Promise<VideoProjectDetail> {
  return action(id, 'cancel', { by })
}

export function getTimeline(id: number): Promise<Timeline> {
  return apiFetch<Timeline>(`/api/video-projects/${id}/timeline`)
}
