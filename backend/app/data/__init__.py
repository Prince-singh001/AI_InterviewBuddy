"""
Aggregated Question Bank for Practice Center
Contains 140 carefully constructed interview-grade questions across:
- C (28 questions)
- C++ (28 questions)
- Python (28 questions)
- Java (28 questions)
- Aptitude (28 questions)
"""

from app.data.c_questions import C_QUESTIONS
from app.data.cpp_questions import CPP_QUESTIONS
from app.data.python_questions import PYTHON_QUESTIONS
from app.data.java_questions import JAVA_QUESTIONS
from app.data.aptitude_questions import APTITUDE_QUESTIONS

ALL_PRACTICE_QUESTIONS = (
    C_QUESTIONS
    + CPP_QUESTIONS
    + PYTHON_QUESTIONS
    + JAVA_QUESTIONS
    + APTITUDE_QUESTIONS
)

QUESTIONS_BY_ID = {q["id"]: q for q in ALL_PRACTICE_QUESTIONS}

SUBJECT_MAP = {
    "c": "C",
    "cpp": "C++",
    "c++": "C++",
    "cplusplus": "C++",
    "python": "Python",
    "py": "Python",
    "java": "Java",
    "aptitude": "Aptitude",
    "apt": "Aptitude",
}
