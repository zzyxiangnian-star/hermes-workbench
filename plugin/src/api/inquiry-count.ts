import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { getSegmentSummary } from './customers'

type Listener = () => void

const POLL_MS = 60_000
let openInquiries: number | undefined
const listeners = new Set<Listener>()
let timer: number | undefined
let started = false

function emit(): void {
  for (const listener of listeners) listener()
}

function setOpenInquiries(next: number | undefined): void {
  if (next === openInquiries) return
  openInquiries = next
  emit()
}

export function getOpenInquiryCount(): number | undefined {
  return openInquiries
}

export function useOpenInquiryCount(): number | undefined {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getOpenInquiryCount,
    () => undefined
  )
}

export async function refreshOpenInquiryCount(): Promise<void> {
  try {
    const summary = await getSegmentSummary()
    setOpenInquiries(summary.open_inquiries)
  } catch {
    setOpenInquiries(undefined)
  }
}

export function ensureOpenInquiryPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshOpenInquiryCount()
  timer = window.setInterval(() => {
    void refreshOpenInquiryCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshOpenInquiryCount()
  })
}

export function stopOpenInquiryPolling(): void {
  if (timer !== undefined) window.clearInterval(timer)
  timer = undefined
  started = false
}
