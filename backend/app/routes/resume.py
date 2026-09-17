import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume
from app.routes.auth import get_user_from_token
from app.agents.interview_manager import ResumeAgent
from app.utils.file_upload import save_upload, extract_text
from app.schemas.resume import ResumeAnalysisResponse

router = APIRouter(prefix='/api/resume', tags=['resume'])
resume_agent = ResumeAgent()


@router.post('/upload', response_model=dict)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    file_path, filename = await save_upload(file, 'resumes')
    content = extract_text(file_path)
    resume = Resume(user_id=current_user.id, filename=filename, file_path=file_path, content_text=content)
    await db.resumes.insert_one(resume.to_doc())
    return {'id': resume.id, 'filename': filename, 'status': 'uploaded'}


@router.post('/analyze/{resume_id}', response_model=ResumeAnalysisResponse)
async def analyze_resume(
    resume_id: str,
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    doc = await db.resumes.find_one({'id': resume_id, 'user_id': current_user.id})
    resume = Resume.from_doc(doc)
    if not resume:
        raise HTTPException(404, 'Resume not found')

    user_skills = []
    if current_user.skills:
        try:
            user_skills = json.loads(current_user.skills) if isinstance(current_user.skills, str) else current_user.skills
        except Exception:
            user_skills = [s.strip() for s in current_user.skills.split(',') if s.strip()]

    analysis = resume_agent.analyze(resume.content_text or '', user_skills)

    update_fields = {
        'overall_score': analysis['overall_score'],
        'ats_score': analysis['ats_score'],
        'skills_score': analysis['skills_score'],
        'experience_score': analysis['experience_score'],
        'projects_score': analysis['projects_score'],
        'keywords_score': analysis['keywords_score'],
        'formatting_score': analysis['formatting_score'],
        'extracted_skills': json.dumps(analysis['extracted_skills']),
        'strengths': json.dumps(analysis['strengths']),
        'improvements': json.dumps(analysis['improvements']),
        'analysis_complete': True,
    }
    await db.resumes.update_one({'id': resume_id}, {'$set': update_fields})

    return ResumeAnalysisResponse(
        id=resume_id,
        **{k: v for k, v in analysis.items() if k != 'overall_score'},
        overall_score=analysis['overall_score'],
    )


@router.get('', response_model=list[dict])
async def get_resumes(
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.resumes.find({'user_id': current_user.id}).sort('created_at', -1)
    docs = await cursor.to_list(length=100)
    return [
        {
            'id': r.get('id'),
            'filename': r.get('filename'),
            'overall_score': r.get('overall_score'),
            'created_at': r.get('created_at'),
        }
        for r in docs
    ]
