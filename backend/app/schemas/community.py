from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.enums import CommunityCategoryEnum


class PostCreate(BaseModel):
    kid_id: Optional[int] = None
    category: CommunityCategoryEnum
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    image_url: Optional[str] = None


class PostUpdate(BaseModel):
    category: Optional[CommunityCategoryEnum] = None
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    image_url: Optional[str] = None


class AuthorResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)


class CommentResponse(BaseModel):
    id: int
    post_id: int
    content: str
    created_at: datetime
    author: AuthorResponse

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    id: int
    user_id: int
    kid_id: Optional[int]
    category: CommunityCategoryEnum
    title: str
    content: str
    image_url: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    likes_count: int = 0
    author: Optional[AuthorResponse] = None
    comment_count: int = 0
    is_liked: bool = False
    kid_name: Optional[str] = None
    kid_image_url: Optional[str] = None

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    posts: List[PostResponse]
    total: int
    page: int
    limit: int
