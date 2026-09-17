import io
import pytest


async def get_auth_headers(client) -> dict:
    reg = await client.post('/api/auth/register', json={
        'name': 'Feature User',
        'email': 'features@example.com',
        'password': 'testpassword123'
    })
    token = reg.json()['access_token']
    return {'Authorization': f'Bearer {token}'}


@pytest.mark.asyncio
async def test_dashboard_and_profile(client):
    headers = await get_auth_headers(client)

    # Update profile
    prof_res = await client.put('/api/auth/profile', json={
        'college': 'Stanford',
        'target_role': 'AI Engineer',
        'experience': '2 years',
        'skills': ['Python', 'FastAPI', 'MongoDB'],
    }, headers=headers)
    assert prof_res.status_code == 200
    assert prof_res.json()['target_role'] == 'AI Engineer'

    # Get Dashboard
    dash_res = await client.get('/api/dashboard', headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert 'overall_score' in dash_data
    assert 'recent_interviews' in dash_data


@pytest.mark.asyncio
async def test_interview_full_flow(client):
    headers = await get_auth_headers(client)

    # 1. Create interview
    create_res = await client.post('/api/interviews', json={
        'role': 'Full Stack Developer',
        'interview_type': 'technical',
        'difficulty': 'Intermediate',
        'duration_minutes': 30,
        'mode': 'text'
    }, headers=headers)
    assert create_res.status_code == 200
    interview_id = create_res.json()['id']

    # 2. Start interview
    start_res = await client.post(f'/api/interviews/{interview_id}/start', headers=headers)
    assert start_res.status_code == 200
    q_data = start_res.json()
    question_id = q_data['question_id']

    # 3. Submit answer
    ans_res = await client.post(f'/api/interviews/{interview_id}/answer', json={
        'question_id': question_id,
        'answer_text': 'I have built REST and GraphQL APIs using FastAPI and MongoDB with index optimization.',
        'duration_seconds': 45
    }, headers=headers)
    assert ans_res.status_code == 200
    assert 'score' in ans_res.json()

    # 4. Next question
    next_q_res = await client.post(f'/api/interviews/{interview_id}/next-question', headers=headers)
    assert next_q_res.status_code == 200
    assert 'question_text' in next_q_res.json()

    # 5. Complete interview
    comp_res = await client.post(f'/api/interviews/{interview_id}/complete', headers=headers)
    assert comp_res.status_code == 200
    assert comp_res.json()['status'] == 'completed'

    # 6. Get report
    report_res = await client.get(f'/api/interviews/{interview_id}/report', headers=headers)
    assert report_res.status_code == 200
    assert report_res.json()['id'] == interview_id


@pytest.mark.asyncio
async def test_resume_upload_and_analyze(client):
    headers = await get_auth_headers(client)

    dummy_resume = b'Software Engineer with 3 years of experience in Python, FastAPI, MongoDB, React, and Cloud.'
    files = {'file': ('test_resume.txt', io.BytesIO(dummy_resume), 'text/plain')}

    upload_res = await client.post('/api/resume/upload', files=files, headers=headers)
    assert upload_res.status_code == 200
    resume_id = upload_res.json()['id']

    analyze_res = await client.post(f'/api/resume/analyze/{resume_id}', headers=headers)
    assert analyze_res.status_code == 200
    assert 'overall_score' in analyze_res.json()

    list_res = await client.get('/api/resume', headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1


@pytest.mark.asyncio
async def test_job_analysis(client):
    headers = await get_auth_headers(client)

    res = await client.post('/api/jobs/analyze', json={
        'title': 'Senior Backend Engineer',
        'company': 'Tech Corp',
        'job_description': 'Looking for a Python engineer skilled in FastAPI, MongoDB, Docker, and system design.'
    }, headers=headers)
    assert res.status_code == 200
    assert 'match_score' in res.json()


@pytest.mark.asyncio
async def test_practice_routes(client):
    headers = await get_auth_headers(client)

    q_res = await client.post('/api/practice/question', json={
        'category': 'python',
        'difficulty': 'Intermediate'
    }, headers=headers)
    assert q_res.status_code == 200
    assert 'question' in q_res.json()

    eval_res = await client.post('/api/practice/evaluate', json={
        'question': 'What are decorators in Python?',
        'answer': 'Decorators are functions that modify the behavior of another function without altering its code.'
    }, headers=headers)
    assert eval_res.status_code == 200
    assert 'score' in eval_res.json()


@pytest.mark.asyncio
async def test_rag_upload_and_query(client):
    headers = await get_auth_headers(client)

    dummy_doc = b'MongoDB is a source-available, cross-platform, document-oriented database program classified as a NoSQL database product.'
    files = {'file': ('mongodb_notes.txt', io.BytesIO(dummy_doc), 'text/plain')}

    upload_res = await client.post('/api/rag/upload', files=files, headers=headers)
    assert upload_res.status_code == 200

    query_res = await client.post('/api/rag/query', json={
        'query': 'What is MongoDB?'
    }, headers=headers)
    assert query_res.status_code == 200
    assert 'answer' in query_res.json()
