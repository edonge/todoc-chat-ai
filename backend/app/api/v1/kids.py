from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session, joinedload
from typing import List
import os
import uuid
from app.api.deps import get_db, get_current_user
from app.models import User, Kid, Record, RecordTypeEnum, MealRecord, SleepRecord, HealthRecord, GrowthRecord
from app.schemas.kid import KidCreate, KidUpdate, KidResponse
from app.core.config import settings

router = APIRouter(prefix="/kids", tags=["kids"])


@router.get("/", response_model=List[KidResponse])
def get_kids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kids = db.query(Kid).filter(Kid.user_id == current_user.id).all()
    return kids


@router.post("/", response_model=KidResponse, status_code=status.HTTP_201_CREATED)
def create_kid(
    kid_data: KidCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_kid = db.query(Kid).filter(Kid.user_id == current_user.id).first()
    if existing_kid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Kid already registered for this user"
        )

    new_kid = Kid(
        user_id=current_user.id,
        name=kid_data.name,
        birth_date=kid_data.birth_date,
        gender=kid_data.gender
    )
    db.add(new_kid)
    db.commit()
    db.refresh(new_kid)
    return new_kid


@router.get("/{kid_id}", response_model=KidResponse)
def get_kid(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )
    return kid


@router.put("/{kid_id}", response_model=KidResponse)
def update_kid(
    kid_id: int,
    kid_data: KidUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    update_data = kid_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kid, field, value)

    db.commit()
    db.refresh(kid)
    return kid


@router.delete("/{kid_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kid(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    db.delete(kid)
    db.commit()
    return None


@router.post("/{kid_id}/photo", response_model=KidResponse)
async def upload_kid_photo(
    kid_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
        )

    # Create upload directory if not exists
    upload_dir = os.path.join(settings.UPLOAD_DIR, "kids")
    os.makedirs(upload_dir, exist_ok=True)

    # Generate unique filename
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    filename = f"{kid_id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    # Save file
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Update kid's image_url
    image_url = f"/static/uploads/kids/{filename}"
    kid.image_url = image_url
    db.commit()
    db.refresh(kid)

    return kid


@router.get("/{kid_id}/dashboard")
def get_kid_dashboard(
    kid_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    kid = db.query(Kid).filter(
        Kid.id == kid_id,
        Kid.user_id == current_user.id
    ).first()

    if not kid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kid not found"
        )

    # Get recent records by joining through Record base table
    recent_meal = db.query(MealRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(MealRecord.record)).order_by(Record.created_at.desc()).first()

    recent_sleep = db.query(SleepRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(SleepRecord.record)).order_by(Record.created_at.desc()).first()

    recent_health = db.query(HealthRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(HealthRecord.record)).order_by(Record.created_at.desc()).first()

    recent_growth = db.query(GrowthRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(GrowthRecord.record)).order_by(Record.created_at.desc()).first()

    return {
        "kid": KidResponse.model_validate(kid),
        "recent_records": {
            "meal": recent_meal,
            "sleep": recent_sleep,
            "health": recent_health,
            "growth": recent_growth
        }
    }
