import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@hermes/plugin-sdk'
import { listBrandGuides, listCampaigns, listProductCards, type Campaign, type ProductCard } from '../../api/brand'
import { isOfflineError } from '../../api/client'
import { createVideoProject, listVideoProjects, mediaSrc, type VideoAspect } from '../../api/video'
import { useQuery } from '../../api/useQuery'
import { HeaderActions } from '../HeaderActions'
import { ScriptEditor } from './ScriptEditor'
import {
  ASPECTS,
  PLATFORMS,
  aspectRatio,
  errorText,
  formatSeconds,
  loadActor,
  platformLabel,
  saveActor,
  statusLabel,
  statusVariant
} from './labels'

type Segment = 'active' | 'in_review' | 'done' | 'all'

export function VideoPage() {
  const [screen, setScreen] = useState<{ name: 'list' } | { name: 'edit'; id: number }>({ name: 'list' })
  if (screen.name === 'edit') {
    return <ScriptEditor id={screen.id} onBack={() => setScreen({ name: 'list' })} />
  }
  return <VideoList onOpen={id => setScreen({ name: 'edit', id })} />
}

function VideoList({ onOpen }: { onOpen: (id: number) => void }) {
  const [segment, setSegment] = useState<Segment>('active')
  const [brand, setBrand] = useState('all')
  const [campaignId, setCampaignId] = useState('all')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const guides = useQuery(() => listBrandGuides(), [])
  const campaigns = useQuery(() => listCampaigns(), [])

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  const list = useQuery(
    () =>
      listVideoProjects({
        status: segment === 'all' ? undefined : segment,
        brand: brand === 'all' ? undefined : brand,
        campaign_id: campaignId === 'all' ? undefined : Number(campaignId),
        q: q || undefined
      }),
    [segment, brand, campaignId, q]
  )
  const brands = (guides.data ?? []).map(item => item.brand)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" onClick={() => setCreating(true)}>
          新建视频
        </Button>
      </HeaderActions>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          className="max-w-full flex-wrap"
          options={[
            { id: 'active', label: '未完成' },
            { id: 'in_review', label: '待审核' },
            { id: 'done', label: '已完成' },
            { id: 'all', label: '全部' }
          ]}
          value={segment}
          onChange={setSegment}
        />
        <FilterSelect label="品牌" value={brand} onChange={setBrand} options={brands.map(item => ({ id: item, label: item }))} />
        <FilterSelect
          label="活动"
          value={campaignId}
          onChange={setCampaignId}
          options={(campaigns.data ?? []).map(item => ({ id: String(item.id), label: item.name }))}
        />
        <Input
          aria-label="搜索视频"
          value={qInput}
          placeholder="标题、说明、口播"
          className="w-44 max-w-full"
          onChange={event => setQInput(event.target.value)}
        />
      </div>
      {list.error ? (
        <ErrorState
          title={isOfflineError(list.error) ? '没有连上工作台服务' : '视频加载失败'}
          description={errorText(list.error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={list.reload}>
            重试
          </Button>
        </ErrorState>
      ) : list.loading && !list.data ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <Loader />
          正在读取视频
        </div>
      ) : list.data && list.data.length === 0 ? (
        <EmptyState title="没有视频" description="当前筛选下没有视频项目。" />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,16rem),1fr))] gap-3">
          {(list.data ?? []).map(item => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full gap-3 rounded-lg border border-(--ui-stroke-secondary) p-3 text-left hover:bg-(--ui-bg-quinary)"
                onClick={() => onOpen(item.id)}
              >
                <span
                  className="flex shrink-0 items-center justify-center overflow-hidden bg-(--ui-bg-secondary)"
                  style={{ width: '4.5rem', aspectRatio: aspectRatio(item.aspect) }}
                >
                  {item.cover ? (
                    <img src={mediaSrc(item.cover.url)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[0.625rem] text-(--ui-text-tertiary)">无封面</span>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium">{item.title}</span>
                  <span className="text-xs text-(--ui-text-secondary)">
                    {platformLabel(item.platform)} · {item.aspect} · {formatSeconds(item.duration)} · {item.shot_count} 镜
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
                    {item.missing_media > 0 ? <Badge variant="warn">缺画面 {item.missing_media}</Badge> : null}
                    {item.missing_voice > 0 ? <Badge variant="warn">缺配音 {item.missing_voice}</Badge> : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <CreateVideoDialog
        open={creating}
        brands={brands}
        campaigns={campaigns.data ?? []}
        onOpenChange={setCreating}
        onCreated={onOpen}
      />
    </div>
  )
}

function CreateVideoDialog({
  open,
  brands,
  campaigns,
  onOpenChange,
  onCreated
}: {
  open: boolean
  brands: string[]
  campaigns: Campaign[]
  onOpenChange: (open: boolean) => void
  onCreated: (id: number) => void
}) {
  const [title, setTitle] = useState('')
  const [brand, setBrand] = useState(brands[0] ?? '')
  const [platform, setPlatform] = useState('douyin')
  const [aspect, setAspect] = useState<VideoAspect>('9:16')
  const [productCode, setProductCode] = useState('')
  const [codeQuery, setCodeQuery] = useState('')
  const [campaignId, setCampaignId] = useState('none')
  const [brief, setBrief] = useState('')
  const [actor, setActor] = useState(loadActor)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!brand && brands[0]) setBrand(brands[0])
  }, [brand, brands])

  useEffect(() => {
    const timer = window.setTimeout(() => setCodeQuery(productCode.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [productCode])

  const cards = useQuery(() => (codeQuery ? listProductCards({ q: codeQuery }) : Promise.resolve([] as ProductCard[])), [codeQuery])

  const submit = async () => {
    if (!title.trim() || !brand.trim()) {
      setError('标题和品牌要填')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await createVideoProject({
        title: title.trim(),
        brand: brand.trim(),
        campaign_id: campaignId === 'none' ? null : Number(campaignId),
        product_code: productCode.trim() || null,
        platform: platform === 'none' ? null : platform,
        aspect,
        brief: brief.trim() || null,
        author: actor.trim() || null,
        shots: []
      })
      saveActor(actor)
      onOpenChange(false)
      onCreated(created.id)
    } catch (reason) {
      setError(errorText(reason, '没有建成'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建视频</DialogTitle>
        </DialogHeader>
        <label className="flex flex-col gap-1 text-xs">
          标题
          <Input aria-label="标题" value={title} onChange={event => setTitle(event.target.value)} />
        </label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
          <label className="flex flex-col gap-1 text-xs">
            品牌
            {brands.length > 0 ? (
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger aria-label="品牌">
                  <SelectValue placeholder="选择品牌" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map(item => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input aria-label="品牌" value={brand} onChange={event => setBrand(event.target.value)} />
            )}
          </label>
          <label className="flex flex-col gap-1 text-xs">
            平台
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger aria-label="平台">
                <SelectValue placeholder="平台" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">不选</SelectItem>
                {PLATFORMS.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            画幅
            <Select value={aspect} onValueChange={value => setAspect(value as VideoAspect)}>
              <SelectTrigger aria-label="画幅">
                <SelectValue placeholder="画幅" />
              </SelectTrigger>
              <SelectContent>
                {ASPECTS.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs">
          商品编码
          <Input aria-label="商品编码" value={productCode} onChange={event => setProductCode(event.target.value)} />
        </label>
        {cards.data && cards.data.length > 0 ? (
          <ul className="max-h-28 overflow-y-auto rounded-md border border-(--ui-stroke-secondary)">
            {cards.data.slice(0, 6).map(card => (
              <li key={card.id}>
                <button
                  type="button"
                  className="flex w-full gap-2 px-2 py-1 text-left text-xs hover:bg-(--ui-bg-quinary)"
                  onClick={() => setProductCode(card.product_code)}
                >
                  <span className="text-(--ui-text-tertiary)">{card.product_code}</span>
                  <span className="min-w-0 truncate">{card.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <label className="flex flex-col gap-1 text-xs">
          活动
          <Select value={campaignId} onValueChange={setCampaignId}>
            <SelectTrigger aria-label="活动">
              <SelectValue placeholder="不关联活动" />
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
        </label>
        <label className="flex flex-col gap-1 text-xs">
          说明
          <Textarea aria-label="说明" rows={3} value={brief} onChange={event => setBrief(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          署名
          <Input
            aria-label="署名"
            value={actor}
            onChange={event => {
              setActor(event.target.value)
              saveActor(event.target.value)
            }}
          />
        </label>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void submit()}>
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string }[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="w-36 max-w-full">
        <SelectValue placeholder={`全部${label}`} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">全部{label}</SelectItem>
        {options.map(item => (
          <SelectItem key={item.id} value={item.id}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
