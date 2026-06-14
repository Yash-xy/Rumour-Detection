"""Predict route: /predict — rumor detection endpoint."""

import datetime
import json
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import History
from app.security import verify_token
from app.services.rumor_detector import check_claim

import os
import google.generativeai as genai

router = APIRouter()


class TextInput(BaseModel):
    text: str


def _get_optional_user_id(request: Request):
    """Try to extract user_id from JWT token if present. Returns None for anonymous users."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1]
    payload = verify_token(token)
    if not payload:
        return None
    return payload.get("user_id")


from typing import Tuple, Optional

def get_gemini_explanation(claim: str, scheme: dict) -> Tuple[Optional[str], Optional[str]]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None, "Gemini API key not configured."
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = f"""
A user submitted the following claim about an Indian government scheme:
"{claim}"

The most closely related official scheme we found is "{scheme.get('scheme', 'Unknown')}".
Official Details: {scheme.get('details', '')}
Official Benefits: {scheme.get('benefits', '')}
Official Eligibility: {scheme.get('eligibility', '')}

Based strictly on the official details, evaluate if the user's claim is True, False, or Partially True. Briefly explain why in 1 or 2 concise natural language sentences. Do not use markdown formatting.
"""
        response = model.generate_content(prompt)
        return response.text.strip(), None
    except Exception as e:
        print(f"Gemini error: {e}")
        return None, str(e)


@router.post("/predict")
def predict(payload: TextInput, request: Request, db: Session = Depends(get_db)):
    text_input = payload.text
    results = check_claim(text_input)
    now = datetime.datetime.utcnow()

    if not results:
        response_data = {
            "scheme": "Unknown",
            "level": "Low",
            "similarity": 0.0,
            "verdict": "Rumor",
            "confidence": 0,
            "timestamp": now.isoformat(),
            "related_schemes": [],
            "explanation": None,
        }
        user_id = _get_optional_user_id(request)
        entry = History(
            text=text_input, verdict="Rumor", confidence=0,
            scheme="Unknown", similarity=0.0, level="Low",
            timestamp=now, related_schemes_json="[]", user_id=user_id,
            explanation=None,
        )
        db.add(entry)
        db.commit()
        return response_data

    top = results[0]
    similarity = top["similarity"]
    confidence = int(similarity * 100)
    level = "High" if confidence > 75 else "Medium" if confidence > 50 else "Low"
    verdict = "Not Rumor" if similarity > 0.50 else "Rumor"
    
    # Explanation is now fetched on-demand via separate endpoint

    related_schemes = []
    for r in results[:4]:
        related_schemes.append({
            "scheme": r.get("scheme", "Unknown"),
            "slug": r.get("slug", ""),
            "level": r.get("level", "Unknown"),
            "similarity": r.get("similarity", 0),
            "verdict": r.get("verdict", "Rumor"),
            "details": r.get("details", ""),
            "benefits": r.get("benefits", ""),
            "eligibility": r.get("eligibility", ""),
            "application": r.get("application", ""),
            "documents": r.get("documents", ""),
            "category": r.get("category", ""),
            "tags": r.get("tags", ""),
            "status": r.get("status", ""),
            "sentiment": r.get("sentiment", ""),
        })

    user_id = _get_optional_user_id(request)
    entry = History(
        text=text_input, verdict=verdict, confidence=confidence,
        scheme=top["scheme"], similarity=similarity, level=level,
        timestamp=now, related_schemes_json=json.dumps(related_schemes),
        user_id=user_id, explanation=None,
        status=top.get("status", ""), sentiment=top.get("sentiment", ""),
    )
    db.add(entry)
    db.commit()

    return {
        "scheme": top["scheme"], "slug": top.get("slug", ""), "level": level, "similarity": similarity,
        "verdict": verdict, "confidence": confidence,
        "timestamp": now.isoformat(),
        "details": top.get("details", ""), "benefits": top.get("benefits", ""),
        "eligibility": top.get("eligibility", ""),
        "application": top.get("application", ""), "documents": top.get("documents", ""),
        "category": top.get("category", ""), "tags": top.get("tags", ""), 
        "status": top.get("status", ""), "sentiment": top.get("sentiment", ""),
        "related_schemes": related_schemes,
        "explanation": None,
        "history_id": entry.id,
    }

@router.post("/predict/explain/{history_id}")
def generate_explanation(history_id: int, request: Request, db: Session = Depends(get_db)):
    """Generate and save AI explanation for a specific history item."""
    entry = db.query(History).filter(History.id == history_id).first()
    if not entry:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="History not found")
        
    if entry.explanation:
        return {"explanation": entry.explanation}
        
    user_id = _get_optional_user_id(request)
    if entry.user_id is not None and entry.user_id != user_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized")
        
    related = []
    if entry.related_schemes_json:
        try:
            related = json.loads(entry.related_schemes_json)
        except:
            pass
            
    top_scheme = {"scheme": entry.scheme, "details": "", "benefits": "", "eligibility": ""}
    if related and len(related) > 0:
        top_scheme = related[0]
        
    explanation, error_msg = get_gemini_explanation(entry.text, top_scheme)
    if explanation:
        entry.explanation = explanation
        db.commit()
        return {"explanation": explanation}
        
    from fastapi import HTTPException
    status_code = 429 if error_msg and ("429" in error_msg or "quota" in error_msg.lower()) else 500
    
    if status_code == 429:
        user_detail = "Currently AI analysis is not available. Please try again later."
    else:
        user_detail = error_msg or "AI generation failed."
        
    raise HTTPException(status_code=status_code, detail=user_detail)
