from sqlalchemy import Column, Integer, Text, TIMESTAMP, func
from app.core.database import Base


class DailyTip(Base):
    __tablename__ = "daily_tips"

    id = Column(Integer, primary_key=True)
    content = Column(Text, nullable=False)
    language = Column(Text, nullable=False, default="kor")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), nullable=False)
