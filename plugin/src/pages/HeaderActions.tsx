import { useLayoutEffect, useRef, type ReactNode } from 'react'

/**
 * 挂到页头的 `data-slot="actions"`。插件运行时没有 react-dom，不能用 createPortal。
 * 外层 span 留在原处：后端断开时旁边的提示会换掉，React 仍按这个 span 插入节点。
 * 只搬走里面的按钮。卸掉时先放回去，避免 removeChild 找不到节点。
 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const placeholder = useRef<HTMLSpanElement>(null)
  const holder = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const node = holder.current
    const anchor = placeholder.current
    const slot = document.querySelector('[data-slot="actions"]')
    if (!node || !anchor || !(slot instanceof HTMLElement)) return
    slot.appendChild(node)
    return () => {
      if (anchor.isConnected) anchor.appendChild(node)
      else node.remove()
    }
  }, [])
  return (
    <span ref={placeholder} className="contents">
      <div ref={holder} className="flex shrink-0 items-center gap-2">
        {children}
      </div>
    </span>
  )
}
