import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Codicon,
  ConfirmDialog,
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
import { listBrandGuides, listCampaigns, type Campaign } from '../../api/brand'
import { isOfflineError } from '../../api/client'
import {
  assetDownloadUrl,
  assetSrc,
  deleteAsset,
  getDesignSummary,
  listDesignRequests,
  listLibraryAssets,
  patchAsset,
  uploadLibraryAsset,
  type DesignAsset,
  type DesignRequest
} from '../../api/design'
import { refreshDesignNeedsActionCount } from '../../api/design-count'
import { useQuery } from '../../api/useQuery'
import { HeaderActions } from '../HeaderActions'
import { SideDrawer } from '../products/Drawer'
import { AssetGrid } from './AssetGrid'
import { FileDrop, RequestDialog } from './RequestDialog'
import { ReviewView } from './ReviewView'
import { KINDS, errorText, isImage, kindLabel, loadActor, statusLabel, statusVariant } from './labels'

type RequestSegment = 'active' | 'reviewing' | 'done' | 'all'
type DesignTab = 'requests' | 'library'

export function DesignPage() {
  const [screen, setScreen] = useState<{ name: 'list' } | { name: 'review'; id: number }>({ name: 'list' })
  if (screen.name === 'review') {
    return <ReviewView id={screen.id} onBack={() => setScreen({ name: 'list' })} />
  }
  return <DesignHome onOpen={id => setScreen({ name: 'review', id })} />
}

function DesignHome({ onOpen }: { onOpen: (id: number) => void }) {
  const [tab, setTab] = useState<DesignTab>('requests')
  const guides = useQuery(() => listBrandGuides(), [])
  const campaigns = useQuery(() => listCampaigns(), [])
  const brands = (guides.data ?? []).map(item => item.brand)

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SegmentedControl
          className="max-w-full flex-wrap"
          options={[
            { id: 'requests', label: '需求' },
            { id: 'library', label: '素材库' }
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      {tab === 'requests' ? (
        <RequestTab brands={brands} campaigns={campaigns.data ?? []} onOpen={onOpen} />
      ) : (
        <LibraryTab brands={brands} campaigns={campaigns.data ?? []} />
      )}
    </div>
  )
}

function RequestTab({
  brands,
  campaigns,
  onOpen
}: {
  brands: string[]
  campaigns: Campaign[]
  onOpen: (id: number) => void
}) {
  const [segment, setSegment] = useState<RequestSegment>('active')
  const [brand, setBrand] = useState('all')
  const [kind, setKind] = useState('all')
  const [campaignId, setCampaignId] = useState('all')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  const summary = useQuery(() => getDesignSummary(brand === 'all' ? undefined : brand), [brand])
  const list = useQuery(
    () =>
      listDesignRequests({
        status: segment === 'all' ? undefined : segment,
        brand: brand === 'all' ? undefined : brand,
        kind: kind === 'all' ? undefined : kind,
        campaign_id: campaignId === 'all' ? undefined : Number(campaignId),
        q: q || undefined
      }),
    [segment, brand, kind, campaignId, q]
  )

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" onClick={() => setCreating(true)}>
          提需求
        </Button>
      </HeaderActions>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span>待接单</span>
        <Badge variant="outline">{summary.data?.open ?? 0}</Badge>
        <span>设计中</span>
        <Badge variant="outline">{summary.data?.in_progress ?? 0}</Badge>
        <span>待评审</span>
        <Badge variant="warn">{summary.data?.reviewing ?? 0}</Badge>
        <span>逾期</span>
        <Badge variant="warn">{summary.data?.overdue ?? 0}</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          className="max-w-full flex-wrap"
          options={[
            { id: 'active', label: '未完成' },
            { id: 'reviewing', label: '待评审' },
            { id: 'done', label: '已定稿' },
            { id: 'all', label: '全部' }
          ]}
          value={segment}
          onChange={setSegment}
        />
        <FilterSelect label="品牌" value={brand} onChange={setBrand} options={brands.map(item => ({ id: item, label: item }))} />
        <FilterSelect label="类型" value={kind} onChange={setKind} options={KINDS.map(item => ({ id: item.id, label: item.label }))} />
        <FilterSelect
          label="活动"
          value={campaignId}
          onChange={setCampaignId}
          options={campaigns.map(item => ({ id: String(item.id), label: item.name }))}
        />
        <Input
          aria-label="搜索需求"
          value={qInput}
          placeholder="标题、文案、商品编码"
          className="w-44 max-w-full"
          onChange={event => setQInput(event.target.value)}
        />
      </div>
      {list.error ? (
        <ErrorState
          title={isOfflineError(list.error) ? '没有连上工作台服务' : '需求加载失败'}
          description={errorText(list.error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={list.reload}>
            重试
          </Button>
        </ErrorState>
      ) : list.loading && !list.data ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <Loader />
          正在读取需求
        </div>
      ) : list.data && list.data.length === 0 ? (
        <EmptyState title="没有需求" description="当前筛选下没有设计需求。" />
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
          {(list.data ?? []).map(item => (
            <RequestCard key={item.id} item={item} onOpen={() => onOpen(item.id)} />
          ))}
        </ul>
      )}
      {creating ? (
        <RequestDialog
          open
          brands={brands}
          campaigns={campaigns}
          onOpenChange={setCreating}
          onSaved={id => {
            setCreating(false)
            void refreshDesignNeedsActionCount()
            onOpen(id)
          }}
        />
      ) : null}
    </div>
  )
}

function RequestCard({ item, onOpen }: { item: DesignRequest; onOpen: () => void }) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-full w-full min-w-0 flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) p-2 text-left hover:bg-(--ui-bg-quinary)"
      >
        <span className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)">
          {item.cover && isImage(item.cover.mime) ? (
            <img src={assetSrc(item.cover.url)} alt="" className="max-h-full max-w-full object-contain" />
          ) : (
            <Codicon name="symbol-color" size="1.25rem" />
          )}
        </span>
        <span className="truncate text-sm font-medium">{item.title}</span>
        <span className="truncate text-xs text-(--ui-text-secondary)">
          {kindLabel(item.kind)}
          {item.sizes.length > 0 ? ` · ${item.sizes.join('、')}` : ''}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[0.6875rem]">
          <span className={item.overdue ? 'text-destructive' : 'text-(--ui-text-tertiary)'}>
            {item.due_date || '未设截止日'}
            {item.overdue ? ' · 逾期' : ''}
          </span>
          <span className="text-(--ui-text-tertiary)">{item.assignee || '未指定'}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant(item.status)}>{statusLabel(item.status)}</Badge>
          <span className="text-[0.6875rem] text-(--ui-text-tertiary)">{item.candidate_count} 张候选</span>
          <span className="text-[0.6875rem] text-(--ui-text-tertiary)">{item.open_comments} 条未解决</span>
        </span>
      </button>
    </li>
  )
}

