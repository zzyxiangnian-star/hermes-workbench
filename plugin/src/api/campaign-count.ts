import { useSyncExternalStore } from 'react'
import { subscribeApiBase } from '../settings'
import { listCampaigns } from './brand'

type Listener = () => void

const POLL_MS = 60_000
let running: number | undefined
const listeners = new Set<Listener>()
let timer: number | undefined
let started = false

function emit(): void {
  for (const listener of listeners) listener()
}

function setRunning(next: number | undefined): void {
  if (next === running) return
  running = next
  emit()
}

export function getRunningCampaignCount(): number | undefined {
  return running
}

export function useRunningCampaignCount(): number | undefined {
  return useSyncExternalStore(
    listener => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    getRunningCampaignCount,
    () => undefined
  )
}

export async function refreshRunningCampaignCount(): Promise<void> {
  try {
    const campaigns = await listCampaigns()
    setRunning(campaigns.filter(item => item.phase === 'running').length)
  } catch {
    setRunning(undefined)
  }
}

export function ensureRunningCampaignPolling(): void {
  if (started || typeof window === 'undefined') return
  started = true
  void refreshRunningCampaignCount()
  timer = window.setInterval(() => {
    void refreshRunningCampaignCount()
  }, POLL_MS)
  subscribeApiBase(() => {
    void refreshRunningCampaignCount()
  })
}

export function stopRunningCampaignPolling(): void {
  if (timer !== undefined) window.clearInterval(timer)
  timer = undefined
  started = false
}
