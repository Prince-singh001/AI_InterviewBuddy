import asyncio
import logging
from datetime import datetime
from typing import AsyncGenerator, Optional
from urllib.parse import quote, unquote

from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
)

from beanie import init_beanie

from app.config import settings

from app.models.interview import (
    Interview,
    InterviewQuestion,
    InterviewAnswer,
)


# ============================================================
# LOGGER
# ============================================================

logger = logging.getLogger(
    "interviewer_buddy.database"
)


# ============================================================
# GLOBAL DATABASE OBJECTS
# ============================================================

_client: Optional[AsyncIOMotorClient] = None

_db: Optional[AsyncIOMotorDatabase] = None

_is_mock: bool = False


# ============================================================
# MONGODB URL
# ============================================================

def sanitize_mongodb_url(
    raw_url: str,
) -> tuple[str, str]:
    """
    Sanitizes MongoDB URI and extracts database name.
    """

    if " " in raw_url:

        parts = raw_url.split("/")

        last_part = parts[-1]

        if "?" in last_part:

            db_part, query_part = last_part.split(
                "?",
                1,
            )

            clean_db = quote(
                unquote(
                    db_part.strip()
                )
            )

            parts[-1] = (
                f"{clean_db}?{query_part}"
            )

        else:

            clean_db = quote(
                unquote(
                    last_part.strip()
                )
            )

            parts[-1] = clean_db

        raw_url = "/".join(parts)

    db_name = settings.parsed_db_name

    return raw_url, db_name


# ============================================================
# MOTOR CLIENT
# ============================================================

def get_motor_client() -> AsyncIOMotorClient:
    """
    Creates and returns MongoDB Motor client.
    """

    global _client

    if _client is None:

        url, _ = sanitize_mongodb_url(
            settings.DATABASE_URL
        )

        _client = AsyncIOMotorClient(
            url,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
        )

    return _client


# ============================================================
# MOTOR DATABASE
# ============================================================

def get_motor_database() -> AsyncIOMotorDatabase:
    """
    Returns configured MongoDB database.
    """

    global _db

    if _db is None:

        client = get_motor_client()

        _, db_name = sanitize_mongodb_url(
            settings.DATABASE_URL
        )

        _db = client[db_name]

    return _db


# ============================================================
# FASTAPI DATABASE DEPENDENCY
# ============================================================

async def get_db() -> AsyncGenerator[
    AsyncIOMotorDatabase,
    None,
]:
    """
    FastAPI dependency for MongoDB.
    """

    yield get_motor_database()


# ============================================================
# BEANIE INITIALIZATION
# ============================================================

async def initialize_beanie(
    db: AsyncIOMotorDatabase,
) -> None:
    """
    Initializes Beanie with all MongoDB document models.
    """

    await init_beanie(
        database=db,
        document_models=[
            Interview,
            InterviewQuestion,
            InterviewAnswer,
        ],
    )

    logger.info(
        "Beanie ODM initialized successfully."
    )


# ============================================================
# SEED DATA
# ============================================================

async def seed_initial_data(
    db: AsyncIOMotorDatabase,
) -> None:
    """
    Seeds demo data ONLY when Demo Mode is enabled.

    Real production/user data is never fabricated when
    DEMO_MODE=False.
    """

    if not settings.DEMO_MODE:

        logger.info(
            "Demo Mode disabled. "
            "Skipping demo/seed data."
        )

        return

    try:

        # ====================================================
        # DEMO USER
        # ====================================================

        user_count = await db.users.count_documents({})

        if user_count == 0:

            demo_user = {
                "id": "demo-001",
                "email": "demo@interviewerbuddy.ai",
                "name": "Demo User",
                "hashed_password": "",

                "college": (
                    "Engineering University"
                ),

                "target_role": "AIML Engineer",

                "experience": "Fresher",

                "skills": (
                    '["Python", '
                    '"Machine Learning", '
                    '"Computer Vision"]'
                ),

                "github": "",

                "linkedin": "",

                "portfolio": "",

                "profile_complete": True,

                "created_at": datetime.utcnow(),
            }

            await db.users.insert_one(
                demo_user
            )

            logger.info(
                "Seeded demo user."
            )

        # ====================================================
        # DEMO INTERVIEWS
        # ====================================================

        interview_count = (
            await db.interviews.count_documents({})
        )

        if interview_count == 0:

            now = datetime.utcnow()

            sample_interviews = [

                {
                    "id": "interview-sample-1",

                    "user_id": "demo-001",

                    "role": "AIML Engineer",

                    "interview_type": "Technical",

                    "difficulty": "Intermediate",

                    "duration_minutes": 30,

                    "mode": "text",

                    "personality": "Professional",

                    "status": "completed",

                    "questions": [],

                    "answers": [],

                    "overall_score": 88,

                    "technical_score": 90,

                    "communication_score": 85,

                    "created_at": now,

                    "started_at": now,

                    "completed_at": now,

                    "strengths": (
                        '["Clear explanations of '
                        'ML concepts"]'
                    ),

                    "improvements": (
                        '["Could elaborate on '
                        'model deployment"]'
                    ),

                    "recommendations": (
                        '["Review ML deployment '
                        'pipelines"]'
                    ),
                },

                {
                    "id": "interview-sample-2",

                    "user_id": "demo-001",

                    "role": "Python Developer",

                    "interview_type": "Technical",

                    "difficulty": "Intermediate",

                    "duration_minutes": 45,

                    "mode": "text",

                    "personality": "Friendly",

                    "status": "completed",

                    "questions": [],

                    "answers": [],

                    "overall_score": 92,

                    "technical_score": 94,

                    "communication_score": 90,

                    "created_at": now,

                    "started_at": now,

                    "completed_at": now,

                    "strengths": (
                        '["Strong Python fundamentals"]'
                    ),

                    "improvements": (
                        '["Improve advanced SQL concepts"]'
                    ),

                    "recommendations": (
                        '["Practice system design basics"]'
                    ),
                },
            ]

            await db.interviews.insert_many(
                sample_interviews
            )

            logger.info(
                "Seeded sample interviews."
            )

    except Exception as err:

        logger.warning(
            f"Seed data notice: {err}"
        )


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

