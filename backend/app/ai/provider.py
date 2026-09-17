"""
LLM Provider for Interviewer Buddy AI

Uses Google Gemini as the primary and only AI provider.
No Demo Mode or fake/mock AI responses.
"""

import json
from typing import Any

from app.config import settings


class GeminiProvider:
    """Google Gemini provider for all AI-powered Interviewer Buddy features."""

    def __init__(self) -> None:
        from google import genai

        # --------------------------------------------------------
        # Validate Gemini configuration
        # --------------------------------------------------------
        if (
            not settings.GEMINI_API_KEY
            or settings.GEMINI_API_KEY.strip() == ""
        ):
            raise RuntimeError(
                "GEMINI_API_KEY is missing or invalid. "
                "Add your real Gemini API key to backend/.env."
            )

        self.client = genai.Client(
            api_key=settings.GEMINI_API_KEY
        )

        self.model = settings.GEMINI_MODEL

    # ============================================================
    # Basic Chat
    # ============================================================

    def chat(
        self,
        system: str,
        user: str,
        json_mode: bool = False,
    ) -> str:
        """
        Send a request to Google Gemini using the Interactions API.

        When json_mode=True, Gemini is instructed to return
        a valid JSON object.
        """

        prompt = f"""
SYSTEM INSTRUCTIONS:
{system}

USER REQUEST:
{user}
"""

        if json_mode:
            prompt += """

IMPORTANT:
Return ONLY a valid JSON object.
Do not use markdown code fences.
Do not add explanations before or after the JSON.
"""

        try:
            response = self.client.interactions.create(
                model=self.model,
                input=prompt,
            )

            content = getattr(
                response,
                "output_text",
                None,
            )

            if not content:
                raise RuntimeError(
                    "Gemini returned an empty response."
                )

            return content.strip()

        except Exception as exc:
            raise RuntimeError(
                f"Gemini API request failed: {exc}"
            ) from exc

    # ============================================================
    # JSON Helper
    # ============================================================

    @staticmethod
    def _parse_json(raw: str) -> dict:
        """Parse a Gemini JSON response."""

        if not raw or not raw.strip():
            raise RuntimeError(
                "Gemini returned an empty JSON response."
            )

        cleaned = raw.strip()

        # Remove markdown code fences if Gemini adds them.
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()

            if lines and lines[0].startswith("```"):
                lines = lines[1:]

            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]

            cleaned = "\n".join(lines).strip()

            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:].strip()

        try:
            data = json.loads(cleaned)

        except json.JSONDecodeError as exc:
            raise RuntimeError(
                f"Gemini returned invalid JSON: {raw}"
            ) from exc

        if not isinstance(data, dict):
            raise RuntimeError(
                "Gemini response must be a JSON object."
            )

        return data

    # ============================================================
    # Generate Interview Question
    # ============================================================

    def get_question(
        self,
        interview_type: str,
        role: str,
        difficulty: str,
        asked_topics: list[str],
    ) -> dict:

        asked = (
            ", ".join(asked_topics)
            if asked_topics
            else "None"
        )

        system = """
You are an expert professional interviewer.

Generate one high-quality interview question based on:

- Interview type
- Job role
- Difficulty
- Previously asked topics

Avoid repeating previously asked topics.

Return ONLY valid JSON with exactly these keys:

{
    "text": "interview question",
    "topic": "topic name",
    "difficulty": "easy|medium|hard"
}

Rules:
- The question must be relevant to the selected role.
- The question must match the requested difficulty.
- Do not repeat previously asked topics.
- Do not include markdown.
- Do not include explanations outside JSON.
"""

        user = f"""
Interview Type: {interview_type}
Role: {role}
Difficulty: {difficulty}
Previously Asked Topics: {asked}

Generate the next interview question.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(raw)

        required_keys = [
            "text",
            "topic",
            "difficulty",
        ]

        for key in required_keys:
            if key not in result:
                raise RuntimeError(
                    f"Gemini question response is missing '{key}'."
                )

        if not str(result["text"]).strip():
            raise RuntimeError(
                "Gemini returned an empty interview question."
            )

        return result

    # ============================================================
    # Evaluate Interview Answer
    # ============================================================

    def evaluate_answer(
        self,
        question: str,
        answer: str,
    ) -> dict:

        system = """
