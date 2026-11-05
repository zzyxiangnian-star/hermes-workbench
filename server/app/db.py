"""数据库连接、建表，以及第一次启动时写入默认规则。"""

import os
from collections.abc import Iterator
from pathlib import Path

from fastapi import Request
from sqlalchemy import create_engine, event, func, inspect, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.ad_rules import DEFAULT_AD_RULES
from app.brand import seed_banned_words
from app.models import AdRule, Rule
from app.rules import DEFAULT_RULES

ALEMBIC_INI = Path(__file__).resolve().parent.parent / "alembic.ini"


def default_database_url() -> str:
    configured = os.environ.get("WORKBENCH_DATABASE_URL")
    if configured:
        return configured
    path = Path(__file__).resolve().parent.parent / "data" / "workbench.db"
    path.parent.mkdir(parents=True, exist_ok=True)
    return "sqlite:///" + path.resolve().as_posix()


def make_engine(url: str) -> Engine:
    kwargs: dict = {"future": True}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
        if url in {"sqlite://", "sqlite:///:memory:"} or url.endswith(":memory:"):
            kwargs["poolclass"] = StaticPool
    engine = create_engine(url, **kwargs)
    if engine.dialect.name == "sqlite":

        @event.listens_for(engine, "connect")
        def _enable_foreign_keys(dbapi_connection, _connection_record) -> None:
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

    return engine


def make_session_factory(engine: Engine) -> sessionmaker:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False, future=True)


def seed_rules(session: Session) -> None:
    if not session.scalar(select(func.count()).select_from(Rule)):
        for item in DEFAULT_RULES:
            session.add(
                Rule(
                    kind=item["kind"],
                    name=item["name"],
                    params=dict(item["params"]),
                    level=item["level"],
                    enabled=True,
                )
            )
    if not session.scalar(select(func.count()).select_from(AdRule)):
        for item in DEFAULT_AD_RULES:
            session.add(
                AdRule(
                    kind=item["kind"],
                    name=item["name"],
                    params=dict(item["params"]),
                    level=item["level"],
                    enabled=True,
                )
            )


def upgrade_to_head(engine: Engine, url: str) -> None:
    from alembic import command
    from alembic.config import Config

    config = Config(str(ALEMBIC_INI))
    previous = os.environ.get("WB_ALEMBIC_URL_LOCK")
    os.environ["WB_ALEMBIC_URL_LOCK"] = "1"
    try:
        config.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
        tables = set(inspect(engine).get_table_names())
        # C01 曾经用 create_all 建库，没有 alembic_version。先盖章再升级，避免把已有表再建一遍。
        if "shops" in tables and "alembic_version" not in tables:
            command.stamp(config, "c01")
        command.upgrade(config, "head")
    finally:
        if previous is None:
            os.environ.pop("WB_ALEMBIC_URL_LOCK", None)
        else:
            os.environ["WB_ALEMBIC_URL_LOCK"] = previous


def init_db(engine: Engine, url: str) -> None:
    upgrade_to_head(engine, url)
    factory = make_session_factory(engine)
    with factory() as session:
        seed_rules(session)
        seed_banned_words(session)
        session.commit()


def get_db(request: Request) -> Iterator[Session]:
    session = request.app.state.session_factory()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
