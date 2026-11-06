import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { getInstallSummary } from './installs'

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

export function getNeedsActionCount(): number | undefined {
  return needsAction
}

export function useNeedsActionCount(): number | undefined {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getNeedsActionCount,
    () => undefined
  )
}

export async function refreshNeedsActionCount(): Promise<void> {
  try {
    const summary = await getInstallSummary()
    setNeedsAction(summary.needs_action)
  } catch {
    setNeedsAction(undefined)
  }
}

export function ensureNeedsActionPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshNeedsActionCount()
  timer = window.setInterval(() => {
    void refreshNeedsActionCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshNeedsActionCount()
  })
}

export function stopNeedsActionPolling(): void {
  if (timer !== undefined) window.clearInterval(timer)
  timer = undefined
  started = false
}
