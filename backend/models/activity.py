"""Activity Model"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID

class ActivityBase(BaseModel):
    title: str
    type: str  # 'traditional', 'simulation', 'interactive'
    duration: int = 20  # minutes
    content: Dict[str, Any] = Field(default_factory=dict)
    code: Optional[str] = None  # Generated code for simulations
    language: Optional[str] = None  # 'python', 'javascript'
    sandbox_id: Optional[str] = None  # Daytona sandbox ID
    sandbox_url: Optional[str] = None  # Daytona sandbox URL

class ActivityCreate(ActivityBase):
    student_id: UUID
    tutor_id: UUID
    lesson_id: Optional[UUID] = None
    activity_description: str  # User's request

class Activity(ActivityBase):
    id: UUID
    student_id: UUID
    tutor_id: UUID
    lesson_id: Optional[UUID] = None
    self_evaluation: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

