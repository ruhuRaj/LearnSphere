"""AI Service Pydantic models for request/response schemas."""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class TestGenerationRequest(BaseModel):
    topic: str
    difficulty: str = "Medium"
    num_questions: int = 10
    category: str = "JEE"


class QuestionOption(BaseModel):
    text: str
    isCorrect: bool = False


class GeneratedQuestion(BaseModel):
    id: int
    text: str
    type: str = "mcq"
    options: List[QuestionOption]
    difficulty: str
    topic: str
    explanation: str


class GeneratedTest(BaseModel):
    title: str
    questions: List[GeneratedQuestion]
    duration: int
    totalMarks: int
    isAIGenerated: bool = True


class DoubtRequest(BaseModel):
    question: str
    subject: str = "Physics"
    context: str = ""


class ContentRequest(BaseModel):
    topic: str
    type: str = "notes"
    detail_level: str = "detailed"


class ModerationRequest(BaseModel):
    text: str


class ModerationResult(BaseModel):
    isApproved: bool
    isToxic: bool
    isSpam: bool
    sentiment: str
    confidence: float
    reason: str


class StudyPlanRequest(BaseModel):
    target_exam: str
    subjects: List[str]
    hours_per_day: int = 6
    weeks: int = 12


class WeeklyPlan(BaseModel):
    week: int
    focus: str
    daily_hours: int
    tasks: List[str]
    milestone: str


class StudyPlan(BaseModel):
    targetExam: str
    totalWeeks: int
    hoursPerDay: int
    plan: List[WeeklyPlan]


class Recommendation(BaseModel):
    type: str
    title: str
    reason: str
