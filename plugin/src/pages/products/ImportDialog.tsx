import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@hermes/plugin-sdk'
import { ApiError } from '../../api/client'
import {
  createShop,
  importProducts,
  type ImportResult,
  type Shop
} from '../../api/products'
import { PLATFORM_NAME, platformName } from './labels'

const PLATFORMS = ['tmall', 'jd', 'pdd', 'douyin'] as const

export function ImportDialog({
  open,
  shops,
  onClose,
  onDone
}: {
  open: boolean
  shops: Shop[]
  onClose: () => void
  onDone: () => void
}) {
  const [shopId, setShopId] = useState<string>('')
  const [createdShops, setCreatedShops] = useState<Shop[]>([])
  const [creating, setCreating] = useState(false)
  const [platform, setPlatform] = useState<string>('tmall')
  const [shopName, setShopName] = useState('')
  const [brand, setBrand] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setResult(null)
    setFile(null)
    setBusy(false)
    setCreating(shops.length === 0)
    setShopId(shops.length === 1 ? String(shops[0].id) : '')
    setCreatedShops([])
    // 只在打开时重置。导入成功后父级会刷新店铺列表，不能因此清掉结果。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const createAndSelect = async () => {
    setBusy(true)
    setError(null)
    try {
      const shop = await createShop({
        platform,
        name: shopName.trim(),
        brand: brand.trim()
      })
      setShopId(String(shop.id))
      setCreatedShops(current => [...current, shop])
      setCreating(false)
      setShopName('')
      setBrand('')
      onDone()
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : '新建店铺失败')
    } finally {
      setBusy(false)
    }
  }

  const upload = async () => {
    if (!file || !shopId) return
    const lower = file.name.toLowerCase()
    if (!lower.endsWith('.xlsx') && !lower.endsWith('.csv')) {
      setError('只支持 xlsx 或 csv')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const imported = await importProducts(Number(shopId), file)
      setResult(imported)
      onDone()
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : '导入失败')
    } finally {
      setBusy(false)
    }
  }

  const knownShops = [
    ...shops,
    ...createdShops.filter(shop => !shops.some(item => item.id === shop.id))
  ]

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入报表</DialogTitle>
          <DialogDescription>选择店铺和 xlsx / csv 文件。导入完成后会自动按规则检查。</DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-sm text-(--ui-text-primary)">
              成功 {result.rows_ok} 行，失败 {result.rows_failed} 行
            </p>
            {result.errors.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto border border-(--ui-stroke-secondary) text-(--ui-text-secondary)">
                {result.errors.map(row => (
                  <li key={`${row.row}-${row.reason}`} className="border-b border-(--ui-stroke-secondary) px-2 py-1.5">
                    第 {row.row} 行：{row.reason}
                  </li>
                ))}
              </ul>
            ) : null}
            <DialogFooter>
              <Button
                onClick={() => {
                  onDone()
                  onClose()
                }}
              >
                查看商品
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {knownShops.length > 0 && !creating ? (
              <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
                店铺
                <Select
                  value={shopId || 'none'}
                  onValueChange={value => {
                    if (value !== 'none') setShopId(value)
                  }}
                >
                  <SelectTrigger aria-label="选择店铺">
                    <SelectValue placeholder="选择店铺" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">选择店铺</SelectItem>
                    {knownShops.map(shop => (
                      <SelectItem key={shop.id} value={String(shop.id)}>
                        {platformName(shop.platform)} · {shop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            ) : null}

            {knownShops.length > 0 && !creating ? (
              <Button size="xs" variant="ghost" onClick={() => setCreating(true)}>
                新建店铺
              </Button>
            ) : null}

            {creating ? (
              <div className="flex flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) p-2">
                <p className="text-xs text-(--ui-text-secondary)">新建店铺</p>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger aria-label="平台">
                    <SelectValue placeholder="平台" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(item => (
                      <SelectItem key={item} value={item}>
                        {PLATFORM_NAME[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  aria-label="店名"
                  placeholder="店名"
                  value={shopName}
                  onChange={event => setShopName(event.target.value)}
                />
                <Input
                  aria-label="品牌"
                  placeholder="品牌"
                  value={brand}
                  onChange={event => setBrand(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    disabled={busy || !shopName.trim() || !brand.trim()}
                    onClick={() => void createAndSelect()}
                  >
                    保存店铺
                  </Button>
                  {knownShops.length > 0 ? (
                    <Button size="xs" variant="outline" onClick={() => setCreating(false)}>
                      取消
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <label className="flex flex-col gap-1 text-xs text-(--ui-text-secondary)">
              报表文件
              <input
                aria-label="报表文件"
                type="file"
                accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                className="text-xs text-(--ui-text-primary) file:mr-2 file:rounded-md file:border file:border-(--ui-stroke-secondary) file:bg-(--ui-bg-quinary) file:px-2 file:py-1 file:text-xs file:text-(--ui-text-primary)"
                onChange={event => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {error ? <p className="text-xs text-(--ui-error)">{error}</p> : null}

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                关闭
              </Button>
              <Button disabled={busy || !file || !shopId || creating} onClick={() => void upload()}>
                {busy ? '正在导入' : '上传'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
