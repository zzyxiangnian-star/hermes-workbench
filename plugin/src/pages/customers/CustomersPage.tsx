import { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Checkbox,
  EmptyState,
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
  Textarea,
  Tip
} from '@hermes/plugin-sdk'
import { listProductCards, type ProductCard } from '../../api/brand'
import { isOfflineError } from '../../api/client'
import {
  createBusinessCustomer,
  createFollowup,
  createInquiry,
  getSegmentSummary,
  listCustomers,
  listFollowups,
  listInquiries,
  type Customer,
  type Followup,
  type FollowupChannel,
  type Inquiry,
  type InquiryChannel,
  type SegmentCount,
  type SegmentId
} from '../../api/customers'
import { refreshOpenInquiryCount } from '../../api/inquiry-count'
import { useQuery } from '../../api/useQuery'
import { useApiBase } from '../../settings'
import { HeaderActions } from '../HeaderActions'
import { OfflineNotice } from '../OfflineNotice'
import { CustomerDrawer } from './CustomerDrawer'
import { FollowupView } from './FollowupView'
import { InquiryView } from './InquiryView'
import {
  FOLLOWUP_CHANNELS,
  INQUIRY_CHANNELS,
  PLACEHOLDERS,
  SEGMENTS,
  channelLabel,
  errorText,
  followupStatusLabel,
  followupStatusVariant,
  formatMoney,
  formatShanghai,
  formatShanghaiDate,
  inquiryStatusLabel,
  inquiryStatusVariant,
  loadActor,
  parseTags,
  saveActor,
  segmentLabel
} from './labels'

type Tab = 'members' | 'inquiries' | 'all'
type Screen =
  | { name: Tab }
  | { name: 'followup'; id: number }
  | { name: 'inquiry'; id: number; from: Tab }

const TABS: ReadonlyArray<{ id: Tab; label: string }> = [
  { id: 'members', label: '会员' },
  { id: 'inquiries', label: '询盘' },
  { id: 'all', label: '全部客户' }
]

const INQUIRY_FILTERS: ReadonlyArray<{ id: string; label: string }> = [
  { id: 'open', label: '未关闭' },
  { id: 'all', label: '全部' },
  { id: 'new', label: '新询盘' },
  { id: 'replied', label: '已回复' },
  { id: 'quoted', label: '已报价' },
  { id: 'won', label: '成交' },
  { id: 'lost', label: '丢单' }
]

const PAGE_SIZE = 50

export function CustomersPage() {
  const [screen, setScreen] = useState<Screen>({ name: 'members' })
  if (screen.name === 'followup') {
    return <FollowupView id={screen.id} onBack={() => setScreen({ name: 'members' })} />
  }
  if (screen.name === 'inquiry') {
    return <InquiryView id={screen.id} onBack={() => setScreen({ name: screen.from })} />
  }
  return (
    <CustomerHome
      tab={screen.name}
      onTab={tab => setScreen({ name: tab })}
      onOpenFollowup={id => setScreen({ name: 'followup', id })}
      onOpenInquiry={(id, from) => setScreen({ name: 'inquiry', id, from })}
    />
  )
}

