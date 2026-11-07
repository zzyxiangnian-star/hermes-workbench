import type { ReactNode } from 'react'
import { EmptyState } from '@hermes/plugin-sdk'

/**
 * Hermes 的 EmptyState 只认 title / description，传进去的按钮会被丢掉。
 * 要带按钮的空状态都用这个：按钮放在 EmptyState 下面。
 */
export function EmptyBlock({
  title,
  description,
  children
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <EmptyState title={title} description={description} className="min-h-0" />
      {children ? <div className="flex flex-wrap items-center justify-center gap-2">{children}</div> : null}
    </div>
  )
}
