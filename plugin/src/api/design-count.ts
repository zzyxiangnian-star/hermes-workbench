import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { getDesignSummary } from './design'

type Listener = () => void

const POLL_MS = 60_000
let needsAction: number | undefined
const listeners = new Set<Listener>()
let timer: number | undefined
let started = false

function emit(): void {
  for (const listener of listeners) listener()
}

function setNeedsAction(next: number | undefined): void {
  if (next === needsAction) return
  needsAction = next
  emit()
}

export function getDesignNeedsActionCount(): number | undefined {
  return needsAction
}

export function useDesignNeedsActionCount(): number | undefined {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getDesignNeedsActionCount,
    () => undefined
  )
}

export async function refreshDesignNeedsActionCount(): Promise<void> {
  try {
    const summary = await getDesignSummary()
    setNeedsAction(summary.needs_action)
  } catch {
    setNeedsAction(undefined)
  }
}

export function ensureDesignNeedsActionPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshDesignNeedsActionCount()
  timer = window.setInterval(() => {
    void refreshDesignNeedsActionCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshDesignNeedsActionCount()
  })
}