You are an expert technical and behavioral interview evaluator.

Evaluate the candidate's answer fairly.

Consider:

- Correctness
- Technical depth
- Relevance
- Clarity
- Communication
- Examples
- Problem-solving ability
- Structure

Score the answer from 0 to 100.

Return ONLY valid JSON:

{
    "score": 0,
    "feedback": "detailed feedback",
    "strengths": [
        "strength 1",
        "strength 2"
    ],
    "improvements": [
        "improvement 1",
        "improvement 2"
    ],
    "suggested_answer": "example of a stronger answer"
}

Rules:
- Score must be an integer from 0 to 100.
- Evaluate ONLY the provided answer.
- Do not invent information about the candidate.
- Do not include markdown.
- Do not include text outside JSON.
"""

        user = f"""
Interview Question:
{question}

Candidate Answer:
{answer}

Evaluate this answer.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(raw)

        required_keys = [
            "score",
            "feedback",
            "strengths",
            "improvements",
            "suggested_answer",
        ]

        for key in required_keys:
            if key not in result:
                raise RuntimeError(
                    f"Gemini evaluation response is missing '{key}'."
                )

        # --------------------------------------------------------
        # Normalize score
        # --------------------------------------------------------
        try:
            result["score"] = max(
                0,
                min(100, int(result["score"]))
            )
        except (TypeError, ValueError) as exc:
            raise RuntimeError(
                "Gemini returned an invalid interview score."
            ) from exc

        return result

    # ============================================================
    # Resume Analysis
    # ============================================================

    def analyze_resume(
        self,
        resume_text: str,
    ) -> dict:

        if not resume_text.strip():
            raise ValueError(
                "Resume text cannot be empty."
            )

        system = """
You are an expert resume reviewer and ATS specialist.

Analyze the actual resume content provided by the candidate.

Evaluate:

- Overall quality
- ATS compatibility
- Technical skills
- Experience
- Projects
- Keywords
- Formatting
- Resume strengths
- Areas for improvement

Scores must be based ONLY on the provided resume.

Return ONLY valid JSON:

{
    "overall_score": 0,
    "ats_score": 0,
    "skills_score": 0,
    "experience_score": 0,
    "projects_score": 0,
    "keywords_score": 0,
    "formatting_score": 0,
    "extracted_skills": [],
    "strengths": [],
    "improvements": []
}

Rules:
- All scores must be integers from 0 to 100.
- Do not invent experience.
- Do not invent skills.
- Do not invent projects.
- Do not invent certifications.
- Do not include markdown.
"""

        user = f"""
Analyze this resume:

{resume_text}
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(raw)

        required_keys = [
            "overall_score",
            "ats_score",
            "skills_score",
            "experience_score",
            "projects_score",
            "keywords_score",
            "formatting_score",
            "extracted_skills",
            "strengths",
            "improvements",
        ]

        for key in required_keys:
            if key not in result:
                raise RuntimeError(
                    f"Gemini resume response is missing '{key}'."
                )

        # --------------------------------------------------------
        # Normalize score fields
        # --------------------------------------------------------
        score_fields = [
            "overall_score",
            "ats_score",
            "skills_score",
            "experience_score",
            "projects_score",
            "keywords_score",
            "formatting_score",
        ]

        for field in score_fields:
            try:
                result[field] = max(
                    0,
                    min(100, int(result[field]))
                )
            except (TypeError, ValueError) as exc:
                raise RuntimeError(
                    f"Invalid resume score returned for '{field}'."
                ) from exc

        return result

    # ============================================================
    # Job Analysis
    # ============================================================

    def analyze_job(
        self,
        job_description: str,
        user_skills: list[str],
    ) -> dict:

        if not job_description.strip():
            raise ValueError(
                "Job description cannot be empty."
            )

        skills = (
            ", ".join(user_skills)
            if user_skills
            else "None provided"
        )

        system = """
You are an expert job-fit and career analyst.

Compare the actual job description against the candidate's skills.

Analyze:

