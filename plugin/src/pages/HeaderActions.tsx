import { useLayoutEffect, useRef, type ReactNode } from 'react'

/** 挂到页头的 `data-slot="actions"`。插件运行时没有 react-dom，不能用 createPortal。 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const holder = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const node = holder.current
    const slot = document.querySelector('[data-slot="actions"]')
    if (!node || !(slot instanceof HTMLElement)) return
    const parent = node.parentNode
    slot.appendChild(node)
    return () => {
      // 旁边的兄弟节点会在后续渲染里被换掉，按当初的 next 插回去会抛 NotFoundError，整页被卸掉。
      if (parent?.isConnected) parent.appendChild(node)
      else node.remove()
    }
  }, [])
  return (
    <div ref={holder} className="flex shrink-0 items-center gap-2">
      {children}
    </div>
  )
}
