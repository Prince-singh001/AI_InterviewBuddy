import json
import hashlib
import secrets
import smtplib
import base64
import urllib.parse

from datetime import datetime, timedelta
from typing import Any

import httpx

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.message import EmailMessage

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

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
# PROFILE COMPLETION CALCULATION
# ============================================================

def calculate_profile_completion(user: User) -> tuple[int, bool]:
    """
    Calculate profile completion percentage and status.
    Uses the exact 5 core checks required by the UI:
    1. Basic Information (name, email, headline)
    2. Education (college, degree, or educations entry)
    3. Career Information (target_role, experience)
    4. Skills (3+ skills)
    5. Professional Links (github, linkedin, or portfolio)
    """
    name = (user.name or "").strip()
    email = (user.email or "").strip()
    headline = (user.headline or "").strip()
    basic_done = bool(name and email and headline)

    college = (user.college or "").strip()
    degree = (user.degree or "").strip()
    has_edu_entry = False
    if user.educations and isinstance(user.educations, list):
        for e in user.educations:
            if isinstance(e, dict) and e.get("college") and e.get("degree"):
                has_edu_entry = True
                break
    education_done = bool(has_edu_entry or (college and (degree or user.educations)))

    target_role = (user.target_role or "").strip()
    experience = (user.experience or "").strip()
    career_done = bool(target_role and experience)

    skills: list = []
    if isinstance(user.skills, list):
        skills = user.skills
    elif user.skills:
        try:
            skills = json.loads(user.skills)
        except Exception:
            skills = [s.strip() for s in user.skills.split(",") if s.strip()]
    skills_done = bool(len(skills) >= 3)

    github = (user.github or "").strip()
    linkedin = (user.linkedin or "").strip()
    portfolio = (user.portfolio or "").strip()
    links_done = bool(github or linkedin or portfolio)

    checks = [basic_done, education_done, career_done, skills_done, links_done]
    completed_count = sum(1 for c in checks if c)
    percentage = round((completed_count / len(checks)) * 100)
    is_complete = percentage >= 80

    return percentage, is_complete


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

    percentage, is_complete = calculate_profile_completion(user)

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

        headline=user.headline,
        phone=user.phone,
        location=user.location,
        city=user.city,
        country=user.country,
        career_objective=user.career_objective,
        about=user.about,
        preferred_job_type=user.preferred_job_type,
        preferred_location=user.preferred_location,
        degree=user.degree,
        field_of_study=user.field_of_study,
        graduation_year=user.graduation_year,
        cgpa=user.cgpa,
        avatar=user.avatar,
        resume_filename=user.resume_filename,
        resume_uploaded_at=user.resume_uploaded_at,
        educations=user.educations,
        projects=user.projects,
        certifications=user.certifications,
        languages=user.languages,

        profile_complete=is_complete,
        profile_completion=percentage,
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
# GMAIL API EMAIL SENDING
# ============================================================

