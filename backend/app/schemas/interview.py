from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CreateInterviewRequest(BaseModel):
    role: str
    interview_type: str = 'Technical'
    difficulty: str = 'Intermediate'
    duration_minutes: int = 30
    mode: str = 'text'
    personality: str = 'Professional'
    interviewer: Optional[str] = 'jenny'
    voice_gender: Optional[str] = 'female'
    language: Optional[str] = 'en'


class SubmitAnswerRequest(BaseModel):
    question_id: str
    answer_text: str
    duration_seconds: Optional[int] = None


class InterviewResponse(BaseModel):
    id: str
    role: str
    interview_type: str
    difficulty: str
    status: str
    interviewer: Optional[str] = None
    voice_gender: Optional[str] = None
    language: Optional[str] = None
    overall_score: Optional[float] = None
    created_at: datetime


class NextQuestionResponse(BaseModel):
    question_id: str
    question_text: str
    question_type: str
    difficulty: str
    topic: Optional[str] = None
    question_number: int
    total_questions: int
    is_last: bool
    acknowledgement: Optional[str] = None
