from typing import Optional

from pydantic import BaseModel, EmailStr


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

    profile_complete: bool = False


# ============================================================
# TOKEN RESPONSE
# ============================================================

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str

    token_type: str = "bearer"

    user: UserResponse


# ============================================================
# PROFILE
# ============================================================

class ProfileSetupRequest(BaseModel):

    college: Optional[str] = None
    target_role: Optional[str] = None
    experience: Optional[str] = None

    skills: Optional[list[str]] = None

    github: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None


TokenResponse.model_rebuild()