import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  Loader,
  SearchField,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea
} from '@hermes/plugin-sdk'
import { ApiError, isOfflineError } from '../../api/client'
import {
  createBannedWord,
  deleteBannedWord,
  getBrandGuide,
  listBannedWords,
  listBrandGuides,
  listProductCards,
  patchBannedWord,
  saveBrandGuide,
  type BannedWord,
  type BrandGuide,
  type ProductCard
} from '../../api/brand'
import { listShops } from '../../api/products'
import { useQuery } from '../../api/useQuery'
import { useApiBase } from '../../settings'
import { HeaderActions } from '../HeaderActions'
import { OfflineNotice } from '../OfflineNotice'
import { CardDrawer } from './CardDrawer'
import { CompliancePanel } from './CompliancePanel'

type Tab = 'cards' | 'guides' | 'words'

export function AssetsPage() {
  const apiBase = useApiBase()
  const [tab, setTab] = useState<Tab>('cards')
  const [brand, setBrand] = useState('')
  const [qInput, setQInput] = useState('')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [active, setActive] = useState<ProductCard | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setQ(qInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [qInput])

  const shopsQuery = useQuery(() => listShops(), [apiBase])
  const cardsQuery = useQuery(
    () => listProductCards({ brand: brand || undefined, q: q || undefined }),
    [apiBase, brand, q]
  )
  const guidesQuery = useQuery(() => listBrandGuides(), [apiBase])
  const wordsQuery = useQuery(() => listBannedWords(), [apiBase])

  const error =
    tab === 'cards'
      ? cardsQuery.error ?? shopsQuery.error
      : tab === 'guides'
        ? guidesQuery.error ?? shopsQuery.error
        : wordsQuery.error
  const offline = isOfflineError(error)
  const shopBrands = unique(shopsQuery.data?.map(shop => shop.brand) ?? [])
  const guideBrands = unique([...(guidesQuery.data?.map(item => item.brand) ?? []), ...shopBrands])

  const reload = () => {
    shopsQuery.reload()
    cardsQuery.reload()
    guidesQuery.reload()
    wordsQuery.reload()
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <HeaderActions>
        {tab === 'cards' ? (
          <Button size="sm" onClick={() => { setActive(null); setCreating(true) }}>
            新建资料卡
          </Button>
        ) : null}
      </HeaderActions>
      <SegmentedControl
        sizing="content"
        value={tab}
        onChange={setTab}
        options={[
          { id: 'cards', label: '商品资料卡' },
          { id: 'guides', label: '品牌规范' },
          { id: 'words', label: '违禁词' }
        ]}
      />

      {offline ? <OfflineNotice detail={error instanceof Error ? error.message : undefined} onRetry={reload} /> : null}
      {!offline && error ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <ErrorState title="资料加载失败" description={error instanceof Error ? error.message : '请重试'}>
            <Button size="sm" variant="outline" onClick={reload}>
              重试
            </Button>
          </ErrorState>
        </div>
      ) : null}

      {!offline && !error && tab === 'cards' ? (
        <CardsPane
          cards={cardsQuery.data}
          loading={cardsQuery.loading}
          brands={shopBrands}
          brand={brand}
          qInput={qInput}
          onBrand={setBrand}
          onQuery={setQInput}
          onOpen={card => { setCreating(false); setActive(card) }}
        />
      ) : null}
      {!offline && !error && tab === 'guides' ? (
        <GuidesPane brands={guideBrands} onSaved={() => guidesQuery.reload()} />
      ) : null}
      {!offline && !error && tab === 'words' ? (
        <WordsPane words={wordsQuery.data} loading={wordsQuery.loading} onChanged={() => wordsQuery.reload()} />
      ) : null}

      <CardDrawer
        open={creating || active != null}
        creating={creating}
        card={active}
        onClose={() => { setCreating(false); setActive(null) }}
        onSaved={() => cardsQuery.reload()}
      />
    </div>
  )
}

