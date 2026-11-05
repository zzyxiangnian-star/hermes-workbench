import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { getIssueSummary } from './products'

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

export function getOpenIssueCount(): number | undefined {
  return total
}

export function subscribeOpenIssueCount(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useOpenIssueCount(): number | undefined {
  return useSyncExternalStore(subscribeOpenIssueCount, getOpenIssueCount, () => undefined)
}

export async function refreshOpenIssueCount(): Promise<void> {
  try {
    const summary = await getIssueSummary()
    setTotal(summary.total_open)
  } catch {
    setTotal(undefined)
  }
}

export function ensureOpenIssuePolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshOpenIssueCount()
  timer = window.setInterval(() => {
    void refreshOpenIssueCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshOpenIssueCount()
  })
}

export function stopOpenIssuePolling(): void {
  if (timer !== undefined) {
    window.clearInterval(timer)
    timer = undefined
  }
  started = false
}
