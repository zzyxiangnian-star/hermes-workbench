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
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@hermes/plugin-sdk'
import { ApiError } from '../../api/client'
import { importOrders } from '../../api/installs'
import {
  createShop,
  getFolderImport,
  importProducts,
  scanFolderImport,
  type FolderImportStatus,
  type FolderScanResult,
  type ImportResult,
  type Shop
} from '../../api/products'
import { PLATFORM_NAME, platformName } from './labels'

const PLATFORMS = ['tmall', 'jd', 'pdd', 'douyin'] as const

export function ImportDialog({
  open,
  shops,
  initialKind = 'products',
  onClose,
  onDone
}: {
  open: boolean
  shops: Shop[]
  initialKind?: 'products' | 'orders'
  onClose: () => void
  onDone: () => void
}) {
  const [kind, setKind] = useState<'products' | 'orders'>(initialKind)
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
    setKind(initialKind)
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
      const imported = kind === 'orders' ? await importOrders(Number(shopId), file) : await importProducts(Number(shopId), file)
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
          <DialogTitle>{kind === 'orders' ? '导入订单' : '导入报表'}</DialogTitle>
          <DialogDescription>
            {kind === 'orders'
              ? '选择店铺和订单表。买了需安装商品的订单会生成工单。'
              : '选择店铺和 xlsx / csv 文件。导入完成后会自动按规则检查。'}
          </DialogDescription>
        </DialogHeader>

        <FolderImportRow open={open} />

        {result ? (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-sm text-(--ui-text-primary)">
              成功 {result.rows_ok} 行，失败 {result.rows_failed} 行
              {result.installs ? `，新建工单 ${result.installs.created} 张` : ''}
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
                {kind === 'orders' ? '完成' : '查看商品'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <SegmentedControl
              options={[
                { id: 'products', label: '商品' },
                { id: 'orders', label: '订单' }
              ]}
              value={kind}
              sizing="content"
              onChange={value => setKind(value)}
            />
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

            {error ? <p className="text-xs text-destructive">{error}</p> : null}

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

const FOLDER_KIND: Record<string, string> = {
  products: '商品',
  metrics: '经营',
  ad_spend: '投放',
  orders: '订单'
}

function FolderImportRow({ open }: { open: boolean }) {
  const [status, setStatus] = useState<FolderImportStatus | null>(null)
  const [scan, setScan] = useState<FolderScanResult | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setScan(null)
    setScanError(null)
    setStatusError(null)
    getFolderImport().then(
      value => {
        if (!cancelled) setStatus(value)
      },
      (reason: unknown) => {
        if (!cancelled) setStatusError(reason instanceof Error ? reason.message : '读不到报表文件夹')
      }
    )
    return () => {
      cancelled = true
    }
  }, [open])

  const runScan = async () => {
    setBusy(true)
    setScanError(null)
    try {
      setScan(await scanFolderImport())
    } catch (reason) {
      setScan(null)
      setScanError(reason instanceof Error ? reason.message : '导入失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-(--ui-stroke-secondary) px-2 py-2 text-xs">
      {statusError ? <p className="text-destructive">{statusError}</p> : null}
      {!status && !statusError ? <p className="text-(--ui-text-tertiary)">正在查看报表文件夹…</p> : null}
      {status && !status.enabled ? (
        <p className="text-(--ui-text-secondary)">
          还没启用自动导入。把 server\scripts\env.example.bat 复制成 env.bat，填上 WB_IMPORT_DIR（每个店铺一个同名子文件夹），保存后重启后端。
        </p>
      ) : null}
      {status?.enabled ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-(--ui-text-secondary)">
            报表文件夹：{status.path}
            {status.exists ? '' : '（这个路径现在不存在）'}
            ，每 10 分钟自动导入
          </p>
          <Button size="xs" variant="outline" disabled={busy} onClick={() => void runScan()}>
            {busy ? '正在导入' : '立即导入'}
          </Button>
        </div>
      ) : null}
      {scanError ? <p className="text-destructive">{scanError}</p> : null}
      {scan ? (
        <div className="flex flex-col gap-1">
          <p className="text-(--ui-text-primary)">
            成功 {scan.imported} 个文件，失败 {scan.failed} 个
          </p>
          <ul className="max-h-32 overflow-y-auto border border-(--ui-stroke-secondary)">
            {scan.files.length === 0 ? (
              <li className="px-2 py-1.5 text-(--ui-text-tertiary)">文件夹里没有待导入的表。</li>
            ) : null}
            {scan.files.map(file => (
              <li key={`${file.shop}-${file.file}`} className="border-b border-(--ui-stroke-secondary) px-2 py-1.5">
                {file.shop} / {file.file}
                {file.kind ? `（${FOLDER_KIND[file.kind] ?? file.kind}）` : ''}：
                {file.ok
                  ? `成功 ${file.rows_ok} 行${file.rows_failed ? `，${file.rows_failed} 行没导进去` : ''}`
                  : `失败，${file.reason ?? '未知原因'}`}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
