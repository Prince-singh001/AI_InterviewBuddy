import json
import hashlib
import secrets
import smtplib

from datetime import datetime, timedelta
from typing import Any

import httpx

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException

from app.models.user import User

from app.auth.jwt_handler import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)

from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
)

from app.config import settings


# ============================================================
# CONSTANTS
# ============================================================

OTP_EXPIRY_MINUTES = getattr(
    settings,
    "OTP_EXPIRE_MINUTES",
    5,
)

MAX_OTP_ATTEMPTS = getattr(
    settings,
    "OTP_MAX_ATTEMPTS",
    5,
)


# ============================================================
# USER → RESPONSE
# ============================================================

def user_to_response(user: User) -> UserResponse:
    """
    Convert User model into API response.
    """

    if isinstance(user.skills, list):

        skills = user.skills

    elif user.skills:

        try:
            skills = json.loads(user.skills)

        except Exception:

            skills = [
                skill.strip()
                for skill in user.skills.split(",")
                if skill.strip()
            ]

    else:

        skills = []

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,

        college=user.college,
        target_role=user.target_role,
        experience=user.experience,

        skills=skills,

        github=user.github,
        linkedin=user.linkedin,
        portfolio=user.portfolio,

        profile_complete=user.profile_complete,
    )


# ============================================================
# OTP GENERATION
# ============================================================

def generate_otp() -> str:
    """
    Generate a secure 6-digit OTP.
    """

    return f"{secrets.randbelow(1_000_000):06d}"


# ============================================================
# OTP HASH
# ============================================================

def hash_otp(otp: str) -> str:
    """
    Hash OTP before storing it in database.
    """

    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


# ============================================================
# OTP VERIFY
# ============================================================

def verify_otp_hash(
    otp: str,
    otp_hash: str,
) -> bool:
    """
    Compare entered OTP with stored hash.
    """

    return secrets.compare_digest(
        hash_otp(otp),
        otp_hash,
    )


# ============================================================
# EMAIL SENDING
# ============================================================

async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
):
    """
    Send email using:

    1. Resend HTTPS API
    2. Gmail SMTP fallback

    Resend is preferred because it works well with
    cloud deployments such as Render.

    Gmail SMTP is used as fallback when Resend is
    unavailable or rejected.
    """

    # ========================================================
    # RESEND CONFIGURATION
    # ========================================================

    resend_api_key = getattr(
        settings,
        "RESEND_API_KEY",
        None,
    )

    resend_from_email = getattr(
        settings,
        "RESEND_FROM_EMAIL",
        None,
    )

    # ========================================================
    # SMTP CONFIGURATION
    # ========================================================

    smtp_host = getattr(
        settings,
        "SMTP_HOST",
        "smtp.gmail.com",
    )

    smtp_port = getattr(
        settings,
        "SMTP_PORT",
        587,
    )

    smtp_username = getattr(
        settings,
        "SMTP_USERNAME",
        None,
    )

    smtp_password = getattr(
        settings,
        "SMTP_PASSWORD",
        None,
    )

    smtp_from_email = getattr(
        settings,
        "SMTP_FROM_EMAIL",
        None,
    )

    # ========================================================
    # TRY RESEND FIRST
    # ========================================================

    if resend_api_key and resend_from_email:

        payload = {
            "from": resend_from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }

        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json",
        }

        try:

            async with httpx.AsyncClient(
                timeout=20.0
            ) as client:

                response = await client.post(
                    "https://api.resend.com/emails",
                    json=payload,
                    headers=headers,
                )

            # ------------------------------------------------
            # SUCCESS
            # ------------------------------------------------

            if response.status_code < 400:

                print(
                    f"Email sent successfully using Resend "
                    f"to {to_email}"
                )

                return

            # ------------------------------------------------
            # RESEND FAILED
            # ------------------------------------------------

            print(
                "Resend API error:",
                response.status_code,
                response.text,
            )

            print(
                "Trying Gmail SMTP fallback..."
            )

        except httpx.RequestError as exc:

            print(
                f"Resend network error: {exc}"
            )

            print(
                "Trying Gmail SMTP fallback..."
            )

        except Exception as exc:

            print(
                f"Unexpected Resend error: {exc}"
            )

            print(
                "Trying Gmail SMTP fallback..."
            )

    # ========================================================
    # GMAIL SMTP FALLBACK
    # ========================================================

    if smtp_username and smtp_password:

        message = MIMEMultipart(
            "alternative"
        )

        message["Subject"] = subject

        message["From"] = (
            smtp_from_email
            or smtp_username
        )

        message["To"] = to_email

        message.attach(
            MIMEText(
                html_body,
                "html",
                "utf-8",
            )
        )

        try:

            with smtplib.SMTP(
                smtp_host,
                smtp_port,
                timeout=20,
            ) as server:

                server.ehlo()

                server.starttls()

                server.ehlo()

                server.login(
                    smtp_username,
                    smtp_password,
                )

                server.sendmail(
                    message["From"],
                    [to_email],
                    message.as_string(),
                )

            print(
                f"Email sent successfully using Gmail SMTP "
                f"to {to_email}"
            )

            return

        except Exception as exc:

            print(
                f"Gmail SMTP error: {exc}"
            )

    # ========================================================
    # NO EMAIL PROVIDER WORKED
    # ========================================================

    raise RuntimeError(
        "Unable to send email. "
        "Configure Resend or Gmail SMTP correctly."
    )


