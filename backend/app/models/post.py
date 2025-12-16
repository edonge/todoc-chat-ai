from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.enums import CommunityCategoryEnum


class Post(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    kid_id = Column(Integer, ForeignKey("kids.id", ondelete="SET NULL"))
    category = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    image_url = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())
    likes_count = Column(Integer, default=0, server_default="0")

    user = relationship("User", back_populates="posts")
    kid = relationship("Kid", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")