async def init_db() -> None:
    """
    Initializes MongoDB connection and Beanie ODM.
    """

    global _client
    global _db
    global _is_mock

    _, db_name = sanitize_mongodb_url(
        settings.DATABASE_URL
    )

    # ========================================================
    # CONNECT TO MONGODB
    # ========================================================

    try:

        client = get_motor_client()

        logger.info(
            f"Connecting to MongoDB database: {db_name}"
        )

        await asyncio.wait_for(
            client.admin.command("ping"),
            timeout=10,
        )

        _db = client[db_name]

        _is_mock = False

        logger.info(
            "MongoDB Atlas connection successful."
        )

    except Exception as exc:

        logger.warning(
            f"MongoDB Atlas connection failed: {exc}"
        )

        logger.warning(
            "Falling back to in-memory MongoDB "
            "for development."
        )

        try:

            from mongomock_motor import (
                AsyncMongoMockClient
            )

            _client = AsyncMongoMockClient()

            _db = _client[db_name]

            _is_mock = True

            logger.info(
                "In-memory MongoDB initialized."
            )

        except Exception as mock_err:

            logger.error(
                f"Could not initialize fallback "
                f"database: {mock_err}"
            )

            raise

    # ========================================================
    # BEANIE
    # ========================================================

    try:

        await initialize_beanie(_db)

    except Exception as beanie_err:

        logger.error(
            f"Beanie initialization failed: "
            f"{beanie_err}"
        )

        raise

    # ========================================================
    # INDEXES
    # ========================================================

    try:

        # ----------------------------------------------------
        # USERS
        # ----------------------------------------------------

        await _db.users.create_index(
            "email",
            unique=True,
        )

        await _db.users.create_index(
            "id",
            unique=True,
        )

        # ----------------------------------------------------
        # INTERVIEWS
        # ----------------------------------------------------

        await _db.interviews.create_index(
            [
                ("user_id", 1),
                ("created_at", -1),
            ]
        )

        # IMPORTANT:
        # Do NOT create an "id" index here.
        #
        # Beanie's Document.id is mapped to MongoDB _id.
        #
        # The old id_1 index can cause:
        # E11000 duplicate key error
        # dup key: { id: null }

        # ----------------------------------------------------
        # QUESTIONS
        # ----------------------------------------------------

        await _db.interview_questions.create_index(
            [
                ("interview_id", 1),
                ("order_index", 1),
            ]
        )

        # Do NOT create an "id" index here.

        # ----------------------------------------------------
        # ANSWERS
        # ----------------------------------------------------

        await _db.interview_answers.create_index(
            [
                ("interview_id", 1),
                ("question_id", 1),
            ]
        )

        # Do NOT create an "id" index here.

        # ----------------------------------------------------
        # RESUMES
        # ----------------------------------------------------

        await _db.resumes.create_index(
            [
                ("user_id", 1),
                ("created_at", -1),
            ]
        )

        await _db.resumes.create_index(
            "id",
            unique=True,
        )

        # ----------------------------------------------------
        # DOCUMENTS
        # ----------------------------------------------------

        await _db.documents.create_index(
            [
                ("user_id", 1),
                ("created_at", -1),
            ]
        )

        await _db.documents.create_index(
            "id",
            unique=True,
        )

        logger.info(
            "MongoDB indexes successfully verified."
        )

    except Exception as idx_err:

        logger.warning(
            f"Index verification notice: {idx_err}"
        )

    # ========================================================
    # SEED DATA
    # ========================================================

    await seed_initial_data(_db)


# ============================================================
# CLOSE DATABASE
# ============================================================

async def close_db() -> None:
    """
    Closes MongoDB client.
    """

    global _client
    global _db

    if _client is not None:

        _client.close()

        _client = None

        _db = None

        logger.info(
            "MongoDB client connection closed."
        )