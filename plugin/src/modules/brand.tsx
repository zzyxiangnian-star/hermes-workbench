import { Codicon, EmptyState } from '@hermes/plugin-sdk'
import { ensureRunningCampaignPolling, getRunningCampaignCount } from '../api/campaign-count'
import { ensureInReviewPolling, getInReviewCount } from '../api/content-count'
import { AssetsPage } from '../pages/assets/AssetsPage'
import { CampaignsPage } from '../pages/campaigns/CampaignsPage'
import { ContentsPage } from '../pages/contents/ContentsPage'
import type { WorkbenchDef } from '../types'

ensureRunningCampaignPolling()
ensureInReviewPolling()

export const brandWorkbench: WorkbenchDef = {
  id: 'brand',
  name: '品牌活动',
  codicon: 'megaphone',
  pages: [
    {
      id: 'campaigns',
      label: '活动',
      codicon: 'calendar',
      badge: () => getRunningCampaignCount(),
      render: () => <CampaignsPage />
    },
    {
      id: 'content',
      label: '内容',
      codicon: 'edit',
      badge: () => getInReviewCount(),
      render: () => <ContentsPage />
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
      render: () => <AssetsPage />
    }
  ]
}
