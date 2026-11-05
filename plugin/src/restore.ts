import { host } from '@hermes/plugin-sdk'
import { listWorkbenches, parsePath, toPath } from './registry'

const RESTORE_KEY = 'hermes-workbench:restore'
const RESTORE_MS = 30_000

interface RestoreRecord {
  path: string
  at: number
}

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

function remember(): void {
  try {
    const path = isRegisteredPath(hashPath())
    if (!path) {
      sessionStorage.removeItem(RESTORE_KEY)
      return
    }
    const record: RestoreRecord = { path, at: Date.now() }
    sessionStorage.setItem(RESTORE_KEY, JSON.stringify(record))
  } catch {
    // sessionStorage 不可用时，刷新后留在新对话。
  }
}

/** 读出并立刻删掉刷新前记下的路径。只在 30 秒内、且当前是新对话时跳回去。 */
export function restoreWorkbenchPath(): void {
  let raw: string | null = null
  try {
    raw = sessionStorage.getItem(RESTORE_KEY)
    sessionStorage.removeItem(RESTORE_KEY)
  } catch {
    return
  }
  if (!raw || !isNewChat()) return
  let record: RestoreRecord
  try {
    record = JSON.parse(raw) as RestoreRecord
  } catch {
    return
  }
  if (typeof record.at !== 'number' || Date.now() - record.at > RESTORE_MS) return
  const path = typeof record.path === 'string' ? isRegisteredPath(record.path) : undefined
  if (!path) return
  host.navigate(path)
}

export function watchWorkbenchPath(): () => void {
  window.addEventListener('pagehide', remember)
  window.addEventListener('beforeunload', remember)
  return () => {
    window.removeEventListener('pagehide', remember)
    window.removeEventListener('beforeunload', remember)
  }
}
