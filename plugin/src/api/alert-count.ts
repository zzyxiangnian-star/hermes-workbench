import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { getAlertSummary } from './overview'

type Listener = () => void

const POLL_MS = 60_000
let total: number | undefined
const listeners = new Set<Listener>()
let timer: number | undefined
let started = false

function emit(): void {
  for (const listener of listeners) listener()
}

function setTotal(next: number | undefined): void {
  if (next === total) return
  total = next
  emit()
}

export function getOpenAlertCount(): number | undefined {
  return total
}

export function subscribeOpenAlertCount(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useOpenAlertCount(): number | undefined {
  return useSyncExternalStore(subscribeOpenAlertCount, getOpenAlertCount, () => undefined)
}

export async function refreshOpenAlertCount(): Promise<void> {
  try {
    const summary = await getAlertSummary()
    setTotal(summary.total_open)
  } catch {
    setTotal(undefined)
  }
}

export function ensureOpenAlertPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshOpenAlertCount()
  timer = window.setInterval(() => {
    void refreshOpenAlertCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshOpenAlertCount()
  })
}

export function stopOpenAlertPolling(): void {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
  started = false
}
