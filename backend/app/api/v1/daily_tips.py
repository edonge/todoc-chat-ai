from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.api.deps import get_db
from app.models import DailyTip
from app.schemas.daily_tip import DailyTipResponse

router = APIRouter(prefix="/daily-tips", tags=["daily-tips"])


@router.get("/random", response_model=Optional[DailyTipResponse])
def get_random_tip(
    language: str = Query(default="kor", regex="^(kor|eng)$"),
    db: Session = Depends(get_db)
):
    """Get a random daily tip by language (kor/eng)"""
    tip = db.query(DailyTip).filter(
        DailyTip.language == language
    ).order_by(func.random()).first()
    return tip
