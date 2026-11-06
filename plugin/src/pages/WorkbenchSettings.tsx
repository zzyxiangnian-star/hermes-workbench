import { useState } from 'react'
import { Button, Input } from '@hermes/plugin-sdk'
import { getBackupList, getHealth, runBackup } from '../api/backup'
import { useQuery } from '../api/useQuery'
import { setApiBase, useApiBase } from '../settings'
import { errorText, formatBytes } from './video/labels'

export function WorkbenchSettings({ onAddressSaved }: { onAddressSaved?: () => void }) {
  const apiBase = useApiBase()
  const [draft, setDraft] = useState(apiBase)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [backupMessage, setBackupMessage] = useState<string | null>(null)
  const [backupError, setBackupError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const backups = useQuery(() => getBackupList(), [apiBase])
  const health = useQuery(() => getHealth(), [apiBase])

  return (
    <div className="flex flex-col gap-3 text-xs">
      <section className="flex flex-col gap-1">
        <h3 className="font-medium">后端地址</h3>
        <form
          className="flex flex-col gap-1"
          onSubmit={event => {
            event.preventDefault()
            const ok = setApiBase(draft)
            if (!ok) {
              setAddressError('地址需要以 http:// 或 https:// 开头')
              return
            }
            setAddressError(null)
            onAddressSaved?.()
          }}
        >
          <Input aria-label="工作台服务地址" value={draft} onChange={event => setDraft(event.target.value)} />
          <Button size="xs" type="submit" variant="outline">
            保存地址
          </Button>
        </form>
        {addressError ? <p className="text-destructive">{addressError}</p> : null}
        <p className="text-(--ui-text-tertiary)">
          后端版本 {health.data?.version ?? (health.error ? '没有读到' : '…')}
        </p>
      </section>
      <section className="flex flex-col gap-1">
        <h3 className="font-medium">数据备份</h3>
        <p className="text-(--ui-text-tertiary)">每天 12:30 自动备份，位置可在 env.bat 里改。</p>
        {backups.error ? (
          <p className="text-destructive">{errorText(backups.error, '备份目录没有读到')}</p>
        ) : (
          <>
            <p className="break-all text-(--ui-text-secondary)">{backups.data?.dir ?? '…'}</p>
            {backups.data && backups.data.snapshots.length === 0 ? (
              <p className="text-(--ui-text-tertiary)">还没有快照。</p>
            ) : (
              <ul>
                {(backups.data?.snapshots ?? []).slice(0, 5).map(item => (
                  <li key={item.name} className="truncate text-(--ui-text-secondary)">
                    {item.name} · {formatBytes(item.bytes)}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <Button
          size="xs"
          disabled={busy}
          onClick={() => {
            setBusy(true)
            setBackupError(null)
            setBackupMessage(null)
            void runBackup()
              .then(result => {
                setBackupMessage(`已备份：${result.database}，新复制 ${result.assets_copied} 个素材`)
                backups.reload()
              })
              .catch((reason: unknown) => setBackupError(errorText(reason, '没有备份成')))
              .finally(() => setBusy(false))
          }}
        >
          立即备份
        </Button>
        {backupMessage ? <p>{backupMessage}</p> : null}
        {backupError ? <p className="text-destructive">{backupError}</p> : null}
      </section>
    </div>
  )
}
