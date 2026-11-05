import { Codicon, EmptyState } from '@hermes/plugin-sdk'
import type { WorkbenchDef } from '../types'

export const brandWorkbench: WorkbenchDef = {
  id: 'brand',
  name: '品牌活动',
  codicon: 'megaphone',
  pages: [
    {
      id: 'campaigns',
      label: '活动',
      codicon: 'calendar',
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="calendar" size="1.25rem" />}
            title="活动"
            description="管理品牌活动排期、关键节点倒计时、各环节物料齐套进度与活动复盘。"
          />
        </div>
      )
    },
    {
      id: 'content',
      label: '内容',
      codicon: 'edit',
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="edit" size="1.25rem" />}
            title="内容"
            description="按产品资料起草推文与脚本，自动检查禁用词并适配公众号、小红书、抖音格式。"
          />
        </div>
      )
    },
    {
      id: 'design',
      label: '设计',
      codicon: 'symbol-color',
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="symbol-color" size="1.25rem" />}
            title="设计"
            description="汇总海报与视觉物料需求，对比各渠道尺寸规格并跟踪历次审稿修改版本。"
          />
        </div>
      )
    },
    {
      id: 'assets',
      label: '资料',
      codicon: 'library',
      render: () => (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            icon={<Codicon name="library" size="1.25rem" />}
            title="资料"
            description="集中存放产品参数表、品牌视觉规范、禁用词库与可商用素材，供起草和审查直接引用。"
          />
        </div>
      )
    }
  ]
}