async def send_email_using_gmail_api(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """
    Send email using Gmail API over HTTPS.

    Gmail API is the primary email provider because
    cloud platforms such as Render may block SMTP
    connections on port 587.

    Required settings:

        GMAIL_CLIENT_ID
        GMAIL_CLIENT_SECRET
        GMAIL_REFRESH_TOKEN
        GMAIL_FROM_EMAIL
    """

    try:

        gmail_client_id = getattr(
            settings,
            "GMAIL_CLIENT_ID",
            None,
        )

        gmail_client_secret = getattr(
            settings,
            "GMAIL_CLIENT_SECRET",
            None,
        )

        gmail_refresh_token = getattr(
            settings,
            "GMAIL_REFRESH_TOKEN",
            None,
        )

        gmail_from_email = getattr(
            settings,
            "GMAIL_FROM_EMAIL",
            None,
        )

        # ----------------------------------------------------
        # CHECK CONFIGURATION
        # ----------------------------------------------------

        if not gmail_client_id:

            raise RuntimeError(
                "GMAIL_CLIENT_ID is missing"
            )

        if not gmail_client_secret:

            raise RuntimeError(
                "GMAIL_CLIENT_SECRET is missing"
            )

        if not gmail_refresh_token:

            raise RuntimeError(
                "GMAIL_REFRESH_TOKEN is missing"
            )

        if not gmail_from_email:

            raise RuntimeError(
                "GMAIL_FROM_EMAIL is missing"
            )

        # ----------------------------------------------------
        # CREATE GOOGLE CREDENTIALS
        # ----------------------------------------------------

        credentials = Credentials(
            token=None,
            refresh_token=gmail_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=gmail_client_id,
            client_secret=gmail_client_secret,
            scopes=[
                "https://www.googleapis.com/auth/gmail.send"
            ],
        )

        # ----------------------------------------------------
        # CREATE GMAIL SERVICE
        # ----------------------------------------------------

        service = build(
            "gmail",
            "v1",
            credentials=credentials,
        )

        # ----------------------------------------------------
        # CREATE EMAIL
        # ----------------------------------------------------

        message = EmailMessage()

        message["To"] = to_email
        message["From"] = gmail_from_email
        message["Subject"] = subject

        # Plain-text fallback
        message.set_content(
            "Your email client does not support HTML emails."
        )

        # HTML email
        message.add_alternative(
            html_body,
            subtype="html",
        )

        # ----------------------------------------------------
        # ENCODE EMAIL
        # ----------------------------------------------------

        encoded_message = (
            base64.urlsafe_b64encode(
                message.as_bytes()
            )
            .decode("utf-8")
        )

        # ----------------------------------------------------
        # SEND EMAIL
        # ----------------------------------------------------

        result = (
            service.users()
            .messages()
            .send(
                userId="me",
                body={
                    "raw": encoded_message
                },
            )
            .execute()
        )

        print(
            f"Gmail API email sent successfully "
            f"to {to_email}. "
            f"Message ID: {result.get('id')}"
        )

        return True

    except Exception as exc:

        print(
            f"Gmail API email error: "
            f"{type(exc).__name__}: {exc}"
        )

        return False


# ============================================================
# EMAIL SENDING
# ============================================================

async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
):
    """
    Send email using the following priority:

    1. Gmail API
    2. Resend HTTPS API
    3. Gmail SMTP

    Gmail API is the primary provider because it works
    through HTTPS and avoids Render SMTP restrictions.
    """

    # ========================================================
    # GMAIL API CONFIGURATION
    # ========================================================

    gmail_client_id = getattr(
        settings,
        "GMAIL_CLIENT_ID",
        None,
    )

    gmail_client_secret = getattr(
        settings,
        "GMAIL_CLIENT_SECRET",
        None,
    )

    gmail_refresh_token = getattr(
        settings,
        "GMAIL_REFRESH_TOKEN",
        None,
    )

    gmail_from_email = getattr(
        settings,
        "GMAIL_FROM_EMAIL",
        None,
    )

    # ========================================================
    # TRY GMAIL API FIRST
    # ========================================================

    if (
        gmail_client_id
        and gmail_client_secret
        and gmail_refresh_token
        and gmail_from_email
    ):

        gmail_api_success = (
            await send_email_using_gmail_api(
                to_email=to_email,
                subject=subject,
                html_body=html_body,
            )
        )

        if gmail_api_success:

            return

        print(
            "Gmail API failed. "
            "Trying Resend fallback..."
        )

    else:

        print(
            "Gmail API configuration is incomplete. "
            "Trying Resend fallback..."
        )

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
    # TRY RESEND
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
        "Configure Gmail API, Resend, "
        "or Gmail SMTP correctly."
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


# ============================================================
# SEND PASSWORD RESET EMAIL
# ============================================================

