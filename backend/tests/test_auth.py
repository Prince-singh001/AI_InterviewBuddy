import pytest


@pytest.mark.asyncio
async def test_register(client):
    response = await client.post('/api/auth/register', json={
        'name': 'Test User', 'email': 'test@example.com', 'password': 'testpassword123'
    })
    assert response.status_code == 200
    data = response.json()
    assert 'access_token' in data
    assert data['user']['email'] == 'test@example.com'


@pytest.mark.asyncio
async def test_login(client):
    # Register first
    await client.post('/api/auth/register', json={
        'name': 'Test User', 'email': 'login@example.com', 'password': 'testpassword123'
    })
    # Then login
    response = await client.post('/api/auth/login', json={
        'email': 'login@example.com', 'password': 'testpassword123'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post('/api/auth/register', json={
        'name': 'Test', 'email': 'wrong@example.com', 'password': 'correctpassword'
    })
    response = await client.post('/api/auth/login', json={
        'email': 'wrong@example.com', 'password': 'wrongpassword'
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client):
    reg = await client.post('/api/auth/register', json={
        'name': 'Me User', 'email': 'me@example.com', 'password': 'testpassword'
    })
    token = reg.json()['access_token']
    response = await client.get('/api/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200
    assert response.json()['email'] == 'me@example.com'


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get('/api/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'
