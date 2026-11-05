import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'hermes-workbench:api-base'
export const DEFAULT_API_BASE = 'http://127.0.0.1:8000'

type Listener = () => void

function readStoredBase(): string {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw && raw.trim()) return raw.trim().replace(/\/$/, '')
  } catch {
    // 预览或受限环境读不到 localStorage 时用默认地址
  }
  return DEFAULT_API_BASE
}

let currentBase = readStoredBase()
const listeners = new Set<Listener>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function getApiBase(): string {
  return currentBase
}

export function subscribeApiBase(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useApiBase(): string {
  return useSyncExternalStore(subscribeApiBase, getApiBase, () => DEFAULT_API_BASE)
}

/** 保存后端地址。空字符串恢复默认。返回 false 表示不是 http(s) 地址。 */
export function setApiBase(next: string): boolean {
  const trimmed = next.trim().replace(/\/$/, '')
  const value = trimmed || DEFAULT_API_BASE
  if (!/^https?:\/\/.+/i.test(value)) return false
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // 写失败仍更新内存，方便当前页重试
  }
  if (value === currentBase) return true
  currentBase = value
  emit()
  return true
}