function LibraryTab({ brands, campaigns }: { brands: string[]; campaigns: { id: number; name: string }[] }) {
  const [brand, setBrand] = useState('all')
  const [kind, setKind] = useState('all')
  const [campaignId, setCampaignId] = useState('all')
  const [codeInput, setCodeInput] = useState('')
  const [code, setCode] = useState('')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [uploading, setUploading] = useState(false)
  const [opened, setOpened] = useState<DesignAsset | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCode(codeInput.trim())
      setQ(qInput.trim())
    }, 300)
    return () => window.clearTimeout(timer)
  }, [codeInput, qInput])

  const list = useQuery(
    () =>
      listLibraryAssets({
        brand: brand === 'all' ? undefined : brand,
        kind: kind === 'all' ? undefined : kind,
        campaign_id: campaignId === 'all' ? undefined : Number(campaignId),
        product_code: code || undefined,
        q: q || undefined
      }),
    [brand, kind, campaignId, code, q]
  )

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <HeaderActions>
        <Button size="sm" onClick={() => setUploading(true)}>
          上传素材
        </Button>
      </HeaderActions>
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect label="品牌" value={brand} onChange={setBrand} options={brands.map(item => ({ id: item, label: item }))} />
        <FilterSelect label="类型" value={kind} onChange={setKind} options={KINDS.map(item => ({ id: item.id, label: item.label }))} />
        <FilterSelect
          label="活动"
          value={campaignId}
          onChange={setCampaignId}
          options={campaigns.map(item => ({ id: String(item.id), label: item.name }))}
        />
        <Input
          aria-label="商品编码"
          value={codeInput}
          placeholder="商品编码"
          className="w-32 max-w-full"
          onChange={event => setCodeInput(event.target.value)}
        />
        <Input
          aria-label="搜索素材"
          value={qInput}
          placeholder="文件名、标签、备注"
          className="w-44 max-w-full"
          onChange={event => setQInput(event.target.value)}
        />
      </div>
      {list.error ? (
        <ErrorState
          title={isOfflineError(list.error) ? '没有连上工作台服务' : '素材加载失败'}
          description={errorText(list.error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={list.reload}>
            重试
          </Button>
        </ErrorState>
      ) : list.loading && !list.data ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <Loader />
          正在读取素材
        </div>
      ) : (
        <AssetGrid assets={list.data ?? []} onOpen={setOpened} empty="素材库还没有图片" />
      )}
      {uploading ? (
        <LibraryUpload
          brands={brands}
          onClose={() => setUploading(false)}
          onDone={() => {
            setUploading(false)
            list.reload()
          }}
        />
      ) : null}
      <AssetDrawer
        asset={opened}
        onClose={() => setOpened(null)}
        onChanged={next => {
          setOpened(next)
          list.reload()
        }}
        onDeleted={() => {
          setOpened(null)
          list.reload()
        }}
      />
    </div>
  )
}

