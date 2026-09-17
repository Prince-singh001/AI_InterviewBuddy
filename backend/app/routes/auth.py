import json
from datetime import datetime

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
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
)

from app.services.auth_service import (
    register_user,
    login_user,
    verify_signup_otp as verify_signup_otp_service,
    resend_signup_otp,
    user_to_response,
    get_current_user,
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
    # COLLEGE
    # --------------------------------------------------------

    if req.college is not None:

        current_user.college = req.college
        update_data["college"] = req.college

    # --------------------------------------------------------
    # TARGET ROLE
    # --------------------------------------------------------

    if req.target_role is not None:

        current_user.target_role = req.target_role
        update_data["target_role"] = req.target_role

    # --------------------------------------------------------
    # EXPERIENCE
    # --------------------------------------------------------

    if req.experience is not None:

        current_user.experience = req.experience
        update_data["experience"] = req.experience

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    if req.skills is not None:

        skills_value = (
            json.dumps(req.skills)
            if isinstance(req.skills, list)
            else req.skills
        )

        current_user.skills = skills_value
        update_data["skills"] = skills_value

    # --------------------------------------------------------
    # GITHUB
    # --------------------------------------------------------

    if req.github is not None:

        current_user.github = req.github
        update_data["github"] = req.github

    # --------------------------------------------------------
    # LINKEDIN
    # --------------------------------------------------------

    if req.linkedin is not None:

        current_user.linkedin = req.linkedin
        update_data["linkedin"] = req.linkedin

    # --------------------------------------------------------
    # PORTFOLIO
    # --------------------------------------------------------

    if req.portfolio is not None:

        current_user.portfolio = req.portfolio
        update_data["portfolio"] = req.portfolio

    # --------------------------------------------------------
    # PROFILE COMPLETE
    # --------------------------------------------------------

    current_user.profile_complete = True

    update_data["profile_complete"] = True
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