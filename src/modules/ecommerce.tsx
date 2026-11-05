import { Codicon, EmptyState } from '@hermes/plugin-sdk'
import type { WorkbenchDef } from '../types'

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
      badge: () => 5,
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="package" size="1.25rem" />}
            title="商品"
            description="每天按规则检查底价、最低价、活动报名和库存，只列出异常。"
          />
        </div>
      )
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
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="tools" size="1.25rem" />}
            title="安装"
            description="跟踪需要上门安装的订单进度、预约时间、服务商派单与完工回访结果。"
          />
        </div>
      )
    }
  ]
}