function CardsPane({
  cards,
  loading,
  brands,
  brand,
  qInput,
  onBrand,
  onQuery,
  onOpen
}: {
  cards: ProductCard[] | undefined
  loading: boolean
  brands: string[]
  brand: string
  qInput: string
  onBrand: (value: string) => void
  onQuery: (value: string) => void
  onOpen: (card: ProductCard) => void
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={brand || 'all'} onValueChange={value => onBrand(value === 'all' ? '' : value)}>
          <SelectTrigger aria-label="品牌" className="w-36">
            <SelectValue placeholder="全部品牌" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部品牌</SelectItem>
            {brands.map(item => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SearchField aria-label="搜索资料卡" placeholder="名称、编码" value={qInput} onChange={onQuery} />
        {loading && cards ? <Loader /> : null}
      </div>
      {loading && !cards ? <Loader /> : null}
      {cards && cards.length === 0 ? (
        <EmptyState title="没有资料卡" description="新建一张，或换个筛选。" />
      ) : null}
      {cards && cards.length > 0 ? (
        <div>
          <div className="grid grid-cols-[minmax(0,1.4fr)_6rem_5rem_4.5rem_4rem] gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)">
            <span>名称</span>
            <span>编码</span>
            <span>品牌</span>
            <span>安装</span>
            <span>在售</span>
          </div>
          <ul>
            {cards.map(card => (
              <li key={card.id}>
                <button
                  type="button"
                  onClick={() => onOpen(card)}
                  className="grid w-full grid-cols-[minmax(0,1.4fr)_6rem_5rem_4.5rem_4rem] items-center gap-2 border-b border-(--ui-stroke-secondary) px-2 py-2 text-left text-xs hover:bg-(--ui-bg-quinary)"
                >
                  <span className="truncate">{card.name}</span>
                  <span className="truncate text-(--ui-text-secondary)">{card.product_code}</span>
                  <span className="truncate">{card.brand}</span>
                  <span>{card.install_required ? '需要' : '不需要'}</span>
                  <span className="tabular-nums">{card.listings.length}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}

function GuidesPane({ brands, onSaved }: { brands: string[]; onSaved: () => void }) {
  const [brand, setBrand] = useState(brands[0] ?? '')
  useEffect(() => {
    if (!brand && brands[0]) setBrand(brands[0])
  }, [brand, brands])
  const [draftBrand, setDraftBrand] = useState('')
  const [guide, setGuide] = useState<BrandGuide | null>(null)
  const [tone, setTone] = useState('')
  const [colors, setColors] = useState<string[]>([])
  const [fonts, setFonts] = useState<string[]>([])
  const [logo, setLogo] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!brand) return
    let cancelled = false
    setLoading(true)
    setError(null)
    getBrandGuide(brand)
      .then(value => {
        if (cancelled) return
        setGuide(value)
        setTone(value.tone ?? '')
        setColors(value.colors)
        setFonts(value.fonts)
        setLogo(value.logo_rules ?? '')
        setNotes(value.notes ?? '')
      })
      .catch((reason: unknown) => {
        if (cancelled) return
        if (reason instanceof ApiError && reason.status === 404) {
          setGuide(null)
          setTone('')
          setColors([])
          setFonts([])
          setLogo('')
          setNotes('')
          return
        }
        setError(reason instanceof Error ? reason.message : '加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [brand])

  const save = async () => {
    if (!brand.trim()) return
    setError(null)
    setNotice(null)
    try {
      const saved = await saveBrandGuide(brand.trim(), {
        tone: tone.trim() || null,
        colors: colors.map(item => item.trim()).filter(Boolean),
        fonts: fonts.map(item => item.trim()).filter(Boolean),
        logo_rules: logo.trim() || null,
        notes: notes.trim() || null
      })
      setGuide(saved)
      setNotice('已保存')
      onSaved()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '保存失败')
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[10rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-1">
        {brands.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setBrand(item)}
            className={
              item === brand
                ? 'rounded-md bg-(--ui-bg-quinary) px-2 py-1.5 text-left text-xs'
                : 'rounded-md px-2 py-1.5 text-left text-xs text-(--ui-text-secondary) hover:bg-(--ui-bg-quinary)'
            }
          >
            {item}
          </button>
        ))}
        <form
          className="mt-2 flex flex-col gap-1"
          onSubmit={event => {
            event.preventDefault()
            const next = draftBrand.trim()
            if (!next) return
            setBrand(next)
            setDraftBrand('')
          }}
        >
          <Input aria-label="新品牌" placeholder="新品牌" value={draftBrand} onChange={event => setDraftBrand(event.target.value)} />
          <Button size="xs" variant="outline" type="submit">打开</Button>
        </form>
      </div>
      {brand ? (
        <div className="flex flex-col gap-3">
          <div className="text-sm">{brand}{guide ? '' : ' · 还没有规范'}</div>
          {loading ? <Loader /> : null}
          <Textarea aria-label="语气" placeholder="语气" value={tone} onChange={event => setTone(event.target.value)} />
          <ColorList colors={colors} onChange={setColors} />
          <StringRows label="字体" values={fonts} onChange={setFonts} />
          <Textarea aria-label="Logo 用法" placeholder="Logo 用法" value={logo} onChange={event => setLogo(event.target.value)} />
          <Textarea aria-label="其他注意" placeholder="其他注意" value={notes} onChange={event => setNotes(event.target.value)} />
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {notice ? <p className="text-xs text-(--ui-text-secondary)">{notice}</p> : null}
          <div className="flex justify-end">
            <Button size="sm" onClick={() => void save()}>保存</Button>
          </div>
        </div>
      ) : (
        <EmptyState title="还没有品牌" description="从左边输入一个品牌名。" />
      )}
    </div>
  )
}

function WordsPane({
  words,
  loading,
  onChanged
}: {
  words: BannedWord[] | undefined
  loading: boolean
  onChanged: () => void
}) {
  const [word, setWord] = useState('')
  const [level, setLevel] = useState('must')
  const [category, setCategory] = useState('自定义')
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<BannedWord | null>(null)

  const add = async () => {
    if (!word.trim()) return
    setError(null)
    try {
      await createBannedWord({
        word: word.trim(),
        level,
        category: category.trim() || '自定义',
        suggestion: suggestion.trim() || null
      })
      setWord('')
      setSuggestion('')
      onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '添加失败')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <CompliancePanel />
      <div className="grid grid-cols-[minmax(0,1fr)_6rem_6rem_minmax(0,1fr)_auto] gap-2">
        <Input aria-label="违禁词" placeholder="词" value={word} onChange={event => setWord(event.target.value)} />
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger aria-label="级别"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="must">必须处理</SelectItem>
            <SelectItem value="warn">提醒</SelectItem>
          </SelectContent>
        </Select>
        <Input aria-label="分类" placeholder="分类" value={category} onChange={event => setCategory(event.target.value)} />
        <Input aria-label="替换建议" placeholder="替换建议" value={suggestion} onChange={event => setSuggestion(event.target.value)} />
        <Button size="sm" variant="outline" onClick={() => void add()}>加词</Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {loading && !words ? <Loader /> : null}
      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_minmax(0,1fr)_3.5rem_3rem] gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-[0.6875rem] text-(--ui-text-tertiary)">
          <span>词</span><span>级别</span><span>分类</span><span>替换建议</span><span>启用</span><span />
        </div>
        <ul>
          {(words ?? []).map(item => (
            <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_5rem_6rem_minmax(0,1fr)_3.5rem_3rem] items-center gap-2 border-b border-(--ui-stroke-secondary) px-2 py-1.5 text-xs">
              <span className="truncate">{item.word}</span>
              <Badge variant={item.level === 'must' ? 'destructive' : 'warn'}>{item.level === 'must' ? '必须处理' : '提醒'}</Badge>
              <span className="truncate text-(--ui-text-secondary)">{item.category}</span>
              <span className="truncate">{item.suggestion || '—'}</span>
              <Switch
                checked={item.enabled}
                aria-label={`${item.word}启用`}
                onCheckedChange={checked => {
                  void patchBannedWord(item.id, { enabled: checked }).then(onChanged).catch((reason: unknown) => {
                    setError(reason instanceof Error ? reason.message : '更新失败')
                  })
                }}
              />
              <Button size="xs" variant="ghost" onClick={() => setRemoving(item)}>删除</Button>
            </li>
          ))}
        </ul>
      </div>
      <ConfirmDialog
        open={removing != null}
        title="删除这个词"
        description={removing ? `删除「${removing.word}」后，检查不再用它。` : ''}
        confirmLabel="删除"
        onClose={() => setRemoving(null)}
        onConfirm={async () => {
          if (!removing) return
          await deleteBannedWord(removing.id)
          setRemoving(null)
          onChanged()
        }}
      />
    </div>
  )
}

function ColorList({ colors, onChange }: { colors: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-(--ui-text-secondary)">品牌色</div>
      {colors.map((color, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="h-5 w-5 shrink-0 rounded-sm border border-(--ui-stroke-secondary)" style={{ background: safeColor(color) }} />
          <Input
            aria-label={`品牌色 ${index + 1}`}
            value={color}
            onChange={event => onChange(colors.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
          />
          <Button size="xs" variant="ghost" onClick={() => onChange(colors.filter((_, itemIndex) => itemIndex !== index))}>删除</Button>
        </div>
      ))}
      <Button size="xs" variant="outline" onClick={() => onChange([...colors, '#000000'])}>加一个颜色</Button>
    </div>
  )
}

function StringRows({ label, values, onChange }: { label: string; values: string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-(--ui-text-secondary)">{label}</div>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            aria-label={`${label} ${index + 1}`}
            value={value}
            onChange={event => onChange(values.map((item, itemIndex) => (itemIndex === index ? event.target.value : item)))}
          />
          <Button size="xs" variant="ghost" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>删除</Button>
        </div>
      ))}
      <Button size="xs" variant="outline" onClick={() => onChange([...values, ''])}>加一项</Button>
    </div>
  )
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'zh-CN'))
}

function safeColor(value: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(value.trim()) ? value.trim() : 'transparent'
}
