import { apiFetch } from './client'

export type CampaignKind = 'holiday' | 'big_promo' | 'new_launch' | 'offline' | 'other'
export type CampaignStatus = 'planning' | 'running' | 'ended' | 'cancelled'
export type CampaignPhase = 'upcoming' | 'running' | 'ended' | 'cancelled'
export type TaskKind = 'copy' | 'design' | 'ads' | 'member' | 'other'
export type IssueLevel = 'must' | 'warn'

export interface BrandGuide {
  id: number
  brand: string
  tone: string | null
  colors: string[]
  fonts: string[]
  logo_rules: string | null
  notes: string | null
  updated_at: string
}

export interface BannedWord {
  id: number
  word: string
  level: IssueLevel | string
  category: string
  suggestion: string | null
  enabled: boolean
}

export interface ComplianceHit {
  word: string
  level: IssueLevel | string
  category: string
  suggestion: string | null
  positions: number[]
}

export interface ComplianceResult {
  passed: boolean
  must_count: number
  warn_count: number
  hits: ComplianceHit[]
}

export interface FaqItem {
  q: string
  a: string
}

export interface CardListing {
  shop_id: number
  shop_name: string
  platform: string
  sku: string
  price: number
  stock: number
  activity: string | null
}

export interface ProductCard {
  id: number
  product_code: string
  brand: string
  name: string
  selling_points: string[]
  specs: string | null
  faq: FaqItem[]
  install_required: boolean
  notes: string | null
  updated_at: string
  listings: CardListing[]
}

export interface CampaignTask {
  id: number
  campaign_id: number
  title: string
  kind: TaskKind | string
  owner: string | null
  due_date: string | null
  done: boolean
  note: string | null
}

export interface Campaign {
  id: number
  name: string
  brand: string
  kind: CampaignKind | string
  status: CampaignStatus | string
  phase: CampaignPhase | string
  start_date: string
  end_date: string
  goal: string | null
  target_sales: number | null
  budget: number | null
  product_codes: string[]
  tasks_total: number
  tasks_done: number
  created_at: string
  updated_at: string
}

export interface CampaignDetail extends Campaign {
  tasks: CampaignTask[]
}

export interface CampaignTemplate {
  kind: CampaignKind | string
  name: string
  tasks: Array<{ title: string; kind: TaskKind | string }>
}

export interface ReviewMetric {
  value: number | null
  previous: number | null
  change: number | null
}

export interface CampaignReview {
  campaign_id: number
  name: string
  brand: string
  phase: string
  start_date: string
  end_date: string
  compare_start: string
  compare_end: string
  days: number
  days_with_data: number
  metrics: Record<string, ReviewMetric>
  target_sales: number | null
  target_rate: number | null
  budget: number | null
  budget_rate: number | null
  tasks_total: number
  tasks_done: number
  shops: Array<{
    shop_id: number
    shop_name: string
    platform: string
    sales_amount: number
    orders: number
    ad_spend: number
    roi: number | null
  }>
  markdown: string
}

export interface CampaignInput {
  name: string
  brand: string
  kind: CampaignKind
  start_date: string
  end_date: string
  goal?: string | null
  target_sales?: number | null
  budget?: number | null
  product_codes?: string[]
  use_template: boolean
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

export function listBrandGuides(): Promise<BrandGuide[]> {
  return apiFetch<BrandGuide[]>('/api/brand-guides')
}

export function getBrandGuide(brand: string): Promise<BrandGuide> {
  return apiFetch<BrandGuide>(`/api/brand-guides/${encodeURIComponent(brand)}`)
}

export function saveBrandGuide(
  brand: string,
  body: Pick<BrandGuide, 'tone' | 'colors' | 'fonts' | 'logo_rules' | 'notes'>
): Promise<BrandGuide> {
  return apiFetch<BrandGuide>(`/api/brand-guides/${encodeURIComponent(brand)}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })
}

export function listBannedWords(): Promise<BannedWord[]> {
  return apiFetch<BannedWord[]>('/api/banned-words')
}

export function createBannedWord(body: {
  word: string
  level?: string
  category?: string
  suggestion?: string | null
}): Promise<BannedWord> {
  return apiFetch<BannedWord>('/api/banned-words', { method: 'POST', body: JSON.stringify(body) })
}

export function patchBannedWord(
  id: number,
  patch: { level?: string; category?: string; suggestion?: string | null; enabled?: boolean }
): Promise<BannedWord> {
  return apiFetch<BannedWord>(`/api/banned-words/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function deleteBannedWord(id: number): Promise<void> {
  return apiFetch<void>(`/api/banned-words/${id}`, { method: 'DELETE' })
}

export function checkCompliance(text: string): Promise<ComplianceResult> {
  return apiFetch<ComplianceResult>('/api/compliance/check', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
}

export function listProductCards(query: { brand?: string; q?: string } = {}): Promise<ProductCard[]> {
  return apiFetch<ProductCard[]>(`/api/product-cards${queryString(query)}`)
}

export function getProductCard(id: number): Promise<ProductCard> {
  return apiFetch<ProductCard>(`/api/product-cards/${id}`)
}

export function createProductCard(body: {
  product_code: string
  brand: string
  name: string
  selling_points: string[]
  specs: string | null
  faq: FaqItem[]
  install_required: boolean
  notes: string | null
}): Promise<ProductCard> {
  return apiFetch<ProductCard>('/api/product-cards', { method: 'POST', body: JSON.stringify(body) })
}

export function patchProductCard(
  id: number,
  patch: Partial<Omit<ProductCard, 'id' | 'product_code' | 'updated_at' | 'listings'>>
): Promise<ProductCard> {
  return apiFetch<ProductCard>(`/api/product-cards/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function listCampaignTemplates(): Promise<CampaignTemplate[]> {
  return apiFetch<CampaignTemplate[]>('/api/campaign-templates')
}

export function listCampaigns(query: {
  date_from?: string
  date_to?: string
  brand?: string
  status?: string
} = {}): Promise<Campaign[]> {
  return apiFetch<Campaign[]>(`/api/campaigns${queryString(query)}`)
}

export function getCampaign(id: number): Promise<CampaignDetail> {
  return apiFetch<CampaignDetail>(`/api/campaigns/${id}`)
}

export function createCampaign(body: CampaignInput): Promise<CampaignDetail> {
  return apiFetch<CampaignDetail>('/api/campaigns', { method: 'POST', body: JSON.stringify(body) })
}

export function patchCampaign(
  id: number,
  patch: Partial<Pick<Campaign, 'name' | 'kind' | 'status' | 'start_date' | 'end_date' | 'goal' | 'target_sales' | 'budget'>>
): Promise<CampaignDetail> {
  return apiFetch<CampaignDetail>(`/api/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function createCampaignTask(
  campaignId: number,
  body: { title: string; kind: string; owner?: string | null; due_date?: string | null }
): Promise<CampaignTask> {
  return apiFetch<CampaignTask>(`/api/campaigns/${campaignId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(body)
  })
}

export function patchCampaignTask(
  id: number,
  patch: { title?: string; kind?: string; owner?: string | null; due_date?: string | null; done?: boolean }
): Promise<CampaignTask> {
  return apiFetch<CampaignTask>(`/api/campaign-tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
}

export function deleteCampaignTask(id: number): Promise<void> {
  return apiFetch<void>(`/api/campaign-tasks/${id}`, { method: 'DELETE' })
}

export function getCampaignReview(id: number): Promise<CampaignReview> {
  return apiFetch<CampaignReview>(`/api/campaigns/${id}/review`)
}
