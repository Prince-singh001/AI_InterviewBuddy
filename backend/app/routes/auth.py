import json
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
)

from fastapi.security import (
    HTTPBearer,
    HTTPAuthorizationCredentials,
)

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.user import User

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    VerifyOTPRequest,
    ResendOTPRequest,
    OTPResponse,
    TokenResponse,
    UserResponse,
    ProfileSetupRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)

from app.services.auth_service import (
    register_user,
    login_user,
    verify_signup_otp as verify_signup_otp_service,
    resend_signup_otp,
    user_to_response,
    get_current_user,
    request_password_reset,
    reset_password,
    calculate_profile_completion,
)

from app.auth.jwt_handler import (
    decode_token,
    create_access_token,
    create_refresh_token,
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
)

security = HTTPBearer()


# ============================================================
# GET USER FROM ACCESS TOKEN
# ============================================================

async def get_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> User:

    token = credentials.credentials

    # --------------------------------------------------------
    # DEMO TOKEN SUPPORT
    # --------------------------------------------------------

    if (
        token in {
            "mock-jwt-token",
            "mock-token",
            "demo-token",
        }
        or token.startswith("demo-")
    ):

        demo_doc = await db.users.find_one(
            {
                "email": "demo@interviewerbuddy.ai"
            }
        )

        if not demo_doc:

            demo_user = User(
                id="demo-001",
                email="demo@interviewerbuddy.ai",
                name="Prince",
                hashed_password="",
                target_role="AIML Engineer",
                experience="1 year",
                skills=json.dumps([
                    "Python",
                    "Machine Learning",
                    "FastAPI",
                    "MongoDB",
                ]),
                profile_complete=True,
                otp_verified=True,
            )

            await db.users.insert_one(
                demo_user.to_doc()
            )

            return demo_user

        return User.from_doc(demo_doc)

    # --------------------------------------------------------
    # NORMAL JWT
    # --------------------------------------------------------

    payload = decode_token(token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    if payload.get("type") != "access":

        raise HTTPException(
            status_code=401,
            detail="Invalid access token",
        )

    user_id = payload.get("sub")

    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid token payload",
        )

    return await get_current_user(
        db,
        str(user_id),
    )


# ============================================================
# REGISTER
# ============================================================

@router.post(
    "/register",
    response_model=OTPResponse,
)
async def register(
    req: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):

    user = await register_user(
        db,
        req,
    )

    return OTPResponse(
        message="OTP sent to your email. Please verify your email.",
        email=user.email,
    )


# ============================================================
# VERIFY SIGNUP OTP
# ============================================================

@router.post(
    "/verify-signup-otp",
    response_model=TokenResponse,
)
async def verify_signup_otp(
    req: VerifyOTPRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):

    user, access, refresh = await verify_signup_otp_service(
        db=db,
        email=req.email,
        otp=req.otp,
    )

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user=user_to_response(user),
    )


# ============================================================
# RESEND SIGNUP OTP
# ============================================================

@router.post(
    "/resend-signup-otp",
    response_model=OTPResponse,
)
async def resend_signup_otp_route(
    req: ResendOTPRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):

    user = await resend_signup_otp(
        db=db,
        email=req.email,
    )

    return OTPResponse(
        message="A new signup OTP has been sent to your email.",
        email=user.email,
    )


# ============================================================
# LOGIN
# EMAIL + PASSWORD
# ============================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(
    req: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):

    user, access, refresh = await login_user(
        db,
        req,
    )

    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        token_type="bearer",
        user=user_to_response(user),
    )


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
)
async def forgot_password(
    req: ForgotPasswordRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    frontend_origin = request.headers.get("origin") or "http://localhost:5173"

    message = await request_password_reset(
        db=db,
        email=req.email,
        frontend_origin=frontend_origin,
    )

    return ForgotPasswordResponse(
        message=message,
        email=req.email,
    )


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
)
async def reset_password_route(
    req: ResetPasswordRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    message = await reset_password(
        db=db,
        email=req.email,
        token=req.token,
        new_password=req.new_password,
    )

    return ResetPasswordResponse(
        message=message,
    )


# ============================================================
# REFRESH TOKEN
# ============================================================

@router.post(
    "/refresh",
    response_model=TokenResponse,
)
async def refresh_access_token(
    refresh_token: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):

    payload = decode_token(refresh_token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")

    if not user_id:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token payload",
        )

    try:

        user = await get_current_user(
            db,
            str(user_id),
        )

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="User no longer exists",
        )

    new_access_token = create_access_token(
        {
            "sub": str(user.id),
            "email": user.email,
        }
    )

    new_refresh_token = create_refresh_token(
        {
            "sub": str(user.id),
            "email": user.email,
        }
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=user_to_response(user),
    )


