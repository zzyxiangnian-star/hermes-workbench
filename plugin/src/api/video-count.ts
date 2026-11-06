import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { getVideoSummary } from './video'

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

export function getVideoNeedsActionCount(): number | undefined {
  return needsAction
}

export function useVideoNeedsActionCount(): number | undefined {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getVideoNeedsActionCount,
    () => undefined
  )
}

export async function refreshVideoNeedsActionCount(): Promise<void> {
  try {
    const summary = await getVideoSummary()
    setNeedsAction(summary.needs_action)
  } catch {
    setNeedsAction(undefined)
  }
}

export function ensureVideoNeedsActionPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshVideoNeedsActionCount()
  timer = window.setInterval(() => {
    void refreshVideoNeedsActionCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshVideoNeedsActionCount()
  })
}
