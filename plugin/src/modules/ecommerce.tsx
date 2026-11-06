import { Codicon, EmptyState } from '@hermes/plugin-sdk'
import { ensureNeedsActionPolling, getNeedsActionCount } from '../api/install-count'
import { ensureOpenIssuePolling, getOpenIssueCount } from '../api/open-count'
import { InstallsPage } from '../pages/installs/InstallsPage'
import { ProductsPage } from '../pages/products/ProductsPage'
import type { WorkbenchDef } from '../types'

ensureOpenIssuePolling()
ensureNeedsActionPolling()

export const ecommerceWorkbench: WorkbenchDef = {
  id: 'ecommerce',
  name: '电商',
  codicon: 'briefcase',
  pages: [
    {
      id: 'overview',
      label: '经营',
      codicon: 'graph',
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="graph" size="1.25rem" />}
            title="经营"
            description="汇总各平台店铺每日销售额、订单量、退款率与投放 ROI，异常波动第一时间提醒。"
          />
        </div>
      )
    },
    {
      id: 'products',
      label: '商品',
      codicon: 'package',
      badge: () => getOpenIssueCount(),
      render: () => <ProductsPage />
    },
    {
      id: 'customers',
      label: '客户',
      codicon: 'organization',
      badge: () => 12,
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="organization" size="1.25rem" />}
            title="客户"
            description="汇总加购未买、询盘未成交和待回访客户，由 AI 先拟好跟进草稿，人工确认后再发送。"
          />
        </div>
      )
    },
    {
      id: 'install',
      label: '安装',
      codicon: 'tools',
      badge: () => getNeedsActionCount(),
      render: () => <InstallsPage />
    }
  ]
}
