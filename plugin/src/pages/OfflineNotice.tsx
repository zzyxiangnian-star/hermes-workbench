import { useEffect, useState } from 'react'
import { Button, Loader } from '@hermes/plugin-sdk'
import { EmptyBlock } from './EmptyBlock'
import { refreshAllCounts } from '../api/refresh-counts'
import { getBackendStatus, startBackend, type BackendStatus } from '../api/backend-control'
import { useApiBase } from '../settings'
import { WorkbenchSettings } from './WorkbenchSettings'

const BUSY = new Set(['installing', 'starting'])

export function OfflineNotice({ detail, onRetry }: { detail?: string; onRetry: () => void }) {
  const apiBase = useApiBase()
  const [editing, setEditing] = useState(false)
  // null：插件的后台部分不可用（只手动放了 plugin.js），不显示启动按钮
  const [backend, setBackend] = useState<BackendStatus | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const busy = backend != null && BUSY.has(backend.phase)

  const retry = () => {
    onRetry()
    refreshAllCounts()
  }

  useEffect(() => {
    let cancelled = false
    void getBackendStatus().then(value => {
      if (!cancelled) setBackend(value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 正在准备时每 3 秒看一次，起来了就自动重试
  useEffect(() => {
    if (!busy) return
    const timer = window.setInterval(() => {
      void getBackendStatus().then(value => {
        if (!value) return
        setBackend(value)
        if (value.running) retry()
      })
    }, 3000)
    return () => window.clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy])

  const start = async (demo: boolean) => {
    setStartError(null)
    try {
      const value = await startBackend(demo)
      setBackend(value)
      if (value.running) retry()
      else if (value.phase === 'failed') setStartError(value.message || '启动失败')
    } catch (error) {
      setStartError(error instanceof Error ? error.message : '启动失败')
    }
  }

  const description =
    detail && detail !== '没有连上工作台服务' ? `${detail}。当前地址 ${apiBase}` : `当前地址 ${apiBase}`

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
      <EmptyBlock
        title="没有连上工作台服务"
        description={
          backend
            ? description
            : `${description}。可以在 Hermes 对话里说“启动工作台”，或双击桌面上的“工作台后端”。`
        }
      >
        {backend && !busy ? (
          <>
            <Button size="sm" onClick={() => void start(false)}>
              启动工作台
            </Button>
            <Button size="sm" variant="outline" onClick={() => void start(true)}>
              用演示数据启动
            </Button>
          </>
        ) : null}
        <Button size="sm" variant="outline" onClick={retry}>
          重试
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          更改地址
        </Button>
      </EmptyBlock>
      {busy ? (
        <div className="flex items-center gap-2 text-xs text-(--ui-text-secondary)">
          <Loader />
          {backend?.message || '正在准备'}（第一次要联网装依赖，几分钟）
        </div>
      ) : null}
      {startError || backend?.phase === 'failed' ? (
        <p className="max-w-md text-center text-xs text-destructive">{startError || backend?.message}</p>
      ) : null}
      {editing ? (
        <div className="w-full max-w-sm">
          <WorkbenchSettings
            onAddressSaved={() => {
              setEditing(false)
              onRetry()
            }}
          />
        </div>
      ) : null}
    </div>
  )
}
