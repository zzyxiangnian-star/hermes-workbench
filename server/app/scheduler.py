"""进程内的定时任务：早报，以及报表文件夹定时导入。WB_SCHEDULER=off 时都不启动。"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta

from sqlalchemy.orm import sessionmaker

from app.ad_rules import run_ad_rules
from app.folder_import import import_dir, scan
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
    every = _import_every()
    if import_dir() is not None and every:
        scheduler.add_job(
            run_folder_job,
            "interval",
            minutes=every,
            id="folder_import",
            replace_existing=True,
            kwargs={"session_factory": session_factory},
            max_instances=1,
            coalesce=True,
        )
    scheduler.start()
    return scheduler


def run_folder_job(session_factory: sessionmaker) -> None:
    try:
        result = scan(session_factory)
        if result["files"]:
            logger.info("folder import: %s ok, %s failed", result["imported"], result["failed"])
    except Exception:
        logger.exception("folder import failed")


def _import_every() -> int:
    raw = os.environ.get("WB_IMPORT_EVERY", "10").strip()
    try:
        value = int(raw)
    except ValueError as exc:
        raise RuntimeError("WB_IMPORT_EVERY 必须是分钟数（整数），0 表示只在早报前扫一次") from exc
    return max(value, 0)


def run_daily_job(session_factory: sessionmaker) -> None:
    """先导入报表文件夹里的新表，再查商品和投放，最后出昨天的日报。配了推送地址才发送。"""
    try:
        report_date = datetime.now(SHANGHAI).date() - timedelta(days=1)
        if import_dir() is not None:
            run_folder_job(session_factory)
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
