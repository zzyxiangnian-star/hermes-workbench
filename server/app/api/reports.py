from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.alerts import alert_out
from app.db import get_db
from app.overview import overview_payload
from app.reports import build_daily_report, deliver, report_day
from app.schemas import DailyReportOut, DailySendOut

router = APIRouter()


@router.get("/reports/daily", response_model=DailyReportOut)
def daily_report(day: date | None = Query(None, alias="date"), session: Session = Depends(get_db)) -> dict:
    report = build_daily_report(session, report_day(day))
    return _report_out(report)


@router.post("/reports/daily/send", response_model=DailySendOut)
def send_daily_report(
    day: date | None = Query(None, alias="date"),
    dry_run: bool = False,
    session: Session = Depends(get_db),
) -> dict:
    report = build_daily_report(session, report_day(day))
    return deliver(report, dry_run=dry_run)


def _report_out(report: dict) -> dict:
    return {
        "date": report["date"],
        "markdown": report["markdown"],
        "overview": overview_payload(report["overview"]),
        "abnormal_shops": report["abnormal_shops"],
        "open_issue_count": report["open_issue_count"],
        "alerts": [alert_out(item) for item in report["alerts"]],
    }
