// 通过 Hermes 插件后端（dashboard/plugin_api.py）查看、启动工作台后端。
// 只有用插件包装好（Python 部分已启用）时才有；手动只放了 plugin.js 的电脑上调用会失败，界面就不显示按钮。

type Rest = <T>(path: string, opts?: { method?: string; body?: unknown; timeoutMs?: number }) => Promise<T>

export interface BackendStatus {
  running: boolean
  phase: 'stopped' | 'installing' | 'starting' | 'running' | 'failed'
  mode?: 'demo' | 'normal' | null
  version?: string | null
  message?: string
  address?: string
  data_dir?: string
}

let rest: Rest | null = null

export function setPluginRest(fn: Rest | undefined): void {
  rest = fn ?? null
}

export async function getBackendStatus(): Promise<BackendStatus | null> {
  if (!rest) return null
  try {
    return await rest<BackendStatus>('/backend', { timeoutMs: 5000 })
  } catch {
    return null
  }
}

export async function startBackend(demo: boolean): Promise<BackendStatus> {
  if (!rest) throw new Error('这台电脑的 Hermes 没有启用工作台插件的后台部分')
  return rest<BackendStatus>('/backend/start', { method: 'POST', body: { demo }, timeoutMs: 30000 })
}
