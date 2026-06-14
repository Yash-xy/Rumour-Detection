"""History routes: /history, /history/public, /history/{id}."""

import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import History, User
from app.routes.auth import get_current_user

router = APIRouter()


def _serialize_history(item, include_user=False):
    """Convert a History ORM object to a JSON-friendly dict."""
    related = []
    if item.related_schemes_json:
        try:
            related = json.loads(item.related_schemes_json)
        except Exception:
            related = []

    data = {
        "id": item.id,
        "text": item.text,
        "verdict": item.verdict,
        "confidence": item.confidence or 0,
        "scheme": item.scheme or "Unknown",
        "similarity": item.similarity or 0,
        "level": item.level or "Low",
        "timestamp": item.timestamp.isoformat() if item.timestamp else None,
        "isRumor": item.verdict == "Rumor",
        "status": item.status or "N/A",
        "sentiment": item.sentiment or "N/A",
        "related_schemes": related,
        "explanation": getattr(item, "explanation", None),
    }

    if include_user and item.user:
        data["user_name"] = item.user.name
    elif include_user:
        data["user_name"] = "Anonymous"

    return data


@router.get("/history/public")
def get_public_history(
    skip: int = Query(0, description="Number of items to skip"),
    limit: int = Query(20, description="Max number of items to return"),
    db: Session = Depends(get_db)
):
    """Public feed: returns searches by everyone (no auth required)."""
    total = db.query(History).count()
    items = (
        db.query(History)
        .outerjoin(User, History.user_id == User.id)
        .order_by(History.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "total": total,
        "items": [_serialize_history(item, include_user=True) for item in items]
    }


@router.get("/history")
def get_history(
    skip: int = Query(0, description="Number of items to skip"),
    limit: int = Query(20, description="Max number of items to return"),
    current_user=Depends(get_current_user), db: Session = Depends(get_db)
):
    """Personal history: returns the logged-in user's own searches."""
    query = db.query(History).filter(History.user_id == current_user.id)
    total = query.count()
    items = query.order_by(History.id.desc()).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "items": [_serialize_history(item) for item in items]
    }


@router.delete("/history/{id}")
def delete_item(id: int, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(History).filter(History.id == id, History.user_id == current_user.id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Deleted"}


@router.delete("/history")
def clear_all(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(History).filter(History.user_id == current_user.id).delete()
    db.commit()
    return {"message": "All history cleared"}
