import type { DesignKind } from '../../api/design'

export const KIND_LABEL: Record<string, string> = {
  main_image: '主图',
  detail_page: '详情页',
  poster: '海报',
  banner: '横幅',
  video_cover: '视频封面',
  other: '其他'
}

export const STATUS_LABEL: Record<string, string> = {
  open: '待接单',
  in_progress: '设计中',
  reviewing: '待评审',
  done: '已定稿',
  cancelled: '已取消'
}

export const KINDS: ReadonlyArray<{ id: DesignKind; label: string }> = [
  { id: 'main_image', label: '主图' },
  { id: 'detail_page', label: '详情页' },
  { id: 'poster', label: '海报' },
  { id: 'banner', label: '横幅' },
  { id: 'video_cover', label: '视频封面' },
  { id: 'other', label: '其他' }
]

export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? kind
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

export function statusVariant(status: string): 'outline' | 'default' | 'warn' | 'success' {
  if (status === 'done') return 'success'
  if (status === 'reviewing') return 'warn'
  if (status === 'in_progress') return 'default'
  return 'outline'
}

export function isImage(mime: string): boolean {
  return mime.startsWith('image/')
}

export function formatDue(value: string | null): string {
  if (!value) return '未设截止日'
  return value
}

const SIZE_PATTERN = /^\d+\s*[x×*]\s*\d+$/i

export function normalizeSize(value: string): string | null {
  const text = value.trim().toLowerCase().replace('×', 'x').replace('*', 'x').replace(/\s/g, '')
  if (!SIZE_PATTERN.test(value.trim())) return null
  const [width, height] = text.split('x')
  const w = Number(width)
  const h = Number(height)
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 20000 || h > 20000) return null
  return `${w}x${h}`
}

export const ACTOR_KEY = 'hermes-workbench:actor'

export function loadActor(): string {
  try {
    return window.localStorage.getItem(ACTOR_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveActor(value: string): void {
  try {
    window.localStorage.setItem(ACTOR_KEY, value)
  } catch {
    // 忽略受限环境下的 localStorage 异常
  }
}

export function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function formatShanghai(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })
}
