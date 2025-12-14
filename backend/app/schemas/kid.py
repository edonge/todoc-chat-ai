from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional


class KidCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    birth_date: date
    gender: str = Field(..., pattern="^(male|female)$")


class KidUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    birth_date: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(male|female)$")
    image_url: Optional[str] = None


class KidResponse(BaseModel):
    id: int
    user_id: int
    name: str
    birth_date: date
    gender: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class KidDashboard(BaseModel):
    kid: KidResponse
    recent_records: dict
    stats: dict
