import { useLayoutEffect, useRef, type ReactNode } from 'react'

/** 挂到页头的 `data-slot="actions"`。插件运行时没有 react-dom，不能用 createPortal。 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const holder = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const node = holder.current
    const slot = document.querySelector('[data-slot="actions"]')
    if (!node || !(slot instanceof HTMLElement)) return
    const parent = node.parentNode
    const next = node.nextSibling
    slot.appendChild(node)
    return () => {
      if (parent?.isConnected) parent.insertBefore(node, next)
    }
  }, [])
  return (
    <div ref={holder} className="flex shrink-0 items-center gap-2">
      {children}
    </div>
  )
}
