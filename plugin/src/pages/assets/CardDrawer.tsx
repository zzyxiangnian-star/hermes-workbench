import { useEffect, useState } from 'react'
import { Button, Input, Switch, Textarea } from '@hermes/plugin-sdk'
import {
  createProductCard,
  patchProductCard,
  type FaqItem,
  type ProductCard
} from '../../api/brand'
import { formatAmount, platformMark, platformName } from '../products/labels'
import { SideDrawer } from '../products/Drawer'

export function CardDrawer({
  open,
  card,
  creating,
  onClose,
  onSaved
}: {
  open: boolean
  card: ProductCard | null
  creating: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const [code, setCode] = useState('')
  const [brand, setBrand] = useState('')
  const [name, setName] = useState('')
  const [points, setPoints] = useState<string[]>([''])
  const [specs, setSpecs] = useState('')
  const [faq, setFaq] = useState<FaqItem[]>([])
  const [install, setInstall] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setCode(card?.product_code ?? '')
    setBrand(card?.brand ?? '')
    setName(card?.name ?? '')
    setPoints(card?.selling_points.length ? card.selling_points : [''])
    setSpecs(card?.specs ?? '')
    setFaq(card?.faq ?? [])
    setInstall(card?.install_required ?? false)
    setNotes(card?.notes ?? '')
    setError(null)
  }, [open, card])

  const save = async () => {
    if (!name.trim() || !brand.trim() || (creating && !code.trim())) {
      setError(creating ? '编码、名称和品牌都要填' : '名称和品牌都要填')
      return
    }
    const body = {
      brand: brand.trim(),
      name: name.trim(),
      selling_points: points.map(item => item.trim()).filter(Boolean),
      specs: specs.trim() || null,
      faq: faq.filter(item => item.q.trim() || item.a.trim()).map(item => ({ q: item.q.trim(), a: item.a.trim() })),
      install_required: install,
      notes: notes.trim() || null
    }
    setSaving(true)
    setError(null)
    try {
      if (creating) await createProductCard({ ...body, product_code: code.trim() })
      else if (card) await patchProductCard(card.id, body)
      onSaved()
      onClose()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SideDrawer
      open={open}
      title={creating ? '新建资料卡' : card?.name ?? '资料卡'}
      description={creating ? '编码保存后不能改' : card?.product_code}
      onClose={onClose}
      widthClass="max-w-lg"
      footer={
        <Button size="sm" disabled={saving} onClick={() => void save()}>
          保存
        </Button>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
          编码
          <Input aria-label="商品编码" value={code} disabled={!creating} onChange={event => setCode(event.target.value)} />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input aria-label="资料卡名称" placeholder="名称" value={name} onChange={event => setName(event.target.value)} />
          <Input aria-label="资料卡品牌" placeholder="品牌" value={brand} onChange={event => setBrand(event.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-xs text-(--ui-text-secondary)">卖点</div>
          {points.map((point, index) => (
            <div key={index} className="flex gap-2">
              <Input
                aria-label={`卖点 ${index + 1}`}
                value={point}
                onChange={event => setPoints(current => current.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
              />
              <Button size="xs" variant="ghost" onClick={() => setPoints(current => current.filter((_, itemIndex) => itemIndex !== index))}>
                删除
              </Button>
            </div>
          ))}
          <Button size="xs" variant="outline" onClick={() => setPoints(current => [...current, ''])}>
            加一条卖点
          </Button>
        </div>
        <Textarea aria-label="参数" placeholder="参数" value={specs} onChange={event => setSpecs(event.target.value)} />
        <div className="flex flex-col gap-1">
          <div className="text-xs text-(--ui-text-secondary)">常见问题</div>
          {faq.map((item, index) => (
            <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
              <Input
                aria-label={`问题 ${index + 1}`}
                placeholder="问"
                value={item.q}
                onChange={event => setFaq(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, q: event.target.value } : row)))}
              />
              <Input
                aria-label={`回答 ${index + 1}`}
                placeholder="答"
                value={item.a}
                onChange={event => setFaq(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, a: event.target.value } : row)))}
              />
              <Button size="xs" variant="ghost" onClick={() => setFaq(current => current.filter((_, rowIndex) => rowIndex !== index))}>
                删除
              </Button>
            </div>
          ))}
          <Button size="xs" variant="outline" onClick={() => setFaq(current => [...current, { q: '', a: '' }])}>
            加一组问答
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>需要安装</span>
          <Switch checked={install} onCheckedChange={setInstall} aria-label="需要安装" />
        </div>
        <Textarea aria-label="备注" placeholder="备注" value={notes} onChange={event => setNotes(event.target.value)} />
        {card && !creating ? (
          <div>
            <div className="mb-1 text-xs text-(--ui-text-secondary)">各店铺在售</div>
            {card.listings.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有店铺在卖这个编码。</p>
            ) : (
              <ul>
                {card.listings.map(listing => (
                  <li key={`${listing.shop_id}-${listing.sku}`} className="grid grid-cols-[minmax(0,1.4fr)_4rem_3rem_minmax(0,1fr)] gap-2 border-b border-(--ui-stroke-secondary) py-1.5 text-xs">
                    <span className="flex min-w-0 items-center gap-1 truncate">
                      <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-(--ui-stroke-secondary) text-[0.625rem]">
                        {platformMark(listing.platform)}
                      </span>
                      {platformName(listing.platform)} · {listing.shop_name}
                    </span>
                    <span className="tabular-nums">{formatAmount(listing.price)}</span>
                    <span className="tabular-nums">{listing.stock}</span>
                    <span className="truncate text-(--ui-text-secondary)">{listing.activity || '—'}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </SideDrawer>
  )
}
