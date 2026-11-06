import { useEffect, useRef, useState } from 'react'
import { Badge, Button, ErrorState, Input, Loader, Textarea } from '@hermes/plugin-sdk'
import type { ProductCard } from '../../api/brand'
import { isOfflineError } from '../../api/client'
import {
  addInquiryNote,
  getInquiry,
  getInquiryProducts,
  setInquiryStatus,
  type InquiryDetail,
  type InquiryProducts,
  type InquiryStatus
} from '../../api/customers'
import { refreshOpenInquiryCount } from '../../api/inquiry-count'
import { platformName } from '../products/labels'
import { QuoteDialog } from './QuoteDialog'
import {
  channelLabel,
  errorText,
  formatMoney,
  formatShanghai,
  inquiryStatusLabel,
  inquiryStatusVariant,
  loadActor,
  saveActor
} from './labels'

export function InquiryView({ id, onBack }: { id: number; onBack: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [detail, setDetail] = useState<InquiryDetail | null>(null)
  const [products, setProducts] = useState<InquiryProducts | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [narrow, setNarrow] = useState(false)
  const [sideWidth, setSideWidth] = useState(300)
  const [actor, setActor] = useState(loadActor)
  const [note, setNote] = useState('')
  const [lostReason, setLostReason] = useState('')
  const [losing, setLosing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [viewQuoteId, setViewQuoteId] = useState<number | null>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width ?? 0
      setNarrow(width < 640)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [detail])

  useEffect(() => {
    let cancelled = false
    setError(null)
    setActionError(null)
    setLosing(false)
    Promise.all([getInquiry(id), getInquiryProducts(id)]).then(
      ([next, side]) => {
        if (cancelled) return
        setDetail(next)
        setProducts(side)
      },
      (reason: unknown) => {
        if (!cancelled) setError(reason)
      }
    )
    return () => {
      cancelled = true
    }
  }, [id, revision])

  const reload = () => setRevision(value => value + 1)

  const runStatus = async (status: InquiryStatus, reason?: string) => {
    setBusy(true)
    setActionError(null)
    saveActor(actor)
    try {
      const next = await setInquiryStatus(id, { status, by: actor.trim() || null, reason: reason ?? null })
      setDetail(next)
      setLosing(false)
      setLostReason('')
      void refreshOpenInquiryCount()
    } catch (reasonError) {
      setActionError(errorText(reasonError, '操作失败'))
    } finally {
      setBusy(false)
    }
  }

  const submitLost = () => {
    if (!lostReason.trim()) {
      setActionError('请填写丢单原因')
      return
    }
    void runStatus('lost', lostReason.trim())
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <ErrorState
          title={isOfflineError(error) ? '没有连上工作台服务' : '询盘加载失败'}
          description={errorText(error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={onBack}>
            返回
          </Button>
          <Button size="sm" variant="outline" onClick={reload}>
            重试
          </Button>
        </ErrorState>
      </div>
    )
  }

  if (!detail) {
    return (
      <div ref={root} className="flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取询盘
      </div>
    )
  }

  const status = detail.status
  const canReply = status === 'new' || status === 'quoted' || status === 'lost'
  const canQuote = status === 'new' || status === 'replied' || status === 'quoted'
  const canWin = status === 'new' || status === 'replied' || status === 'quoted'
  const canLose = status === 'new' || status === 'replied' || status === 'quoted'

  return (
    <div ref={root} className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs" variant="outline" onClick={onBack}>
          返回
        </Button>
        <h2 className="min-w-0 text-sm font-medium">{detail.company || detail.contact || '询盘'}</h2>
        <Badge variant={inquiryStatusVariant(status)}>{inquiryStatusLabel(status)}</Badge>
        {detail.stale ? <Badge variant="warn">超过 7 天未跟进</Badge> : null}
        <span className="text-xs text-(--ui-text-tertiary)">
          {channelLabel(detail.channel)} · {detail.assignee || '未指定负责人'}
        </span>
      </div>

      <div className={narrow ? 'flex min-w-0 flex-col gap-3' : 'flex min-w-0 items-start gap-0'}>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">询盘原文</h3>
            <p className="text-xs leading-relaxed whitespace-pre-wrap text-(--ui-text-secondary)">{detail.content}</p>
            <p className="text-xs text-(--ui-text-tertiary)">
              {detail.contact || '未留联系人'}
              {detail.phone ? ` · ${detail.phone}` : ''}
              {detail.product_codes.length > 0 ? ` · ${detail.product_codes.join('、')}` : ''}
            </p>
          </section>
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">备注</h3>
            {detail.note ? <p className="text-xs leading-relaxed whitespace-pre-wrap text-(--ui-text-secondary)">{detail.note}</p> : null}
            {detail.lost_reason ? <p className="text-xs text-destructive">丢单原因：{detail.lost_reason}</p> : null}
          </section>
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">报价单</h3>
            {detail.quotes.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有报价单。</p>
            ) : (
              <ul>
                {detail.quotes.map(quote => (
                  <li key={quote.id} className="flex flex-wrap items-center gap-2 border-b border-(--ui-stroke-secondary) py-1.5 text-xs">
                    <span>{quote.number}</span>
                    <span className="text-(--ui-text-secondary)">{formatMoney(quote.total)} 元</span>
                    <span className="text-(--ui-text-tertiary)">有效期 {quote.valid_until || '—'}</span>
                    <Button size="xs" variant="outline" onClick={() => setViewQuoteId(quote.id)}>
                      查看
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">处理记录</h3>
            {detail.events.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有处理记录。</p>
            ) : (
              <ul>
                {detail.events.map((event, index) => (
                  <li key={`${event.at}-${index}`} className="border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)">
                    {formatShanghai(event.at)} · {event.by || '有人'} · {event.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        {narrow ? null : (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="拖动调整资料栏宽度"
            className="mx-2 w-1 shrink-0 cursor-col-resize self-stretch bg-(--ui-stroke-secondary)"
            onPointerDown={event => {
              const startX = event.clientX
              const startW = sideWidth
              const move = (ev: PointerEvent) => {
                setSideWidth(Math.min(480, Math.max(200, startW - (ev.clientX - startX))))
              }
              const up = () => {
                window.removeEventListener('pointermove', move)
                window.removeEventListener('pointerup', up)
              }
              window.addEventListener('pointermove', move)
              window.addEventListener('pointerup', up)
            }}
          />
        )}
        <aside className="min-w-0" style={narrow ? undefined : { width: sideWidth }}>
          <ProductSide products={products} />
        </aside>
      </div>

      <div className="flex flex-col gap-2 border-t border-(--ui-stroke-secondary) pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-(--ui-text-secondary)">署名</span>
          <Input aria-label="署名" value={actor} onChange={event => setActor(event.target.value)} style={{ width: '7rem' }} />
        </div>
        <div className="flex flex-wrap gap-2">
          {canReply ? (
            <Button size="xs" disabled={busy} onClick={() => void runStatus('replied')}>
              已回复
            </Button>
          ) : null}
          {canQuote ? (
            <Button size="xs" variant="outline" disabled={busy} onClick={() => setQuoting(true)}>
              出报价单
            </Button>
          ) : null}
          {canWin ? (
            <Button size="xs" variant="outline" disabled={busy} onClick={() => void runStatus('won')}>
              成交
            </Button>
          ) : null}
          {canLose ? (
            <Button size="xs" variant="outline" disabled={busy} onClick={() => setLosing(true)}>
              丢单
            </Button>
          ) : null}
        </div>
        {losing ? (
          <div className="flex flex-col gap-2">
            <Textarea aria-label="丢单原因" placeholder="丢单原因" value={lostReason} onChange={event => setLostReason(event.target.value)} />
            <div className="flex gap-2">
              <Button size="xs" disabled={busy} onClick={submitLost}>
                确认丢单
              </Button>
              <Button size="xs" variant="outline" onClick={() => setLosing(false)}>
                取消
              </Button>
            </div>
          </div>
        ) : null}
        <Textarea aria-label="追加备注" placeholder="追加一条备注" value={note} onChange={event => setNote(event.target.value)} />
        <div>
          <Button
            size="xs"
            variant="outline"
            disabled={busy || !note.trim()}
            onClick={() => {
              setBusy(true)
              setActionError(null)
              saveActor(actor)
              void addInquiryNote(id, note.trim(), actor.trim() || null)
                .then(next => {
                  setDetail(next)
                  setNote('')
                })
                .catch((reason: unknown) => setActionError(errorText(reason, '备注失败')))
                .finally(() => setBusy(false))
            }}
          >
            加备注
          </Button>
        </div>
        {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
      </div>

      <QuoteDialog
        open={quoting || viewQuoteId != null}
        inquiry={detail}
        cards={products?.cards ?? []}
        quoteId={viewQuoteId}
        onClose={() => {
          setQuoting(false)
          setViewQuoteId(null)
        }}
        onCreated={reload}
      />
    </div>
  )
}

function ProductSide({ products }: { products: InquiryProducts | null }) {
  if (!products) {
    return <p className="text-xs text-(--ui-text-tertiary)">正在读取资料卡</p>
  }
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium">资料</h3>
      {products.missing.map(item => (
        <p key={item.product_code} className="text-xs text-(--ui-text-secondary)">
          {item.product_code}：还没有资料卡
          {item.listed ? '（店铺里有这个商品）' : ''}
        </p>
      ))}
      {products.cards.length === 0 && products.missing.length === 0 ? (
        <p className="text-xs text-(--ui-text-tertiary)">这条询盘没有商品编码。</p>
      ) : null}
      {products.cards.map(card => (
        <ProductCardBlock key={card.id} card={card} />
      ))}
    </div>
  )
}

function ProductCardBlock({ card }: { card: ProductCard }) {
  return (
    <section className="flex flex-col gap-1 border-b border-(--ui-stroke-secondary) pb-2 text-xs">
      <p className="font-medium">
        {card.product_code} · {card.name}
      </p>
      {card.selling_points.length > 0 ? (
        <ul className="list-disc pl-4 text-(--ui-text-secondary)">
          {card.selling_points.map(point => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
      {card.specs ? <p className="whitespace-pre-wrap text-(--ui-text-secondary)">{card.specs}</p> : null}
      {card.faq.map(item => (
        <p key={item.q} className="text-(--ui-text-secondary)">
          <span className="text-(--ui-text-primary)">{item.q}</span> {item.a}
        </p>
      ))}
      {card.listings.map(listing => (
        <p key={`${listing.shop_id}-${listing.sku}`} className="text-(--ui-text-tertiary)">
          {listing.shop_name} · {platformName(listing.platform)} · {formatMoney(listing.price)} 元 · 库存 {listing.stock}
        </p>
      ))}
    </section>
  )
}
