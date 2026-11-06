"""导出 CSV 时防公式注入：顾客名、地址、留言是外面来的，以 = + - @ 开头时 Excel 会当公式执行。"""

from __future__ import annotations

import csv
import re
from typing import Any, Iterable

_NUMBER = re.compile(r"^[+-]?\d+(\.\d+)?$")


def safe_cell(value: Any) -> Any:
    if isinstance(value, str) and value[:1] in ("=", "+", "-", "@", "\t", "\r") and not _NUMBER.match(value):
        return "'" + value
    return value


class SafeWriter:
    def __init__(self, buffer, **kwargs: Any) -> None:
        self._writer = csv.writer(buffer, **kwargs)

    def writerow(self, row: Iterable[Any]) -> Any:
        return self._writer.writerow([safe_cell(v) for v in row])

    def writerows(self, rows: Iterable[Iterable[Any]]) -> None:
        for row in rows:
            self.writerow(row)


def writer(buffer, **kwargs: Any) -> SafeWriter:
    return SafeWriter(buffer, **kwargs)
