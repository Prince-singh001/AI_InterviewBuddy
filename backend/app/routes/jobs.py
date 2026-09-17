import json
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_db
from app.models.user import User
from app.routes.auth import get_user_from_token
from app.agents.interview_manager import JobAgent
from app.schemas.resume import JobAnalysisRequest, JobAnalysisResponse

router = APIRouter(prefix='/api/jobs', tags=['jobs'])
job_agent = JobAgent()


@router.post('/analyze', response_model=JobAnalysisResponse)
async def analyze_job(
    req: JobAnalysisRequest,
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    user_skills = []
    if current_user.skills:
        try:
            user_skills = json.loads(current_user.skills) if isinstance(current_user.skills, str) else current_user.skills
        except Exception:
            user_skills = [s.strip() for s in current_user.skills.split(',') if s.strip()]

    analysis = job_agent.analyze(req.job_description, user_skills)
    return JobAnalysisResponse(
        match_score=analysis['match_score'],
        title=req.title or 'Software Engineer',
        company=req.company,
        skills=analysis['skills'],
        required_exp=analysis['required_exp'],
        seniority=analysis['seniority'],
        interview_topics=analysis['interview_topics'],
        preparation_strategy=analysis['preparation_strategy'],
        missing_skills=analysis['missing_skills'],
    )
