"""进程内的早报定时任务。WB_SCHEDULER=off 时不启动。"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta

from sqlalchemy.orm import sessionmaker

from app.ad_rules import run_ad_rules
from app.overview import SHANGHAI
from app.reports import build_daily_report, deliver, webhook_targets
from app.rules import run_enabled_rules

logger = logging.getLogger("workbench")


def start_scheduler(session_factory: sessionmaker):
    if os.environ.get("WB_SCHEDULER", "on").strip().lower() == "off":
        return None
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.cron import CronTrigger

    hour, minute = _daily_at(os.environ.get("WB_DAILY_AT", "08:30"))
    scheduler = BackgroundScheduler(timezone=SHANGHAI)
    scheduler.add_job(
        run_daily_job,
        CronTrigger(hour=hour, minute=minute, timezone=SHANGHAI),
        id="daily_report",
        replace_existing=True,
        kwargs={"session_factory": session_factory},
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()
    return scheduler


def run_daily_job(session_factory: sessionmaker) -> None:
    """先查商品和投放，再出昨天的日报。配了推送地址才发送。"""
    try:
        report_date = datetime.now(SHANGHAI).date() - timedelta(days=1)
        with session_factory() as session:
            run_enabled_rules(session)
            run_ad_rules(session)
            report = build_daily_report(session, report_date)
            session.commit()
        if webhook_targets():
            deliver(report, dry_run=False)
    except Exception:
        logger.exception("daily job failed")


def _daily_at(value: str) -> tuple[int, int]:
    text = (value or "08:30").strip()
    parts = text.split(":")
    if len(parts) != 2:
        raise RuntimeError("WB_DAILY_AT 必须是 HH:MM")
    try:
        hour, minute = int(parts[0]), int(parts[1])
    except ValueError as exc:
        raise RuntimeError("WB_DAILY_AT 必须是 HH:MM") from exc
    if hour not in range(24) or minute not in range(60):
        raise RuntimeError("WB_DAILY_AT 必须是 HH:MM")
    return hour, minute
