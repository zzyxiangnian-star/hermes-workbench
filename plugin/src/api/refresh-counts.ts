import { refreshOpenAlertCount } from './alert-count'
import { refreshRunningCampaignCount } from './campaign-count'
import { refreshInReviewCount } from './content-count'
import { refreshDesignNeedsActionCount } from './design-count'
import { refreshOpenInquiryCount } from './inquiry-count'
import { refreshNeedsActionCount } from './install-count'
import { refreshOpenIssueCount } from './open-count'
import { refreshVideoNeedsActionCount } from './video-count'

/** 后端断开再连上时，左栏角标不用等 60 秒轮询，点“重试”就一起刷新。 */
export function refreshAllCounts(): void {
  void refreshOpenAlertCount()
  void refreshRunningCampaignCount()
  void refreshInReviewCount()
  void refreshDesignNeedsActionCount()
  void refreshOpenInquiryCount()
  void refreshNeedsActionCount()
  void refreshOpenIssueCount()
  void refreshVideoNeedsActionCount()
}
