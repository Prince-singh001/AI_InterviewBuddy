from pydantic import BaseModel
from typing import Optional


class ResumeAnalysisResponse(BaseModel):
    id: str
    overall_score: float
    ats_score: float
    skills_score: float
    experience_score: float
    projects_score: float
    keywords_score: float
    formatting_score: float
    extracted_skills: list[str]
    strengths: list[str]
    improvements: list[str]


class JobAnalysisRequest(BaseModel):
    job_description: str
    title: Optional[str] = None
    company: Optional[str] = None


class JobSkillMatch(BaseModel):
    name: str
    status: str  # matched | partial | missing
    level: int


class JobAnalysisResponse(BaseModel):
    match_score: int
    title: str
    company: Optional[str] = None
    skills: list[JobSkillMatch]
    required_exp: str
    seniority: str
    interview_topics: list[str]
    preparation_strategy: str
    missing_skills: list[str]
