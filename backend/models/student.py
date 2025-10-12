"""Student Model"""

from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID

class StudentBase(BaseModel):
    name: str
    grade: str
    subject: Optional[str] = None
    learning_style: Optional[str] = None
    nationality: Optional[str] = None
    residence: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    objectives: List[str] = Field(default_factory=list)

class StudentCreate(StudentBase):
    tutor_id: UUID

class Student(StudentBase):
    id: UUID
    tutor_id: UUID
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

