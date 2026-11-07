import { useEffect, useState, type ReactNode } from 'react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorState,
  Input,
  SearchField,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Tip
} from '@hermes/plugin-sdk'
import { isOfflineError } from '../../api/client'
import { refreshInReviewCount } from '../../api/content-count'
import { listCampaigns } from '../../api/brand'
import { createContent, listContents, type ContentItem } from '../../api/contents'
import { listShops } from '../../api/products'
import { useQuery } from '../../api/useQuery'
import { useApiBase } from '../../settings'
import { EmptyBlock } from '../EmptyBlock'
import { HeaderActions } from '../HeaderActions'
import { OfflineNotice } from '../OfflineNotice'
import { formatTime } from '../products/labels'
import { ContentEditor } from './ContentEditor'
import {
  CONTENT_PLATFORMS,
  KIND_LABEL,
  kindLabel,
  platformLabel,
  platformMark,
  statusLabel,
  statusVariant
} from './labels'

const STATUSES = [
  { id: 'all', label: '全部' },
  { id: 'draft', label: '草稿' },
  { id: 'in_review', label: '送审中' },
  { id: 'approved', label: '已通过' },
  { id: 'rejected', label: '被退回' },
  { id: 'published', label: '已发布' }
] as const

export function ContentsPage() {
  const [editing, setEditing] = useState<number | null>(null)
  if (editing !== null) {
    return (
      <ContentEditor
        id={editing}
        onBack={() => {
          setEditing(null)
          void refreshInReviewCount()
        }}
      />
    )
  }
  return <ContentsList onOpen={setEditing} />
}

