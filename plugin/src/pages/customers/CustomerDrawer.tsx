import { useEffect, useState } from 'react'
import { Badge, Button, Checkbox, ErrorState, Input, Loader, Textarea } from '@hermes/plugin-sdk'
import { isOfflineError } from '../../api/client'
import { getCustomer, patchCustomer, type CustomerDetail, type Inquiry } from '../../api/customers'
import { SideDrawer, FieldText } from '../products/Drawer'
import {
  errorText,
  formatMoney,
  formatShanghaiDate,
  inquiryStatusLabel,
  parseTags,
  segmentLabel
} from './labels'

export function CustomerDrawer({
  customerId,
  onClose,
  onSaved,
  onOpenInquiry
}: {
  customerId: number | null
  onClose: () => void
  onSaved: () => void
  onOpenInquiry: (id: number) => void
}) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null)
  const [loadedFor, setLoadedFor] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [wecom, setWecom] = useState(false)
  const [tags, setTags] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    if (customerId == null) return
    let cancelled = false
    setLoadedFor(null)
    setError(null)
    setActionError(null)
    getCustomer(customerId).then(
      value => {
        if (cancelled) return
        setDetail(value)
        setName(value.name ?? '')
        setCompany(value.company ?? '')
        setWecom(value.wecom_added)
        setTags(value.tags.join('，'))
        setNote(value.note ?? '')
        setLoadedFor(customerId)
      },
      (reason: unknown) => {
        if (cancelled) return
        setError(reason)
        setLoadedFor(customerId)
      }
    )
    return () => {
      cancelled = true
    }
  }, [customerId, revision])

  const ready = detail != null && loadedFor === customerId ? detail : null

  const save = async () => {
    if (customerId == null || ready == null) return
    if (ready.kind === 'business' && !company.trim()) {
      setActionError('企业客户请填写公司名称')
      return
    }
    setSaving(true)
    setActionError(null)
    try {
      const next = await patchCustomer(customerId, {
        name: name.trim() || null,
        company: company.trim() || null,
        wecom_added: wecom,
        tags: parseTags(tags),
        note: note.trim() || null
      })
      setDetail(next)
      onSaved()
    } catch (reason) {
      setActionError(errorText(reason, '保存失败'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SideDrawer
      open={customerId != null}
      title={ready ? ready.name || ready.company || '客户' : '客户'}
      description={ready ? `${ready.kind === 'business' ? '企业' : '会员'} · ${ready.phone || '无手机号'}` : undefined}
      onClose={onClose}
      widthClass="max-w-lg"
      footer={
        ready ? (
          <Button size="sm" disabled={saving} onClick={() => void save()}>
            {saving ? '正在保存' : '保存'}
          </Button>
        ) : null
      }
    >
      {customerId != null && loadedFor !== customerId && !error ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-tertiary)">
          <Loader />
          正在读取客户
        </div>
      ) : null}
      {error ? (
        <ErrorState
          title={isOfflineError(error) ? '没有连上工作台服务' : '客户加载失败'}
          description={errorText(error, '请重试')}
        >
          <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
            重试
          </Button>
        </ErrorState>
      ) : null}
      {ready ? (
        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-2">
            <h3 className="text-xs font-medium">基本信息</h3>
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              名称
              <Input aria-label="名称" value={name} onChange={event => setName(event.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              公司
              <Input aria-label="公司" value={company} onChange={event => setCompany(event.target.value)} />
            </label>
            <FieldText label="手机">{ready.phone || '—'}（不能改）</FieldText>
            <label className="inline-flex items-center gap-2 text-xs text-(--ui-text-secondary)">
              <Checkbox checked={wecom} onCheckedChange={setWecom} aria-label="已加企业微信" />
              已加企业微信
            </label>
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              标签
              <Input aria-label="标签" value={tags} placeholder="用逗号分开" onChange={event => setTags(event.target.value)} />
            </label>
            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              备注
              <Textarea aria-label="备注" value={note} onChange={event => setNote(event.target.value)} />
            </label>
          </section>
          <section className="grid grid-cols-2 gap-3">
            <FieldText label="累计单数">{ready.order_count}</FieldText>
            <FieldText label="累计金额">{formatMoney(ready.total)} 元</FieldText>
            <FieldText label="首单">{formatShanghaiDate(ready.first_paid_at)}</FieldText>
            <FieldText label="最近一单">{formatShanghaiDate(ready.last_paid_at)}</FieldText>
            <FieldText label="最近商品" className="col-span-2">
              {ready.last_title || '—'}
            </FieldText>
            <FieldText label="店铺" className="col-span-2">
              {ready.shops.join('、') || '—'}
            </FieldText>
            <div className="col-span-2 flex flex-wrap gap-1">
              {ready.segments.map(item => (
                <Badge key={item} variant="outline">
                  {segmentLabel(item)}
                </Badge>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">订单</h3>
            {ready.orders.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有订单。</p>
            ) : (
              <ul>
                {ready.orders.map(order => (
                  <li key={order.id} className="border-b border-(--ui-stroke-secondary) py-1.5 text-xs text-(--ui-text-secondary)">
                    <span className="text-(--ui-text-primary)">{order.title}</span>
                    <span className="mt-0.5 block text-(--ui-text-tertiary)">
                      {order.shop_name} · {order.order_no} · {formatShanghaiDate(order.paid_at)} · {order.quantity} 件 ·{' '}
                      {formatMoney(order.amount)} 元
                      {order.platform_status ? ` · ${order.platform_status}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="flex flex-col gap-1">
            <h3 className="text-xs font-medium">询盘</h3>
            {ready.inquiries.length === 0 ? (
              <p className="text-xs text-(--ui-text-tertiary)">还没有询盘。</p>
            ) : (
              <ul>
                {ready.inquiries.map((item: Inquiry) => (
                  <li key={item.id} className="border-b border-(--ui-stroke-secondary)">
                    <button
                      type="button"
                      className="flex w-full flex-col gap-0.5 py-1.5 text-left text-xs hover:bg-(--ui-bg-quinary)"
                      onClick={() => onOpenInquiry(item.id)}
                    >
                      <span>{item.company || item.contact || '询盘'}</span>
                      <span className="text-(--ui-text-tertiary)">{inquiryStatusLabel(item.status)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {actionError ? <p className="text-xs text-destructive">{actionError}</p> : null}
        </div>
      ) : null}
    </SideDrawer>
  )
}
