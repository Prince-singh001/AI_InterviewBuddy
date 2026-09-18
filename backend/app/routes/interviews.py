"""
Interview Routes

Handles:
- Interview creation
- Interview listing
- Interview start
- AI question generation
- Answer submission
- Adaptive next questions
- Interview completion
- Final AI report
- Report retrieval
"""

import json
from datetime import datetime
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.agents.interview_manager import (
    EvaluationAgent,
    InterviewManagerAgent,
)
from app.models.interview import Interview
from app.routes.auth import get_user_from_token
from app.schemas.interview import (
    CreateInterviewRequest,
    SubmitAnswerRequest,
)


router = APIRouter(
    prefix="/api/interviews",
    tags=["Interviews"],
)


# ============================================================
# DURATION → QUESTION COUNT
# ============================================================

QUESTION_COUNTS = {
    10: 6,
    20: 10,
    30: 15,
    45: 18,
}


def get_question_count(duration_minutes: int) -> int:
    """
    Return the number of questions based on interview duration.

    10 minutes -> 6 questions
    20 minutes -> 10 questions
    30 minutes -> 15 questions
    45 minutes -> 18 questions
    """

    return QUESTION_COUNTS.get(
        duration_minutes,
        6,
    )


# ============================================================
# COMMON HELPERS
# ============================================================

def get_user_id(current_user: Any) -> str:
    """
    Safely return the current user's ID as a string.
    """

    user_id = getattr(current_user, "id", None)

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticated user.",
        )

    return str(user_id)


async def get_owned_interview(
    interview_id: str,
    current_user: Any,
) -> Interview:
    """
    Fetch an interview and verify that it belongs to
    the currently authenticated user.
    """

    # --------------------------------------------------------
    # Validate MongoDB ObjectId
    # --------------------------------------------------------

    if not ObjectId.is_valid(interview_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid interview ID.",
        )

    interview = await Interview.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Ownership check
    # --------------------------------------------------------

    if interview.user_id != get_user_id(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interview.",
        )

    return interview


def normalize_question(
    question_data: Any,
    interview: Interview,
    question_number: int,
) -> dict:
    """
    Normalize AI provider output into the structure expected
    by the frontend and database.
    """

    if not isinstance(question_data, dict):
        question_data = {}

    question_text = question_data.get(
        "question",
        question_data.get(
            "text",
            "",
        ),
    )

    if question_text is None:
        question_text = ""

    question_text = str(question_text).strip()

    question_id = question_data.get(
        "question_id",
    )

    if not question_id:
        question_id = (
            f"q_{int(datetime.utcnow().timestamp() * 1000)}"
        )

    question_type = question_data.get(
        "question_type",
        interview.interview_type,
    )

    difficulty = question_data.get(
        "adapted_difficulty",
        question_data.get(
            "difficulty",
            interview.difficulty,
        ),
    )

    topic = question_data.get(
        "topic",
    )

    return {
        "question_id": str(question_id),
        "question": question_text,
        "question_type": question_type,
        "difficulty": difficulty,
        "topic": topic,
        "question_number": question_number,
    }


def get_question_by_id(
    questions: list[dict],
    question_id: str,
) -> dict | None:
    """
    Find a question by question_id.
    """

    for question in questions:

        if not isinstance(question, dict):
            continue

        if str(
            question.get("question_id")
        ) == str(question_id):
            return question

    return None


def get_last_answer_score(
    answers: list[dict],
) -> float | None:
    """
    Return the most recent answer score.
    """

    if not answers:
        return None

    last_answer = answers[-1]

    if not isinstance(last_answer, dict):
        return None

    score = last_answer.get("score")

    if score is None:
        score = last_answer.get(
            "overall_score"
        )

    if score is None:
        return None

    try:
        return float(score)
    except (TypeError, ValueError):
        return None


def get_asked_topics(
    questions: list[dict],
) -> list[str]:
    """
    Return topics already covered during the interview.
    """

    topics = []

    for question in questions:

        if not isinstance(question, dict):
            continue

        topic = question.get("topic")

        if topic and topic not in topics:
            topics.append(str(topic))

    return topics


