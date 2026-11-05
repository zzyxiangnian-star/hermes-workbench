"""数据库连接、建表，以及第一次启动时写入默认规则。"""

import os
from collections.abc import Iterator
from pathlib import Path

from fastapi import Request
from sqlalchemy import create_engine, event, func, select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.models import Base, Rule
from app.rules import DEFAULT_RULES


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
    count = session.scalar(select(func.count()).select_from(Rule))
    if count:
        return
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


def init_db(engine: Engine) -> None:
    Base.metadata.create_all(engine)
    factory = make_session_factory(engine)
    with factory() as session:
        seed_rules(session)
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
