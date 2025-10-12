"""Strategy Model"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID

class StrategyWeek(BaseModel):
    week_number: int
    topic: str
    focus_area: str
    learning_objectives: List[str]
    key_concepts: List[str]
    activities: List[Dict[str, Any]]
    assessment_methods: List[str]
    resources: List[Dict[str, str]]
    cultural_adaptations: Optional[str] = None

class StrategyBase(BaseModel):
    title: str
    description: Optional[str] = None
    weeks_count: int = 4
    content: Dict[str, Any] = Field(default_factory=dict)  # Full strategy with weeks

class StrategyCreate(StrategyBase):
    student_id: UUID
    tutor_id: UUID

class Strategy(StrategyBase):
    id: UUID
    student_id: UUID
    tutor_id: UUID
    self_evaluation: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