function ContentsList({ onOpen }: { onOpen: (id: number) => void }) {
  const apiBase = useApiBase()
  const [status, setStatus] = useState<(typeof STATUSES)[number]['id']>('all')
  const [platform, setPlatform] = useState('all')
  const [brand, setBrand] = useState('all')
  const [campaign, setCampaign] = useState('all')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  const query = useQuery(
    () =>
      listContents({
        status: status === 'all' ? undefined : status,
        platform: platform === 'all' ? undefined : platform,
        brand: brand === 'all' ? undefined : brand,
        campaign_id: campaign === 'all' ? undefined : Number(campaign),
        q: q || undefined
      }),
    [apiBase, status, platform, brand, campaign, q]
  )
  const shops = useQuery(() => listShops(), [apiBase])
  const campaigns = useQuery(() => listCampaigns(), [apiBase])
  const offline = isOfflineError(query.error)
  const brands = Array.from(new Set((shops.data ?? []).map(item => item.brand).filter(Boolean)))
  const filtered = status !== 'all' || platform !== 'all' || brand !== 'all' || campaign !== 'all' || q !== ''

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" onClick={() => setCreating(true)}>
          新建稿件
        </Button>
      </HeaderActions>

      {offline ? (
        <OfflineNotice detail={query.error instanceof Error ? query.error.message : undefined} onRetry={query.reload} />
      ) : null}

      {!offline && query.error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState title="稿件加载失败" description={query.error instanceof Error ? query.error.message : '请重试'}>
            <Button size="sm" variant="outline" onClick={query.reload}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !query.error ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl options={STATUSES} value={status} onChange={setStatus} />
            <FilterSelect label="平台" value={platform} onChange={setPlatform} allLabel="全部平台">
              {CONTENT_PLATFORMS.map(item => (
                <SelectItem key={item} value={item}>
                  {platformLabel(item)}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="品牌" value={brand} onChange={setBrand} allLabel="全部品牌">
              {brands.map(item => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </FilterSelect>
            <FilterSelect label="活动" value={campaign} onChange={setCampaign} allLabel="全部活动">
              {(campaigns.data ?? []).map(item => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </FilterSelect>
            <SearchField aria-label="搜索稿件" placeholder="搜索标题" value={qInput} onChange={setQInput} />
          </div>

          {query.loading && !query.data ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : null}

          {query.data && query.data.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <EmptyBlock
                title={filtered ? '没有符合条件的稿件' : '还没有稿件'}
                description={filtered ? '换个筛选条件，或者清空搜索。' : '从主稿写起，再拆成各个平台的版本。'}
              >
                {filtered ? null : (
                  <Button size="sm" onClick={() => setCreating(true)}>
                    新建稿件
                  </Button>
                )}
              </EmptyBlock>
            </div>
          ) : null}

          {query.data && query.data.length > 0 ? (
            <ul className="flex flex-col border-t border-(--ui-stroke-secondary)">
              {query.data.map(item => (
                <li key={item.id} className="border-b border-(--ui-stroke-secondary)">
                  <ContentRow item={item} onOpen={() => onOpen(item.id)} />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : null}

      <CreateDialog
        open={creating}
        brands={brands}
        campaigns={(campaigns.data ?? []).map(item => ({ id: item.id, name: item.name }))}
        onClose={() => setCreating(false)}
        onCreated={id => {
          setCreating(false)
          onOpen(id)
        }}
      />
    </div>
  )
}

function ContentRow({ item, onOpen }: { item: ContentItem; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="flex w-full flex-col gap-1 px-1 py-2 text-left hover:bg-(--ui-bg-quinary)">
      <span className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm font-medium">{item.title}</span>
        {item.author === '品牌助手' ? <Badge variant="default">品牌助手</Badge> : null}
        <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
        {item.open_comments > 0 ? <Badge variant="outline">{item.open_comments} 条未解决</Badge> : null}
      </span>
      <span className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-(--ui-text-tertiary)">
        <span>{kindLabel(item.kind)}</span>
        <span>{item.brand}</span>
        {item.campaign_name ? <span>{item.campaign_name}</span> : null}
        <span className="inline-flex items-center gap-1">
          {item.platforms.map(platform => (
            <Tip key={platform} label={platformLabel(platform)}>
              <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) px-0.5">
                {platformMark(platform)}
              </span>
            </Tip>
          ))}
        </span>
        <span>v{item.version}</span>
        <span>{item.author || '未署名'}</span>
        <span>{formatTime(item.updated_at)}</span>
      </span>
    </button>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  children
}: {
  label: string
  value: string
  onChange: (value: string) => void
  allLabel: string
  children: ReactNode
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {children}
      </SelectContent>
    </Select>
  )
}

function CreateDialog({
  open,
  brands,
  campaigns,
  onClose,
  onCreated
}: {
  open: boolean
  brands: string[]
  campaigns: Array<{ id: number; name: string }>
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState(brands[0] ?? '')
  const [kind, setKind] = useState('article')
  const [campaignId, setCampaignId] = useState('none')
  const [platforms, setPlatforms] = useState<string[]>(['xiaohongshu', 'wechat'])
  const [author, setAuthor] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setBrand(brands[0] ?? '')
    setKind('article')
    setCampaignId('none')
    setPlatforms(['xiaohongshu', 'wechat'])
    setAuthor('')
    setBusy(false)
    setError(null)
    // 只在打开时重置。品牌列表稍后刷新不能清掉正在填的标题。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggle = (platform: string) => {
    setPlatforms(current =>
      current.includes(platform) ? current.filter(item => item !== platform) : [...current, platform]
    )
  }

  const create = async () => {
    setBusy(true)
    setError(null)
    try {
      const created = await createContent({
        title: title.trim(),
        brand: brand.trim(),
        kind,
        campaign_id: campaignId === 'none' ? null : Number(campaignId),
        author: author.trim() || null,
        variants: platforms.map(platform => ({ platform, title: null, body: '' }))
      })
      onCreated(created.id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '新建失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建稿件</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input aria-label="稿件标题" placeholder="标题" value={title} onChange={event => setTitle(event.target.value)} />
          <div className="flex flex-wrap gap-2">
            <Select value={brand || 'custom'} onValueChange={value => { if (value !== 'custom') setBrand(value) }}>
              <SelectTrigger aria-label="品牌">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">手填品牌</SelectItem>
                {brands.map(item => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input aria-label="品牌名" placeholder="品牌" value={brand} onChange={event => setBrand(event.target.value)} className="max-w-40" />
          </div>
          <Select value={kind} onValueChange={setKind}>
            <SelectTrigger aria-label="稿件类型">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(KIND_LABEL).map(([id, label]) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger aria-label="关联活动">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">不关联活动</SelectItem>
              {campaigns.map(item => (
                <SelectItem key={item.id} value={String(item.id)}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <fieldset className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <legend className="mb-1 text-(--ui-text-tertiary)">要做的平台</legend>
            {CONTENT_PLATFORMS.map(item => (
              <label key={item} className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={platforms.includes(item)}
                  onChange={() => toggle(item)}
                />
                {platformLabel(item)}
              </label>
            ))}
          </fieldset>
          <Input
            aria-label="作者"
            placeholder="作者，品牌助手写的请填品牌助手"
            value={author}
            onChange={event => setAuthor(event.target.value)}
          />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button disabled={busy || !title.trim() || !brand.trim()} onClick={() => void create()}>
            {busy ? '正在创建' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
