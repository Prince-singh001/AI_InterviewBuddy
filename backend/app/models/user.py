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
            target_role=doc.get("target_role"),
            experience=doc.get("experience"),
            skills=doc.get("skills"),

            github=doc.get("github"),
            linkedin=doc.get("linkedin"),
            portfolio=doc.get("portfolio"),

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