- Job match
- Required experience
- Seniority
- Interview topics
- Preparation strategy
- Missing skills
- Matched skills

Do not invent candidate skills.

Return ONLY valid JSON:

{
    "match_score": 0,
    "required_exp": "string",
    "seniority": "string",
    "interview_topics": [],
    "preparation_strategy": "string",
    "missing_skills": [],
    "skills": [
        {
            "name": "skill",
            "status": "matched",
            "level": 0
        }
    ]
}

Rules:
- match_score must be an integer from 0 to 100.
- level must be an integer from 0 to 100.
- status must be either "matched" or "missing".
- Do not invent candidate skills.
- Do not include markdown.
"""

        user = f"""
Job Description:

{job_description}

Candidate Skills:

{skills}

Analyze the candidate's fit for this job.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(raw)

        required_keys = [
            "match_score",
            "required_exp",
            "seniority",
            "interview_topics",
            "preparation_strategy",
            "missing_skills",
            "skills",
        ]

        for key in required_keys:
            if key not in result:
                raise RuntimeError(
                    f"Gemini job analysis is missing '{key}'."
                )

        try:
            result["match_score"] = max(
                0,
                min(100, int(result["match_score"]))
            )
        except (TypeError, ValueError) as exc:
            raise RuntimeError(
                "Invalid job match score returned by Gemini."
            ) from exc

        # --------------------------------------------------------
        # Normalize individual skill levels
        # --------------------------------------------------------
        if isinstance(result["skills"], list):
            for skill in result["skills"]:
                if isinstance(skill, dict) and "level" in skill:
                    try:
                        skill["level"] = max(
                            0,
                            min(100, int(skill["level"]))
                        )
                    except (TypeError, ValueError):
                        skill["level"] = 0

        return result

    # ============================================================
    # Final Interview Scores
    # ============================================================

    def generate_final_scores(
        self,
        answers: list[dict],
    ) -> dict:

        # --------------------------------------------------------
        # No completed interview = no score.
        # Prevents fake/default scores for new users.
        # --------------------------------------------------------
        if not answers:
            return {
                "overall": 0,
                "technical": 0,
                "communication": 0,
                "confidence": 0,
                "clarity": 0,
                "problem_solving": 0,
                "behavioral": 0,
            }

        answers_summary = []

        for index, answer in enumerate(
            answers,
            start=1,
        ):
            answers_summary.append(
                f"""
Answer {index}:
Question: {answer.get('question', '')}
Score: {answer.get('score', 'N/A')}
Feedback: {answer.get('feedback', '')}
"""
            )

        combined_answers = "\n".join(
            answers_summary
        )

        system = """
You are an expert final interview evaluator.

Based on the candidate's actual interview answers
and their individual evaluation scores, generate a
final performance assessment.

Consider:

- Technical knowledge
- Communication
- Confidence
- Clarity
- Problem solving
- Behavioral performance

Return ONLY valid JSON:

{
    "overall": 0,
    "technical": 0,
    "communication": 0,
    "confidence": 0,
    "clarity": 0,
    "problem_solving": 0,
    "behavioral": 0
}

Rules:
- All scores must be integers from 0 to 100.
- Scores must be based on the provided interview data.
- Do not generate random scores.
- Do not include markdown.
"""

        user = f"""
Candidate Interview Results:

{combined_answers}

Generate the final interview scores.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(raw)

        score_fields = [
            "overall",
            "technical",
            "communication",
            "confidence",
            "clarity",
            "problem_solving",
            "behavioral",
        ]

        for field in score_fields:
            if field not in result:
                raise RuntimeError(
                    f"Final score response is missing '{field}'."
                )

            try:
                result[field] = max(
                    0,
                    min(100, int(result[field]))
                )
            except (TypeError, ValueError) as exc:
                raise RuntimeError(
                    f"Invalid final score for '{field}'."
                ) from exc

        return result


# ================================================================
# Provider Factory
# ================================================================

def get_provider() -> GeminiProvider:
    """
    Return the real Google Gemini provider.

    Demo Mode and fake/mock fallback providers are intentionally
    removed.
    """

    return GeminiProvider()