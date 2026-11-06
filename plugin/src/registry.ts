import { useSyncExternalStore } from 'react'
import type { WorkbenchDef, WorkbenchLocation } from './types'

type Listener = () => void

const workbenchMap = new Map<string, WorkbenchDef>()
let workbenchesSnapshot: WorkbenchDef[] = []
const workbenchListeners = new Set<Listener>()

function emitWorkbenches(): void {
  workbenchesSnapshot = Array.from(workbenchMap.values())
  for (const listener of workbenchListeners) {
    listener()
  }
}

function subscribeWorkbenches(listener: Listener): () => void {
  workbenchListeners.add(listener)
  return () => {
    workbenchListeners.delete(listener)
  }
}

export function registerWorkbench(def: WorkbenchDef): () => void {
  workbenchMap.set(def.id, def)
  emitWorkbenches()

  // 若尚未初始化位置，默认指向第一个注册的工作台首页
  if (!locationSnapshot && def.pages.length > 0) {
    setLocationInternal({ workbench: def.id, page: def.pages[0].id })
  }

  return () => {
    const current = workbenchMap.get(def.id)
    if (current === def) {
      workbenchMap.delete(def.id)
      emitWorkbenches()
    }
  }
}

export function listWorkbenches(): WorkbenchDef[] {
  return workbenchesSnapshot
}

export function useWorkbenches(): WorkbenchDef[] {
  return useSyncExternalStore(subscribeWorkbenches, listWorkbenches, listWorkbenches)
}

// Hermes RouteContribution 只保证单段路径（routes.ts：“One segment; no params”）。
// `/workbench/<wb>/<page>` 有三段，宿主会把它落到聊天视图并新开一个 UNTITLED SESSION。
// 因此用单段 `/wb-<workbench>-<page>`，例如 `/wb-ecommerce-products`。
export function toPath(loc: WorkbenchLocation): string {
  return `/wb-${encodeURIComponent(loc.workbench)}-${encodeURIComponent(loc.page)}`
}

export function parsePath(path: string): WorkbenchLocation | undefined {
  if (!path) return undefined
  const clean = path.replace(/^#/, '').split('?')[0].trim()
  const match = /^\/wb-([^/?#]+)-([^/?#]+)\/?$/.exec(clean)
  if (!match) return undefined
  try {
    return {
      workbench: decodeURIComponent(match[1]),
      page: decodeURIComponent(match[2])
    }
  } catch {
    return {
      workbench: match[1],
      page: match[2]
    }
  }
}

function readInitialLocation(): WorkbenchLocation | undefined {
  if (typeof window === 'undefined') return undefined
  const fromHash = parsePath(window.location.hash)
  if (fromHash) return fromHash
  return parsePath(window.location.pathname)
}

let locationSnapshot: WorkbenchLocation | undefined = readInitialLocation()
const locationListeners = new Set<Listener>()
let navigatorFn: ((path: string) => void) | undefined

function setLocationInternal(next: WorkbenchLocation | undefined): void {
  if (
    locationSnapshot?.workbench === next?.workbench &&
    locationSnapshot?.page === next?.page
  ) {
    return
  }
  locationSnapshot = next ? { workbench: next.workbench, page: next.page } : undefined
  for (const listener of locationListeners) {
    listener()
  }
}

function subscribeLocation(listener: Listener): () => void {
  locationListeners.add(listener)
  return () => {
    locationListeners.delete(listener)
  }
}

function getLocationSnapshot(): WorkbenchLocation | undefined {
  return locationSnapshot
}

export function useLocation(): WorkbenchLocation | undefined {
  return useSyncExternalStore(subscribeLocation, getLocationSnapshot, getLocationSnapshot)
}

export function setNavigator(fn: (path: string) => void): void {
  navigatorFn = fn
}

export function syncLocationFromPath(path: string): void {
  const parsed = parsePath(path)
  setLocationInternal(parsed)
}

export function openPage(loc: WorkbenchLocation): void {
  const path = toPath(loc)
  setLocationInternal(loc)
  navigatorFn?.(path)
}