def is_question_answered(
    answers: list[dict],
    question_id: str,
) -> bool:
    """
    Check whether a question already has an answer.
    """

    for answer in answers:

        if not isinstance(answer, dict):
            continue

        if str(
            answer.get("question_id")
        ) == str(question_id):
            return True

    return False


# ============================================================
# CREATE INTERVIEW
# ============================================================

@router.post("")
async def create_interview(
    req: CreateInterviewRequest,
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Create a new interview session.
    """

    duration = req.duration_minutes

    # --------------------------------------------------------
    # Validate duration
    # --------------------------------------------------------

    if duration not in QUESTION_COUNTS:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid interview duration. "
                "Allowed durations are 10, 20, 30 and 45 minutes."
            ),
        )

    question_count = get_question_count(
        duration
    )

    # --------------------------------------------------------
    # Create interview
    # --------------------------------------------------------

    try:

        interview = Interview(
            user_id=get_user_id(
                current_user
            ),
            interview_type=req.interview_type,
            role=req.role,
            difficulty=req.difficulty,
            duration_minutes=duration,
            mode=req.mode,
            personality=req.personality,
            status="created",
            questions=[],
            answers=[],
            created_at=datetime.utcnow(),
        )

        await interview.insert()

    except Exception as exc:

        print(
            f"Interview creation error: {exc}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail="Failed to create interview.",
        )

    return {
        "id": str(interview.id),
        "interview_type": interview.interview_type,
        "role": interview.role,
        "difficulty": interview.difficulty,
        "duration_minutes": interview.duration_minutes,
        "mode": interview.mode,
        "personality": interview.personality,
        "total_questions": question_count,
        "status": interview.status,
        "created_at": interview.created_at,
    }


# ============================================================
# GET USER INTERVIEWS
# ============================================================

@router.get("")
async def list_interviews(
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Return only interviews belonging to the
    currently authenticated user.
    """

    user_id = get_user_id(
        current_user
    )

    interviews = await Interview.find(
        Interview.user_id == user_id
    ).sort(
        -Interview.created_at
    ).to_list()

    result = []

    for interview in interviews:

        duration = (
            interview.duration_minutes
            or 10
        )

        result.append(
            {
                "id": str(interview.id),
                "interview_type": interview.interview_type,
                "role": interview.role,
                "difficulty": interview.difficulty,
                "duration_minutes": duration,
                "total_questions": get_question_count(
                    duration
                ),
                "answered_questions": len(
                    interview.answers or []
                ),
                "status": interview.status,
                "created_at": interview.created_at,
            }
        )

    return result


# ============================================================
# START INTERVIEW
# ============================================================

@router.post("/{interview_id}/start")
async def start_interview(
    interview_id: str,
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Start an interview and generate the first
    AI-generated interview question.
    """

    interview = await get_owned_interview(
        interview_id,
        current_user,
    )

    # --------------------------------------------------------
    # Completed check
    # --------------------------------------------------------

    if interview.status == "completed":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This interview has already been completed."
            ),
        )

    duration = (
        interview.duration_minutes
        or 10
    )

    total_questions = get_question_count(
        duration
    )

    questions = interview.questions or []

    # --------------------------------------------------------
    # If interview already has a first question,
    # return it instead of generating another one.
    # --------------------------------------------------------

    if questions:

        first_question = questions[0]

        return {
            "question_id": first_question.get(
                "question_id"
            ),
            "question": first_question.get(
                "question",
                "",
            ),
            "question_type": first_question.get(
                "question_type",
                interview.interview_type,
            ),
            "difficulty": first_question.get(
                "difficulty",
                interview.difficulty,
            ),
            "topic": first_question.get(
                "topic"
            ),
            "question_number": 1,
            "total_questions": total_questions,
            "is_last": (
                total_questions == 1
            ),
            "status": interview.status,
        }

    # --------------------------------------------------------
    # Create AI manager
    # --------------------------------------------------------

    manager = InterviewManagerAgent(
        max_questions=total_questions
    )

    # --------------------------------------------------------
    # Generate first AI question
    # --------------------------------------------------------

    try:

        question_data = (
            manager.get_next_question(
                interview.interview_type,
                interview.role,
                interview.difficulty,
                [],
                None,
                1,
            )
        )

    except Exception as exc:

        print(
            f"Question generation error: {exc}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "Failed to generate interview question."
            ),
        )

    # --------------------------------------------------------
    # Normalize AI response
    # --------------------------------------------------------

    question_data = normalize_question(
        question_data,
        interview,
        1,
    )

    question_text = question_data.get(
        "question",
        "",
    )

    if not question_text:

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "AI returned an empty interview question."
            ),
        )

    # --------------------------------------------------------
    # Save question
    # --------------------------------------------------------

    interview.questions = [
        question_data
    ]

    interview.status = "running"

    if not interview.started_at:
        interview.started_at = (
            datetime.utcnow()
        )

    await interview.save()

    return {
        **question_data,
        "total_questions": total_questions,
        "is_last": (
            total_questions == 1
        ),
        "status": interview.status,
    }


# ============================================================
# SUBMIT ANSWER
# ============================================================

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    req: SubmitAnswerRequest,
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Evaluate the candidate's answer using the
    configured AI provider and save the result.
    """

    interview = await get_owned_interview(
        interview_id,
        current_user,
    )

    # --------------------------------------------------------
    # Status validation
    # --------------------------------------------------------

    if interview.status == "completed":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This interview has already been completed."
            ),
        )

    if interview.status not in (
        "running",
        "created",
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Interview is not available for answers."
            ),
        )

    questions = interview.questions or []

    answers = interview.answers or []

    # --------------------------------------------------------
    # Find question
    # --------------------------------------------------------

    current_question = get_question_by_id(
        questions,
        req.question_id,
    )

    if not current_question:

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                "Question not found in this interview."
            ),
        )

    # --------------------------------------------------------
    # Prevent duplicate answer
    # --------------------------------------------------------

    if is_question_answered(
        answers,
        req.question_id,
    ):

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "This question has already been answered."
            ),
        )

    # --------------------------------------------------------
    # Validate answer
    # --------------------------------------------------------

    answer_text = (
        req.answer_text
        if req.answer_text
        else ""
    ).strip()

    if not answer_text:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Answer cannot be empty.",
        )

    # --------------------------------------------------------
    # AI Evaluation
    # --------------------------------------------------------

    evaluator = EvaluationAgent()

    try:

        evaluation = (
            evaluator.evaluate_answer(
                current_question.get(
                    "question",
                    "",
                ),
                answer_text,
                current_question.get(
                    "question_type",
                    interview.interview_type,
                ),
            )
        )

    except Exception as exc:

        print(
            f"Answer evaluation error: {exc}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "AI evaluation failed."
            ),
        )

    if not isinstance(
        evaluation,
        dict,
    ):

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "AI evaluation returned an invalid response."
            ),
        )

    # --------------------------------------------------------
    # Extract score
    # --------------------------------------------------------

    score = evaluation.get(
        "score"
    )

    if score is None:
        score = evaluation.get(
            "overall_score"
        )

    if score is None:

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "AI evaluation did not return a valid score."
            ),
        )

    try:

        score = float(score)

    except (
        TypeError,
        ValueError,
    ):

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "AI evaluation returned an invalid score."
            ),
        )

    # Keep score between 0 and 100
    score = max(
        0.0,
        min(
            100.0,
            score,
        ),
    )

    # --------------------------------------------------------
    # Store answer
    # --------------------------------------------------------

    answer_data = {
        "question_id": str(
            req.question_id
        ),
        "answer": answer_text,
        "duration_seconds": (
            req.duration_seconds
        ),
        "score": score,
        "evaluation": evaluation,
        "created_at": datetime.utcnow(),
    }

    answers.append(
        answer_data
    )

    interview.answers = answers

    interview.status = "running"

    await interview.save()

    # --------------------------------------------------------
    # Determine question progress
    # --------------------------------------------------------

    duration = (
        interview.duration_minutes
        or 10
    )

    total_questions = get_question_count(
        duration
    )

    question_number = current_question.get(
        "question_number",
        len(answers),
    )

    try:

        question_number = int(
            question_number
        )

    except (
        TypeError,
        ValueError,
    ):

        question_number = len(
            answers
        )

    is_last = (
        question_number
        >= total_questions
    )

    return {
        "question_id": str(
            req.question_id
        ),
        "score": score,
        "evaluation": evaluation,
        "question_number": question_number,
        "total_questions": total_questions,
        "is_last": is_last,
        "answer_saved": True,
    }


