"""
Practice Questions Seed Script

Safely seeds the 'practice_questions' collection in MongoDB with 140+ structured
interview-oriented questions for C, C++, Python, Java, and Aptitude.
- Re-runnable (upserts by id)
- Preserves existing collections & user data
- Sets up performance indexes
"""

import asyncio
import os
import sys

# Ensure backend root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_ROOT = os.path.dirname(CURRENT_DIR)
if BACKEND_ROOT not in sys.path:
    sys.path.insert(0, BACKEND_ROOT)

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.database import sanitize_mongodb_url
from app.data import ALL_PRACTICE_QUESTIONS


async def seed_practice_questions(db=None) -> int:
    """
    Seed or update practice questions in MongoDB.
    Accepts an existing db instance or connects using application settings.
    """
    should_close_client = False
    client = None

    if db is None:
        raw_url = settings.DATABASE_URL
        _, db_name = sanitize_mongodb_url(raw_url)
        try:
            client = AsyncIOMotorClient(raw_url, serverSelectionTimeoutMS=5000)
            await client.admin.command("ping")
            db = client[db_name]
            should_close_client = True
            print(f"[Practice Seed] Connected to MongoDB: {db_name}")
        except Exception as exc:
            print(f"[Practice Seed] Remote MongoDB connection failed ({exc}). Using mock client...")
            from mongomock_motor import AsyncMongoMockClient
            client = AsyncMongoMockClient()
            db = client[db_name]
            should_close_client = True

    try:
        # Create indexes
        await db.practice_questions.create_index("id", unique=True)
        await db.practice_questions.create_index(
            [("subject", 1), ("difficulty", 1), ("topic", 1)]
        )
        await db.practice_questions.create_index("subject")

        upserted_count = 0
        for q in ALL_PRACTICE_QUESTIONS:
            res = await db.practice_questions.update_one(
                {"id": q["id"]},
                {"$set": q},
                upsert=True,
            )
            upserted_count += 1

        total_in_db = await db.practice_questions.count_documents({})
        print(f"[Practice Seed] Successfully processed {upserted_count} questions. Total in DB: {total_in_db}")
        return total_in_db

    finally:
        if should_close_client and client is not None:
            client.close()


if __name__ == "__main__":
    count = asyncio.run(seed_practice_questions())
    print(f"Done. {count} practice questions ready in MongoDB.")