async def send_password_reset_email(
    email: str,
    name: str,
    reset_link: str,
    expiry_minutes: int = 15,
):
    """
    Send password reset email with secure link reusing the existing email service.
    """

    subject = "Reset Your Interviewer Buddy AI Password"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reset Your Password</title>
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
            padding: 32px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        ">
            <h2 style="
                margin-top: 0;
                color: #0284c7;
                font-size: 22px;
            ">
                Interviewer Buddy AI
            </h2>

            <p style="color: #374151; font-size: 15px; line-height: 1.5;">
                Hello {name},
            </p>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
                We received a request to reset the password for your Interviewer Buddy AI account.
            </p>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.5;">
                Click the button below to set a new password:
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="
                    display: inline-block;
                    background: linear-gradient(135deg, #0284c7, #2563eb);
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 15px;
                ">
                    Reset Password
                </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
                If the button above does not work, copy and paste this link into your browser:
            </p>

            <p style="
                color: #0284c7;
                font-size: 12px;
                word-break: break-all;
                background: #f1f5f9;
                padding: 10px;
                border-radius: 6px;
            ">
                {reset_link}
            </p>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin-top: 20px;">
                This link will expire in <strong>{expiry_minutes} minutes</strong>.
            </p>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
                If you did not request a password reset, you can safely ignore this email.
            </p>

            <hr style="
                border: 0;
                border-top: 1px solid #e5e7eb;
                margin: 25px 0;
            ">

            <small style="
                color: #9ca3af;
                font-size: 12px;
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
# REQUEST PASSWORD RESET
# ============================================================

async def request_password_reset(
    db: AsyncIOMotorDatabase,
    email: str,
    frontend_origin: str = "http://localhost:5173",
) -> str:
    """
    Generate secure reset token, hash it for storage, and send reset email.
    Safely prevents account enumeration by always providing a reassuring response.
    """

    clean_email = email.lower().strip()

    doc = await db.users.find_one({"email": clean_email})

    if not doc:
        # Return generic success to prevent email enumeration
        return "If an account with this email exists, a password reset link has been sent to your email."

    user = User.from_doc(doc)

    if not user:
        return "If an account with this email exists, a password reset link has been sent to your email."

    # Generate secure random token
    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    await db.users.update_one(
        {"id": user.id},
        {
            "$set": {
                "reset_token_hash": token_hash,
                "reset_token_expires_at": expires_at,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    origin = (frontend_origin or "http://localhost:5173").rstrip("/")
    encoded_email = urllib.parse.quote(user.email)
    reset_link = f"{origin}/reset-password?token={raw_token}&email={encoded_email}"

    try:
        await send_password_reset_email(
            email=user.email,
            name=user.name or "User",
            reset_link=reset_link,
            expiry_minutes=15,
        )
    except Exception as exc:
        print(f"Failed to send password reset email: {exc}")
        raise HTTPException(
            status_code=500,
            detail="Unable to send password reset email. Please try again later.",
        )

    return "If an account with this email exists, a password reset link has been sent to your email."


# ============================================================
# RESET PASSWORD
# ============================================================

async def reset_password(
    db: AsyncIOMotorDatabase,
    email: str,
    token: str,
    new_password: str,
) -> str:
    """
    Validate reset token and expiry, update password, and invalidate token (single-use).
    """

    clean_email = email.lower().strip()
    clean_token = token.strip()

    if not clean_token:
        raise HTTPException(
            status_code=400,
            detail="Password reset token is required.",
        )

    if len(new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long.",
        )

    doc = await db.users.find_one({"email": clean_email})

    if not doc:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset link. Please request a new one.",
        )

    user = User.from_doc(doc)

    if not user or not user.reset_token_hash or not user.reset_token_expires_at:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset link. Please request a new one.",
        )

    # Check expiration
    if datetime.utcnow() > user.reset_token_expires_at:
        # Invalidate expired token
        await db.users.update_one(
            {"id": user.id},
            {
                "$set": {
                    "reset_token_hash": None,
                    "reset_token_expires_at": None,
                    "updated_at": datetime.utcnow(),
                }
            },
        )
        raise HTTPException(
            status_code=400,
            detail="Password reset link has expired. Please request a new one.",
        )

    # Compare SHA-256 hash using constant-time comparison
    computed_hash = hashlib.sha256(clean_token.encode("utf-8")).hexdigest()

    if not secrets.compare_digest(user.reset_token_hash, computed_hash):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset link. Please request a new one.",
        )

    # Hash new password
    hashed_password = hash_password(new_password)

    # Invalidate token and update password (single use)
    await db.users.update_one(
        {"id": user.id},
        {
            "$set": {
                "hashed_password": hashed_password,
                "reset_token_hash": None,
                "reset_token_expires_at": None,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return "Password has been reset successfully. You can now log in."