import { ensureRunningCampaignPolling, getRunningCampaignCount } from '../api/campaign-count'
import { ensureInReviewPolling, getInReviewCount } from '../api/content-count'
import { ensureDesignNeedsActionPolling, getDesignNeedsActionCount } from '../api/design-count'
import { AssetsPage } from '../pages/assets/AssetsPage'
import { CampaignsPage } from '../pages/campaigns/CampaignsPage'
import { ContentsPage } from '../pages/contents/ContentsPage'
import { DesignPage } from '../pages/design/DesignPage'
import type { WorkbenchDef } from '../types'

ensureRunningCampaignPolling()
ensureInReviewPolling()
ensureDesignNeedsActionPolling()

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
      badge: () => getDesignNeedsActionCount(),
      render: () => <DesignPage />
    },
    {
      id: 'assets',
      label: '资料',
      codicon: 'library',
      render: () => <AssetsPage />
    }
  ]
}
