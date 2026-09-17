import json
import random
from fastapi import APIRouter, Depends
from app.models.user import User
from app.routes.auth import get_user_from_token
from app.agents.interview_manager import EvaluationAgent

router = APIRouter(prefix='/api/practice', tags=['practice'])
evaluator = EvaluationAgent()

PRACTICE_QUESTIONS = {
    'python': [
        'Explain Python decorators and give a practical example.',
        'What are generators and how do they differ from regular functions?',
        'Explain async/await in Python with an example.',
        'What is the GIL in Python and how does it affect concurrency?',
    ],
    'ml': [
        'Explain gradient descent and its variants (SGD, Adam, RMSprop).',
        'What is the bias-variance tradeoff?',
        'Explain cross-validation and why it is important.',
        'What is regularization and why is it used?',
    ],
    'behavioral': [
        'Tell me about a time you had to learn something quickly.',
        'Describe a challenging project you worked on.',
        'How do you handle disagreements with teammates?',
    ],
}


@router.post('/question')
async def get_practice_question(body: dict, current_user: User = Depends(get_user_from_token)):
    category = body.get('category', 'python').lower().replace(' ', '_')
    difficulty = body.get('difficulty', 'Intermediate')
    questions = PRACTICE_QUESTIONS.get(category, PRACTICE_QUESTIONS['ml'])
    question = random.choice(questions)
    return {
        'id': f'{category}-{random.randint(1000, 9999)}',
        'question': question,
        'category': category,
        'difficulty': difficulty,
        'time_limit': 120,
    }


@router.post('/evaluate')
async def evaluate_practice(body: dict, current_user: User = Depends(get_user_from_token)):
    question = body.get('question', '')
    answer = body.get('answer', '')
    result = evaluator.evaluate_answer(question, answer)
    return result
