import type { SegmentId } from '../../api/customers'

export const ACTOR_KEY = 'hermes-workbench:actor'

export const SEGMENT_LABEL: Record<string, string> = {
  new: '新客',
  repeat: '复购',
  dormant: '沉睡',
  inquiry_open: '询盘未成交'
}

export const INQUIRY_STATUS_LABEL: Record<string, string> = {
  new: '新询盘',
  replied: '已回复',
  quoted: '已报价',
  won: '成交',
  lost: '丢单'
}

export const INQUIRY_CHANNELS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'wecom', label: '企业微信' },
  { id: 'phone', label: '电话' },
  { id: 'tmall', label: '天猫' },
  { id: 'jd', label: '京东' },
  { id: 'pdd', label: '拼多多' },
  { id: 'douyin', label: '抖音' },
  { id: 'email', label: '邮件' },
  { id: 'other', label: '其他' }
]

export const FOLLOWUP_CHANNELS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'wecom', label: '企业微信' },
  { id: 'platform', label: '平台客服' },
  { id: 'sms', label: '短信' },
  { id: 'phone', label: '电话' }
]

export const FOLLOWUP_STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  approved: '已审核',
  done: '已完成',
  cancelled: '已取消'
}

export const PLACEHOLDERS = ['{称呼}', '{姓名}', '{最近商品}', '{店铺}', '{公司}'] as const

export const SEGMENTS: ReadonlyArray<{ id: SegmentId; label: string }> = [
  { id: 'new', label: '新客' },
  { id: 'repeat', label: '复购' },
  { id: 'dormant', label: '沉睡' },
  { id: 'inquiry_open', label: '询盘未成交' }
]

export function segmentLabel(segment: string): string {
  return SEGMENT_LABEL[segment] ?? segment
}

export function inquiryStatusLabel(status: string): string {
  return INQUIRY_STATUS_LABEL[status] ?? status
}

export function inquiryStatusVariant(status: string): 'outline' | 'destructive' | 'default' | 'warn' {
  if (status === 'lost') return 'destructive'
  if (status === 'new') return 'warn'
  if (status === 'quoted' || status === 'replied') return 'default'
  return 'outline'
}

export function channelLabel(channel: string): string {
  return INQUIRY_CHANNELS.find(item => item.id === channel)?.label
    ?? FOLLOWUP_CHANNELS.find(item => item.id === channel)?.label
    ?? channel
}

export function followupStatusLabel(status: string): string {
  return FOLLOWUP_STATUS_LABEL[status] ?? status
}

export function followupStatusVariant(status: string): 'outline' | 'default' | 'warn' {
  if (status === 'draft') return 'warn'
  if (status === 'approved') return 'default'
  return 'outline'
}

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

export function formatShanghai(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })
}

export function formatShanghaiDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

export function shanghaiDate(offsetDays = 0): string {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date())
  if (offsetDays === 0) return today
  const [year, month, day] = today.split('-').map(Number)
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, (day ?? 1) + offsetDays))
  return date.toISOString().slice(0, 10)
}

export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      const ok = document.execCommand('copy')
      area.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function parseTags(value: string): string[] {
  return value
    .split(/[,，]/)
    .map(item => item.trim())
    .filter(Boolean)
}
