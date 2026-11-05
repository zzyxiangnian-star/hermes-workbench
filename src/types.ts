import type { ReactNode } from 'react'
export interface WorkbenchPageDef {
  id: string                 // 'overview'、'products' ……，同一工作台内唯一
  label: string              // '经营'
  codicon: string            // codicon 名称，如 'graph'
  badge?: () => number | undefined   // 待办数，undefined 或 0 时不显示
  render: () => ReactNode
}
export interface WorkbenchDef {
  id: string                 // 'ecommerce'、'brand'
  name: string               // '电商'
  codicon: string
  pages: WorkbenchPageDef[]  // 第一个是默认页
}
export interface WorkbenchLocation { workbench: string; page: string }
