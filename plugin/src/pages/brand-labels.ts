export const KIND_LABEL: Record<string, string> = {
  holiday: '节假日促销',
  big_promo: '大促',
  new_launch: '新品上市',
  offline: '线下地推',
  other: '其他'
}

export const STATUS_LABEL: Record<string, string> = {
  planning: '筹备',
  running: '进行中',
  ended: '已结束',
  cancelled: '已取消'
}

export const PHASE_LABEL: Record<string, string> = {
  upcoming: '即将开始',
  running: '进行中',
  ended: '已结束',
  cancelled: '已取消'
}

export const TASK_KIND_LABEL: Record<string, string> = {
  copy: '文案',
  design: '设计',
  ads: '投放',
  member: '会员触达',
  other: '其他'
}

export const METRIC_LABEL: Record<string, string> = {
  visitors: '访客',
  orders: '订单',
  sales_amount: '销售额',
  conversion_rate: '转化率',
  ad_spend: '投放花费',
  ad_gmv: '投放成交',
  roi: 'ROI'
}

export const CAMPAIGN_KINDS = ['holiday', 'big_promo', 'new_launch', 'offline', 'other'] as const
export const CAMPAIGN_STATUSES = ['planning', 'running', 'ended', 'cancelled'] as const
export const TASK_KINDS = ['copy', 'design', 'ads', 'member', 'other'] as const

export function phaseClass(phase: string): string {
  if (phase === 'running') return 'bg-(--ui-accent) text-(--ui-bg-editor)'
  if (phase === 'upcoming') return 'border border-(--ui-accent) bg-(--ui-bg-editor) text-(--ui-accent)'
  if (phase === 'cancelled') return 'border border-destructive bg-(--ui-bg-editor) text-destructive'
  return 'bg-(--ui-bg-quinary) text-(--ui-text-secondary)'
}

export function phaseBadge(phase: string): 'default' | 'outline' | 'muted' | 'destructive' {
  if (phase === 'running') return 'default'
  if (phase === 'cancelled') return 'destructive'
  if (phase === 'upcoming') return 'outline'
  return 'muted'
}
