import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  ErrorState,
  Input,
  Loader,
  Textarea
} from '@hermes/plugin-sdk'
import { listBrandGuides, listCampaigns, listProductCards, type ProductCard } from '../../api/brand'
import { ApiError, isOfflineError } from '../../api/client'
import {
  addDesignComment,
  assetDownloadUrl,
  assetSrc,
  finalizeDesign,
  getDesignRequest,
  resolveDesignComment,
  setDesignStatus,
  uploadRequestAsset,
  type DesignAsset,
  type DesignRequestDetail
} from '../../api/design'
import { refreshDesignNeedsActionCount } from '../../api/design-count'
import { useQuery } from '../../api/useQuery'
import { AssetGrid } from './AssetGrid'
import { ComplianceHint, RequestDialog } from './RequestDialog'
import { PinLayer } from './PinLayer'
import {
  errorText,
  formatDue,
  formatShanghai,
  isImage,
  kindLabel,
  loadActor,
  saveActor,
  statusLabel,
  statusVariant
} from './labels'

export function ReviewView({ id, onBack }: { id: number; onBack: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const candidateInput = useRef<HTMLInputElement>(null)
  const referenceInput = useRef<HTMLInputElement>(null)
  const [revision, setRevision] = useState(0)
  const query = useQuery(() => getDesignRequest(id), [id, revision])
  const detail = query.data ?? null
  const guides = useQuery(() => listBrandGuides(), [])
  const campaigns = useQuery(() => listCampaigns(), [])
  const productCode = detail?.product_code ?? ''
  const cards = useQuery(
    () => (productCode ? listProductCards({ q: productCode }) : Promise.resolve([] as ProductCard[])),
    [productCode]
  )
  const [narrow, setNarrow] = useState(false)
  const [sideWidth, setSideWidth] = useState(280)
  const [actor, setActor] = useState(loadActor)
  const [round, setRound] = useState<number | null>(null)
  const [selected, setSelected] = useState<number[]>([])
  const [compare, setCompare] = useState(false)
  const [focusId, setFocusId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [finalizeHint, setFinalizeHint] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [returning, setReturning] = useState(false)
  const [returnNote, setReturnNote] = useState('')
  const [returnError, setReturnError] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new ResizeObserver(entries => {
      setNarrow((entries[0]?.contentRect.width ?? 0) < 720)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [detail])

  const seenRound = useRef<number | null>(null)
  useEffect(() => {
    if (!detail) return
    if (seenRound.current == null || detail.round !== seenRound.current) {
      setRound(detail.round)
      seenRound.current = detail.round
    }
  }, [detail])

  const reload = () => setRevision(value => value + 1)
  const card = cards.data?.find(item => item.product_code === productCode) ?? null
  const currentRound = round ?? detail?.round ?? 1
  const roundNumbers = detail
    ? [...new Set(detail.candidates.map(item => item.round ?? 1))].sort((a, b) => a - b)
    : []
  const roundAssets = detail?.candidates.filter(item => (item.round ?? 1) === currentRound) ?? []
  const focused =
    detail?.candidates.find(item => item.id === focusId) ??
    detail?.finals.find(item => item.id === focusId) ??
    null
  const compared = detail?.candidates.filter(item => selected.includes(item.id)) ?? []

  const apply = async (task: () => Promise<unknown>) => {
    setBusy(true)
    setActionError(null)
    try {
      await task()
      reload()
      await refreshDesignNeedsActionCount()
    } finally {
      setBusy(false)
    }
  }

  const toggle = (assetId: number, on: boolean) => {
    setFinalizeHint(null)
    setSelected(current => {
      if (!on) return current.filter(item => item !== assetId)
      if (current.includes(assetId) || current.length >= 4) return current
      return [...current, assetId]
    })
    if (on && selected.length >= 4) setActionError('最多并排对比 4 张')
  }

  const uploadFiles = async (files: File[], role: 'reference' | 'candidate') => {
    if (files.length === 0) return
    setBusy(true)
    setActionError(null)
    try {
      for (const file of files) {
        await uploadRequestAsset(id, file, role, actor.trim() || null)
      }
    } catch (reason) {
      setActionError(errorText(reason, role === 'reference' ? '参考图没有传上去' : '候选稿没有传上去'))
    } finally {
      setBusy(false)
      reload()
      await refreshDesignNeedsActionCount()
    }
  }

  const accept = () => apply(() => setDesignStatus(id, { status: 'in_progress', by: actor.trim() || '设计师' }))

  const sendBack = async () => {
    if (!returnNote.trim()) {
      setReturnError('请填写要改什么')
      return
    }
    setReturnError(null)
    try {
      await apply(() =>
        setDesignStatus(id, { status: 'in_progress', by: actor.trim() || null, note: returnNote.trim() })
      )
      setReturning(false)
      setReturnNote('')
      setSelected([])
      setCompare(false)
    } catch (reason) {
      setReturnError(errorText(reason, '没有退回'))
    }
  }

  const finalize = async () => {
    if (selected.length === 0) {
      setFinalizeHint('请先勾选候选稿')
      return
    }
    setFinalizeHint(null)
    try {
      await apply(() => finalizeDesign(id, selected, actor.trim() || null))
      setCompare(false)
      setFocusId(null)
    } catch (reason) {
      if (reason instanceof ApiError && reason.code === 'compliance_failed') setFinalizeHint(reason.message)
      else setActionError(errorText(reason, '定稿失败'))
    }
  }

  if (query.error && !detail) {
    return (
      <div className="flex flex-1 items-center justify-center py-10">
        <ErrorState
          title={isOfflineError(query.error) ? '没有连上工作台服务' : '需求单加载失败'}
          description={errorText(query.error, '请重试')}
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
      <div className="flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)">
        <Loader />
        正在读取需求单
      </div>
    )
  }

  const closed = detail.status === 'done' || detail.status === 'cancelled'
  const imageComments = focused ? detail.comments.filter(item => item.asset_id === focused.id) : []

  return (
    <div ref={root} className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="ghost" onClick={onBack}>
          返回
        </Button>
        <h2 className="min-w-0 truncate text-sm font-medium">{detail.title}</h2>
        <Badge variant={statusVariant(detail.status)}>{statusLabel(detail.status)}</Badge>
        <span className="text-xs text-(--ui-text-tertiary)">第 {detail.round} 轮</span>
      </div>

      <div className={narrow ? 'flex min-w-0 flex-col gap-4' : 'flex min-w-0 items-start'}>
        <aside className="flex min-w-0 flex-col gap-3" style={narrow ? undefined : { width: sideWidth }}>
          <InfoBlock detail={detail} card={card} />
          <section className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-medium">参考图</h3>
              {closed ? null : (
                <Button size="xs" variant="outline" disabled={busy} onClick={() => referenceInput.current?.click()}>
                  添加参考图
                </Button>
              )}
            </div>
            <AssetGrid assets={detail.references} empty="还没有参考图" />
            <input
              ref={referenceInput}
              type="file"
              multiple
              aria-label="添加参考图"
              className="absolute h-px w-px opacity-0"
              onChange={event => {
                const files = Array.from(event.target.files ?? [])
                event.target.value = ''
                void uploadFiles(files, 'reference')
              }}
            />
          </section>
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">记录</h3>
            {detail.events.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有记录。</p>
            ) : (
              <ul>
                {detail.events.map((event, index) => (
                  <li
                    key={`${event.at}-${index}`}
                    className="border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-tertiary)"
                  >
                    {formatShanghai(event.at)} · {event.by || '有人'} · {event.text}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
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
                setSideWidth(Math.min(480, Math.max(220, startW + (ev.clientX - startX))))
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
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          {detail.status === 'done' ? (
            <FinalStrip assets={detail.finals} />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {roundNumbers.map(item => (
                  <Button
                    key={item}
                    size="xs"
                    variant={item === currentRound ? 'default' : 'outline'}
                    onClick={() => {
                      setRound(item)
                      setCompare(false)
                    }}
                  >
                    第 {item} 轮
                  </Button>
                ))}
                <Button
                  size="xs"
                  variant="outline"
                  disabled={selected.length < 2 || selected.length > 4}
                  onClick={() => setCompare(true)}
                >
                  并排对比
                </Button>
              </div>
              {roundAssets.length === 0 ? (
                <p className="text-xs text-(--ui-text-tertiary)">这一轮还没有候选稿。</p>
              ) : (
                <ul className="flex gap-2 overflow-x-auto">
                  {roundAssets.map(asset => (
                    <li key={asset.id} className="flex w-28 shrink-0 flex-col gap-1">
                      <Checkbox
                        checked={selected.includes(asset.id)}
                        aria-label={`勾选 ${asset.label || asset.file_name}`}
                        onCheckedChange={on => toggle(asset.id, on)}
                      />
                      <button
                        type="button"
                        className="flex flex-col gap-1 text-left"
                        onClick={() => {
                          setFocusId(asset.id)
                          setCompare(false)
                        }}
                      >
                        <span className="flex h-24 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)">
                          {isImage(asset.mime) ? (
                            <img src={assetSrc(asset.url)} alt="" className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs text-(--ui-text-tertiary)">{asset.mime}</span>
                          )}
                        </span>
                        <span className="truncate text-xs">
                          {asset.label || '未编号'} {asset.width && asset.height ? `${asset.width}×${asset.height}` : ''}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {compare && compared.length >= 2 ? (
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${compared.length}, minmax(0, 1fr))` }}
                >
                  {compared.map(asset => (
                    <button
                      key={asset.id}
                      type="button"
                      className="flex min-w-0 flex-col gap-1 text-left"
                      onClick={() => {
                        setFocusId(asset.id)
                        setCompare(false)
                      }}
                    >
                      <span className="flex h-64 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)">
                        {isImage(asset.mime) ? (
                          <img src={assetSrc(asset.url)} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs">{asset.file_name}</span>
                        )}
                      </span>
                      <span className="text-xs">
                        {asset.label || '未编号'}
                        {asset.source === 'ai' ? ' · AI 生成' : ''}
                        {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              ) : focused ? (
                <div className={narrow ? 'flex flex-col gap-3' : 'flex min-w-0 items-start gap-3'}>
                  <div className="min-w-0 flex-1">
                    <PinLayer
                      asset={focused}
                      comments={detail.comments}
                      disabled={detail.status === 'cancelled'}
                      onAdd={async (x, y, body) => {
                        await addDesignComment(id, {
                          body,
                          asset_id: focused.id,
                          x,
                          y,
                          author: actor.trim() || null
                        })
                        reload()
                        await refreshDesignNeedsActionCount()
                      }}
                      onResolve={async commentId => {
                        await resolveDesignComment(commentId, true)
                        reload()
                        await refreshDesignNeedsActionCount()
                      }}
                    />
                    {focused.source === 'ai' && focused.prompt ? (
                      <details className="mt-2 text-xs">
                        <summary>提示词</summary>
                        <p className="mt-1 whitespace-pre-wrap text-(--ui-text-tertiary)">{focused.prompt}</p>
                      </details>
                    ) : null}
                  </div>
                  <aside className={narrow ? 'min-w-0' : 'w-52 shrink-0'}>
                    <h3 className="mb-1 text-xs font-medium">这张图的批注</h3>
                    {imageComments.length === 0 ? (
                      <p className="text-xs text-(--ui-text-tertiary)">点大图可以写批注。</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {imageComments.map(item => (
                          <li key={item.id} className="rounded-md border border-(--ui-stroke-secondary) p-2 text-xs">
                            <p>{item.body}</p>
                            <p className="mt-1 text-(--ui-text-tertiary)">
                              {item.author || '有人'}
                              {item.resolved ? ' · 已解决' : ''}
                            </p>
                            {item.resolved ? null : (
                              <Button
                                size="xs"
                                variant="outline"
                                className="mt-1"
                                onClick={() =>
                                  void resolveDesignComment(item.id, true).then(() => {
                                    reload()
                                    void refreshDesignNeedsActionCount()
                                  })
                                }
                              >
                                标已解决
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </aside>
                </div>
              ) : (
                <p className="text-xs text-(--ui-text-tertiary)">点一张候选稿看大图，勾选 2 到 4 张可以并排对比。</p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-(--ui-stroke-secondary) pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-(--ui-text-secondary)">署名</span>
          <Input
            aria-label="署名"
            value={actor}
            style={{ width: '7rem' }}
            onChange={event => {
              setActor(event.target.value)
              saveActor(event.target.value)
            }}
          />
          {closed ? null : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              编辑
            </Button>
          )}
          {detail.status === 'open' ? (
            <Button size="sm" disabled={busy} onClick={() => void accept().catch((reason: unknown) => setActionError(errorText(reason, '没有接单')))}>
              接单
            </Button>
          ) : null}
          {detail.status === 'in_progress' || detail.status === 'reviewing' ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => candidateInput.current?.click()}>
              上传候选稿
            </Button>
          ) : null}
          {detail.status === 'reviewing' ? (
            <>
              <Button size="sm" disabled={busy} onClick={() => void finalize()}>
                定稿
              </Button>
              {finalizeHint ? <span className="text-xs text-destructive">{finalizeHint}</span> : null}
              <Button size="sm" variant="outline" disabled={busy} onClick={() => setReturning(true)}>
                退回修改
              </Button>
            </>
          ) : null}
          {detail.status === 'cancelled' || detail.status === 'done' ? null : (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setCanceling(true)}>
              取消
            </Button>
          )}
        </div>
        {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
        <input
          ref={candidateInput}
          type="file"
          multiple
          aria-label="上传候选稿"
          className="absolute h-px w-px opacity-0"
          onChange={event => {
            const files = Array.from(event.target.files ?? [])
            event.target.value = ''
            void uploadFiles(files, 'candidate')
          }}
        />
      </div>

      {editing ? (
        <RequestDialog
          open
          brands={(guides.data ?? []).map(item => item.brand)}
          campaigns={campaigns.data ?? []}
          initial={detail}
          onOpenChange={setEditing}
          onSaved={() => {
            setEditing(false)
            reload()
          }}
        />
      ) : null}
      {returning ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="关闭浮层" className="absolute inset-0 bg-black/22" onClick={() => setReturning(false)} />
          <div role="dialog" className="relative z-10 flex w-full max-w-md flex-col gap-2 rounded-lg border border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) p-4">
            <h2 className="text-sm font-medium">退回修改</h2>
            <Textarea
              aria-label="要改什么"
              rows={3}
              value={returnNote}
              placeholder="写明要改什么"
              onChange={event => setReturnNote(event.target.value)}
            />
            {returnError ? <p className="text-xs text-destructive">{returnError}</p> : null}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setReturning(false)}>
                取消
              </Button>
              <Button size="sm" disabled={busy} onClick={() => void sendBack()}>
                退回
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      <ConfirmDialog
        open={canceling}
        title="取消这条需求？"
        description="取消后不能再上传候选稿。"
        confirmLabel="取消需求"
        onClose={() => setCanceling(false)}
        onConfirm={() =>
          apply(() => setDesignStatus(id, { status: 'cancelled', by: actor.trim() || null })).then(() =>
            setCanceling(false)
          )
        }
      />
    </div>
  )
}

function InfoBlock({ detail, card }: { detail: DesignRequestDetail; card: ProductCard | null }) {
  return (
    <section className="flex flex-col gap-2 text-xs">
      <p>
        <span className="text-(--ui-text-tertiary)">类型 </span>
        {kindLabel(detail.kind)}
        {detail.sizes.length > 0 ? ` · ${detail.sizes.join('、')}` : ''}
      </p>
      <p>
        <span className="text-(--ui-text-tertiary)">截止 </span>
        <span className={detail.overdue ? 'text-destructive' : undefined}>{formatDue(detail.due_date)}</span>
        {detail.overdue ? <span className="text-destructive"> · 逾期</span> : null}
      </p>
      <p>
        <span className="text-(--ui-text-tertiary)">设计师 </span>
        {detail.assignee || '未指定'}
      </p>
      <div>
        <p className="text-(--ui-text-tertiary)">图上文案</p>
        <p className="whitespace-pre-wrap">{detail.copy_text || '没有文案'}</p>
        <ComplianceHint result={detail.compliance} />
      </div>
      <div>
        <p className="text-(--ui-text-tertiary)">需求说明</p>
        <p className="whitespace-pre-wrap">{detail.brief || '没有说明'}</p>
      </div>
      <div>
        <p className="text-(--ui-text-tertiary)">商品卡</p>
        {card ? (
          <div className="flex flex-col gap-1">
            <p>
              {card.product_code} {card.name}
            </p>
            {card.selling_points.length > 0 ? <p>{card.selling_points.slice(0, 4).join(' · ')}</p> : null}
            {card.specs ? <p className="whitespace-pre-wrap text-(--ui-text-tertiary)">{card.specs}</p> : null}
          </div>
        ) : (
          <p>{detail.product_code ? '没有找到对应的商品卡' : '未关联商品'}</p>
        )}
      </div>
    </section>
  )
}

function FinalStrip({ assets }: { assets: DesignAsset[] }) {
  if (assets.length === 0) return <p className="text-xs text-(--ui-text-tertiary)">还没有定稿图。</p>
  return (
    <ul className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-3">
      {assets.map(asset => (
        <li key={asset.id} className="flex min-w-0 flex-col gap-1">
          <span className="flex h-64 items-center justify-center overflow-hidden rounded-md bg-(--ui-bg-secondary)">
            {isImage(asset.mime) ? (
              <img src={assetSrc(asset.url)} alt={asset.file_name} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs">{asset.file_name}</span>
            )}
          </span>
          <span className="truncate text-xs">
            {asset.label || asset.file_name}
            {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ''}
          </span>
          <a className="text-xs text-(--ui-accent)" href={assetDownloadUrl(asset.url)}>
            下载原图
          </a>
        </li>
      ))}
    </ul>
  )
}