function CustomerHome({
  tab,
  onTab,
  onOpenFollowup,
  onOpenInquiry
}: {
  tab: Tab
  onTab: (tab: Tab) => void
  onOpenFollowup: (id: number) => void
  onOpenInquiry: (id: number, from: Tab) => void
}) {
  const apiBase = useApiBase()
  const [segment, setSegment] = useState<SegmentId | null>('new')
  const [kind, setKind] = useState<'all' | 'member' | 'business'>('all')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [inquiryStatus, setInquiryStatus] = useState('open')
  const [inquiryQInput, setInquiryQInput] = useState('')
  const [inquiryQ, setInquiryQ] = useState('')
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [followupOpen, setFollowupOpen] = useState(false)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [businessOpen, setBusinessOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  useEffect(() => {
    const timer = window.setTimeout(() => setInquiryQ(inquiryQInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [inquiryQInput])

  const summaryQuery = useQuery(() => getSegmentSummary(), [apiBase])
  const customerQuery = useQuery(
    () =>
      listCustomers({
        segment: tab === 'members' && segment ? segment : undefined,
        kind: tab === 'members' && !segment ? 'member' : tab === 'all' && kind !== 'all' ? kind : undefined,
        q: q || undefined,
        page,
        page_size: PAGE_SIZE
      }),
    [apiBase, tab, segment, kind, q, page]
  )
  const followupQuery = useQuery(() => listFollowups(), [apiBase])
  const inquiryQuery = useQuery(
    () => listInquiries({ status: inquiryStatus === 'all' ? undefined : inquiryStatus, q: inquiryQ || undefined }),
    [apiBase, inquiryStatus, inquiryQ]
  )

  const reload = () => {
    summaryQuery.reload()
    customerQuery.reload()
    followupQuery.reload()
    inquiryQuery.reload()
    void refreshOpenInquiryCount()
  }

  const error =
    summaryQuery.error ??
    (tab === 'inquiries' ? inquiryQuery.error : customerQuery.error) ??
    (tab === 'members' ? followupQuery.error : null)
  const offline = isOfflineError(error)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
      <HeaderActions>
        {tab === 'members' ? (
          <Button size="sm" onClick={() => setFollowupOpen(true)}>
            批量跟进
          </Button>
        ) : null}
        {tab === 'inquiries' ? (
          <Button size="sm" onClick={() => setInquiryOpen(true)}>
            新建询盘
          </Button>
        ) : null}
        {tab === 'all' ? (
          <Button size="sm" onClick={() => setBusinessOpen(true)}>
            新建企业客户
          </Button>
        ) : null}
      </HeaderActions>

      <SegmentedControl
        options={TABS}
        value={tab}
        sizing="content"
        onChange={next => {
          setPage(1)
          onTab(next)
        }}
      />

      {offline ? <OfflineNotice detail={error instanceof Error ? error.message : undefined} onRetry={reload} /> : null}
      {!offline && error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState title="客户加载失败" description={errorText(error, '请重试')}>
            <Button size="sm" variant="outline" onClick={reload}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !error && tab === 'members' ? (
        <MemberPane
          segments={summaryQuery.data?.segments}
          loadingSummary={summaryQuery.loading && !summaryQuery.data}
          selected={segment}
          onSelect={value => {
            setSegment(value)
            setPage(1)
          }}
          customers={customerQuery.data?.items ?? []}
          total={customerQuery.data?.total ?? 0}
          page={page}
          loading={customerQuery.loading && !customerQuery.data}
          q={qInput}
          onQ={value => {
            setQInput(value)
            setPage(1)
          }}
          onPage={setPage}
          onOpen={setCustomerId}
          followups={followupQuery.data ?? []}
          followupsLoading={followupQuery.loading && !followupQuery.data}
          onOpenFollowup={onOpenFollowup}
        />
      ) : null}

      {!offline && !error && tab === 'all' ? (
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              className="max-w-full flex-wrap"
              options={[
                { id: 'all', label: '全部' },
                { id: 'member', label: '会员' },
                { id: 'business', label: '企业' }
              ]}
              value={kind}
              sizing="content"
              onChange={value => {
                setKind(value)
                setPage(1)
              }}
            />
            <SearchField
              aria-label="搜索客户"
              placeholder="姓名、公司、手机、订单号、商品"
              value={qInput}
              onChange={value => {
                setQInput(value)
                setPage(1)
              }}
            />
          </div>
          <CustomerList
            items={customerQuery.data?.items ?? []}
            total={customerQuery.data?.total ?? 0}
            page={page}
            loading={customerQuery.loading && !customerQuery.data}
            onPage={setPage}
            onOpen={setCustomerId}
            empty="没有符合条件的客户"
          />
        </div>
      ) : null}

      {!offline && !error && tab === 'inquiries' ? (
        <InquiryPane
          items={inquiryQuery.data ?? []}
          loading={inquiryQuery.loading && !inquiryQuery.data}
          status={inquiryStatus}
          onStatus={setInquiryStatus}
          q={inquiryQInput}
          onQ={setInquiryQInput}
          onOpen={id => onOpenInquiry(id, 'inquiries')}
        />
      ) : null}

      <CustomerDrawer
        customerId={customerId}
        onClose={() => setCustomerId(null)}
        onSaved={() => customerQuery.reload()}
        onOpenInquiry={id => {
          setCustomerId(null)
          onOpenInquiry(id, tab)
        }}
      />
      <FollowupDialog
        open={followupOpen}
        defaultSegment={segment ?? 'new'}
        onClose={() => setFollowupOpen(false)}
        onCreated={id => {
          setFollowupOpen(false)
          followupQuery.reload()
          onOpenFollowup(id)
        }}
      />
      <InquiryDialog
        open={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
        onCreated={id => {
          setInquiryOpen(false)
          inquiryQuery.reload()
          void refreshOpenInquiryCount()
          onOpenInquiry(id, 'inquiries')
        }}
      />
      <BusinessDialog
        open={businessOpen}
        onClose={() => setBusinessOpen(false)}
        onCreated={id => {
          setBusinessOpen(false)
          customerQuery.reload()
          summaryQuery.reload()
          setCustomerId(id)
        }}
      />
    </div>
  )
}

function MemberPane({
  segments,
  loadingSummary,
  selected,
  onSelect,
  customers,
  total,
  page,
  loading,
  q,
  onQ,
  onPage,
  onOpen,
  followups,
  followupsLoading,
  onOpenFollowup
}: {
  segments: SegmentCount[] | undefined
  loadingSummary: boolean
  selected: SegmentId | null
  onSelect: (segment: SegmentId | null) => void
  customers: Customer[]
  total: number
  page: number
  loading: boolean
  q: string
  onQ: (value: string) => void
  onPage: (page: number) => void
  onOpen: (id: number) => void
  followups: Followup[]
  followupsLoading: boolean
  onOpenFollowup: (id: number) => void
}) {
  const cards = segments ?? SEGMENTS.map(item => ({ segment: item.id, label: item.label, count: 0, rule: '' }))
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">
        {loadingSummary
          ? Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-14 w-full" />)
          : cards.map(card => {
              const active = selected === card.segment
              return (
                <button
                  key={card.segment}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(active ? null : (card.segment as SegmentId))}
                  className={
                    active
                      ? 'flex min-w-0 flex-col items-start gap-1 rounded-lg border border-(--ui-accent) bg-(--ui-bg-quinary) px-3 py-2 text-left'
                      : 'flex min-w-0 flex-col items-start gap-1 rounded-lg border border-(--ui-stroke-secondary) px-3 py-2 text-left hover:bg-(--ui-bg-quinary)'
                  }
                >
                  <span className="inline-flex items-center gap-1.5 text-xs text-(--ui-text-secondary)">
                    {card.label}
                    <Badge variant="outline">{card.count}</Badge>
                  </span>
                  <Tip label={card.rule || card.label}>
                    <span className="truncate text-[0.6875rem] text-(--ui-text-tertiary)">{card.rule}</span>
                  </Tip>
                </button>
              )
            })}
      </div>
      <SearchField aria-label="搜索客户" placeholder="姓名、公司、手机、订单号、商品" value={q} onChange={onQ} />
      <CustomerList
        items={customers}
        total={total}
        page={page}
        loading={loading}
        onPage={onPage}
        onOpen={onOpen}
        empty="这一层还没有客户"
      />
      <section className="flex flex-col gap-1">
        <h3 className="text-xs font-medium">跟进任务</h3>
        {followupsLoading ? <Skeleton className="h-10 w-full" /> : null}
        {!followupsLoading && followups.length === 0 ? (
          <p className="text-xs text-(--ui-text-tertiary)">还没有跟进任务。选一个分层，写好话术后批量生成。</p>
        ) : null}
        <ul>
          {followups.map(item => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpenFollowup(item.id)}
                className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-(--ui-text-tertiary)">
                  {segmentLabel(item.segment)} · {channelLabel(item.channel)}
                </span>
                <Badge variant={followupStatusVariant(item.status)}>{followupStatusLabel(item.status)}</Badge>
                <span className="text-(--ui-text-tertiary)">
                  待发 {item.counts.pending} / 已发 {item.counts.sent} / 跳过 {item.counts.skipped}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function CustomerList({
  items,
  total,
  page,
  loading,
  onPage,
  onOpen,
  empty
}: {
  items: Customer[]
  total: number
  page: number
  loading: boolean
  onPage: (page: number) => void
  onOpen: (id: number) => void
  empty: string
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <EmptyState title={empty} description="换个筛选，或先导入订单。" />
      </div>
    )
  }
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ul className="min-w-0">
        {items.map(item => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen(item.id)}
              className="flex w-full min-w-0 flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)"
            >
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-medium">{item.name || '未留姓名'}</span>
                <span className="text-(--ui-text-secondary)">{item.phone || '无手机号'}</span>
                {item.company ? <span className="text-(--ui-text-tertiary)">{item.company}</span> : null}
                <span className="text-(--ui-text-tertiary)">{item.wecom_added ? '企微已加' : '企微未加'}</span>
                {item.segments.map(seg => (
                  <Badge key={seg} variant="outline">
                    {segmentLabel(seg)}
                  </Badge>
                ))}
              </span>
              <span className="flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-(--ui-text-secondary)">
                <span>{item.order_count} 单</span>
                <span>{formatMoney(item.total)} 元</span>
                <span className="min-w-0 truncate">
                  {formatShanghaiDate(item.last_paid_at)} {item.last_title || ''}
                </span>
              </span>
              <span className="truncate text-(--ui-text-tertiary)">{item.shops.join('、') || '—'}</span>
            </button>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-(--ui-text-secondary)">
          <Button size="xs" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            上一页
          </Button>
          <span>
            {page} / {pages}
          </span>
          <Button size="xs" variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>
            下一页
          </Button>
        </div>
      ) : null}
    </div>
  )
}

function InquiryPane({
  items,
  loading,
  status,
  onStatus,
  q,
  onQ,
  onOpen
}: {
  items: Inquiry[]
  loading: boolean
  status: string
  onStatus: (status: string) => void
  q: string
  onQ: (value: string) => void
  onOpen: (id: number) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          className="max-w-full flex-wrap"
          options={INQUIRY_FILTERS}
          value={status}
          sizing="content"
          onChange={onStatus}
        />
        <SearchField aria-label="搜索询盘" placeholder="公司、联系人、内容" value={q} onChange={onQ} />
      </div>
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : null}
      {!loading && items.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <EmptyState title="没有符合条件的询盘" description="换个筛选，或新建一条。" />
        </div>
      ) : null}
      {!loading && items.length > 0 ? (
        <ul className="min-w-0">
          {items.map(item => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.id)}
                className="flex w-full min-w-0 flex-col gap-1 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)"
              >
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{item.company || '未填公司'}</span>
                  <span className="text-(--ui-text-secondary)">{item.contact || '未留联系人'}</span>
                  <span className="text-(--ui-text-tertiary)">{channelLabel(item.channel)}</span>
                  <Badge variant={inquiryStatusVariant(item.status)}>{inquiryStatusLabel(item.status)}</Badge>
                  {item.stale ? <Badge variant="warn">超过 7 天未跟进</Badge> : null}
                </span>
                <span className="line-clamp-2 text-(--ui-text-secondary)">{item.content}</span>
                <span className="text-(--ui-text-tertiary)">
                  {item.assignee || '未指定负责人'} · {formatShanghai(item.updated_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function FollowupDialog({
  open,
  defaultSegment,
  onClose,
  onCreated
}: {
  open: boolean
  defaultSegment: SegmentId
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const area = useRef<HTMLTextAreaElement>(null)
  const [segment, setSegment] = useState<SegmentId>(defaultSegment)
  const [channel, setChannel] = useState<FollowupChannel>('wecom')
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [actor, setActor] = useState(loadActor)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSegment(defaultSegment)
    setChannel('wecom')
    setName('')
    setTemplate('')
    setActor(loadActor())
    setError(null)
  }, [open, defaultSegment])

  const insert = (token: string) => {
    const el = area.current
    const start = el?.selectionStart ?? template.length
    const end = el?.selectionEnd ?? template.length
    const next = template.slice(0, start) + token + template.slice(end)
    setTemplate(next)
    window.requestAnimationFrame(() => {
      el?.focus()
      const pos = start + token.length
      el?.setSelectionRange(pos, pos)
    })
  }

  const submit = async () => {
    if (!name.trim() || !template.trim()) {
      setError('请填写名称和话术')
      return
    }
    setBusy(true)
    setError(null)
    saveActor(actor)
    try {
      const created = await createFollowup({
        name: name.trim(),
        segment,
        channel,
        template: template.trim(),
        by: actor.trim() || null
      })
      onCreated(created.id)
    } catch (reason) {
      setError(errorText(reason, '创建失败'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => { if (!value) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量跟进</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
            分层
            <Select value={segment} onValueChange={value => setSegment(value as SegmentId)}>
              <SelectTrigger aria-label="分层">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEGMENTS.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
            渠道
            <Select value={channel} onValueChange={value => setChannel(value as FollowupChannel)}>
              <SelectTrigger aria-label="渠道">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLLOWUP_CHANNELS.map(item => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <Input aria-label="名称" placeholder="名称" value={name} onChange={event => setName(event.target.value)} />
          <Textarea ref={area} aria-label="话术" placeholder="话术" value={template} onChange={event => setTemplate(event.target.value)} />
          <div className="flex flex-wrap gap-1">
            {PLACEHOLDERS.map(token => (
              <Button key={token} size="xs" variant="outline" onMouseDown={event => event.preventDefault()} onClick={() => insert(token)}>
                {token}
              </Button>
            ))}
          </div>
          <Input aria-label="署名" placeholder="署名" value={actor} onChange={event => setActor(event.target.value)} style={{ width: '7rem' }} />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void submit()}>
            {busy ? '正在生成' : '生成名单'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InquiryDialog({
  open,
  onClose,
  onCreated
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const apiBase = useApiBase()
  const [channel, setChannel] = useState<InquiryChannel>('wecom')
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [content, setContent] = useState('')
  const [assignee, setAssignee] = useState('')
  const [actor, setActor] = useState(loadActor)
  const [codeInput, setCodeInput] = useState('')
  const [codeQuery, setCodeQuery] = useState('')
  const [codes, setCodes] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setChannel('wecom')
    setCompany('')
    setContact('')
    setPhone('')
    setContent('')
    setAssignee('')
    setActor(loadActor())
    setCodeInput('')
    setCodeQuery('')
    setCodes([])
    setError(null)
  }, [open])

  useEffect(() => {
    const timer = window.setTimeout(() => setCodeQuery(codeInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [codeInput])

  const cardsQuery = useQuery(
    () => (codeQuery ? listProductCards({ q: codeQuery }) : Promise.resolve([] as ProductCard[])),
    [apiBase, codeQuery, open]
  )

  const addCode = (code: string) => {
    const next = code.trim()
    if (!next) return
    setCodes(current => (current.includes(next) ? current : [...current, next]))
    setCodeInput('')
    setCodeQuery('')
  }

  const submit = async () => {
    if (!content.trim()) {
      setError('请填写询盘内容')
      return
    }
    setBusy(true)
    setError(null)
    saveActor(actor)
    try {
      const created = await createInquiry({
        channel,
        content: content.trim(),
        company: company.trim() || null,
        contact: contact.trim() || null,
        phone: phone.trim() || null,
        product_codes: codes,
        assignee: assignee.trim() || null,
        by: actor.trim() || null
      })
      onCreated(created.id)
    } catch (reason) {
      setError(errorText(reason, '创建失败'))
    } finally {
      setBusy(false)
    }
  }

  const matches = codeQuery ? cardsQuery.data ?? [] : []

  return (
    <Dialog open={open} onOpenChange={value => { if (!value) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建询盘</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Select value={channel} onValueChange={value => setChannel(value as InquiryChannel)}>
            <SelectTrigger aria-label="渠道">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INQUIRY_CHANNELS.map(item => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input aria-label="公司" placeholder="公司" value={company} onChange={event => setCompany(event.target.value)} />
          <Input aria-label="联系人" placeholder="联系人" value={contact} onChange={event => setContact(event.target.value)} />
          <Input aria-label="手机" placeholder="手机" value={phone} onChange={event => setPhone(event.target.value)} />
          <Textarea aria-label="内容" placeholder="内容" value={content} onChange={event => setContent(event.target.value)} />
          <div className="flex flex-col gap-1">
            <Input
              aria-label="商品编码"
              placeholder="商品编码，从资料卡里搜"
              value={codeInput}
              onChange={event => setCodeInput(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addCode(codeInput)
                }
              }}
            />
            {matches.length > 0 ? (
              <ul className="max-h-32 overflow-y-auto rounded-md border border-(--ui-stroke-secondary)">
                {matches.map(card => (
                  <li key={card.id}>
                    <button
                      type="button"
                      className="flex w-full px-2 py-1 text-left text-xs hover:bg-(--ui-bg-quinary)"
                      onClick={() => addCode(card.product_code)}
                    >
                      {card.product_code} · {card.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {codes.map(code => (
                <Button key={code} size="xs" variant="outline" onClick={() => setCodes(current => current.filter(item => item !== code))}>
                  {code} ×
                </Button>
              ))}
            </div>
          </div>
          <Input aria-label="负责人" placeholder="负责人" value={assignee} onChange={event => setAssignee(event.target.value)} />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void submit()}>
            {busy ? '正在保存' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BusinessDialog({
  open,
  onClose,
  onCreated
}: {
  open: boolean
  onClose: () => void
  onCreated: (id: number) => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [wecom, setWecom] = useState(false)
  const [tags, setTags] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName('')
    setPhone('')
    setCompany('')
    setWecom(false)
    setTags('')
    setNote('')
    setError(null)
  }, [open])

  const submit = async () => {
    if (!company.trim()) {
      setError('企业客户请填写公司名称')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await createBusinessCustomer({
        name: name.trim() || null,
        phone: phone.trim() || null,
        company: company.trim(),
        wecom_added: wecom,
        tags: parseTags(tags),
        note: note.trim() || null
      })
      onCreated(created.id)
    } catch (reason) {
      setError(errorText(reason, '创建失败'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={value => { if (!value) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建企业客户</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Input aria-label="名称" placeholder="名称" value={name} onChange={event => setName(event.target.value)} />
          <Input aria-label="公司" placeholder="公司" value={company} onChange={event => setCompany(event.target.value)} />
          <Input aria-label="手机" placeholder="手机" value={phone} onChange={event => setPhone(event.target.value)} />
          <label className="inline-flex items-center gap-2 text-xs text-(--ui-text-secondary)">
            <Checkbox checked={wecom} onCheckedChange={setWecom} aria-label="已加企业微信" />
            已加企业微信
          </label>
          <Input aria-label="标签" placeholder="标签，用逗号分开" value={tags} onChange={event => setTags(event.target.value)} />
          <Textarea aria-label="备注" placeholder="备注" value={note} onChange={event => setNote(event.target.value)} />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter>
          <Button size="sm" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void submit()}>
            {busy ? '正在保存' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
