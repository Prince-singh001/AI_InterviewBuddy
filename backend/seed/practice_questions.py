
import argparse
import asyncio
import logging
import sys
from pathlib import Path
from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import UpdateOne

CURRENT_DIR = Path(__file__).resolve().parent

BACKEND_ROOT = next(
    (path for path in [CURRENT_DIR, *CURRENT_DIR.parents]
     if (path / "app").is_dir()),
    None,
)

if BACKEND_ROOT is None:
    raise RuntimeError("Backend root not found.")

if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import settings
from app.database import sanitize_mongodb_url
from app.data import ALL_PRACTICE_QUESTIONS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger("practice_seed")

COLLECTION_NAME = "practice_questions"
DEFAULT_BATCH_SIZE = 500

INDEXES = [
    {
        "keys": [("id", 1)],
        "options": {"unique": True},
    },
    {
        "keys": [
            ("subject", 1),
            ("difficulty", 1),
            ("topic", 1),
        ],
        "options": {},
    },
    {
        "keys": [("subject", 1)],
        "options": {},
    },
]


# Validate questions
def validate_questions(
    questions: list[dict[str, Any]],
) -> list[dict[str, Any]]:

    if not isinstance(questions, (list, tuple)):
        raise ValueError("Practice questions must be a list or tuple.")

    if not questions:
        raise ValueError("ALL_PRACTICE_QUESTIONS is empty.")

    validated = []
    seen_ids = set()

    for index, question in enumerate(questions):

        if not isinstance(question, dict):
            raise ValueError(
                f"Question at index {index} must be a dictionary."
            )

        question = dict(question)
        question_id = question.get("id")

        if question_id is None or not isinstance(question_id, (str, int)):
            raise ValueError(
                f"Question at index {index} has an invalid ID."
            )

        if isinstance(question_id, str) and not question_id.strip():
            raise ValueError(
                f"Question at index {index} has an empty ID."
            )

        if question_id in seen_ids:
            raise ValueError(
                f"Duplicate question ID found: {question_id}"
            )

        seen_ids.add(question_id)
        validated.append(question)

    return validated


# Connect to MongoDB
async def connect_database(
    allow_mock_fallback: bool = False,
):
    raw_url = settings.DATABASE_URL

    if not raw_url:
        raise RuntimeError("DATABASE_URL is not configured.")

    client = None
    db_name = None

    try:
        mongo_url, db_name = sanitize_mongodb_url(raw_url)

        if not mongo_url or not db_name:
            raise RuntimeError("Invalid MongoDB URL or database name.")

        client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=20000,
            retryWrites=True,
        )

        await client.admin.command("ping")

        db = client[db_name]

        logger.info("Connected to MongoDB: %s", db_name)

        return client, db

    except Exception as exc:

        if client is not None:
            client.close()

        logger.exception("MongoDB connection failed.")

        if not allow_mock_fallback:
            raise RuntimeError(
                "MongoDB connection failed. Check DATABASE_URL."
            ) from exc

        logger.warning("Using temporary mock database.")

        try:
            from mongomock_motor import AsyncMongoMockClient

            mock_client = AsyncMongoMockClient()
            mock_db = mock_client[db_name or "test_database"]

            return mock_client, mock_db

        except ImportError as mock_error:
            raise RuntimeError(
                "Install mongomock-motor for mock fallback."
            ) from mock_error


# Create indexes
async def create_indexes(db) -> None:

    collection = db[COLLECTION_NAME]

    for index in INDEXES:
        await collection.create_index(
            index["keys"],
            **index["options"],
        )

    logger.info("MongoDB indexes created successfully.")


# Insert or update questions
async def upsert_questions(
    db,
    questions: list[dict[str, Any]],
    batch_size: int = DEFAULT_BATCH_SIZE,
) -> dict[str, int]:

    if batch_size < 1:
        raise ValueError("batch_size must be greater than zero.")

    collection = db[COLLECTION_NAME]

    inserted = 0
    modified = 0
    matched = 0

    total = len(questions)

    for start in range(0, total, batch_size):

        batch = questions[start:start + batch_size]

        operations = [
            UpdateOne(
                {"id": question["id"]},
                {"$set": question},
                upsert=True,
            )
            for question in batch
        ]

        result = await collection.bulk_write(
            operations,
            ordered=False,
        )

        inserted += result.upserted_count
        modified += result.modified_count
        matched += result.matched_count

        logger.info(
            "Processed %s/%s | Inserted: %s | Updated: %s",
            min(start + len(batch), total),
            total,
            inserted,
            modified,
        )

    return {
        "processed": total,
        "inserted": inserted,
        "modified": modified,
        "matched": matched,
    }


# Main seed function
async def seed_practice_questions(
    db=None,
    batch_size: int = DEFAULT_BATCH_SIZE,
    allow_mock_fallback: bool = False,
) -> int:

    client: Optional[Any] = None

    try:
        questions = validate_questions(ALL_PRACTICE_QUESTIONS)

        logger.info("Validated %s practice questions.", len(questions))

        if db is None:
            client, db = await connect_database(
                allow_mock_fallback=allow_mock_fallback
            )

        await create_indexes(db)

        stats = await upsert_questions(
            db=db,
            questions=questions,
            batch_size=batch_size,
        )

        total_in_db = await db[COLLECTION_NAME].count_documents({})

        logger.info("Practice question seeding completed.")
        logger.info("Processed: %s", stats["processed"])
        logger.info("Inserted: %s", stats["inserted"])
        logger.info("Modified: %s", stats["modified"])
        logger.info("Matched: %s", stats["matched"])
        logger.info("Total in DB: %s", total_in_db)

        return total_in_db

    except Exception:
        logger.exception("Practice question seeding failed.")
        raise

    finally:
        if client is not None:
            client.close()
            logger.info("MongoDB connection closed.")


# Run script
def parse_args():

    parser = argparse.ArgumentParser(
        description="Seed practice questions into MongoDB."
    )

    parser.add_argument(
        "--batch-size",
        type=int,
        default=DEFAULT_BATCH_SIZE,
    )

    parser.add_argument(
        "--allow-mock-fallback",
        action="store_true",
    )

    return parser.parse_args()


async def main():

    args = parse_args()

    try:
        count = await seed_practice_questions(
            batch_size=args.batch_size,
            allow_mock_fallback=args.allow_mock_fallback,
        )

        logger.info(
            "Done. %s practice questions ready in MongoDB.",
            count,
        )

    except Exception:
        logger.error("Seed script failed.")
        raise SystemExit(1)


if __name__ == "__main__":
    asyncio.run(main())
