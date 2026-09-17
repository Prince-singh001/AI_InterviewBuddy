"""
Interview Routes
Handles interview creation, questions, answers, completion and reports.
"""

import json
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.agents.interview_manager import (
    EvaluationAgent,
    InterviewManagerAgent,
)
from app.routes.auth import get_user_from_token
from app.models.interview import Interview
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
    Return total number of questions according to interview duration.

    10 minutes -> 6 questions
    20 minutes -> 10 questions
    30 minutes -> 15 questions
    45 minutes -> 18 questions
    """

    return QUESTION_COUNTS.get(duration_minutes, 6)


# ============================================================
# CREATE INTERVIEW
# ============================================================

@router.post("")
async def create_interview(
    req: CreateInterviewRequest,
    current_user: Any = Depends(get_user_from_token),
):
    """
    Create a new interview session.
    """

    duration = req.duration_minutes

    if duration not in QUESTION_COUNTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid interview duration. "
                "Allowed durations are 10, 20, 30 and 45 minutes."
            ),
        )

    question_count = get_question_count(duration)

    try:
        interview = Interview(
            user_id=str(current_user.id),
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
        print(f"Interview creation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create interview.",
        )

    return {
        "id": str(interview.id),
        "interview_type": interview.interview_type,
        "role": interview.role,
        "difficulty": interview.difficulty,
        "duration_minutes": interview.duration_minutes,
        "total_questions": question_count,
        "status": interview.status,
    }


# ============================================================
# GET USER INTERVIEWS
# ============================================================

@router.get("")
async def list_interviews(
    current_user: Any = Depends(get_user_from_token),
):
    """
    Return interviews belonging only to the logged-in user.
    """

    interviews = await Interview.find(
        Interview.user_id == str(current_user.id)
    ).sort(
        -Interview.created_at
    ).to_list()

    result = []

    for interview in interviews:
        duration = interview.duration_minutes or 10

        result.append(
            {
                "id": str(interview.id),
                "interview_type": interview.interview_type,
                "role": interview.role,
                "difficulty": interview.difficulty,
                "duration_minutes": duration,
                "total_questions": get_question_count(duration),
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
    current_user: Any = Depends(get_user_from_token),
):
    """
    Start interview and generate the first AI question.
    """

    interview = await Interview.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Ownership check
    # --------------------------------------------------------

    if interview.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interview.",
        )

    # --------------------------------------------------------
    # Completed check
    # --------------------------------------------------------

    if interview.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview has already been completed.",
        )

    duration = interview.duration_minutes or 10
    total_questions = get_question_count(duration)

    manager = InterviewManagerAgent(
        max_questions=total_questions
    )

    questions = interview.questions or []

    # --------------------------------------------------------
    # Existing first question
    # --------------------------------------------------------

    if questions:
        first_question = questions[0]

        return {
            "question_id": first_question.get("question_id"),
            "question": first_question.get("question", ""),
            "question_type": first_question.get(
                "question_type",
                interview.interview_type,
            ),
            "difficulty": first_question.get(
                "difficulty",
                interview.difficulty,
            ),
            "topic": first_question.get("topic"),
            "question_number": 1,
            "total_questions": total_questions,
            "is_last": total_questions == 1,
        }

    # --------------------------------------------------------
    # Generate REAL AI question
    # --------------------------------------------------------

    try:
        q_data = manager.get_next_question(
            interview.interview_type,
            interview.role,
            interview.difficulty,
            [],
            None,
            1,
        )

    except Exception as exc:
        print(f"Question generation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to generate interview question: {exc}",
        )

    question_id = q_data.get(
        "question_id",
        f"q_{int(datetime.utcnow().timestamp() * 1000)}",
    )

    question_text = q_data.get(
        "question",
        q_data.get("text", ""),
    )

    question_data = {
        "question_id": question_id,
        "question": question_text,
        "question_type": q_data.get(
            "question_type",
            interview.interview_type,
        ),
        "difficulty": q_data.get(
            "adapted_difficulty",
            q_data.get(
                "difficulty",
                interview.difficulty,
            ),
        ),
        "topic": q_data.get("topic"),
        "question_number": 1,
    }

    if not question_text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an empty interview question.",
        )

    interview.questions = [question_data]
    interview.status = "running"
    interview.started_at = datetime.utcnow()

    await interview.save()

    return {
        **question_data,
        "total_questions": total_questions,
        "is_last": total_questions == 1,
    }


# ============================================================
# SUBMIT ANSWER
# ============================================================

@router.post("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    req: SubmitAnswerRequest,
    current_user: Any = Depends(get_user_from_token),
):
    """
    Evaluate the user's answer using the real AI provider.
    """

    interview = await Interview.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Ownership check
    # --------------------------------------------------------

    if interview.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interview.",
        )

    if interview.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This interview has already been completed.",
        )

    questions = interview.questions or []

    current_question = None

    for question in questions:
        if str(question.get("question_id")) == str(
            req.question_id
        ):
            current_question = question
            break

    if not current_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found in this interview.",
        )

    answers = interview.answers or []

    # --------------------------------------------------------
    # Prevent duplicate answer
    # --------------------------------------------------------

    for existing_answer in answers:
        if str(existing_answer.get("question_id")) == str(
            req.question_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This question has already been answered.",
            )

    # --------------------------------------------------------
    # REAL AI EVALUATION
    # --------------------------------------------------------

    evaluator = EvaluationAgent()

    # Schema uses answer_text
    answer_text = req.answer_text

    try:
        evaluation = evaluator.evaluate_answer(
            current_question.get("question", ""),
            answer_text,
            current_question.get(
                "question_type",
                interview.interview_type,
            ),
        )

    except Exception as exc:
        print(f"Answer evaluation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI evaluation failed: {exc}",
        )

    score = evaluation.get("score")

    if score is None:
        score = evaluation.get("overall_score")

    if score is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI evaluation did not return a valid score.",
        )

    try:
        score = float(score)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI evaluation returned an invalid score.",
        )

    score = max(0.0, min(100.0, score))

    answer_data = {
        "question_id": req.question_id,
        "answer": answer_text,
        "duration_seconds": req.duration_seconds,
        "score": score,
        "evaluation": evaluation,
        "created_at": datetime.utcnow(),
    }

    answers.append(answer_data)

    interview.answers = answers

    await interview.save()

    duration = interview.duration_minutes or 10
    total_questions = get_question_count(duration)

    question_number = current_question.get(
        "question_number",
        len(answers),
    )

    is_last = question_number >= total_questions

    return {
        "question_id": req.question_id,
        "score": score,
        "evaluation": evaluation,
        "question_number": question_number,
        "total_questions": total_questions,
        "is_last": is_last,
    }


# ============================================================
# NEXT QUESTION
# ============================================================

@router.post("/{interview_id}/next-question")
async def next_question(
    interview_id: str,
    current_user: Any = Depends(get_user_from_token),
):
    """
    Generate the next AI interview question.
    """

    interview = await Interview.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Ownership check
    # --------------------------------------------------------

    if interview.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interview.",
        )

    if interview.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview is already completed.",
        )

    duration = interview.duration_minutes or 10
    total_questions = get_question_count(duration)

    questions = interview.questions or []
    answers = interview.answers or []

    questions_asked = len(questions)

    # --------------------------------------------------------
    # Maximum questions reached
    # --------------------------------------------------------

    if questions_asked >= total_questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum number of questions reached.",
        )

    next_question_number = questions_asked + 1

    # --------------------------------------------------------
    # Asked topics
    # --------------------------------------------------------

    asked_topics = []

    for question in questions:
        topic = question.get("topic")

        if topic:
            asked_topics.append(topic)

    # --------------------------------------------------------
    # Last answer score
    # --------------------------------------------------------

    last_score = None

    if answers:
        last_answer = answers[-1]
        last_score = last_answer.get("score")

    manager = InterviewManagerAgent(
        max_questions=total_questions
    )

    # --------------------------------------------------------
    # Generate REAL AI question
    # --------------------------------------------------------

    try:
        q_data = manager.get_next_question(
            interview.interview_type,
            interview.role,
            interview.difficulty,
            asked_topics,
            last_score,
            next_question_number,
        )

    except Exception as exc:
        print(f"Next question generation error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to generate next question: {exc}",
        )

    question_id = q_data.get(
        "question_id",
        f"q_{int(datetime.utcnow().timestamp() * 1000)}",
    )

    question_text = q_data.get(
        "question",
        q_data.get("text", ""),
    )

    question_data = {
        "question_id": question_id,
        "question": question_text,
        "question_type": q_data.get(
            "question_type",
            interview.interview_type,
        ),
        "difficulty": q_data.get(
            "adapted_difficulty",
            q_data.get(
                "difficulty",
                interview.difficulty,
            ),
        ),
        "topic": q_data.get("topic"),
        "question_number": next_question_number,
    }

    if not question_text:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI returned an empty interview question.",
        )

    questions.append(question_data)

    interview.questions = questions
    interview.status = "running"

    await interview.save()

    return {
        **question_data,
        "total_questions": total_questions,
        "is_last": next_question_number >= total_questions,
    }


# ============================================================
# COMPLETE INTERVIEW
# ============================================================

@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    current_user: Any = Depends(get_user_from_token),
):
    """
    Complete interview and generate final AI report.
    """

    interview = await Interview.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Ownership check
    # --------------------------------------------------------

    if interview.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interview.",
        )

    if interview.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Interview has already been completed.",
        )

    answers = interview.answers or []

    if not answers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot complete an interview without answers.",
        )

    duration = interview.duration_minutes or 10
    total_questions = get_question_count(duration)

    evaluator = EvaluationAgent()

    config = {
        "interview_type": interview.interview_type,
        "role": interview.role,
        "difficulty": interview.difficulty,
        "duration_minutes": duration,
        "total_questions": total_questions,
    }

    try:
        report = evaluator.generate_final_report(
            answers,
            config,
        )

    except Exception as exc:
        print(f"Final report error: {exc}")

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to generate final report: {exc}",
        )

    interview.status = "completed"
    interview.completed_at = datetime.utcnow()
    interview.report = report

    # --------------------------------------------------------
    # Save score fields if report contains them
    # --------------------------------------------------------

    if isinstance(report, dict):

        interview.overall_score = report.get(
            "overall",
            report.get("overall_score"),
        )

        interview.technical_score = report.get(
            "technical",
            report.get("technical_score"),
        )

        interview.communication_score = report.get(
            "communication",
            report.get("communication_score"),
        )

        interview.confidence_score = report.get(
            "confidence",
            report.get("confidence_score"),
        )

        interview.clarity_score = report.get(
            "clarity",
            report.get("clarity_score"),
        )

        interview.problem_solving_score = report.get(
            "problem_solving",
            report.get("problem_solving_score"),
        )

        interview.behavioral_score = report.get(
            "behavioral",
            report.get("behavioral_score"),
        )

    await interview.save()

    return {
        "id": str(interview.id),
        "status": "completed",
        "total_questions": total_questions,
        "answered_questions": len(answers),
        "report": report,
    }


# ============================================================
# GET REPORT
# ============================================================

@router.get("/{interview_id}/report")
async def get_interview_report(
    interview_id: str,
    current_user: Any = Depends(get_user_from_token),
):
    """
    Return the final interview report.
    """

    interview = await Interview.get(interview_id)

    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found.",
        )

    # --------------------------------------------------------
    # Ownership check
    # --------------------------------------------------------

    if interview.user_id != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this interview.",
        )

    report = interview.report

    if isinstance(report, str):
        try:
            report = json.loads(report)
        except json.JSONDecodeError:
            report = {}

    if report is None:
        report = {}

    duration = interview.duration_minutes or 10

    return {
        "id": str(interview.id),
        "status": interview.status,
        "duration_minutes": duration,
        "total_questions": get_question_count(duration),
        "answered_questions": len(interview.answers or []),
        "report": report,
    }