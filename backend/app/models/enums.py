from enum import Enum as PyEnum


class RecordTypeEnum(PyEnum):
    growth = "growth"
    sleep = "sleep"
    meal = "meal"
    health = "health"
    stool = "stool"
    misc = "misc"


class MealTypeEnum(PyEnum):
    breast_milk = "breast_milk"
    formula = "formula"
    baby_food = "baby_food"


class SymptomEnum(PyEnum):
    cough = "cough"
    fever = "fever"
    runny_nose = "runny_nose"
    vomit = "vomit"
    diarrhea = "diarrhea"
    other = "other"


class StoolAmountEnum(PyEnum):
    low = "low"
    medium = "medium"
    high = "high"


class StoolConditionEnum(PyEnum):
    normal = "normal"
    diarrhea = "diarrhea"
    constipation = "constipation"


class StoolColorEnum(PyEnum):
    yellow = "yellow"
    brown = "brown"
    green = "green"
    other = "other"


class SleepQualityEnum(PyEnum):
    good = "good"
    normal = "normal"
    bad = "bad"


class SenderTypeEnum(PyEnum):
    user = "user"
    ai = "ai"

class CommunityCategoryEnum(PyEnum):
    general = "general"
    marketplace = "marketplace"
    recipe = "recipe"
