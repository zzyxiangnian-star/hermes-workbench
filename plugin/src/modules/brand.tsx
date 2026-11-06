import { ensureRunningCampaignPolling, getRunningCampaignCount } from '../api/campaign-count'
import { ensureInReviewPolling, getInReviewCount } from '../api/content-count'
import { ensureDesignNeedsActionPolling, getDesignNeedsActionCount } from '../api/design-count'
import { ensureVideoNeedsActionPolling, getVideoNeedsActionCount } from '../api/video-count'
import { AssetsPage } from '../pages/assets/AssetsPage'
import { CampaignsPage } from '../pages/campaigns/CampaignsPage'
import { ContentsPage } from '../pages/contents/ContentsPage'
import { DesignPage } from '../pages/design/DesignPage'
import { VideoPage } from '../pages/video/VideoPage'
import type { WorkbenchDef } from '../types'

ensureRunningCampaignPolling()
ensureInReviewPolling()
ensureDesignNeedsActionPolling()
ensureVideoNeedsActionPolling()

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
      id: 'video',
      label: '视频',
      codicon: 'device-camera-video',
      badge: () => getVideoNeedsActionCount(),
      render: () => <VideoPage />
    },
    {
      id: 'assets',
      label: '资料',
      codicon: 'library',
      render: () => <AssetsPage />
    }
  ]
}
