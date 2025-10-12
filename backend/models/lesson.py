"""Lesson Model"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID

class LessonPhase(BaseModel):
    phase_name: str  # "Engage", "Explore", "Explain", "Elaborate", "Evaluate"
    duration: int  # minutes
    activities: List[str]
    materials: List[str]
    teacher_notes: Optional[str] = None

class LessonBase(BaseModel):
    title: str
    duration: int = 60  # minutes
    content: Dict[str, Any] = Field(default_factory=dict)  # 5E structure

class LessonCreate(LessonBase):
    student_id: UUID
    tutor_id: UUID
    strategy_id: Optional[UUID] = None

class Lesson(LessonBase):
    id: UUID
    student_id: UUID
    tutor_id: UUID
    strategy_id: Optional[UUID] = None
    self_evaluation: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

