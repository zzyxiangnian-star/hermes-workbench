import { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ErrorState,
  Loader
} from '@hermes/plugin-sdk'
import { isOfflineError } from '../../api/client'
import { getDailyReport, type DailyReport } from '../../api/overview'

export function ReportDialog({ open, date, onClose }: { open: boolean; date?: string; onClose: () => void }) {
  const [report, setReport] = useState<DailyReport | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [revision, setRevision] = useState(0)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setReport(null)
    setError(null)
    setCopied(null)
    getDailyReport(date).then(
      value => {
        if (!cancelled) setReport(value)
      },
      (reason: unknown) => {
        if (!cancelled) setError(reason)
      }
    )
    return () => {
      cancelled = true
    }
  }, [open, date, revision])

  const copy = async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report.markdown)
      setCopied('已复制，可以贴到群里')
    } catch {
      setCopied('复制失败，请手动选中文字复制')
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) onClose() }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>经营日报{report ? ` ${report.date}` : ''}</DialogTitle>
          <DialogDescription>和每天早上自动生成的是同一份。复制后由人发到群里。</DialogDescription>
        </DialogHeader>

        {!report && !error ? (
          <div className="flex items-center gap-2 py-6 text-xs text-(--ui-text-tertiary)">
            <Loader />
            正在生成
          </div>
        ) : null}

        {error ? (
          <ErrorState
            title={isOfflineError(error) ? '没有连上工作台服务' : '日报生成失败'}
            description={error instanceof Error ? error.message : '请重试'}
          >
            <Button size="sm" variant="outline" onClick={() => setRevision(value => value + 1)}>
              重试
            </Button>
          </ErrorState>
        ) : null}

        {report ? (
          <pre className="max-h-[60vh] overflow-y-auto rounded-md border border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) p-3 font-[inherit] text-xs leading-relaxed whitespace-pre-wrap text-(--ui-text-primary)">
            {report.markdown}
          </pre>
        ) : null}

        <DialogFooter>
          {copied ? <span className="mr-auto text-xs text-(--ui-text-secondary)">{copied}</span> : null}
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button disabled={!report} onClick={() => void copy()}>
            复制
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
