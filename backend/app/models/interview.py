import uuid
from datetime import datetime
from typing import Optional, Any

from beanie import Document
from pydantic import Field


# ============================================================
# INTERVIEW
# ============================================================

class Interview(Document):
    """
    MongoDB document representing an interview session.
    """

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    # ========================================================
    # USER / INTERVIEW CONFIGURATION
    # ========================================================

    user_id: str

    role: str

    interview_type: str = "Technical"

    difficulty: str = "Intermediate"

    duration_minutes: Optional[int] = 30

    mode: str = "text"

    personality: str = "Professional"

    status: str = "pending"

    # ========================================================
    # QUESTIONS / ANSWERS
    # ========================================================

    questions: list[dict[str, Any]] = Field(
        default_factory=list
    )

    answers: list[dict[str, Any]] = Field(
        default_factory=list
    )

    # ========================================================
    # SCORES
    # ========================================================

    overall_score: Optional[float] = None

    technical_score: Optional[float] = None

    communication_score: Optional[float] = None

    confidence_score: Optional[float] = None

    clarity_score: Optional[float] = None

    problem_solving_score: Optional[float] = None

    behavioral_score: Optional[float] = None

    # ========================================================
    # FEEDBACK
    # ========================================================

    strengths: Optional[str] = None

    improvements: Optional[str] = None

    recommendations: Optional[str] = None

    communication_metrics: Optional[str] = None

    star_scores: Optional[str] = None

    # ========================================================
    # FINAL REPORT
    # ========================================================

    report: Optional[dict[str, Any]] = None

    # ========================================================
    # TIMESTAMPS
    # ========================================================

    started_at: Optional[datetime] = None

    completed_at: Optional[datetime] = None

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # ========================================================
    # MONGODB SETTINGS
    # ========================================================

    class Settings:
        name = "interviews"


# ============================================================
# INTERVIEW QUESTION
# ============================================================

class InterviewQuestion(Document):
    """
    Optional standalone interview question document.
    """

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    interview_id: str

    question_text: str

    question_type: str = "technical"

    difficulty: str = "Intermediate"

    topic: Optional[str] = None

    order_index: int = 0

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "interview_questions"


# ============================================================
# INTERVIEW ANSWER
# ============================================================

class InterviewAnswer(Document):
    """
    Optional standalone interview answer document.
    """

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    interview_id: str

    question_id: str

    answer_text: Optional[str] = None

    score: Optional[float] = None

    evaluation: Optional[str] = None

    duration_seconds: Optional[int] = None

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    class Settings:
        name = "interview_answers"