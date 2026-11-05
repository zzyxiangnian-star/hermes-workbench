import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Button, Codicon, cn } from '@hermes/plugin-sdk'

export function SideDrawer({
  open,
  title,
  description,
  onClose,
  children,
  footer
}: {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  // Runtime plugins may import only @hermes/plugin-sdk and react, so this
  // overlay stays in the page tree. `fixed` still covers the viewport.
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="关闭浮层"
        className="absolute inset-0 bg-black/22 backdrop-blur-[0.125rem]"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-md flex-col border-l border-(--ui-stroke-secondary) bg-(--ui-bg-elevated) text-(--ui-text-primary) shadow-md"
      >
        <header className="flex items-start gap-3 border-b border-(--ui-stroke-secondary) p-3 pr-10">
          <div className="min-w-0">
            <h2 className="truncate text-[0.9375rem] font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs leading-relaxed text-(--ui-text-tertiary)">{description}</p>
            ) : null}
          </div>
        </header>
        <Button
          aria-label="关闭"
          variant="ghost"
          size="icon-xs"
          className="absolute top-3 right-3"
          onClick={onClose}
        >
          <Codicon name="close" size="1rem" />
        </Button>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-(--ui-stroke-secondary) p-3">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>
  )
}

export function FieldText({
  label,
  children,
  className
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <div className="text-[0.6875rem] text-(--ui-text-tertiary)">{label}</div>
      <div className="mt-0.5 text-xs text-(--ui-text-primary)">{children}</div>
    </div>
  )
}
