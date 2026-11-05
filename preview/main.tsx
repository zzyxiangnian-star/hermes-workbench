import './preview.css'
import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Button, Codicon, EmptyState, cn } from '@hermes/plugin-sdk'
import { brandWorkbench } from '../src/modules/brand'
import { ecommerceWorkbench } from '../src/modules/ecommerce'
import {
  openPage,
  registerWorkbench,
  setNavigator,
  toPath,
  useLocation
} from '../src/registry'
import type { WorkbenchDef } from '../src/types'
import { WorkbenchPage } from '../src/WorkbenchPage'
import { WorkbenchPane } from '../src/WorkbenchPane'

const longNameWorkbench: WorkbenchDef = {
  id: 'long-demo',
  name: '跨境多渠道全域供应链协同工作台（超长名称截断演示）',
  codicon: 'briefcase',
  pages: [
    {
      id: 'audit',
      label: '海外仓备货异常与多币种结算毛利核对看板',
      codicon: 'graph',
      badge: () => 8,
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="graph" size="1.25rem" />}
            title="海外仓备货异常与多币种结算毛利核对看板"
            description="用于验证窄面板（200px）下超长工作台与分页名称的省略号截断及按需悬停 Tip。"
          />
        </div>
      )
    }
  ]
}

function registerDefaultModules(includeLongDemo: boolean): () => void {
  const cleanups = [
    registerWorkbench(ecommerceWorkbench),
    registerWorkbench(brandWorkbench)
  ]
  if (includeLongDemo) {
    cleanups.push(registerWorkbench(longNameWorkbench))
  }
  return () => {
    for (const fn of cleanups) fn()
  }
}

function PreviewApp() {
  const [dark, setDark] = useState(false)
  const [paneWidth, setPaneWidth] = useState<200 | 260 | 360>(260)
  const [emptyMode, setEmptyMode] = useState(false)
  const [longNameDemo, setLongNameDemo] = useState(false)
  const [currentPath, setCurrentPath] = useState('/workbench/ecommerce/overview')
  const location = useLocation()

  useEffect(() => {
    setNavigator(path => {
      setCurrentPath(path)
    })
  }, [])

  useEffect(() => {
    if (location) {
      setCurrentPath(toPath(location))
    }
  }, [location])

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [dark])

  useEffect(() => {
    if (emptyMode) {
      return
    }
    const cleanup = registerDefaultModules(longNameDemo)
    return cleanup
  }, [emptyMode, longNameDemo])

  return (
    <div className="flex h-full w-full flex-col bg-(--ui-bg-editor) text-(--ui-text-primary)">
      {/* 顶部调试控制条 */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-(--ui-stroke-secondary) bg-(--ui-bg-quinary) px-3 py-1.5 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 font-medium text-(--ui-text-secondary)">W01 预览控制：</span>

          <Button
            size="xs"
            variant={dark ? 'default' : 'outline'}
            onClick={() => setDark(d => !d)}
          >
            {dark ? '深色模式 (点击切浅色)' : '浅色模式 (点击切深色)'}
          </Button>

          <span className="mx-1 text-(--ui-text-quaternary)">|</span>
          <span className="text-(--ui-text-tertiary)">面板宽：</span>
          {([200, 260, 360] as const).map(w => (
            <Button
              key={w}
              size="xs"
              variant={paneWidth === w ? 'default' : 'outline'}
              onClick={() => setPaneWidth(w)}
            >
              {w}px
            </Button>
          ))}

          <span className="mx-1 text-(--ui-text-quaternary)">|</span>
          <Button
            size="xs"
            variant={emptyMode ? 'default' : 'outline'}
            onClick={() => setEmptyMode(e => !e)}
          >
            {emptyMode ? '恢复工作台模块' : '没有工作台'}
          </Button>

          <Button
            size="xs"
            variant={
              location?.page === 'non-existent-page' ? 'default' : 'outline'
            }
            onClick={() => {
              setEmptyMode(false)
              openPage({ workbench: 'ecommerce', page: 'non-existent-page' })
            }}
          >
            打开一个不存在的分页
          </Button>

          <Button
            size="xs"
            variant={longNameDemo ? 'default' : 'outline'}
            onClick={() => setLongNameDemo(v => !v)}
          >
            {longNameDemo ? '隐藏超长名称演示' : '超长名称截断演示'}
          </Button>
        </div>

        <code className="rounded border border-(--ui-stroke-secondary) bg-(--ui-bg-editor) px-2 py-0.5 text-xs text-(--ui-text-secondary)">
          {currentPath}
        </code>
      </div>

      {/* 模拟 Hermes 主界面：左侧面板 + 右侧主区域 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 左栏：模拟 Hermes 侧栏（顶部“会话 | 机器人 | 工作台”标签条 + WorkbenchPane） */}
        <aside
          style={{ width: `${paneWidth}px` }}
          className="flex h-full shrink-0 flex-col border-r border-(--ui-stroke-secondary) bg-(--ui-bg-editor)"
        >
          {/* 模拟 Hermes 顶部 PaneTabStrip */}
          <div
            role="tablist"
            aria-label="左栏面板标签"
            className="flex h-9 shrink-0 items-center border-b border-(--ui-stroke-secondary) select-none"
          >
            <div
              role="tab"
              aria-selected="false"
              className="flex h-full items-center border-r border-(--ui-stroke-secondary) px-3 text-xs font-medium text-(--ui-text-tertiary)"
            >
              会话
            </div>
            <div
              role="tab"
              aria-selected="false"
              className="flex h-full items-center border-r border-(--ui-stroke-secondary) px-3 text-xs font-medium text-(--ui-text-tertiary)"
            >
              机器人
            </div>
            <div
              role="tab"
              aria-selected="true"
              style={{ boxShadow: 'inset 0 -2px 0 var(--ui-accent)' }}
              className={cn(
                'flex h-full items-center border-r border-(--ui-stroke-secondary) px-3 text-xs font-medium text-(--ui-text-primary)'
              )}
            >
              工作台
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <WorkbenchPane />
          </div>
        </aside>

        {/* 右侧主区域：WorkbenchPage */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <WorkbenchPage />
        </div>
      </div>
    </div>
  )
}

const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <StrictMode>
      <PreviewApp />
    </StrictMode>
  )
}
