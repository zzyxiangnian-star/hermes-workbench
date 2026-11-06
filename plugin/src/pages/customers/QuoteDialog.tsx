import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Streamdown,
  Textarea
} from '@hermes/plugin-sdk'
import type { ProductCard } from '../../api/brand'
import { createQuote, getQuoteDocument, type InquiryDetail } from '../../api/customers'
import { copyText, errorText, formatMoney, loadActor, saveActor, shanghaiDate } from './labels'

interface DraftLine {
  key: number
  product_code: string
  name: string
  quantity: string
  unit_price: string
  note: string
}

const MARKDOWN_CLASS =
  'min-w-0 overflow-x-auto text-sm leading-relaxed text-(--ui-text-primary) [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-sm [&_h2]:font-medium [&_li]:my-0.5 [&_p]:my-1 [&_strong]:font-semibold [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-(--ui-stroke-secondary) [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-(--ui-stroke-secondary) [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-4'

function tmallPrice(card: ProductCard | undefined): number | null {
  const listing = card?.listings.find(item => item.platform === 'tmall')
  return listing ? listing.price : null
}

function lineAmount(line: DraftLine): number {
  const quantity = Number(line.quantity)
  const price = Number(line.unit_price)
  if (!Number.isFinite(quantity) || !Number.isFinite(price)) return 0
  return Math.round(quantity * price * 100) / 100
}