# ============================================================
# NEXT QUESTION
# ============================================================

@router.post("/{interview_id}/next-question")
async def next_question(
    interview_id: str,
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Generate the next adaptive AI interview question.

    Difficulty is automatically adapted using the previous
    answer's score.
    """

    interview = await get_owned_interview(
        interview_id,
        current_user,
    )

    # --------------------------------------------------------
    # Status validation
    # --------------------------------------------------------

    if interview.status == "completed":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Interview is already completed."
            ),
        )

    if interview.status != "running":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Interview has not been started."
            ),
        )

    duration = (
        interview.duration_minutes
        or 10
    )

    total_questions = get_question_count(
        duration
    )

    questions = interview.questions or []

    answers = interview.answers or []

    questions_asked = len(
        questions
    )

    # --------------------------------------------------------
    # Maximum question check
    # --------------------------------------------------------

    if questions_asked >= total_questions:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Maximum number of questions reached."
            ),
        )

    # --------------------------------------------------------
    # Make sure the previous question was answered
    # --------------------------------------------------------

    if questions:

        last_question = questions[-1]

        last_question_id = last_question.get(
            "question_id"
        )

        if last_question_id and not is_question_answered(
            answers,
            last_question_id,
        ):

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Please answer the current question "
                    "before requesting the next question."
                ),
            )

    # --------------------------------------------------------
    # Next question number
    # --------------------------------------------------------

    next_question_number = (
        questions_asked + 1
    )

    # --------------------------------------------------------
    # Topics already asked
    # --------------------------------------------------------

    asked_topics = get_asked_topics(
        questions
    )

    # --------------------------------------------------------
    # Last answer score
    # --------------------------------------------------------

    last_score = get_last_answer_score(
        answers
    )

    # --------------------------------------------------------
    # AI Manager
    # --------------------------------------------------------

    manager = InterviewManagerAgent(
        max_questions=total_questions
    )

    # --------------------------------------------------------
    # Generate AI question
    # --------------------------------------------------------

    try:

        question_data = (
            manager.get_next_question(
                interview.interview_type,
                interview.role,
                interview.difficulty,
                asked_topics,
                last_score,
                next_question_number,
            )
        )

    except Exception as exc:

        print(
            f"Next question generation error: {exc}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "Failed to generate next interview question."
            ),
        )

    # --------------------------------------------------------
    # Normalize AI response
    # --------------------------------------------------------

    question_data = normalize_question(
        question_data,
        interview,
        next_question_number,
    )

    question_text = question_data.get(
        "question",
        "",
    )

    if not question_text:

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "AI returned an empty interview question."
            ),
        )

    # --------------------------------------------------------
    # Save question
    # --------------------------------------------------------

    questions.append(
        question_data
    )

    interview.questions = questions

    interview.status = "running"

    await interview.save()

    return {
        **question_data,
        "total_questions": total_questions,
        "is_last": (
            next_question_number
            >= total_questions
        ),
        "status": interview.status,
        "previous_score": last_score,
    }


# ============================================================
# COMPLETE INTERVIEW
# ============================================================

@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Complete the interview and generate the final
    AI-powered report.
    """

    interview = await get_owned_interview(
        interview_id,
        current_user,
    )

    # --------------------------------------------------------
    # Already completed
    # --------------------------------------------------------

    if interview.status == "completed":

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Interview has already been completed."
            ),
        )

    answers = interview.answers or []

    if not answers:

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Cannot complete an interview without answers."
            ),
        )

    # --------------------------------------------------------
    # Prevent completion while current question
    # is unanswered
    # --------------------------------------------------------

    questions = interview.questions or []

    if questions:

        last_question = questions[-1]

        last_question_id = last_question.get(
            "question_id"
        )

        if (
            last_question_id
            and not is_question_answered(
                answers,
                last_question_id,
            )
        ):

            raise HTTPException(
                status_code=(
                    status.HTTP_400_BAD_REQUEST
                ),
                detail=(
                    "Please answer the current question "
                    "before completing the interview."
                ),
            )

    # --------------------------------------------------------
    # Interview configuration
    # --------------------------------------------------------

    duration = (
        interview.duration_minutes
        or 10
    )

    total_questions = get_question_count(
        duration
    )

    config = {
        "interview_type": interview.interview_type,
        "role": interview.role,
        "difficulty": interview.difficulty,
        "duration_minutes": duration,
        "total_questions": total_questions,
        "mode": interview.mode,
        "personality": interview.personality,
    }

    # --------------------------------------------------------
    # Generate final report
    # --------------------------------------------------------

    evaluator = EvaluationAgent()

    try:

        report = (
            evaluator.generate_final_report(
                answers,
                config,
            )
        )

    except Exception as exc:

        print(
            f"Final report error: {exc}"
        )

        raise HTTPException(
            status_code=(
                status.HTTP_503_SERVICE_UNAVAILABLE
            ),
            detail=(
                "Failed to generate final interview report."
            ),
        )

    if not isinstance(
        report,
        dict,
    ):

        raise HTTPException(
            status_code=(
                status.HTTP_502_BAD_GATEWAY
            ),
            detail=(
                "AI returned an invalid final report."
            ),
        )

    # --------------------------------------------------------
    # Save completion data
    # --------------------------------------------------------

    interview.status = "completed"

    interview.completed_at = (
        datetime.utcnow()
    )

    interview.report = report

    # --------------------------------------------------------
    # Save score fields
    # --------------------------------------------------------

    interview.overall_score = report.get(
        "overall",
        report.get(
            "overall_score"
        ),
    )

    interview.technical_score = report.get(
        "technical",
        report.get(
            "technical_score"
        ),
    )

    interview.communication_score = report.get(
        "communication",
        report.get(
            "communication_score"
        ),
    )

    interview.confidence_score = report.get(
        "confidence",
        report.get(
            "confidence_score"
        ),
    )

    interview.clarity_score = report.get(
        "clarity",
        report.get(
            "clarity_score"
        ),
    )

    interview.problem_solving_score = report.get(
        "problem_solving",
        report.get(
            "problem_solving_score"
        ),
    )

    interview.behavioral_score = report.get(
        "behavioral",
        report.get(
            "behavioral_score"
        ),
    )

    await interview.save()

    return {
        "id": str(
            interview.id
        ),
        "status": "completed",
        "total_questions": total_questions,
        "answered_questions": len(
            answers
        ),
        "report": report,
    }


