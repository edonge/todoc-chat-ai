from pydantic import BaseModel
from datetime import datetime


class DailyTipResponse(BaseModel):
    id: int
    content: str
    language: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
