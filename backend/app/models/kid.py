from sqlalchemy import Column, Integer, String, Date, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Kid(Base):
    __tablename__ = "kids"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(50), nullable=False)
    birth_date = Column(Date, nullable=False)
    gender = Column(String(20))
    image_url = Column(String(500), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="kids")
    records = relationship("Record", back_populates="kid", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="kid", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="kid")
