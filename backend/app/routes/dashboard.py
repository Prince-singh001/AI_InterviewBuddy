from datetime import datetime, timedelta, date

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.user import User
from app.routes.auth import get_user_from_token


router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
)


def _calculate_streak(completed_dates: list) -> int:
    """Calculate current consecutive-day streak from completed interview dates."""

    if not completed_dates:
        return 0

    clean_dates = []

    for d in completed_dates:
        if isinstance(d, datetime):
            clean_dates.append(d.date())

        elif isinstance(d, date):
            clean_dates.append(d)

        elif isinstance(d, str):
            try:
                clean_dates.append(
                    datetime.fromisoformat(
                        d.replace("Z", "+00:00")
                    ).date()
                )
            except Exception:
                pass

    if not clean_dates:
        return 0

    unique_days = sorted(set(clean_dates), reverse=True)

    today = datetime.utcnow().date()

    # Allow streak to start from today or yesterday.
    if unique_days[0] not in {
        today,
        today - timedelta(days=1),
    }:
        return 0

    streak = 1
    expected = unique_days[0] - timedelta(days=1)

    for day in unique_days[1:]:
        if day == expected:
            streak += 1
            expected = day - timedelta(days=1)
        else:
            break

    return streak


@router.get("")
async def get_dashboard(
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # ============================================================
    # 1. FETCH ALL COMPLETED INTERVIEWS
    # ============================================================

    completed_cursor = db.interviews.find(
        {
            "user_id": current_user.id,
            "status": "completed",
        }
    )

    completed_docs = await completed_cursor.to_list(length=1000)

    interview_count = len(completed_docs)

    # ============================================================
    # 2. SCORE CALCULATIONS
    # ============================================================

    scores = [
        float(interview["overall_score"])
        for interview in completed_docs
        if interview.get("overall_score") is not None
    ]

    avg_score = (
        round(sum(scores) / len(scores), 1)
        if scores
        else 0.0
    )

    best_score = (
        round(max(scores), 1)
        if scores
        else 0.0
    )

    # ============================================================
    # 3. CURRENT STREAK
    # ============================================================

    raw_dates = [
        interview.get("completed_at")
        for interview in completed_docs
        if interview.get("completed_at")
    ]

    current_streak = _calculate_streak(raw_dates)

    # ============================================================
    # 4. RECENT COMPLETED INTERVIEWS
    #
    # IMPORTANT:
    # Only completed interviews are returned here.
    #
    # Previously this query returned running interviews too:
    #
    # db.interviews.find({
    #     "user_id": current_user.id
    # })
    #
    # That caused AI Insights to receive:
    # status = running
    # score = null
    #
    # Now we explicitly filter completed interviews.
    # ============================================================

    recent_cursor = (
        db.interviews.find(
            {
                "user_id": current_user.id,
                "status": "completed",
            }
        )
        .sort("completed_at", -1)
        .limit(5)
    )

    recent_docs = await recent_cursor.to_list(length=5)

    recent_interviews = []

    for interview in recent_docs:

        # --------------------------------------------------------
        # Get interview ID
        # --------------------------------------------------------
        interview_id = interview.get("id")

        # MongoDB normally uses "_id".
        # If custom "id" is missing, use MongoDB "_id".
        if not interview_id:
            mongo_id = interview.get("_id")

            if mongo_id is not None:
                interview_id = str(mongo_id)

        # --------------------------------------------------------
        # Get display date
        # --------------------------------------------------------
        display_date = (
            interview.get("completed_at")
            or interview.get("created_at")
        )

        if isinstance(display_date, datetime):
            display_date = display_date.isoformat()
        else:
            display_date = str(display_date or "")

        # --------------------------------------------------------
        # Add completed interview
        # --------------------------------------------------------
        recent_interviews.append(
            {
                "id": interview_id,
                "role": interview.get("role"),
                "type": interview.get("interview_type"),
                "difficulty": interview.get("difficulty"),
                "status": interview.get("status"),
                "score": interview.get("overall_score"),
                "duration": f"{interview.get('duration_minutes', 30)} min",
                "date": display_date,
            }
        )

    # ============================================================
    # 5. WEEKLY PERFORMANCE
    # ============================================================

    six_weeks_ago = datetime.utcnow() - timedelta(weeks=6)

    week_buckets: dict[str, list[float]] = {}

    for interview in completed_docs:

        completed_at = interview.get("completed_at")
        score = interview.get("overall_score")

        if not completed_at or score is None:
            continue

        if not isinstance(completed_at, datetime):
            continue

        if completed_at < six_weeks_ago:
            continue

        week = completed_at.strftime("W%W")

        week_buckets.setdefault(
            week,
            [],
        ).append(float(score))

    weekly_performance = [
        {
            "week": week,
            "score": round(
                sum(scores_list) / len(scores_list),
                1,
            ),
            "interviews": len(scores_list),
        }
        for week, scores_list in sorted(
            week_buckets.items()
        )
    ]

    # ============================================================
    # 6. QUESTIONS ANSWERED
    #
    # If actual answers are available, count them.
    # Otherwise preserve the existing fallback of 8/interview.
    # ============================================================

    questions_answered = 0

    for interview in completed_docs:

        answers = interview.get("answers")

        if isinstance(answers, list):
            questions_answered += len(answers)

        elif isinstance(answers, dict):
            questions_answered += len(answers)

        else:
            questions_answered += 8

    # ============================================================
    # 7. PRACTICE HOURS
    # ============================================================

    practice_hours = round(
        interview_count * 0.5,
        1,
    )

    # ============================================================
    # 8. DASHBOARD RESPONSE
    # ============================================================

    return {
        "overall_score": avg_score,
        "interviews_completed": interview_count,
        "average_score": avg_score,
        "best_score": best_score,
        "current_streak": current_streak,
        "questions_answered": questions_answered,
        "practice_hours": practice_hours,
        "recent_interviews": recent_interviews,
        "weekly_performance": weekly_performance,
    }