# ============================================================
# SEND SIGNUP OTP
# ============================================================

async def send_signup_otp(
    email: str,
    name: str,
    otp: str,
):
    """
    Send OTP for account verification.
    """

    subject = (
        "Verify Your Interviewer Buddy AI Account"
    )

    html = f"""
    <!DOCTYPE html>

    <html>

    <head>
        <meta charset="UTF-8">
        <title>Verify Account</title>
    </head>

    <body style="
        margin: 0;
        padding: 30px;
        background: #f5f7fb;
        font-family: Arial, sans-serif;
    ">

        <div style="
            max-width: 500px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">

            <h2 style="
                margin-top: 0;
                color: #111827;
            ">
                Interviewer Buddy AI
            </h2>

            <p>
                Hello {name},
            </p>

            <p>
                Thank you for creating an account
                with Interviewer Buddy AI.
            </p>

            <p>
                Please use the following OTP
                to verify your email address:
            </p>

            <div style="
                font-size: 32px;
                font-weight: bold;
                letter-spacing: 8px;
                text-align: center;
                padding: 20px;
                background: #f1f5f9;
                border-radius: 10px;
                margin: 20px 0;
                color: #111827;
            ">
                {otp}
            </div>

            <p>
                This OTP will expire in
                <strong>
                    {OTP_EXPIRY_MINUTES} minutes
                </strong>.
            </p>

            <p>
                If you did not create this account,
                you can safely ignore this email.
            </p>

            <hr style="
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 25px 0;
            ">

            <small style="
                color: #6b7280;
            ">
                Interviewer Buddy AI Security
            </small>

        </div>

    </body>

    </html>
    """

    await send_email(
        to_email=email,
        subject=subject,
        html_body=html,
    )


# ============================================================
# REGISTER
# ============================================================

