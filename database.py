"""
InfoMind AI - Production SQLite Database Manager & Repository (Root Re-export)
System: Intelligent Information Understanding & Processing System
"""

import sys
from pathlib import Path

# Add backend directory to path if needed
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.database import (
    engine,
    SessionLocal,
    DatabaseSession,
    get_db,
    get_sqlalchemy_session,
    init_db,
    DB_PATH,
)

__all__ = [
    "engine",
    "SessionLocal",
    "DatabaseSession",
    "get_db",
    "get_sqlalchemy_session",
    "init_db",
    "DB_PATH",
]
