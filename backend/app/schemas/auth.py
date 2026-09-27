from typing import Optional, Any
from pydantic import BaseModel, EmailStr, Field


# ============================================================
# REGISTER
# ============================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ============================================================
# OTP VERIFICATION
# ============================================================

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# ============================================================
# RESEND OTP
# ============================================================

class ResendOTPRequest(BaseModel):
    email: EmailStr


# ============================================================
# OTP RESPONSE
# ============================================================

class OTPResponse(BaseModel):
    message: str
    email: EmailStr


# ============================================================
# FORGOT & RESET PASSWORD
# ============================================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    message: str
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str


class ResetPasswordResponse(BaseModel):
    message: str


# ============================================================
# USER RESPONSE
# ============================================================

class UserResponse(BaseModel):
    id: str
    email: str
    name: str

    college: Optional[str] = None
    target_role: Optional[str] = None
    experience: Optional[str] = None

    skills: Optional[list[str]] = None

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
    profile_completion: int = 0


# ============================================================
# TOKEN RESPONSE
# ============================================================

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str

    token_type: str = "bearer"

    user: UserResponse


# ============================================================
# PROFILE SETUP / UPDATE
# ============================================================

class ProfileSetupRequest(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    career_objective: Optional[str] = None
    careerObjective: Optional[str] = None
    about: Optional[str] = None
    preferred_job_type: Optional[str] = None
    preferredJobType: Optional[str] = None
    preferred_location: Optional[str] = None
    preferredLocation: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    fieldOfStudy: Optional[str] = None
    graduation_year: Optional[str] = None
    graduationYear: Optional[str] = None
    cgpa: Optional[str] = None
    target_role: Optional[str] = None
    targetRole: Optional[str] = None
    experience: Optional[str] = None

    skills: Optional[list[str]] = None

    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    avatar: Optional[str] = None
    resume_filename: Optional[str] = None
    resumeFilename: Optional[str] = None
    resume_uploaded_at: Optional[str] = None
    resumeUploadedAt: Optional[str] = None
    educations: Optional[list[dict[str, Any]]] = None
    projects: Optional[list[dict[str, Any]]] = None
    certifications: Optional[list[dict[str, Any]]] = None
    languages: Optional[list[dict[str, Any]]] = None

    profile_complete: Optional[bool] = None
    profileComplete: Optional[bool] = None


TokenResponse.model_rebuild()