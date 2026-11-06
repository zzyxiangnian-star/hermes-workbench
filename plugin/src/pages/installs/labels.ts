import type { InstallStatus } from '../../api/installs'

export const STATUS_LABEL: Record<string, string> = {
  pending: '待预约',
  booked: '已预约',
  done: '已完工',
  exception: '异常',
  cancelled: '已取消'
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

export function statusVariant(status: string): 'outline' | 'destructive' | 'default' | 'warn' {
  if (status === 'exception') return 'destructive'
  if (status === 'booked') return 'default'
  if (status === 'pending') return 'warn'
  return 'outline'
}

export function formatShanghai(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' })
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100)
}

/** 把北京时间的 datetime-local 值收成带 +08:00 的字符串。 */
export function appointmentPayload(value: string): string {
  return `${value}:00+08:00`
}

export function appointmentInputValue(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date)
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? ''
  const hour = pick('hour') === '24' ? '00' : pick('hour')
  return `${pick('year')}-${pick('month')}-${pick('day')}T${hour}:${pick('minute')}`
}

export function isActionStatus(status: string): boolean {
  return status === 'pending' || status === 'exception'
}

export type InstallSegment = 'action' | 'booked' | 'done' | 'all'

export function segmentStatus(segment: InstallSegment): InstallStatus | undefined {
  if (segment === 'booked' || segment === 'done') return segment
  return undefined
}
