from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any
from decimal import Decimal
from app.models.enums import (
    RecordTypeEnum,
    MealTypeEnum,
    SleepQualityEnum,
    SymptomEnum,
    StoolAmountEnum,
    StoolConditionEnum,
    StoolColorEnum,
)


# Base Record
class RecordBase(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    memo: Optional[str] = None
    image_url: Optional[str] = None


class RecordCreate(RecordBase):
    record_type: RecordTypeEnum


class RecordResponse(RecordBase):
    id: int
    kid_id: int
    record_type: RecordTypeEnum
    created_at: datetime

    class Config:
        from_attributes = True


# Meal Record
class MealRecordCreate(RecordBase):
    meal_type: MealTypeEnum
    meal_detail: Optional[str] = None
    burp: Optional[bool] = None


class MealRecordResponse(BaseModel):
    id: int
    meal_type: MealTypeEnum
    meal_detail: Optional[str]
    burp: Optional[bool]
    record: Optional[RecordResponse] = None

    class Config:
        from_attributes = True


# Sleep Record
class SleepRecordCreate(RecordBase):
    start_datetime: datetime
    end_datetime: datetime
    sleep_quality: SleepQualityEnum


class SleepRecordResponse(BaseModel):
    id: int
    start_datetime: datetime
    end_datetime: datetime
    sleep_quality: SleepQualityEnum
    record: Optional[RecordResponse] = None

    class Config:
        from_attributes = True


# Health Record
class HealthRecordCreate(RecordBase):
    temperature: Optional[Decimal] = Field(None, ge=35, le=42)
    symptom: SymptomEnum
    symptom_other: Optional[str] = None


class HealthRecordResponse(BaseModel):
    id: int
    temperature: Optional[Decimal]
    symptom: SymptomEnum
    symptom_other: Optional[str]
    record: Optional[RecordResponse] = None

    class Config:
        from_attributes = True


# Growth Record
class GrowthRecordCreate(RecordBase):
    height_cm: Optional[Decimal] = Field(None, gt=0)
    weight_kg: Optional[Decimal] = Field(None, gt=0)


class GrowthRecordResponse(BaseModel):
    id: int
    height_cm: Optional[Decimal]
    weight_kg: Optional[Decimal]
    record: Optional[RecordResponse] = None

    class Config:
        from_attributes = True


# Stool Record
class StoolRecordCreate(RecordBase):
    amount: StoolAmountEnum
    condition: StoolConditionEnum
    color: StoolColorEnum


class StoolRecordResponse(BaseModel):
    id: int
    amount: StoolAmountEnum
    condition: StoolConditionEnum
    color: StoolColorEnum
    record: Optional[RecordResponse] = None

    class Config:
        from_attributes = True


# Extended Record Response with details
class RecordWithDetailsResponse(RecordResponse):
    """Record response that includes type-specific details"""
    # Growth details
    height_cm: Optional[Decimal] = None
    weight_kg: Optional[Decimal] = None
    # Sleep details
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    sleep_quality: Optional[SleepQualityEnum] = None
    # Meal details
    meal_type: Optional[MealTypeEnum] = None
    meal_detail: Optional[str] = None
    burp: Optional[bool] = None
    # Health details
    temperature: Optional[Decimal] = None
    symptom: Optional[SymptomEnum] = None
    symptom_other: Optional[str] = None
    # Stool details
    amount: Optional[StoolAmountEnum] = None
    condition: Optional[StoolConditionEnum] = None
    color: Optional[StoolColorEnum] = None

    class Config:
        from_attributes = True
