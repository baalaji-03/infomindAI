"""
InfoMind AI - ASGI Application Entrypoint
Supports 'uvicorn backend.app:app' specified in startup scripts.
"""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from main import app, init_db

__all__ = ["app", "init_db"]
