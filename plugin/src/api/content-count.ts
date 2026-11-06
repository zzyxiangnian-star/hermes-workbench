import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { listContents } from './contents'

type Listener = () => void

const POLL_MS = 60_000
let inReview: number | undefined
const listeners = new Set<Listener>()
let timer: number | undefined
let started = false

function emit(): void {
  for (const listener of listeners) listener()
}

function setInReview(next: number | undefined): void {
  if (next === inReview) return
  inReview = next
  emit()
}

export function getInReviewCount(): number | undefined {
  return inReview
}

export function useInReviewCount(): number | undefined {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getInReviewCount,
    () => undefined
  )
}

export async function refreshInReviewCount(): Promise<void> {
  try {
    const items = await listContents({ status: 'in_review' })
    setInReview(items.length)
  } catch {
    setInReview(undefined)
  }
}

export function ensureInReviewPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshInReviewCount()
  timer = window.setInterval(() => {
    void refreshInReviewCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshInReviewCount()
  })
}

export function stopInReviewPolling(): void {
  if (timer !== undefined) window.clearInterval(timer)
  timer = undefined
  started = false
}
