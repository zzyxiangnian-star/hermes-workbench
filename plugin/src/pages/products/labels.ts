export const PLATFORM_NAME: Record<string, string> = {
  tmall: '天猫',
  jd: '京东',
  pdd: '拼多多',
  douyin: '抖音'
}

export function platformName(platform: string): string {
  return PLATFORM_NAME[platform] ?? platform
}

export function platformMark(platform: string): string {
  const name = platformName(platform)
  return name.slice(0, 1)
}

export function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100)
}

export function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('zh-CN', { hour12: false })
}

export function levelLabel(level: string): string {
  if (level === 'must') return '必须处理'
  if (level === 'warn') return '提醒'
  return level
}

export function statusLabel(status: string): string {
  if (status === 'open') return '未处理'
  if (status === 'resolved') return '已处理'
  if (status === 'ignored') return '已忽略'
  return status
}
