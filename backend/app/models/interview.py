
import uuid
from datetime import datetime, timezone
from typing import Optional, Any, ClassVar

from beanie import Document
from pydantic import Field


def utc_now() -> datetime:
    """Return timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


# ============================================================
# PROFESSIONAL AI INTERVIEWER PROFILES
# ============================================================

INTERVIEWER_PROFILES: dict[str, dict[str, Any]] = {
    "jenny": {
        "name": "Jenny Wilson",
        "gender": "female",
        "voice_key": "female_1",
        "description": "Professional, friendly and supportive interviewer",
    },
    "sarah": {
        "name": "Sarah Mitchell",
        "gender": "female",
        "voice_key": "female_2",
        "description": "Confident and experienced technical interviewer",
    },
    "emily": {
        "name": "Emily Carter",
        "gender": "female",
        "voice_key": "female_3",
        "description": "Friendly HR and behavioral interviewer",
    },
    "james": {
        "name": "James Anderson",
        "gender": "male",
        "voice_key": "male_1",
        "description": "Professional and experienced technical interviewer",
    },
    "daniel": {
        "name": "Daniel Brooks",
        "gender": "male",
        "voice_key": "male_2",
        "description": "Analytical and detail-oriented interviewer",
    },
    "michael": {
        "name": "Michael Reed",
        "gender": "male",
        "voice_key": "male_3",
        "description": "Friendly and professional HR interviewer",
    },
}


# ============================================================
# INTERVIEW DOCUMENT
# ============================================================

class Interview(Document):
    """
    Main MongoDB document for an AI InterviewBuddy interview.
    """

    # --------------------------------------------------------
    # IDENTIFICATION
    # --------------------------------------------------------

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4())
    )

    user_id: str

    # --------------------------------------------------------
    # INTERVIEW CONFIGURATION
    # --------------------------------------------------------

    role: str

    interview_type: str = "Technical"

    difficulty: str = "Intermediate"

    duration_minutes: Optional[int] = 30

    mode: str = "text"

    personality: str = "Professional"

    # Legacy interviewer field: keep for existing API compatibility.
    interviewer: Optional[str] = "jenny"

    # New interviewer configuration.
    assistant_name: str = "Jenny Wilson"

    assistant_gender: str = "female"

    assistant_voice_key: str = "female_1"

    voice_provider: str = "browser"

    voice_gender: Optional[str] = "female"

    language: Optional[str] = "en"

    # --------------------------------------------------------
    # INTERVIEW STATUS
    # --------------------------------------------------------

    status: str = "pending"

    current_question_index: int = 0

    total_questions: int = 0

    # --------------------------------------------------------
    # QUESTIONS AND ANSWERS
    # --------------------------------------------------------

    questions: list[dict[str, Any]] = Field(
        default_factory=list
    )

    answers: list[dict[str, Any]] = Field(
        default_factory=list
    )

    # --------------------------------------------------------
    # SCORES
    # --------------------------------------------------------

    overall_score: Optional[float] = None

    technical_score: Optional[float] = None

    communication_score: Optional[float] = None

    confidence_score: Optional[float] = None

    clarity_score: Optional[float] = None

    problem_solving_score: Optional[float] = None

    behavioral_score: Optional[float] = None

    # --------------------------------------------------------
    # FEEDBACK
    # --------------------------------------------------------

    strengths: Optional[str] = None

    improvements: Optional[str] = None

    recommendations: Optional[str] = None

    communication_metrics: Optional[str] = None

    star_scores: Optional[str] = None

    # --------------------------------------------------------
    # FINAL REPORT
    # --------------------------------------------------------

    report: Optional[dict[str, Any]] = None

    # --------------------------------------------------------
    # TIMESTAMPS
    # --------------------------------------------------------

    started_at: Optional[datetime] = None

    completed_at: Optional[datetime] = None

    created_at: datetime = Field(
        default_factory=utc_now
    )

    updated_at: datetime = Field(
        default_factory=utc_now
    )

    # --------------------------------------------------------
    # PROFILE HELPERS
    # --------------------------------------------------------

    @classmethod
    def get_interviewer_profiles(cls) -> dict[str, dict[str, Any]]:
        """Return all available interviewer profiles."""
        return INTERVIEWER_PROFILES.copy()

    @classmethod
    def get_interviewer_profile(
        cls,
        interviewer_key: str
    ) -> dict[str, Any]:
        """Get one interviewer profile by key."""

        profile = INTERVIEWER_PROFILES.get(
            interviewer_key.lower()
        )

        if not profile:
            raise ValueError(
                f"Invalid interviewer: {interviewer_key}"
            )

        return {
            "key": interviewer_key.lower(),
            **profile,
        }

    def set_interviewer(self, interviewer_key: str) -> None:
        """Set the interviewer name, gender and voice key."""

        profile = self.get_interviewer_profile(
            interviewer_key
        )

        self.interviewer = interviewer_key.lower()
        self.assistant_name = profile["name"]
        self.assistant_gender = profile["gender"]
        self.assistant_voice_key = profile["voice_key"]
        self.voice_gender = profile["gender"]

    # --------------------------------------------------------
    # INTERVIEW LIFECYCLE
    # --------------------------------------------------------

    async def start_interview(self):
        """Start a pending interview."""

        if self.status == "completed":
            raise ValueError(
                "A completed interview cannot be restarted."
            )

        if self.started_at is None:
            self.started_at = utc_now()

        self.status = "in_progress"
        self.updated_at = utc_now()

        await self.save()
        return self

    async def add_question(
        self,
        question_text: str,
        question_type: str = "technical",
        difficulty: Optional[str] = None,
        topic: Optional[str] = None,
    ) -> dict[str, Any]:
        """Add a question to the interview."""

        if self.status == "completed":
            raise ValueError(
                "Cannot add questions to a completed interview."
            )

        question_text = question_text.strip()

        if not question_text:
            raise ValueError("Question text cannot be empty.")

        question = {
            "id": str(uuid.uuid4()),
            "question_text": question_text,
            "question_type": question_type,
            "difficulty": difficulty or self.difficulty,
            "topic": topic,
            "order_index": len(self.questions),
            "created_at": utc_now().isoformat(),
        }

        self.questions.append(question)

        self.total_questions = len(self.questions)
        self.updated_at = utc_now()

        await self.save()

        return question

    async def submit_answer(
        self,
        question_id: str,
        answer_text: str,
        duration_seconds: Optional[int] = None,
    ) -> dict[str, Any]:
        """Save or update an answer for a question."""

        if self.status == "completed":
            raise ValueError(
                "Cannot submit answers to a completed interview."
            )

        question = next(
            (
                q for q in self.questions
                if q.get("id") == question_id
            ),
            None,
        )

        if question is None:
            raise ValueError("Question not found.")

        answer_text = answer_text.strip()

        if not answer_text:
            raise ValueError("Answer cannot be empty.")

        existing = next(
            (
                a for a in self.answers
                if a.get("question_id") == question_id
            ),
            None,
        )

        now = utc_now().isoformat()

        if existing:
            existing["answer_text"] = answer_text
            existing["duration_seconds"] = duration_seconds
            existing["updated_at"] = now
            answer = existing
        else:
            answer = {
                "id": str(uuid.uuid4()),
                "question_id": question_id,
                "question_text": question.get("question_text"),
                "answer_text": answer_text,
                "score": None,
                "evaluation": None,
                "duration_seconds": duration_seconds,
                "created_at": now,
            }

            self.answers.append(answer)

        self.updated_at = utc_now()

        await self.save()

        return answer

    async def complete_interview(
        self,
        report: Optional[dict[str, Any]] = None,
    ):
        """Mark the interview as completed."""

        if self.status == "completed":
            return self

        if not self.started_at:
            self.started_at = utc_now()

        self.status = "completed"
        self.completed_at = utc_now()
        self.updated_at = utc_now()

        if report is not None:
            self.report = report

        await self.save()

        return self

    # --------------------------------------------------------
    # UTILITY METHODS
    # --------------------------------------------------------

    def get_unanswered_questions(
        self,
    ) -> list[dict[str, Any]]:
        """Return questions that do not have submitted answers."""

        answered_ids = {
            answer.get("question_id")
            for answer in self.answers
        }

        return [
            question
            for question in self.questions
            if question.get("id") not in answered_ids
        ]

    def get_progress(self) -> dict[str, Any]:
        """Return interview progress information."""

        total = len(self.questions)
        answered = len(self.answers)

        percentage = (
            round((answered / total) * 100, 2)
            if total else 0
        )

        return {
            "total_questions": total,
            "answered_questions": answered,
            "remaining_questions": max(total - answered, 0),
            "progress_percentage": percentage,
        }

    # --------------------------------------------------------
    # MONGODB SETTINGS
    # --------------------------------------------------------

    class Settings:
        name = "interviews"


# ============================================================
# STANDALONE INTERVIEW QUESTION
# ============================================================

class InterviewQuestion(Document):

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
        default_factory=utc_now
    )

    class Settings:
        name = "interview_questions"


# ============================================================
# STANDALONE INTERVIEW ANSWER
# ============================================================

class InterviewAnswer(Document):

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
        default_factory=utc_now
    )

    updated_at: datetime = Field(
        default_factory=utc_now
    )

    class Settings:
        name = "interview_answers"
