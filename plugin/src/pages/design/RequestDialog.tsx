import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea
} from '@hermes/plugin-sdk'
import {
  checkCompliance,
  listProductCards,
  type Campaign,
  type ComplianceResult,
  type ProductCard
} from '../../api/brand'
import { useQuery } from '../../api/useQuery'
import {
  createDesignRequest,
  patchDesignRequest,
  uploadRequestAsset,
  type DesignKind,
  type DesignRequest
} from '../../api/design'
import { KINDS, errorText, loadActor, normalizeSize, saveActor } from './labels'

export function RequestDialog({
  open,
  onOpenChange,
  brands,
  campaigns,
  initial,
  onSaved
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  brands: string[]
  campaigns: Campaign[]
  initial?: DesignRequest | null
  onSaved: (id: number) => void
}) {
  const editing = initial ?? null
  const [title, setTitle] = useState(editing?.title ?? '')
  const [kind, setKind] = useState<DesignKind>((editing?.kind as DesignKind) || 'main_image')
  const [brand, setBrand] = useState(editing?.brand ?? brands[0] ?? '')
  const [campaignId, setCampaignId] = useState(editing?.campaign_id ? String(editing.campaign_id) : 'none')
  const [productCode, setProductCode] = useState(editing?.product_code ?? '')
  const [codeQuery, setCodeQuery] = useState(editing?.product_code ?? '')
  const [sizes, setSizes] = useState<string[]>(editing?.sizes ?? [])
  const [sizeInput, setSizeInput] = useState('')
  const [sizeError, setSizeError] = useState<string | null>(null)
  const [copy, setCopy] = useState(editing?.copy_text ?? '')
  const [brief, setBrief] = useState(editing?.brief ?? '')
  const [due, setDue] = useState(editing?.due_date ?? '')
  const [assignee, setAssignee] = useState(editing?.assignee ?? '')
  const [actor, setActor] = useState(loadActor)
  const [files, setFiles] = useState<File[]>([])
  const [createdId, setCreatedId] = useState<number | null>(editing?.id ?? null)
  const [compliance, setCompliance] = useState<ComplianceResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setCodeQuery(productCode.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [productCode])

  useEffect(() => {
    const text = copy.trim()
    if (!text) {
      setCompliance(null)
      return
    }
    const timer = window.setTimeout(() => {
      checkCompliance(text)
        .then(setCompliance)
        .catch(() => setCompliance(null))
    }, 500)
    return () => window.clearTimeout(timer)
  }, [copy])

  const cards = useQuery(
    () => (codeQuery ? listProductCards({ q: codeQuery }) : Promise.resolve([] as ProductCard[])),
    [codeQuery]
  )
  const brandOptions = brand && !brands.includes(brand) ? [brand, ...brands] : brands

  const addSize = () => {
    const next = normalizeSize(sizeInput)
    if (!next) {
      setSizeError('尺寸写成 800x800 这样')
      return
    }
    setSizeError(null)
    setSizes(current => (current.includes(next) ? current : [...current, next]))
    setSizeInput('')
  }

  const submit = async () => {
    if (!title.trim() || !(editing ? editing.brand : brand).trim()) {
      setError('请填写标题和品牌')
      return
    }
    saveActor(actor)
    setBusy(true)
    setError(null)
    const fields = {
      title: title.trim(),
      kind,
      campaign_id: campaignId === 'none' ? null : Number(campaignId),
      product_code: productCode.trim() || null,
      sizes,
      copy_text: copy.trim() || null,
      brief: brief.trim() || null,
      due_date: due || null,
      assignee: assignee.trim() || null
    }
    let savedId = createdId
    try {
      if (editing) {
        await patchDesignRequest(editing.id, fields)
        savedId = editing.id
      } else if (savedId == null) {
        const created = await createDesignRequest({
          ...fields,
          brand: brand.trim(),
          requester: actor.trim() || null
        })
        savedId = created.id
        setCreatedId(savedId)
      }
      for (const file of files) {
        await uploadRequestAsset(savedId, file, 'reference', actor.trim() || null)
      }
      onSaved(savedId)
      onOpenChange(false)
    } catch (reason) {
      setError(errorText(reason, !editing && savedId != null ? '需求单已创建，参考图没有传上去' : '没有保存'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? '编辑需求' : '提需求'}</DialogTitle>
        </DialogHeader>
        <label className="flex flex-col gap-1 text-xs">
          标题
          <Input aria-label="标题" value={title} onChange={event => setTitle(event.target.value)} />
        </label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
          <label className="flex min-w-0 flex-col gap-1 text-xs">
            类型
            <Select value={kind} onValueChange={value => setKind(value as DesignKind)}>
              <SelectTrigger aria-label="类型">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KINDS.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-xs">
            品牌
            {editing ? (
              <Input aria-label="品牌" value={editing.brand} disabled />
            ) : brandOptions.length > 0 ? (
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger aria-label="品牌">
                  <SelectValue placeholder="选择品牌" />
                </SelectTrigger>
                <SelectContent>
                  {brandOptions.map(item => (
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
        </div>
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
          商品编码
          <Input
            aria-label="商品编码"
            value={productCode}
            placeholder="从商品卡搜索"
            onChange={event => setProductCode(event.target.value)}
          />
        </label>
        {cards.data && cards.data.length > 0 ? (
          <ul className="max-h-32 overflow-y-auto rounded-md border border-(--ui-stroke-secondary)">
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
        <div className="flex flex-col gap-1 text-xs">
          尺寸
          <div className="flex gap-2">
            <Input
              aria-label="尺寸"
              value={sizeInput}
              placeholder="800x800"
              onChange={event => setSizeInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addSize()
                }
              }}
            />
            <Button type="button" size="sm" variant="outline" onClick={addSize}>
              添加
            </Button>
          </div>
          {sizeError ? <p className="text-destructive">{sizeError}</p> : null}
          {sizes.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {sizes.map(size => (
                <li key={size}>
                  <button
                    type="button"
                    className="rounded-sm border border-(--ui-stroke-secondary) px-1.5 py-0.5"
                    onClick={() => setSizes(current => current.filter(item => item !== size))}
                  >
                    {size} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <label className="flex flex-col gap-1 text-xs">
          图上文案
          <Textarea aria-label="图上文案" value={copy} rows={3} onChange={event => setCopy(event.target.value)} />
        </label>
        <ComplianceHint result={compliance} />
        <label className="flex flex-col gap-1 text-xs">
          需求说明
          <Textarea aria-label="需求说明" value={brief} rows={3} onChange={event => setBrief(event.target.value)} />
        </label>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
          <label className="flex flex-col gap-1 text-xs">
            截止日期
            <Input aria-label="截止日期" type="date" value={due} onChange={event => setDue(event.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            设计师
            <Input aria-label="设计师" value={assignee} onChange={event => setAssignee(event.target.value)} />
          </label>
          {editing ? null : (
            <label className="flex flex-col gap-1 text-xs">
              提出人
              <Input aria-label="提出人" value={actor} onChange={event => setActor(event.target.value)} />
            </label>
          )}
        </div>
        <FileDrop
          label={editing ? '添加参考图' : '参考图，可以拖进来'}
          files={files}
          onFiles={next => setFiles(current => [...current, ...next])}
        />
        {files.length > 0 ? (
          <ul className="text-xs text-(--ui-text-tertiary)">
            {files.map(file => (
              <li key={`${file.name}-${file.size}`}>{file.name}</li>
            ))}
          </ul>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button type="button" size="sm" disabled={busy} onClick={() => void submit()}>
            {busy ? '正在保存' : editing ? '保存' : createdId ? '重试上传' : '提交'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ComplianceHint({ result }: { result: ComplianceResult | null }) {
  if (!result) return null
  if (result.hits.length === 0) {
    return <p className="text-xs text-(--ui-text-tertiary)">没有发现违禁词</p>
  }
  return (
    <ul className="flex flex-col gap-0.5">
      {result.hits.map(hit => (
        <li
          key={`${hit.word}-${hit.level}`}
          className={hit.level === 'must' ? 'text-xs text-destructive' : 'text-xs text-(--ui-text-tertiary)'}
        >
          {hit.word}
          {hit.level === 'must' ? ' · 必须修改' : ' · 提醒'}
          {hit.suggestion ? `，可改成「${hit.suggestion}」` : ''}
        </li>
      ))}
    </ul>
  )
}

export function FileDrop({
  label,
  files,
  onFiles
}: {
  label: string
  files?: File[]
  onFiles: (files: File[]) => void
}) {
  return (
    <label
      className="flex cursor-pointer flex-col gap-1 rounded-md border border-dashed border-(--ui-stroke-secondary) bg-(--ui-bg-secondary) p-3 text-xs text-(--ui-text-tertiary)"
      onDragOver={event => event.preventDefault()}
      onDrop={event => {
        event.preventDefault()
        const next = Array.from(event.dataTransfer.files)
        if (next.length > 0) onFiles(next)
      }}
    >
      {label}
      {files && files.length > 0 ? <span>已选 {files.length} 个文件</span> : <span>或点击选择文件</span>}
      <input
        type="file"
        multiple
        className="hidden"
        aria-label={label}
        onChange={event => {
          const next = Array.from(event.target.files ?? [])
          if (next.length > 0) onFiles(next)
          event.target.value = ''
        }}
      />
    </label>
  )
}
