"""Scheme lookup routes: /schemes/search."""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db

router = APIRouter()


@router.get("/schemes/search")
def search_scheme(name: str = Query(..., description="Scheme name to look up"), db: Session = Depends(get_db)):
    """Look up a scheme's full details by name (partial match)."""
    row = db.execute(
        text(
            'SELECT scheme_name, slug, details, benefits, eligibility, application, documents, level, "schemeCategory", tags, validity, sentiment '
            'FROM schemes WHERE scheme_name ILIKE :name LIMIT 1'
        ),
        {"name": f"%{name}%"},
    ).fetchone()
    if not row:
        return JSONResponse(status_code=404, content={"detail": "Scheme not found"})
    m = row._mapping
    return {
        "scheme": m["scheme_name"],
        "slug": m["slug"] or "",
        "details": m["details"] or "",
        "benefits": m["benefits"] or "",
        "eligibility": m["eligibility"] or "",
        "application": m["application"] or "",
        "documents": m["documents"] or "",
        "level": m["level"] or "",
        "category": m["schemeCategory"] or "",
        "tags": m["tags"] or "",
        "status": m["validity"] or "",
        "sentiment": m["sentiment"] or "",
    }