# ============================================================
# GET INTERVIEW REPORT
# ============================================================

@router.get("/{interview_id}/report")
async def get_interview_report(
    interview_id: str,
    current_user: Any = Depends(
        get_user_from_token
    ),
):
    """
    Return the final interview report.
    """

    interview = await get_owned_interview(
        interview_id,
        current_user,
    )

    report = interview.report

    # --------------------------------------------------------
    # Handle JSON string reports
    # --------------------------------------------------------

    if isinstance(
        report,
        str,
    ):

        try:

            report = json.loads(
                report
            )

        except json.JSONDecodeError:

            report = {}

    if report is None:
        report = {}

    duration = (
        interview.duration_minutes
        or 10
    )

    return {
        "id": str(
            interview.id
        ),
        "status": interview.status,
        "role": interview.role,
        "interview_type": interview.interview_type,
        "difficulty": interview.difficulty,
        "duration_minutes": duration,
        "total_questions": get_question_count(
            duration
        ),
        "answered_questions": len(
            interview.answers or []
        ),
        "overall_score": interview.overall_score,
        "technical_score": interview.technical_score,
        "communication_score": interview.communication_score,
        "confidence_score": interview.confidence_score,
        "clarity_score": interview.clarity_score,
        "problem_solving_score": interview.problem_solving_score,
        "behavioral_score": interview.behavioral_score,
        "report": report,
        "created_at": interview.created_at,
        "started_at": interview.started_at,
        "completed_at": interview.completed_at,
    }