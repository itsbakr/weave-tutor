"""Evaluation Models"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from uuid import UUID

class CriterionScore(BaseModel):
    score: float = Field(ge=1.0, le=10.0)
    reasoning: str

class Evaluation(BaseModel):
    overall_score: float = Field(ge=1.0, le=10.0)
    criteria: Dict[str, CriterionScore]
    weaknesses: List[str] = Field(default_factory=list)
    improvements: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.8, ge=0.0, le=1.0)

class PerformanceMetric(BaseModel):
    id: Optional[UUID] = None
    agent_type: str  # 'strategy_planner', 'lesson_creator', 'activity_creator'
    agent_id: str
    session_id: Optional[UUID] = None
    success_rate: float = Field(ge=0.0, le=1.0)
    confidence_scores: List[float] = Field(default_factory=list)
    error_count: int = 0
    last_error: Optional[str] = None
    evaluation_details: Optional[Dict] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

