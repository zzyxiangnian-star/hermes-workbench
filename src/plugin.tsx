import type { ReactNode } from 'react'
import { host, ROUTES_AREA, type RouteContribution } from '@hermes/plugin-sdk'
import { brandWorkbench } from './modules/brand'
import { ecommerceWorkbench } from './modules/ecommerce'
import {
  listWorkbenches,
  registerWorkbench,
  setNavigator,
  syncLocationFromPath,
  toPath
} from './registry'
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
  // 1. 注册内置的两个工作台模块（电商、品牌活动）
  const disposeWorkbenches = BUILTIN_WORKBENCHES.map(wb => registerWorkbench(wb))

  // 2. 注入导航函数：参考 apps/desktop/src/sdk/index.ts 第 642-654 行 host.navigate
  setNavigator(path => {
    host.navigate(path)
  })

  // 3. 同步当前路由位置：
  // Hermes SDK (apps/desktop/src/sdk/index.ts) 目前未在 host.state 中暴露当前路由路径 atom，
  // 但桌面端采用 HashRouter（host.navigate 内部写入 window.location.hash = `#${to}`），
  // 因此通过读取 window.location.hash 并监听 hashchange 来同步当前工作台分页。
  const syncFromWindowHash = () => {
    if (typeof window === 'undefined') return
    const hashPath = window.location.hash.replace(/^#/, '')
    if (hashPath) {
      syncLocationFromPath(hashPath)
    }
  }
  syncFromWindowHash()
  if (typeof window !== 'undefined') {
    window.addEventListener('hashchange', syncFromWindowHash)
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

  // 5. 注册主区域页面路由
  // 参考 apps/desktop/src/plugins/kanban/plugin.tsx 第 107-113 行。
  // 注意：apps/desktop/src/app/routes.ts 第 119-121 行 isContributedPath(pathname) 使用
  // `route.path === pathname` 严格相等判断，不支持 `/workbench/*` 通配。
  // 因此为每个工作台的每个分页显式注册一条精确路由，同时额外注册一条 `/workbench/*` 兜底。
  for (const wb of listWorkbenches()) {
    for (const page of wb.pages) {
      const path = toPath({ workbench: wb.id, page: page.id })
      ctx.register({
        id: `page:${wb.id}:${page.id}`,
        area: ROUTES_AREA,
        data: { path } satisfies RouteContribution,
        render: () => <WorkbenchPage />
      })
    }
  }

  ctx.register({
    id: 'page:wildcard',
    area: ROUTES_AREA,
    data: { path: '/workbench/*' } satisfies RouteContribution,
    render: () => <WorkbenchPage />
  })

  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('hashchange', syncFromWindowHash)
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
  setup: setupWorkbenchPlugin,
  register: setupWorkbenchPlugin
}
