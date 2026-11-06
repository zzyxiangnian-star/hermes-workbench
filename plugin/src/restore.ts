import { host } from '@hermes/plugin-sdk'
import { listWorkbenches, parsePath, toPath } from './registry'

const RESTORE_KEY = 'hermes-workbench:restore'
const RESTORE_MS = 60_000
const BOOT_MS = 2_000

interface RestoreRecord {
  path: string
  at: number
}

let bootUntil = 0

function hashPath(): string {
  return window.location.hash.replace(/^#/, '')
}

function isNewChat(): boolean {
  const hash = window.location.hash
  return hash === '' || hash === '#' || hash === '#/'
}

function isRegisteredPath(path: string): string | undefined {
  const loc = parsePath(path)
  if (!loc) return undefined
  const workbench = listWorkbenches().find(item => item.id === loc.workbench)
  if (!workbench?.pages.some(page => page.id === loc.page)) return undefined
  return toPath(loc)
}

function readRecord(): RestoreRecord | undefined {
  try {
    const raw = sessionStorage.getItem(RESTORE_KEY)
    if (!raw) return undefined
    const record = JSON.parse(raw) as RestoreRecord
    if (typeof record.at !== 'number' || typeof record.path !== 'string') return undefined
    return record
  } catch {
    return undefined
  }
}

function writeRecord(path: string): void {
  try {
    const record: RestoreRecord = { path, at: Date.now() }
    sessionStorage.setItem(RESTORE_KEY, JSON.stringify(record))
  } catch {
    // sessionStorage 不可用时，刷新后留在新对话。
  }
}

function clearRecord(): void {
  try {
    sessionStorage.removeItem(RESTORE_KEY)
  } catch {
    // 忽略受限环境。
  }
}

function remember(): void {
  const path = isRegisteredPath(hashPath())
  if (path) writeRecord(path)
}

function tryRestore(): void {
  if (!isNewChat()) return
  const record = readRecord()
  if (!record || Date.now() - record.at > RESTORE_MS) return
  const path = isRegisteredPath(record.path)
  if (!path) return
  host.navigate(path)
}

/**
 * 在路由注册之后调用。
 * 刷新时浏览器会先留下原来的 hash，宿主的 `path="*"` 再把它改成 `#/`。
 * 若这时把记录删掉，等地址变成新对话就跳不回去了。启动后两秒内看到 `#/` 才跳。
 */
export function installPathRestore(): () => void {
  bootUntil = Date.now() + BOOT_MS
  const onHash = () => {
    const path = isRegisteredPath(hashPath())
    if (path) {
      writeRecord(path)
      return
    }
    if (Date.now() < bootUntil) {
      tryRestore()
      return
    }
    clearRecord()
  }
  const onHide = () => {
    if (isRegisteredPath(hashPath())) remember()
    else if (Date.now() >= bootUntil) clearRecord()
  }
  window.addEventListener('hashchange', onHash)
  window.addEventListener('pagehide', onHide)
  window.addEventListener('beforeunload', onHide)
  const interval = window.setInterval(remember, 5_000)
  remember()
  tryRestore()
  const timers = [0, 50, 300, 1000].map(delay => window.setTimeout(tryRestore, delay))
  return () => {
    window.removeEventListener('hashchange', onHash)
    window.removeEventListener('pagehide', onHide)
    window.removeEventListener('beforeunload', onHide)
    window.clearInterval(interval)
    for (const timer of timers) window.clearTimeout(timer)
  }
}