async def register_user(
    db: AsyncIOMotorDatabase,
    req: RegisterRequest,
) -> UserResponse:
    """
    Register a new user.

    Flow:

        Register
            ↓
        Create password hash
            ↓
        Save user
            ↓
        Generate OTP
            ↓
        Send OTP
            ↓
        Verify OTP
            ↓
        Account verified
    """

    email = req.email.lower().strip()

    # ========================================================
    # CHECK EXISTING USER
    # ========================================================

    existing = await db.users.find_one(
        {
            "email": email
        }
    )

    if existing:

        existing_user = User.from_doc(
            existing
        )

        # ----------------------------------------------------
        # UNVERIFIED USER
        # ----------------------------------------------------

        if (
            existing_user
            and not existing_user.otp_verified
        ):

            otp = generate_otp()

            otp_hash = hash_otp(
                otp
            )

            otp_expires_at = (
                datetime.utcnow()
                + timedelta(
                    minutes=OTP_EXPIRY_MINUTES
                )
            )

            await db.users.update_one(
                {
                    "id": existing_user.id
                },
                {
                    "$set": {
                        "otp_hash": otp_hash,
                        "otp_expires_at": otp_expires_at,
                        "otp_attempts": 0,
                        "otp_verified": False,
                        "updated_at": datetime.utcnow(),
                    }
                },
            )

            try:

                await send_signup_otp(
                    email=existing_user.email,
                    name=existing_user.name,
                    otp=otp,
                )

            except Exception as exc:

                print(
                    f"Signup OTP email failed: {exc}"
                )

                raise HTTPException(
                    status_code=500,
                    detail="Unable to send OTP email",
                )

            return user_to_response(
                existing_user
            )

        # ----------------------------------------------------
        # ALREADY REGISTERED
        # ----------------------------------------------------

        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # ========================================================
    # CREATE USER
    # ========================================================

    user = User(
        email=email,
        name=req.name.strip(),
        hashed_password=hash_password(
            req.password
        ),
        otp_verified=False,
    )

    await db.users.insert_one(
        user.to_doc()
    )

    # ========================================================
    # GENERATE OTP
    # ========================================================

    otp = generate_otp()

    otp_hash = hash_otp(
        otp
    )

    otp_expires_at = (
        datetime.utcnow()
        + timedelta(
            minutes=OTP_EXPIRY_MINUTES
        )
    )

    await db.users.update_one(
        {
            "id": user.id
        },
        {
            "$set": {
                "otp_hash": otp_hash,
                "otp_expires_at": otp_expires_at,
                "otp_attempts": 0,
                "otp_verified": False,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    # ========================================================
    # SEND OTP
    # ========================================================

    try:

        await send_signup_otp(
            email=user.email,
            name=user.name,
            otp=otp,
        )

    except Exception as exc:

        # ----------------------------------------------------
        # DELETE INCOMPLETE USER
        # ----------------------------------------------------

        await db.users.delete_one(
            {
                "id": user.id
            }
        )

        print(
            f"Signup OTP email failed: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP email",
        )

    return user_to_response(
        user
    )


# ============================================================
# VERIFY SIGNUP OTP
# ============================================================

async def verify_signup_otp(
    db: AsyncIOMotorDatabase,
    email: str,
    otp: str,
) -> tuple[UserResponse, str, str]:
    """
    Verify signup OTP.

    Successful verification creates JWT tokens.
    """

    email = email.lower().strip()

    # ========================================================
    # FIND USER
    # ========================================================

    doc = await db.users.find_one(
        {
            "email": email
        }
    )

    user = User.from_doc(
        doc
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # ========================================================
    # ALREADY VERIFIED
    # ========================================================

    if user.otp_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )

    # ========================================================
    # OTP EXISTS
    # ========================================================

    if not user.otp_hash:

        raise HTTPException(
            status_code=400,
            detail=(
                "No OTP request found. "
                "Please request a new OTP."
            ),
        )

    # ========================================================
    # MAX ATTEMPTS
    # ========================================================

    if user.otp_attempts >= MAX_OTP_ATTEMPTS:

        raise HTTPException(
            status_code=429,
            detail=(
                "Too many incorrect OTP attempts. "
                "Please request a new OTP."
            ),
        )

    # ========================================================
    # CHECK EXPIRY
    # ========================================================

    if (
        not user.otp_expires_at
        or datetime.utcnow()
        > user.otp_expires_at
    ):

        await db.users.update_one(
            {
                "id": user.id
            },
            {
                "$set": {
                    "otp_hash": None,
                    "otp_expires_at": None,
                    "otp_attempts": 0,
                    "otp_verified": False,
                }
            },
        )

        raise HTTPException(
            status_code=400,
            detail=(
                "OTP has expired. "
                "Please request a new OTP."
            ),
        )

    # ========================================================
    # VERIFY OTP
    # ========================================================

    if not verify_otp_hash(
        otp,
        user.otp_hash,
    ):

        await db.users.update_one(
            {
                "id": user.id
            },
            {
                "$inc": {
                    "otp_attempts": 1
                }
            },
        )

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP",
        )

    # ========================================================
    # OTP SUCCESS
    # ========================================================

    await db.users.update_one(
        {
            "id": user.id
        },
        {
            "$set": {
                "otp_hash": None,
                "otp_expires_at": None,
                "otp_attempts": 0,
                "otp_verified": True,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    # ========================================================
    # CREATE ACCESS TOKEN
    # ========================================================

    access = create_access_token(
        {
            "sub": user.id,
            "email": user.email,
        }
    )

    # ========================================================
    # CREATE REFRESH TOKEN
    # ========================================================

    refresh = create_refresh_token(
        {
            "sub": user.id,
            "email": user.email,
        }
    )

    return (
        user_to_response(user),
        access,
        refresh,
    )


# ============================================================
# RESEND SIGNUP OTP
# ============================================================

async def resend_signup_otp(
    db: AsyncIOMotorDatabase,
    email: str,
) -> UserResponse:
    """
    Generate and resend signup OTP.
    """

    email = email.lower().strip()

    # ========================================================
    # FIND USER
    # ========================================================

    doc = await db.users.find_one(
        {
            "email": email
        }
    )

    user = User.from_doc(
        doc
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    # ========================================================
    # ALREADY VERIFIED
    # ========================================================

    if user.otp_verified:

        raise HTTPException(
            status_code=400,
            detail="Email is already verified.",
        )

    # ========================================================
    # ACCOUNT STATUS
    # ========================================================

    if not user.is_active:

        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    # ========================================================
    # GENERATE NEW OTP
    # ========================================================

    otp = generate_otp()

    otp_hash = hash_otp(
        otp
    )

    otp_expires_at = (
        datetime.utcnow()
        + timedelta(
            minutes=OTP_EXPIRY_MINUTES
        )
    )

    await db.users.update_one(
        {
            "id": user.id
        },
        {
            "$set": {
                "otp_hash": otp_hash,
                "otp_expires_at": otp_expires_at,
                "otp_attempts": 0,
                "otp_verified": False,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    # ========================================================
    # SEND OTP
    # ========================================================

    try:

        await send_signup_otp(
            email=user.email,
            name=user.name,
            otp=otp,
        )

    except Exception as exc:

        print(
            f"Signup OTP resend failed: {exc}"
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP email",
        )

    return user_to_response(
        user
    )


# ============================================================
# LOGIN
# ============================================================

async def login_user(
    db: AsyncIOMotorDatabase,
    req: LoginRequest,
) -> tuple[UserResponse, str, str]:
    """
    Login using email + password.

    Login does NOT use OTP.

    Flow:

        Email + Password
              ↓
        Find User
              ↓
        Verify Password
              ↓
        Check Email Verification
              ↓
        Create JWT
              ↓
        Dashboard
    """

    email = req.email.lower().strip()

    # ========================================================
    # FIND USER
    # ========================================================

    doc = await db.users.find_one(
        {
            "email": email
        }
    )

    user = User.from_doc(
        doc
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # ========================================================
    # ACCOUNT STATUS
    # ========================================================

    if not user.is_active:

        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    # ========================================================
    # PASSWORD
    # ========================================================

    if not user.hashed_password:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        req.password,
        user.hashed_password,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    # ========================================================
    # EMAIL VERIFICATION
    # ========================================================

    if not user.otp_verified:

        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your email before logging in."
            ),
        )

    # ========================================================
    # ACCESS TOKEN
    # ========================================================

    access = create_access_token(
        {
            "sub": user.id,
            "email": user.email,
        }
    )

    # ========================================================
    # REFRESH TOKEN
    # ========================================================

    refresh = create_refresh_token(
        {
            "sub": user.id,
            "email": user.email,
        }
    )

    # ========================================================
    # RETURN
    # ========================================================

    return (
        user_to_response(user),
        access,
        refresh,
    )


# ============================================================
# CURRENT USER
# ============================================================

async def get_current_user(
    db: AsyncIOMotorDatabase,
    user_id: str,
) -> User:
    """
    Get currently authenticated user.
    """

    doc = await db.users.find_one(
        {
            "$or": [
                {
                    "id": user_id
                },
                {
                    "_id": user_id
                },
            ]
        }
    )

    user = User.from_doc(
        doc
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    return user