# ============================================================
# CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
async def me(
    current_user: User = Depends(
        get_user_from_token
    ),
):

    return user_to_response(
        current_user
    )


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put(
    "/profile",
    response_model=UserResponse,
)
async def update_profile(
    req: ProfileSetupRequest,
    current_user: User = Depends(
        get_user_from_token
    ),
    db: AsyncIOMotorDatabase = Depends(get_db),
):

    update_data = {}

    # --------------------------------------------------------
    # BASIC INFO
    # --------------------------------------------------------

    if req.name is not None:
        current_user.name = req.name
        update_data["name"] = req.name

    if req.headline is not None:
        current_user.headline = req.headline
        update_data["headline"] = req.headline

    if req.phone is not None:
        current_user.phone = req.phone
        update_data["phone"] = req.phone

    if req.location is not None:
        current_user.location = req.location
        update_data["location"] = req.location

    if req.city is not None:
        current_user.city = req.city
        update_data["city"] = req.city

    if req.country is not None:
        current_user.country = req.country
        update_data["country"] = req.country

    career_obj = req.career_objective if req.career_objective is not None else req.careerObjective
    if career_obj is not None:
        current_user.career_objective = career_obj
        update_data["career_objective"] = career_obj

    if req.about is not None:
        current_user.about = req.about
        update_data["about"] = req.about

    pref_job = req.preferred_job_type if req.preferred_job_type is not None else req.preferredJobType
    if pref_job is not None:
        current_user.preferred_job_type = pref_job
        update_data["preferred_job_type"] = pref_job

    pref_loc = req.preferred_location if req.preferred_location is not None else req.preferredLocation
    if pref_loc is not None:
        current_user.preferred_location = pref_loc
        update_data["preferred_location"] = pref_loc

    # --------------------------------------------------------
    # EDUCATION
    # --------------------------------------------------------

    if req.college is not None:
        current_user.college = req.college
        update_data["college"] = req.college

    if req.degree is not None:
        current_user.degree = req.degree
        update_data["degree"] = req.degree

    field_of_study = req.field_of_study if req.field_of_study is not None else req.fieldOfStudy
    if field_of_study is not None:
        current_user.field_of_study = field_of_study
        update_data["field_of_study"] = field_of_study

    grad_year = req.graduation_year if req.graduation_year is not None else req.graduationYear
    if grad_year is not None:
        current_user.graduation_year = grad_year
        update_data["graduation_year"] = grad_year

    if req.cgpa is not None:
        current_user.cgpa = req.cgpa
        update_data["cgpa"] = req.cgpa

    # --------------------------------------------------------
    # CAREER & SKILLS
    # --------------------------------------------------------

    target_role = req.target_role if req.target_role is not None else req.targetRole
    if target_role is not None:
        current_user.target_role = target_role
        update_data["target_role"] = target_role

    if req.experience is not None:
        current_user.experience = req.experience
        update_data["experience"] = req.experience

    if req.skills is not None:
        skills_value = (
            json.dumps(req.skills)
            if isinstance(req.skills, list)
            else req.skills
        )
        current_user.skills = skills_value
        update_data["skills"] = skills_value

    # --------------------------------------------------------
    # SOCIAL / PROFESSIONAL LINKS
    # --------------------------------------------------------

    if req.github is not None:
        current_user.github = req.github
        update_data["github"] = req.github

    if req.linkedin is not None:
        current_user.linkedin = req.linkedin
        update_data["linkedin"] = req.linkedin

    if req.portfolio is not None:
        current_user.portfolio = req.portfolio
        update_data["portfolio"] = req.portfolio

    # --------------------------------------------------------
    # ATTACHMENTS & ARRAYS
    # --------------------------------------------------------

    if req.avatar is not None:
        current_user.avatar = req.avatar
        update_data["avatar"] = req.avatar

    resume_fn = req.resume_filename if req.resume_filename is not None else req.resumeFilename
    if resume_fn is not None:
        current_user.resume_filename = resume_fn
        update_data["resume_filename"] = resume_fn

    resume_up = req.resume_uploaded_at if req.resume_uploaded_at is not None else req.resumeUploadedAt
    if resume_up is not None:
        current_user.resume_uploaded_at = resume_up
        update_data["resume_uploaded_at"] = resume_up

    if req.educations is not None:
        current_user.educations = req.educations
        update_data["educations"] = req.educations
        # If user college / degree is not set, derive from primary education entry
        if req.educations and len(req.educations) > 0:
            first_edu = req.educations[0]
            if isinstance(first_edu, dict):
                if not current_user.college and first_edu.get("college"):
                    current_user.college = first_edu.get("college")
                    update_data["college"] = first_edu.get("college")
                if not current_user.degree and first_edu.get("degree"):
                    current_user.degree = first_edu.get("degree")
                    update_data["degree"] = first_edu.get("degree")

    if req.projects is not None:
        current_user.projects = req.projects
        update_data["projects"] = req.projects

    if req.certifications is not None:
        current_user.certifications = req.certifications
        update_data["certifications"] = req.certifications

    if req.languages is not None:
        current_user.languages = req.languages
        update_data["languages"] = req.languages

    # --------------------------------------------------------
    # RECALCULATE PROFILE COMPLETION
    # --------------------------------------------------------

    percentage, is_complete = calculate_profile_completion(current_user)
    current_user.profile_complete = is_complete

    update_data["profile_complete"] = is_complete
    update_data["profile_completion"] = percentage
    update_data["updated_at"] = datetime.utcnow()

    # --------------------------------------------------------
    # UPDATE DATABASE
    # --------------------------------------------------------

    result = await db.users.update_one(
        {
            "$or": [
                {"id": current_user.id},
                {"_id": current_user.id},
            ]
        },
        {
            "$set": update_data
        },
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user_to_response(
        current_user
    )