import { apiFetch } from './client'

export interface BackupSnapshot {
  name: string
  bytes: number
}

export interface BackupList {
  dir: string
  snapshots: BackupSnapshot[]
}

export interface BackupResult {
  dir: string
  database: string
  database_bytes: number
  kept: number
  removed: string[]
  assets_copied: number
  assets_bytes: number
}

export interface HealthInfo {
  status: string
  version: string
}

export function getBackupList(): Promise<BackupList> {
  return apiFetch<BackupList>('/api/backup')
}

export function runBackup(): Promise<BackupResult> {
  return apiFetch<BackupResult>('/api/backup', { method: 'POST', timeoutMs: 120_000 })
}

export function getHealth(): Promise<HealthInfo> {
  return apiFetch<HealthInfo>('/api/health')
}
