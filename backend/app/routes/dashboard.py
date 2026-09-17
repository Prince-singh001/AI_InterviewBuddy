from datetime import datetime, timedelta, date
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_db
from app.models.user import User
from app.routes.auth import get_user_from_token

router = APIRouter(prefix='/api/dashboard', tags=['dashboard'])


def _calculate_streak(completed_dates: list) -> int:
    """Calculate current consecutive-day streak from a list of activity dates."""
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
                clean_dates.append(datetime.fromisoformat(d.replace('Z', '+00:00')).date())
            except Exception:
                pass
    if not clean_dates:
        return 0

    unique_days = sorted(set(clean_dates), reverse=True)
    today = datetime.utcnow().date()
    streak = 0
    expected = today
    for day in unique_days:
        if day == expected or day == expected - timedelta(days=1):
            if day == expected - timedelta(days=1):
                expected = day
            streak += 1
            expected = day - timedelta(days=1)
        elif day == today - timedelta(days=1) and streak == 0:
            streak += 1
            expected = day - timedelta(days=1)
        else:
            break
    return streak


@router.get('')
async def get_dashboard(
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # Fetch all completed interviews for metrics
    completed_cursor = db.interviews.find({
        'user_id': current_user.id,
        'status': 'completed',
    })
    completed_docs = await completed_cursor.to_list(length=1000)
    interview_count = len(completed_docs)

    scores = [d['overall_score'] for d in completed_docs if d.get('overall_score') is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0.0
    best_score = round(max(scores), 1) if scores else 0.0

    # Calculate streak
    raw_dates = [d.get('completed_at') for d in completed_docs if d.get('completed_at')]
    current_streak = _calculate_streak(raw_dates)

    # Recent interviews (last 5)
    recent_cursor = db.interviews.find({'user_id': current_user.id}).sort('created_at', -1).limit(5)
    recent_docs = await recent_cursor.to_list(length=5)
    recent_interviews = [
        {
            'id': i.get('id'),
            'role': i.get('role'),
            'type': i.get('interview_type'),
            'difficulty': i.get('difficulty'),
            'status': i.get('status'),
            'score': i.get('overall_score'),
            'duration': f"{i.get('duration_minutes', 30)} min",
            'date': i.get('created_at').isoformat() if isinstance(i.get('created_at'), datetime) else str(i.get('created_at', '')),
        }
        for i in recent_docs
    ]

    # Weekly performance (last 6 weeks)
    six_weeks_ago = datetime.utcnow() - timedelta(weeks=6)
    week_buckets: dict[str, list[float]] = {}
    for iv in completed_docs:
        comp_at = iv.get('completed_at')
        sc = iv.get('overall_score')
        if comp_at and sc is not None:
            dt = comp_at if isinstance(comp_at, datetime) else None
            if dt and dt >= six_weeks_ago:
                wk = dt.strftime('W%W')
                week_buckets.setdefault(wk, []).append(sc)

    weekly_performance = [
        {'week': wk, 'score': round(sum(scs) / len(scs), 1), 'interviews': len(scs)}
        for wk, scs in sorted(week_buckets.items())
    ]

    return {
        'overall_score': avg_score,
        'interviews_completed': interview_count,
        'average_score': avg_score,
        'best_score': best_score,
        'current_streak': current_streak,
        'questions_answered': interview_count * 8,
        'practice_hours': round(interview_count * 0.5, 1),
        'recent_interviews': recent_interviews,
        'weekly_performance': weekly_performance,
    }
