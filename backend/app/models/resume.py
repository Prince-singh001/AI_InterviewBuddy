import uuid
from datetime import datetime
from typing import Optional, Any
from dataclasses import dataclass, field, asdict


@dataclass
class Resume:
    user_id: str
    filename: str
    file_path: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content_text: Optional[str] = None

    # Analysis results
    overall_score: Optional[float] = None
    ats_score: Optional[float] = None
    skills_score: Optional[float] = None
    experience_score: Optional[float] = None
    projects_score: Optional[float] = None
    keywords_score: Optional[float] = None
    formatting_score: Optional[float] = None

    extracted_skills: Optional[str] = None  # JSON
    strengths: Optional[str] = None         # JSON
    improvements: Optional[str] = None      # JSON
    analysis_complete: bool = False

    created_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def from_doc(cls, doc: Optional[dict[str, Any]]) -> Optional['Resume']:
        if not doc:
            return None
        return cls(
            id=doc.get('id') or str(doc.get('_id', '')),
            user_id=doc.get('user_id', ''),
            filename=doc.get('filename', ''),
            file_path=doc.get('file_path', ''),
            content_text=doc.get('content_text'),
            overall_score=doc.get('overall_score'),
            ats_score=doc.get('ats_score'),
            skills_score=doc.get('skills_score'),
            experience_score=doc.get('experience_score'),
            projects_score=doc.get('projects_score'),
            keywords_score=doc.get('keywords_score'),
            formatting_score=doc.get('formatting_score'),
            extracted_skills=doc.get('extracted_skills'),
            strengths=doc.get('strengths'),
            improvements=doc.get('improvements'),
            analysis_complete=doc.get('analysis_complete', False),
            created_at=doc.get('created_at') or datetime.utcnow(),
        )

    def to_doc(self) -> dict[str, Any]:
        d = asdict(self)
        d['_id'] = self.id
        return d


@dataclass
class Document:
    user_id: str
    filename: str
    doc_type: str  # resume, study_material, etc.
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content_text: Optional[str] = None
    chunk_count: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def from_doc(cls, doc: Optional[dict[str, Any]]) -> Optional['Document']:
        if not doc:
            return None
        return cls(
            id=doc.get('id') or str(doc.get('_id', '')),
            user_id=doc.get('user_id', ''),
            filename=doc.get('filename', ''),
            doc_type=doc.get('doc_type', 'study_material'),
            content_text=doc.get('content_text'),
            chunk_count=doc.get('chunk_count', 0),
            created_at=doc.get('created_at') or datetime.utcnow(),
        )

    def to_doc(self) -> dict[str, Any]:
        d = asdict(self)
        d['_id'] = self.id
        return d
