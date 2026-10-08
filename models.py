"""
InfoMind AI - SQLAlchemy ORM Data Models (Root Re-export)
Intelligent Information Understanding & Processing System
"""

import sys
from pathlib import Path

# Add backend directory to path if needed
backend_dir = Path(__file__).resolve().parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.models import (
    Base,
    User,
    Document,
    DocumentContent,
    DocumentPage,
    Insight,
    Conflict,
    MissingInformation,
    Comparison,
    ComparisonRecord,
    Action,
    HealthScore,
    SearchHistory,
    QAHistory,
)

__all__ = [
    "Base",
    "User",
    "Document",
    "DocumentContent",
    "DocumentPage",
    "Insight",
    "Conflict",
    "MissingInformation",
    "Comparison",
    "ComparisonRecord",
    "Action",
    "HealthScore",
    "SearchHistory",
    "QAHistory",
]
