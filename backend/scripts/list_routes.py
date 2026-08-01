"""Print all registered API routes (dev utility)."""

from app.main import app

for r in app.routes:
    p = getattr(r, "path", None)
    if p and p.startswith("/api"):
        methods = ",".join(sorted(getattr(r, "methods", []) or []))
        print(f"  {methods:12s} {p}")
