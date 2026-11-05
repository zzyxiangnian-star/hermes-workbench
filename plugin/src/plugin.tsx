import type { ReactNode } from 'react'
import { host, ROUTES_AREA, type RouteContribution } from '@hermes/plugin-sdk'
import { injectPluginCss } from './inject-css'
import { brandWorkbench } from './modules/brand'
import { ecommerceWorkbench } from './modules/ecommerce'
import {
  listWorkbenches,
  registerWorkbench,
  setNavigator,
  syncLocationFromPath,
  toPath
} from './registry'
import { restoreWorkbenchPath, watchWorkbenchPath } from './restore'
import { WorkbenchPage } from './WorkbenchPage'
import { WorkbenchPane } from './WorkbenchPane'

interface PluginContext {
  register: (contribution: {
    id: string
    area: string
    title?: string
    data?: unknown
    render?: () => ReactNode
  }) => (() => void) | void
  onDispose?: (fn: () => void) => void
}

const BUILTIN_WORKBENCHES = [ecommerceWorkbench, brandWorkbench]

function setupWorkbenchPlugin(ctx: PluginContext) {
  // 0. 注入打包构建时生成的 Tailwind 样式（卸载时移除）
  injectPluginCss(ctx)

  // 1. 注册内置的两个工作台模块（电商、品牌活动）
  const disposeWorkbenches = BUILTIN_WORKBENCHES.map(wb => registerWorkbench(wb))

  // 2. 注入导航函数：参考 apps/desktop/src/sdk/index.ts 第 642-654 行 host.navigate
  setNavigator(path => {
    host.navigate(path)
  })

  // 外部插件比内置路由晚加载。刷新时宿主的 path="*" 会先把地址拉回新对话，
  // 这里用刷新前记下的路径再跳回去。直接粘贴地址打开新窗口没有这份记录，回不来。
  restoreWorkbenchPath()
  const stopWatchingPath = watchWorkbenchPath()

  // 3. 同步当前路由位置：
  // Hermes SDK (apps/desktop/src/sdk/index.ts) 目前未在 host.state 中暴露当前路由路径 atom，
  // 但桌面端采用 HashRouter（host.navigate 内部写入 window.location.hash = `#${to}`），
  // 因此通过读取 window.location.hash 并监听 hashchange/popstate 来同步当前工作台分页。
  // 若路由不是工作台路径（例如切回某个对话），syncLocationFromPath 会将 location 置空，清除左栏高亮。
  const syncFromWindowHash = () => {
    if (typeof window === 'undefined') return
    const hashPath = window.location.hash.replace(/^#/, '')
    syncLocationFromPath(hashPath)
  }
  syncFromWindowHash()
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', syncFromWindowHash)
    window.addEventListener('popstate', syncFromWindowHash)
  }

  // 4. 注册左栏“工作台”面板
  // 照抄自 apps/desktop/src/plugins/hermes-bots/plugin.tsx 第 445-487 行
  ctx.register({
    id: 'pane',
    area: 'panes',
    title: '工作台',
    data: {
      placement: 'left',
      width: '260px',
      collapsible: true,
      hideOnly: true,
      tabTitle: () => '工作台',
      tabTitleText: () => '工作台',
      dock: {
        pane: 'sessions',
        pos: 'center',
        enforce: true
      }
    },
    render: () => <WorkbenchPane />
  })

  // 5. 注册主区域页面路由（带中文标题）。路径是单段 /wb-<工作台>-<分页>，
  // 多段 /workbench/<wb>/<page> 会被宿主当成聊天路由。
  // 参考 apps/desktop/src/plugins/kanban/plugin.tsx 第 107-113 行 与 apps/desktop/src/app/chat/route-tile.tsx 第 54 行。
  for (const wb of listWorkbenches()) {
    for (const page of wb.pages) {
      const path = toPath({ workbench: wb.id, page: page.id })
      ctx.register({
        id: `page:${wb.id}:${page.id}`,
        area: ROUTES_AREA,
        title: `${wb.name} · ${page.label}`,
        data: { path } satisfies RouteContribution,
        render: () => <WorkbenchPage />
      })
    }
  }

  const cleanup = () => {
    stopWatchingPath()
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', syncFromWindowHash)
      window.removeEventListener('popstate', syncFromWindowHash)
    }
    for (const dispose of disposeWorkbenches) {
      dispose()
    }
  }

  ctx.onDispose?.(cleanup)
  return cleanup
}

export default {
  id: 'hermes-workbench',
  name: '工作台',
  description: '电商、品牌活动等部门工作台：左上角“工作台”标签和各业务页面。',
  register: setupWorkbenchPlugin
}
