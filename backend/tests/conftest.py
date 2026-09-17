import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from mongomock_motor import AsyncMongoMockClient
from app.main import app
from app.database import get_db


@pytest_asyncio.fixture(scope='function')
async def db():
    mock_client = AsyncMongoMockClient()
    mock_db = mock_client['InterviewBuddy_Test']
    return mock_db


@pytest_asyncio.fixture(scope='function')
async def client(db):
    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as c:
        yield c
    app.dependency_overrides.clear()
