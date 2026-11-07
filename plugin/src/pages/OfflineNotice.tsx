import { useState } from 'react'
import { Button } from '@hermes/plugin-sdk'
import { EmptyBlock } from './EmptyBlock'
import { refreshAllCounts } from '../api/refresh-counts'
import { useApiBase } from '../settings'
import { WorkbenchSettings } from './WorkbenchSettings'

export function OfflineNotice({ detail, onRetry }: { detail?: string; onRetry: () => void }) {
  const apiBase = useApiBase()
  const [editing, setEditing] = useState(false)
  const description =
    detail && detail !== '没有连上工作台服务' ? `${detail}。当前地址 ${apiBase}` : `当前地址 ${apiBase}`

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10">
      <EmptyBlock title="没有连上工作台服务" description={description}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onRetry()
            refreshAllCounts()
          }}
        >
          重试
        </Button>
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          更改地址
        </Button>
      </EmptyBlock>
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
