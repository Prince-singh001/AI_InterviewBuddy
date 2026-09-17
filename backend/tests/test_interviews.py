import pytest


async def get_token(client) -> str:
    reg = await client.post('/api/auth/register', json={
        'name': 'Interview User', 'email': 'int@example.com', 'password': 'testpassword'
    })
    return reg.json()['access_token']


@pytest.mark.asyncio
async def test_create_interview(client):
    token = await get_token(client)
    response = await client.post('/api/interviews', json={
        'role': 'ML Engineer', 'interview_type': 'Technical',
        'difficulty': 'Intermediate', 'duration_minutes': 30, 'mode': 'text'
    }, headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert 'id' in response.json()


@pytest.mark.asyncio
async def test_list_interviews(client):
    token = await get_token(client)
    response = await client.get('/api/interviews', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
