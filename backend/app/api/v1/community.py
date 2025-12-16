from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from app.api.deps import get_db, get_current_user
from app.models import User, Post, Comment, PostLike, CommunityCategoryEnum, Kid
from app.schemas.community import (
    PostCreate, PostUpdate, PostResponse, PostListResponse,
    CommentCreate, CommentResponse, AuthorResponse
)

router = APIRouter(prefix="/community", tags=["community"])


def get_post_response(post: Post, current_user_id: int, db: Session) -> dict:
    comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar()
    is_liked = db.query(PostLike).filter(
        PostLike.post_id == post.id,
        PostLike.user_id == current_user_id
    ).first() is not None

    kid_name = None
    kid_image_url = None
    if post.kid_id:
        kid = db.query(Kid).filter(Kid.id == post.kid_id).first()
        if kid:
            kid_name = kid.name
            kid_image_url = kid.image_url

    return {
        "id": post.id,
        "user_id": post.user_id,
        "kid_id": post.kid_id,
        "category": post.category,
        "title": post.title,
        "content": post.content,
        "image_url": post.image_url,
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "likes_count": post.likes_count or 0,
        "author": AuthorResponse.model_validate(post.user) if post.user else None,
        "comment_count": comment_count or 0,
        "is_liked": is_liked,
        "kid_name": kid_name,
        "kid_image_url": kid_image_url,
    }


@router.get("/posts", response_model=PostListResponse)
def get_posts(
    category: Optional[CommunityCategoryEnum] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Post).options(joinedload(Post.user))

    if category:
        query = query.filter(Post.category == category)

    total = query.count()
    posts = query.order_by(Post.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    post_responses = [get_post_response(post, current_user.id, db) for post in posts]

    return PostListResponse(
        posts=post_responses,
        total=total,
        page=page,
        limit=limit
    )


@router.post("/posts", response_model=PostResponse, status_code=201)
def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        kid_id = data.kid_id
        if kid_id is None:
            kid = db.query(Kid).filter(Kid.user_id == current_user.id).first()
            if kid:
                kid_id = kid.id

        post = Post(
            user_id=current_user.id,
            kid_id=kid_id,
            category=data.category,
            title=data.title,
            content=data.content,
            image_url=data.image_url
        )
        db.add(post)
        db.commit()
        db.refresh(post)

        # Reload with user
        post = db.query(Post).options(joinedload(Post.user)).filter(Post.id == post.id).first()
        return get_post_response(post, current_user.id, db)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create post: {str(e)}")


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).options(joinedload(Post.user)).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    return get_post_response(post, current_user.id, db)


@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: int,
    data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")

    if data.category is not None:
        post.category = data.category
    if data.title is not None:
        post.title = data.title
    if data.content is not None:
        post.content = data.content
    if data.image_url is not None:
        post.image_url = data.image_url

    db.commit()
    db.refresh(post)

    post = db.query(Post).options(joinedload(Post.user)).filter(Post.id == post.id).first()
    return get_post_response(post, current_user.id, db)


@router.delete("/posts/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")

    db.delete(post)
    db.commit()


@router.post("/posts/{post_id}/like")
def toggle_like(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": post.likes_count}
    else:
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count = (post.likes_count or 0) + 1
        db.commit()
        return {"liked": True, "likes_count": post.likes_count}


# ========== Comments ==========
@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
def get_comments(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comments = db.query(Comment).options(
        joinedload(Comment.user)
    ).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()

    return [
        {
            "id": c.id,
            "post_id": c.post_id,
            "content": c.content,
            "created_at": c.created_at,
            "author": AuthorResponse.model_validate(c.user)
        }
        for c in comments
    ]


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=201)
def create_comment(
    post_id: int,
    data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=data.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "author": AuthorResponse.model_validate(current_user)
    }


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
