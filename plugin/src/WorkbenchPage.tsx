import { Button, ErrorState, cn } from '@hermes/plugin-sdk'
import { openPage, useLocation, useWorkbenches } from './registry'

/**
 * 对应 hermes-agent 源码 `apps/desktop/src/app/layout-constants.ts` 第 9 行：
 * `export const PAGE_INSET_X = 'px-[clamp(1.25rem,4vw,4rem)]'`
 * 为避免宿主未编译任意值 Tailwind 类，使用 wb- 前缀样式类实现相同的左右边距。
 */
const PAGE_STYLE = `
.wb-page-inset {
  padding-inline: clamp(1.25rem, 4vw, 4rem);
}
.wb-page-header {
  min-height: 2.75rem;
}
.wb-breadcrumb-link {
  font-size: 0.8125rem;
  line-height: 1.35;
  cursor: pointer;
  color: var(--ui-text-secondary);
  transition: color 100ms ease-out;
}
.wb-breadcrumb-link:hover {
  transition: none;
  color: var(--ui-text-primary);
}
.wb-breadcrumb-current {
  font-size: 0.8125rem;
  line-height: 1.35;
  color: var(--ui-text-primary);
  font-weight: 500;
}
@media (prefers-reduced-motion: reduce) {
  .wb-breadcrumb-link {
    transition: none !important;
  }
}
`

export function WorkbenchPage() {
  const workbenches = useWorkbenches()
  const location = useLocation()

  const activeWorkbench = location
    ? workbenches.find(wb => wb.id === location.workbench)
    : undefined
  const activePage =
    activeWorkbench && location
      ? activeWorkbench.pages.find(page => page.id === location.page)
      : undefined

  const handleBackHome = () => {
    const targetWorkbench = activeWorkbench ?? workbenches[0]
    const firstPage = targetWorkbench?.pages[0]
    if (targetWorkbench && firstPage) {
      openPage({ workbench: targetWorkbench.id, page: firstPage.id })
    }
  }

  if (!activeWorkbench || !activePage) {
    return (
      <div className="flex h-full w-full flex-col bg-(--ui-bg-editor) text-(--ui-text-primary)">
        <style>{PAGE_STYLE}</style>
        <header className="wb-page-inset wb-page-header flex shrink-0 items-center justify-between gap-3 border-b border-(--ui-stroke-secondary) py-2">
          <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1.5">
            {activeWorkbench ? (
              <>
                <button
                  type="button"
                  onClick={handleBackHome}
                  className="wb-breadcrumb-link truncate rounded px-1 py-0.5 outline-none focus-visible:outline-2 focus-visible:outline-(--ui-accent)"
                >
                  {activeWorkbench.name}
                </button>
                <span className="text-xs text-(--ui-text-quaternary)" aria-hidden="true">
                  /
                </span>
              </>
            ) : null}
            <span className="wb-breadcrumb-current truncate">找不到这个页面</span>
          </nav>
          <div data-slot="actions" className="flex shrink-0 items-center gap-2" />
        </header>

        <main className="wb-page-inset flex min-h-0 flex-1 flex-col items-center justify-center py-8">
          <ErrorState
            title="找不到这个页面"
            description={
              location
                ? `未找到路径 /workbench/${location.workbench}/${location.page} 对应的工作台分页。`
                : '当前路径未匹配到任何已注册的工作台分页。'
            }
          >
            {workbenches.length > 0 && (
              <Button onClick={handleBackHome} size="sm" variant="outline">
                回到工作台首页
              </Button>
            )}
          </ErrorState>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col bg-(--ui-bg-editor) text-(--ui-text-primary)">
      <style>{PAGE_STYLE}</style>
      <header className="wb-page-inset wb-page-header flex shrink-0 items-center justify-between gap-3 border-b border-(--ui-stroke-secondary) py-2">
        <nav aria-label="面包屑" className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              const firstPage = activeWorkbench.pages[0]
              if (firstPage) {
                openPage({ workbench: activeWorkbench.id, page: firstPage.id })
              }
            }}
            className={cn(
              'wb-breadcrumb-link truncate rounded px-1 py-0.5 outline-none',
              'focus-visible:outline-2 focus-visible:outline-(--ui-accent)'
            )}
          >
            {activeWorkbench.name}
          </button>
          <span className="text-xs text-(--ui-text-quaternary)" aria-hidden="true">
            /
          </span>
          <span className="wb-breadcrumb-current truncate px-1 py-0.5" aria-current="page">
            {activePage.label}
          </span>
        </nav>
        <div data-slot="actions" className="flex shrink-0 items-center gap-2" />
      </header>

      <main className="wb-page-inset flex min-h-0 flex-1 flex-col overflow-y-auto py-6">
        {activePage.render()}
      </main>
    </div>
  )
}
