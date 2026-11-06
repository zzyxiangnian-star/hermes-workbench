import type { VideoAspect, VideoPlatform } from '../../api/video'
import { loadActor, saveActor } from '../design/labels'

export { loadActor, saveActor }

export const CHARS_PER_SECOND = 4.5

export const PLATFORMS: ReadonlyArray<{ id: VideoPlatform; label: string }> = [
  { id: 'douyin', label: '抖音' },
  { id: 'xiaohongshu', label: '小红书' },
  { id: 'wechat', label: '公众号' },
  { id: 'weibo', label: '微博' },
  { id: 'tmall', label: '天猫' },
  { id: 'jd', label: '京东' },
  { id: 'pdd', label: '拼多多' },
  { id: 'other', label: '其他' }
]

export const ASPECTS: ReadonlyArray<{ id: VideoAspect; label: string }> = [
  { id: '9:16', label: '9:16 竖版' },
  { id: '16:9', label: '16:9 横版' },
  { id: '1:1', label: '1:1 方形' },
  { id: '3:4', label: '3:4' }
]

const STATUS_LABEL: Record<string, string> = {
  draft: '写脚本中',
  in_review: '待审核',
  approved: '已通过',
  done: '已完成',
  cancelled: '已取消'
}

export function platformLabel(platform: string | null): string {
  if (!platform) return '未选平台'
  return PLATFORMS.find(item => item.id === platform)?.label ?? platform
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

export function statusVariant(status: string): 'outline' | 'default' | 'warn' | 'success' {
  if (status === 'done') return 'success'
  if (status === 'in_review') return 'warn'
  if (status === 'approved') return 'default'
  return 'outline'
}

export function formatSeconds(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const rounded = Math.round(value * 10) / 10
  return `${rounded} 秒`
}

export function estimateSeconds(text: string): number {
  return text.length / CHARS_PER_SECOND
}

export function aspectRatio(aspect: string): string {
  const [width, height] = aspect.split(':')
  const w = Number(width)
  const h = Number(height)
  if (!w || !h) return '9 / 16'
  return `${w} / ${h}`
}

export function isImage(mime: string): boolean {
  return mime.startsWith('image/')
}

export function isVideo(mime: string): boolean {
  return mime.startsWith('video/')
}

export function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
