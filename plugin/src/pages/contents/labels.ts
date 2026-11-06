export const CONTENT_PLATFORMS = [
  'wechat',
  'xiaohongshu',
  'douyin',
  'weibo',
  'tmall',
  'jd',
  'pdd',
  'other'
] as const

export const PLATFORM_LABEL: Record<string, string> = {
  wechat: '公众号',
  xiaohongshu: '小红书',
  douyin: '抖音',
  weibo: '微博',
  tmall: '天猫',
  jd: '京东',
  pdd: '拼多多',
  other: '其他'
}

export const KIND_LABEL: Record<string, string> = {
  article: '长文',
  note: '短文',
  video_script: '视频脚本',
  poster_copy: '海报文案',
  product_copy: '商品文案'
}

export const STATUS_LABEL: Record<string, string> = {
  draft: '草稿',
  in_review: '送审中',
  approved: '已通过',
  rejected: '被退回',
  published: '已发布'
}

const BODY_LIMIT: Record<string, number> = {
  xiaohongshu: 1000,
  weibo: 2000
}

export function platformLabel(platform: string): string {
  return PLATFORM_LABEL[platform] ?? platform
}

export function platformMark(platform: string): string {
  return platformLabel(platform).slice(0, 1)
}

export function kindLabel(kind: string): string {
  return KIND_LABEL[kind] ?? kind
}

export function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status
}

export function statusVariant(status: string): 'default' | 'outline' | 'destructive' {
  if (status === 'in_review') return 'default'
  if (status === 'rejected') return 'destructive'
  return 'outline'
}

export function bodyLimit(platform: string | null): number | null {
  if (!platform) return null
  return BODY_LIMIT[platform] ?? null
}

export function isLockedStatus(status: string): boolean {
  return status === 'in_review' || status === 'approved' || status === 'published'
}