function LibraryUpload({
  brands,
  onClose,
  onDone
}: {
  brands: string[]
  onClose: () => void
  onDone: () => void
}) {
  const [files, setFiles] = useState<File[]>([])
  const [brand, setBrand] = useState(brands[0] ?? '')
  const [productCode, setProductCode] = useState('')
  const [tags, setTags] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (files.length === 0) {
      setError('请先选择文件')
      return
    }
    setBusy(true)
    setError(null)
    try {
      for (const file of files) {
        await uploadLibraryAsset(file, {
          brand: brand.trim() || undefined,
          product_code: productCode.trim() || undefined,
          tags: tags.trim() || undefined,
          by: loadActor().trim() || null
        })
      }
      onDone()
    } catch (reason) {
      setError(errorText(reason, '没有上传'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="关闭浮层" className="absolute inset-0 bg-black/22" onClick={onClose} />
      <div role="dialog" className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col gap-3 overflow-y-auto rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-4">
        <h2 className="text-sm font-medium">上传素材</h2>
        <FileDrop label="把文件拖进来，可以一次多张" files={files} onFiles={next => setFiles(current => [...current, ...next])} />
        {files.length > 0 ? (
          <ul className="text-xs text-(--ui-text-tertiary)">
            {files.map(file => (
              <li key={`${file.name}-${file.size}-${file.lastModified}`}>{file.name}</li>
            ))}
          </ul>
        ) : null}
        <label className="flex flex-col gap-1 text-xs">
          品牌
          {brands.length > 0 ? (
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger aria-label="素材品牌">
                <SelectValue />
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
            <Input aria-label="素材品牌" value={brand} onChange={event => setBrand(event.target.value)} />
          )}
        </label>
        <label className="flex flex-col gap-1 text-xs">
          商品编码
          <Input aria-label="素材商品编码" value={productCode} onChange={event => setProductCode(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          标签
          <Input aria-label="标签" value={tags} placeholder="用逗号分隔" onChange={event => setTags(event.target.value)} />
        </label>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={onClose}>
            取消
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void submit()}>
            {busy ? '正在上传' : '上传'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function AssetDrawer({
  asset,
  onClose,
  onChanged,
  onDeleted
}: {
  asset: DesignAsset | null
  onClose: () => void
  onChanged: (asset: DesignAsset) => void
  onDeleted: () => void
}) {
  const [tags, setTags] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    setTags(asset?.tags.join(', ') ?? '')
    setNote(asset?.note ?? '')
    setError(null)
  }, [asset])

  const save = async () => {
    if (!asset) return
    setBusy(true)
    setError(null)
    try {
      const next = await patchAsset(asset.id, {
        tags: tags
          .split(/[,，]/)
          .map(item => item.trim())
          .filter(Boolean),
        note: note.trim() || null
      })
      onChanged(next)
    } catch (reason) {
      setError(errorText(reason, '没有保存'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <SideDrawer
        open={asset != null}
        title={asset?.file_name ?? '素材'}
        description={asset ? `${asset.width && asset.height ? `${asset.width}×${asset.height} · ` : ''}${asset.role === 'final' ? '定稿' : '素材库'}` : undefined}
        onClose={onClose}
        footer={
          asset ? (
            <>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => void save()}>
                保存
              </Button>
              {asset.role === 'library' ? (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => setConfirming(true)}>
                  删除
                </Button>
              ) : null}
            </>
          ) : null
        }
      >
        {asset ? (
          <div className="flex flex-col gap-3 text-xs">
            <span className="flex h-64 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)">
              {isImage(asset.mime) ? (
                <img src={assetSrc(asset.url)} alt={asset.file_name} className="max-h-full max-w-full object-contain" />
              ) : (
                <Codicon name="library" size="1.5rem" />
              )}
            </span>
            <p className="text-(--ui-text-tertiary)">
              {asset.brand || '未填品牌'}
              {asset.product_code ? ` · ${asset.product_code}` : ''}
            </p>
            <a className="text-(--ui-accent)" href={assetDownloadUrl(asset.url)}>
              下载原图
            </a>
            <label className="flex flex-col gap-1">
              标签
              <Input aria-label="编辑标签" value={tags} placeholder="用逗号分隔" onChange={event => setTags(event.target.value)} />
            </label>
            <label className="flex flex-col gap-1">
              备注
              <Textarea aria-label="备注" rows={3} value={note} onChange={event => setNote(event.target.value)} />
            </label>
            {error ? <p className="text-destructive">{error}</p> : null}
          </div>
        ) : null}
      </SideDrawer>
      <ConfirmDialog
        open={confirming}
        title="删除这张素材？"
        confirmLabel="删除"
        onClose={() => setConfirming(false)}
        onConfirm={async () => {
          if (!asset) return
          await deleteAsset(asset.id)
          setConfirming(false)
          onDeleted()
        }}
      />
    </>
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
