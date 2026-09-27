import uuid
from datetime import datetime
from typing import Optional, Any
from dataclasses import dataclass, field, asdict


@dataclass
class User:
    email: str
    name: str
    hashed_password: str

    id: str = field(default_factory=lambda: str(uuid.uuid4()))

    college: Optional[str] = None
    target_role: Optional[str] = None
    experience: Optional[str] = None
    skills: Optional[str] = None

    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None

    # Extended profile fields
    headline: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    career_objective: Optional[str] = None
    about: Optional[str] = None
    preferred_job_type: Optional[str] = None
    preferred_location: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    graduation_year: Optional[str] = None
    cgpa: Optional[str] = None
    avatar: Optional[str] = None
    resume_filename: Optional[str] = None
    resume_uploaded_at: Optional[str] = None
    educations: Optional[list[dict[str, Any]]] = None
    projects: Optional[list[dict[str, Any]]] = None
    certifications: Optional[list[dict[str, Any]]] = None
    languages: Optional[list[dict[str, Any]]] = None

    profile_complete: bool = False
    is_active: bool = True

    # ========================================================
    # OTP FIELDS
    # ========================================================

    otp_hash: Optional[str] = None
    otp_expires_at: Optional[datetime] = None
    otp_attempts: int = 0

    # Used to identify whether OTP verification is pending
    otp_verified: bool = False

    # ========================================================
    # PASSWORD RESET FIELDS
    # ========================================================
    reset_token_hash: Optional[str] = None
    reset_token_expires_at: Optional[datetime] = None

    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    # ========================================================
    # FROM MONGODB DOCUMENT
    # ========================================================

    @classmethod
    def from_doc(
        cls,
        doc: Optional[dict[str, Any]]
    ) -> Optional["User"]:

        if not doc:
            return None

        return cls(
            id=doc.get("id") or str(doc.get("_id", "")),

            email=doc.get("email", ""),
            name=doc.get("name", ""),
            hashed_password=doc.get("hashed_password", ""),

            college=doc.get("college"),
            target_role=doc.get("target_role") or doc.get("targetRole"),
            experience=doc.get("experience"),
            skills=doc.get("skills"),

            github=doc.get("github"),
            linkedin=doc.get("linkedin"),
            portfolio=doc.get("portfolio"),

            headline=doc.get("headline"),
            phone=doc.get("phone"),
            location=doc.get("location"),
            city=doc.get("city"),
            country=doc.get("country"),
            career_objective=doc.get("career_objective") or doc.get("careerObjective"),
            about=doc.get("about"),
            preferred_job_type=doc.get("preferred_job_type") or doc.get("preferredJobType"),
            preferred_location=doc.get("preferred_location") or doc.get("preferredLocation"),
            degree=doc.get("degree"),
            field_of_study=doc.get("field_of_study") or doc.get("fieldOfStudy"),
            graduation_year=doc.get("graduation_year") or doc.get("graduationYear"),
            cgpa=doc.get("cgpa"),
            avatar=doc.get("avatar"),
            resume_filename=doc.get("resume_filename") or doc.get("resumeFilename"),
            resume_uploaded_at=doc.get("resume_uploaded_at") or doc.get("resumeUploadedAt"),
            educations=doc.get("educations"),
            projects=doc.get("projects"),
            certifications=doc.get("certifications"),
            languages=doc.get("languages"),

            profile_complete=doc.get(
                "profile_complete",
                False
            ),

            is_active=doc.get(
                "is_active",
                True
            ),

            # =================================================
            # OTP
            # =================================================

            otp_hash=doc.get("otp_hash"),

            otp_expires_at=doc.get(
                "otp_expires_at"
            ),

            otp_attempts=doc.get(
                "otp_attempts",
                0
            ),

            otp_verified=doc.get(
                "otp_verified",
                False
            ),

            # =================================================
            # PASSWORD RESET
            # =================================================
            reset_token_hash=doc.get("reset_token_hash"),
            reset_token_expires_at=doc.get("reset_token_expires_at"),

            created_at=doc.get(
                "created_at"
            ) or datetime.utcnow(),

            updated_at=doc.get(
                "updated_at"
            ) or datetime.utcnow(),
        )

    # ========================================================
    # TO MONGODB DOCUMENT
    # ========================================================

    def to_doc(self) -> dict[str, Any]:

        data = asdict(self)

        # Keep custom string ID as MongoDB _id
        data["_id"] = self.id

        return data