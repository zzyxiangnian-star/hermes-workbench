import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.models import Base

config = context.config
# 只有直接跑 alembic 命令时才按 alembic.ini 配日志。随 workbench-api 启动时不能配：
# fileConfig 默认会关掉已有的 logger，uvicorn 的“已启动”就不打印了，看起来像卡在最后一条迁移上。
if config.config_file_name is not None and not os.environ.get("WB_ALEMBIC_URL_LOCK"):
    fileConfig(config.config_file_name, disable_existing_loggers=False)

if not os.environ.get("WB_ALEMBIC_URL_LOCK"):
    env_url = os.environ.get("WORKBENCH_DATABASE_URL")
    if env_url:
        config.set_main_option("sqlalchemy.url", env_url.replace("%", "%%"))

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=config.get_main_option("sqlalchemy.url"),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
