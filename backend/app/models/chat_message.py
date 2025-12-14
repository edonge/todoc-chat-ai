from sqlalchemy import Column, Integer, Text, TIMESTAMP, func, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import SenderTypeEnum


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False)
    sender = Column(Enum(SenderTypeEnum), nullable=False)
    ai_mode_id = Column(Integer, ForeignKey("ai_modes.id"))
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")
    ai_mode = relationship("AIMode", back_populates="chat_messages")
