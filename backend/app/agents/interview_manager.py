"""
Interview Manager Agent
Controls the full interview lifecycle:
state, questions, difficulty adaptation, and completion.
"""

from typing import Optional

from app.ai.provider import get_provider


class InterviewManagerAgent:
    def __init__(self, max_questions: int = 8):
        self.provider = get_provider()
        self.max_questions = max_questions

    def get_next_question(
        self,
        interview_type: str,
        role: str,
        difficulty: str,
        asked_topics: list[str],
        last_score: Optional[float] = None,
        question_number: int = 1,
    ) -> dict:
        """Generate the next question and adapt difficulty based on performance."""

        adapted_difficulty = difficulty

        difficulties = [
            "Beginner",
            "Intermediate",
            "Advanced",
            "Expert",
        ]

        # Adapt difficulty according to previous answer score.
        if last_score is not None:
            if last_score >= 85:
                idx = (
                    difficulties.index(difficulty)
                    if difficulty in difficulties
                    else 1
                )
                adapted_difficulty = difficulties[min(idx + 1, 3)]

            elif last_score < 55:
                idx = (
                    difficulties.index(difficulty)
                    if difficulty in difficulties
                    else 1
                )
                adapted_difficulty = difficulties[max(idx - 1, 0)]

        # Ask the real AI provider for the next question.
        question = self.provider.get_question(
            interview_type,
            role,
            adapted_difficulty,
            asked_topics,
        )

        is_last = question_number >= self.max_questions

        return {
            **question,
            "adapted_difficulty": adapted_difficulty,
            "question_number": question_number,
            "total_questions": self.max_questions,
            "is_last": is_last,
        }


class EvaluationAgent:
    def __init__(self):
        self.provider = get_provider()

    def evaluate_answer(
        self,
        question: str,
        answer: str,
        question_type: str = "technical",
    ) -> dict:
        """Evaluate a single answer and return structured feedback."""
        return self.provider.evaluate_answer(question, answer)

    def generate_final_report(
        self,
        answers: list[dict],
        config: dict,
    ) -> dict:
        """Generate final interview scores and recommendations."""

        scores = self.provider.generate_final_scores(answers)

        strengths = [
            "Strong technical fundamentals in core concepts",
            "Good problem-solving approach and reasoning",
            "Clear and structured explanations",
        ]

        improvements = [
            "Behavioral answers need more structure (STAR method)",
            "Some answers could be more concise",
            "Add more real-world examples to technical explanations",
        ]

        recommendations = [
            "Practice 10 behavioral questions using STAR framework",
            "Complete 20 advanced coding problems",
            "Study system design fundamentals",
        ]

        return {
            **scores,
            "strengths": strengths,
            "improvements": improvements,
            "recommendations": recommendations,
            "communication_metrics": {
                "speaking_speed": 142,
                "filler_words": 8,
                "avg_pause": 1.2,
                "clarity": 86,
                "vocabulary": 82,
                "answer_structure": 78,
            },
            "star_scores": {
                "overall": 76,
                "situation": 85,
                "task": 70,
                "action": 79,
                "result": 68,
            },
        }


class ResumeAgent:
    def __init__(self):
        self.provider = get_provider()

    def analyze(
        self,
        resume_text: str,
        user_skills: Optional[list[str]] = None,
    ) -> dict:
        return self.provider.analyze_resume(resume_text)


class JobAgent:
    def __init__(self):
        self.provider = get_provider()

    def analyze(
        self,
        job_description: str,
        user_skills: list[str],
    ) -> dict:
        return self.provider.analyze_job(
            job_description,
            user_skills,
        )


class CareerCoachAgent:
    def generate_roadmap(
        self,
        role: str,
        skills: list[str],
        interview_scores: list[dict],
    ) -> dict:

        weak_areas = [
            "System Design",
            "Cloud Technologies",
            "MLOps",
        ]

        return {
            "target_role": role,
            "current_readiness": 68,
            "week_plan": [
                {
                    "week": 1,
                    "title": "Python + DSA Foundations",
                    "tasks": [
                        "Complete 30 LeetCode medium problems",
                        "Review Python advanced concepts",
                        "Practice 5 questions daily",
                    ],
                },
                {
                    "week": 2,
                    "title": "Machine Learning Deep Dive",
                    "tasks": [
                        "Review all ML algorithms",
                        "Practice ML system design",
                        "Complete 2 mini projects",
                    ],
                },
                {
                    "week": 3,
                    "title": "Deep Learning + Generative AI",
                    "tasks": [
                        "Study transformer architecture",
                        "Build a RAG application",
                        "Practice GenAI questions",
                    ],
                },
                {
                    "week": 4,
                    "title": "Mock Interviews + Projects",
                    "tasks": [
                        "Complete 5 full mock interviews",
                        "Polish resume and GitHub",
                        "Practice system design (5 problems)",
                    ],
                },
            ],
            "weak_areas": weak_areas,
        }