export function QuoteDialog({
  open,
  inquiry,
  cards,
  quoteId,
  onClose,
  onCreated
}: {
  open: boolean
  inquiry: InquiryDetail | null
  cards: ProductCard[]
  quoteId: number | null
  onClose: () => void
  onCreated: () => void
}) {
  const [lines, setLines] = useState<DraftLine[]>([])
  const [validUntil, setValidUntil] = useState(shanghaiDate(15))
  const [terms, setTerms] = useState('')
  const [actor, setActor] = useState(loadActor)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [number, setNumber] = useState<string | null>(null)
  const [copyHint, setCopyHint] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setCopyHint(null)
    setActor(loadActor())
    setMarkdown(null)
    setNumber(null)
    setValidUntil(shanghaiDate(15))
    setTerms('')
    setLines([{ key: 1, product_code: '', name: '', quantity: '1', unit_price: '', note: '' }])
    if (quoteId == null) return
    let cancelled = false
    setBusy(true)
    getQuoteDocument(quoteId).then(
      doc => {
        if (cancelled) return
        setMarkdown(doc.markdown)
        setNumber(doc.number)
        setBusy(false)
      },
      (reason: unknown) => {
        if (cancelled) return
        setError(errorText(reason, '报价单加载失败'))
        setBusy(false)
      }
    )
    return () => {
      cancelled = true
    }
  }, [open, quoteId])

  const total = useMemo(() => lines.reduce((sum, line) => sum + lineAmount(line), 0), [lines])

  const update = (key: number, patch: Partial<DraftLine>) => {
    setLines(current => current.map(line => (line.key === key ? { ...line, ...patch } : line)))
  }

  const fillFromCard = (code: string) => {
    const card = cards.find(item => item.product_code === code)
    const price = tmallPrice(card)
    setLines(current => [
      ...current.filter(line => line.name.trim() || line.product_code.trim()),
      {
        key: Date.now(),
        product_code: code,
        name: card?.name ?? '',
        quantity: '1',
        unit_price: price == null ? '' : String(price),
        note: ''
      }
    ])
  }

  const submit = async () => {
    if (inquiry == null) return
    const items = lines
      .map(line => ({
        product_code: line.product_code.trim() || null,
        name: line.name.trim(),
        quantity: Number(line.quantity),
        unit_price: Number(line.unit_price),
        note: line.note.trim() || null
      }))
      .filter(item => item.name)
    if (items.length === 0) {
      setError('请至少填一行商品')
      return
    }
    if (items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isFinite(item.unit_price) || item.unit_price < 0)) {
      setError('数量要是正整数，单价不能为负')
      return
    }
    setBusy(true)
    setError(null)
    saveActor(actor)
    try {
      const quote = await createQuote(inquiry.id, {
        items,
        valid_until: validUntil || null,
        terms: terms.trim() || null,
        by: actor.trim() || null
      })
      const doc = await getQuoteDocument(quote.id)
      setMarkdown(doc.markdown)
      setNumber(doc.number)
      onCreated()
    } catch (reason) {
      setError(errorText(reason, '报价失败'))
    } finally {
      setBusy(false)
    }
  }

  const copyDoc = async () => {
    if (!markdown) return
    const ok = await copyText(markdown)
    setCopyHint(ok ? '报价单已复制' : '复制失败，请手动选择下面的文字')
  }

  return (
    <Dialog open={open} onOpenChange={value => { if (!value) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{number ? `报价单 ${number}` : '出报价单'}</DialogTitle>
        </DialogHeader>
        <style>{PRINT_STYLE}</style>
        {markdown ? (
          <div className="flex flex-col gap-2">
            <div data-quote-print className={MARKDOWN_CLASS}>
              <Streamdown mode="static" controls={false} parseIncompleteMarkdown={false}>
                {markdown}
              </Streamdown>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="xs" variant="outline" onClick={() => void copyDoc()}>
                复制
              </Button>
              <Button size="xs" variant="outline" onClick={() => window.print()}>
                打印
              </Button>
            </div>
            {copyHint ? <p className="text-xs text-(--ui-text-secondary)">{copyHint}</p> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-(--ui-text-secondary)">署名</span>
              <Input aria-label="署名" value={actor} onChange={event => setActor(event.target.value)} style={{ width: '7rem' }} />
            </div>
            {inquiry && inquiry.product_codes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs text-(--ui-text-tertiary)">从询盘带入</span>
                {inquiry.product_codes.map(code => (
                  <Button key={code} size="xs" variant="outline" onClick={() => fillFromCard(code)}>
                    {code}
                  </Button>
                ))}
              </div>
            ) : null}
            <ul className="flex flex-col gap-2">
              {lines.map(line => (
                <li key={line.key} className="grid grid-cols-2 gap-2 rounded-md border border-(--ui-stroke-secondary) p-2">
                  <Input aria-label="商品编码" placeholder="商品编码" value={line.product_code} onChange={event => update(line.key, { product_code: event.target.value })} />
                  <Input aria-label="商品名称" placeholder="商品名称" value={line.name} onChange={event => update(line.key, { name: event.target.value })} />
                  <Input aria-label="数量" placeholder="数量" value={line.quantity} onChange={event => update(line.key, { quantity: event.target.value })} />
                  <Input aria-label="单价" placeholder="单价" value={line.unit_price} onChange={event => update(line.key, { unit_price: event.target.value })} />
                  <Input aria-label="行备注" placeholder="备注" value={line.note} onChange={event => update(line.key, { note: event.target.value })} />
                  <div className="flex items-center justify-between gap-2 text-xs text-(--ui-text-secondary)">
                    <span>{formatMoney(lineAmount(line))} 元</span>
                    <Button size="xs" variant="ghost" onClick={() => setLines(current => current.filter(item => item.key !== line.key))}>
                      删除
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div>
              <Button
                size="xs"
                variant="outline"
                onClick={() =>
                  setLines(current => [
                    ...current,
                    { key: Date.now(), product_code: '', name: '', quantity: '1', unit_price: '', note: '' }
                  ])
                }
              >
                加一行
              </Button>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
                有效期
                <Input aria-label="有效期" type="date" value={validUntil} onChange={event => setValidUntil(event.target.value)} />
              </label>
              <span className="text-sm font-medium">合计 {formatMoney(total)} 元</span>
            </div>
            <Textarea aria-label="说明" placeholder="说明" value={terms} onChange={event => setTerms(event.target.value)} />
          </div>
        )}
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            关闭
          </Button>
          {markdown ? null : (
            <Button size="sm" disabled={busy} onClick={() => void submit()}>
              {busy ? '正在提交' : '生成报价单'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  [data-quote-print], [data-quote-print] * { visibility: visible !important; }
  [data-quote-print] { position: absolute; left: 0; top: 0; width: 100%; }
}
`
