from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime
from app.api.deps import get_db, get_current_user
from app.models import (
    User, Kid, Record, RecordTypeEnum,
    MealRecord, SleepRecord, HealthRecord,
    GrowthRecord, StoolRecord
)
from app.schemas.record import (
    RecordResponse,
    RecordWithDetailsResponse,
    MealRecordCreate, MealRecordResponse,
    SleepRecordCreate, SleepRecordResponse,
    HealthRecordCreate, HealthRecordResponse,
    GrowthRecordCreate, GrowthRecordResponse,
    StoolRecordCreate, StoolRecordResponse,
)

router = APIRouter(prefix="/kids/{kid_id}/records", tags=["records"])


def get_kid_or_404(kid_id: int, user_id: int, db: Session) -> Kid:
    kid = db.query(Kid).filter(Kid.id == kid_id, Kid.user_id == user_id).first()
    if not kid:
        raise HTTPException(status_code=404, detail="Kid not found")
    return kid


# ========== All Records ==========
@router.get("/", response_model=List[RecordWithDetailsResponse])
def get_all_records(
    kid_id: int,
    record_type: Optional[RecordTypeEnum] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    query = db.query(Record).filter(Record.kid_id == kid_id)

    if record_type:
        query = query.filter(Record.record_type == record_type)
    if date_from:
        query = query.filter(Record.created_at >= date_from)
    if date_to:
        query = query.filter(Record.created_at <= date_to)

    records = query.order_by(Record.created_at.desc()).limit(limit).all()

    # Build response with details for each record type
    result = []
    for record in records:
        record_dict = {
            "id": record.id,
            "kid_id": record.kid_id,
            "record_type": record.record_type,
            "title": record.title,
            "memo": record.memo,
            "image_url": record.image_url,
            "created_at": record.created_at,
        }

        # Add type-specific details
        if record.record_type == RecordTypeEnum.growth:
            growth = db.query(GrowthRecord).filter(GrowthRecord.id == record.id).first()
            if growth:
                record_dict["height_cm"] = growth.height_cm
                record_dict["weight_kg"] = growth.weight_kg
        elif record.record_type == RecordTypeEnum.sleep:
            sleep = db.query(SleepRecord).filter(SleepRecord.id == record.id).first()
            if sleep:
                record_dict["start_datetime"] = sleep.start_datetime
                record_dict["end_datetime"] = sleep.end_datetime
                record_dict["sleep_quality"] = sleep.sleep_quality
        elif record.record_type == RecordTypeEnum.meal:
            meal = db.query(MealRecord).filter(MealRecord.id == record.id).first()
            if meal:
                record_dict["meal_type"] = meal.meal_type
                record_dict["meal_detail"] = meal.meal_detail
                record_dict["burp"] = meal.burp
        elif record.record_type == RecordTypeEnum.health:
            health = db.query(HealthRecord).filter(HealthRecord.id == record.id).first()
            if health:
                record_dict["temperature"] = health.temperature
                record_dict["symptom"] = health.symptom
                record_dict["symptom_other"] = health.symptom_other
        elif record.record_type == RecordTypeEnum.stool:
            stool = db.query(StoolRecord).filter(StoolRecord.id == record.id).first()
            if stool:
                record_dict["amount"] = stool.amount
                record_dict["condition"] = stool.condition
                record_dict["color"] = stool.color

        result.append(record_dict)

    return result


@router.delete("/{record_id}", status_code=204)
def delete_record(
    kid_id: int,
    record_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    record = db.query(Record).filter(Record.id == record_id, Record.kid_id == kid_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()


# ========== Meal Records ==========
@router.get("/meal", response_model=List[MealRecordResponse])
def get_meal_records(
    kid_id: int,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    records = db.query(MealRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(MealRecord.record)).order_by(Record.created_at.desc()).limit(limit).all()
    return records


@router.post("/meal", response_model=MealRecordResponse, status_code=201)
def create_meal_record(
    kid_id: int,
    data: MealRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    
    # Create base record
    base_record = Record(
        kid_id=kid_id,
        record_type=RecordTypeEnum.meal,
        title=data.title,
        memo=data.memo,
        image_url=data.image_url
    )
    db.add(base_record)
    db.flush()
    
    # Create meal record
    meal_record = MealRecord(
        id=base_record.id,
        meal_type=data.meal_type,
        meal_detail=data.meal_detail,
        burp=data.burp
    )
    db.add(meal_record)
    db.commit()
    db.refresh(meal_record)
    db.refresh(base_record)
    meal_record.record = base_record
    return meal_record


# ========== Sleep Records ==========
@router.get("/sleep", response_model=List[SleepRecordResponse])
def get_sleep_records(
    kid_id: int,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    records = db.query(SleepRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(SleepRecord.record)).order_by(Record.created_at.desc()).limit(limit).all()
    return records


@router.post("/sleep", response_model=SleepRecordResponse, status_code=201)
def create_sleep_record(
    kid_id: int,
    data: SleepRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    
    base_record = Record(
        kid_id=kid_id,
        record_type=RecordTypeEnum.sleep,
        title=data.title,
        memo=data.memo,
        image_url=data.image_url
    )
    db.add(base_record)
    db.flush()
    
    sleep_record = SleepRecord(
        id=base_record.id,
        start_datetime=data.start_datetime,
        end_datetime=data.end_datetime,
        sleep_quality=data.sleep_quality
    )
    db.add(sleep_record)
    db.commit()
    db.refresh(sleep_record)
    db.refresh(base_record)
    sleep_record.record = base_record
    return sleep_record


# ========== Health Records ==========
@router.get("/health", response_model=List[HealthRecordResponse])
def get_health_records(
    kid_id: int,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    records = db.query(HealthRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(HealthRecord.record)).order_by(Record.created_at.desc()).limit(limit).all()
    return records


@router.post("/health", response_model=HealthRecordResponse, status_code=201)
def create_health_record(
    kid_id: int,
    data: HealthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    
    base_record = Record(
        kid_id=kid_id,
        record_type=RecordTypeEnum.health,
        title=data.title,
        memo=data.memo,
        image_url=data.image_url
    )
    db.add(base_record)
    db.flush()
    
    health_record = HealthRecord(
        id=base_record.id,
        temperature=data.temperature,
        symptom=data.symptom,
        symptom_other=data.symptom_other
    )
    db.add(health_record)
    db.commit()
    db.refresh(health_record)
    db.refresh(base_record)
    health_record.record = base_record
    return health_record


# ========== Growth Records ==========
@router.get("/growth", response_model=List[GrowthRecordResponse])
def get_growth_records(
    kid_id: int,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    records = db.query(GrowthRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(GrowthRecord.record)).order_by(Record.created_at.desc()).limit(limit).all()
    return records


@router.post("/growth", response_model=GrowthRecordResponse, status_code=201)
def create_growth_record(
    kid_id: int,
    data: GrowthRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    
    base_record = Record(
        kid_id=kid_id,
        record_type=RecordTypeEnum.growth,
        title=data.title,
        memo=data.memo,
        image_url=data.image_url
    )
    db.add(base_record)
    db.flush()
    
    growth_record = GrowthRecord(
        id=base_record.id,
        height_cm=data.height_cm,
        weight_kg=data.weight_kg
    )
    db.add(growth_record)
    db.commit()
    db.refresh(growth_record)
    db.refresh(base_record)
    growth_record.record = base_record
    return growth_record


# ========== Stool Records ==========
@router.get("/stool", response_model=List[StoolRecordResponse])
def get_stool_records(
    kid_id: int,
    limit: int = Query(50, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    records = db.query(StoolRecord).join(Record).filter(
        Record.kid_id == kid_id
    ).options(joinedload(StoolRecord.record)).order_by(Record.created_at.desc()).limit(limit).all()
    return records


@router.post("/stool", response_model=StoolRecordResponse, status_code=201)
def create_stool_record(
    kid_id: int,
    data: StoolRecordCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    get_kid_or_404(kid_id, current_user.id, db)
    
    base_record = Record(
        kid_id=kid_id,
        record_type=RecordTypeEnum.stool,
        title=data.title,
        memo=data.memo,
        image_url=data.image_url
    )
    db.add(base_record)
    db.flush()
    
    stool_record = StoolRecord(
        id=base_record.id,
        amount=data.amount,
        condition=data.condition,
        color=data.color
    )
    db.add(stool_record)
    db.commit()
    db.refresh(stool_record)
    db.refresh(base_record)
    stool_record.record = base_record
    return stool_record
