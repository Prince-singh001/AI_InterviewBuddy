"""
LLM Provider for InterviewerBuddy AI

Uses Google Gemini as the primary and only AI provider.

Features:
- Real Gemini AI
- AI interview question generation
- Adaptive interview support
- Answer evaluation
- Resume analysis
- Job description analysis
- Final interview scoring
- No demo mode
- No fake/mock AI responses
"""

import json
from typing import Any

from app.config import settings


# ============================================================
# GEMINI PROVIDER
# ============================================================

class GeminiProvider:
    """
    Google Gemini provider for all AI-powered
    InterviewerBuddy AI features.
    """

    def __init__(self) -> None:
        """
        Initialize the Gemini client.
        """

        try:
            from google import genai
        except ImportError as exc:
            raise RuntimeError(
                "Google Gemini SDK is not installed. "
                "Install it with: pip install google-genai"
            ) from exc

        # --------------------------------------------------------
        # Validate Gemini API key
        # --------------------------------------------------------

        api_key = getattr(
            settings,
            "GEMINI_API_KEY",
            None,
        )

        if not api_key or not api_key.strip():

            raise RuntimeError(
                "GEMINI_API_KEY is missing or invalid. "
                "Add your real Gemini API key to backend/.env."
            )

        # --------------------------------------------------------
        # Create Gemini client
        # --------------------------------------------------------

        self.client = genai.Client(
            api_key=api_key.strip()
        )

        # --------------------------------------------------------
        # Gemini model
        # --------------------------------------------------------

        model = getattr(
            settings,
            "GEMINI_MODEL",
            None,
        )

        self.model = (
            model.strip()
            if model
            else "gemini-2.5-flash"
        )

    # ============================================================
    # BASIC CHAT
    # ============================================================

    def chat(
        self,
        system: str,
        user: str,
        json_mode: bool = False,
    ) -> str:
        """
        Send a request to Google Gemini.

        When json_mode=True, Gemini is instructed to return
        only a valid JSON object.
        """

        if not system:
            system = (
                "You are a helpful AI assistant."
            )

        if not user:
            user = ""

        prompt = f"""
SYSTEM INSTRUCTIONS:
{system}

USER REQUEST:
{user}
"""

        if json_mode:

            prompt += """

IMPORTANT OUTPUT RULES:
- Return ONLY a valid JSON object.
- Do not use markdown code fences.
- Do not add explanations before the JSON.
- Do not add explanations after the JSON.
- Use double quotes for JSON keys and string values.
- Do not return trailing commas.
"""

        try:

            response = self.client.interactions.create(
                model=self.model,
                input=prompt,
            )

            # ----------------------------------------------------
            # Extract output text
            # ----------------------------------------------------

            content = getattr(
                response,
                "output_text",
                None,
            )

            # Some SDK response structures may expose output
            # differently, so try a safe fallback.
            if not content:

                output = getattr(
                    response,
                    "output",
                    None,
                )

                if output:

                    content = str(
                        output
                    )

            if not content:

                raise RuntimeError(
                    "Gemini returned an empty response."
                )

            return str(
                content
            ).strip()

        except Exception as exc:

            raise RuntimeError(
                f"Gemini API request failed: {exc}"
            ) from exc

    # ============================================================
    # JSON HELPER
    # ============================================================

    @staticmethod
    def _parse_json(
        raw: str,
    ) -> dict:
        """
        Safely parse a Gemini JSON response.
        """

        if not raw or not raw.strip():

            raise RuntimeError(
                "Gemini returned an empty JSON response."
            )

        cleaned = raw.strip()

        # --------------------------------------------------------
        # Remove markdown code fences
        # --------------------------------------------------------

        if cleaned.startswith("```"):

            lines = cleaned.splitlines()

            if (
                lines
                and lines[0].strip().startswith("```")
            ):
                lines = lines[1:]

            if (
                lines
                and lines[-1].strip() == "```"
            ):
                lines = lines[:-1]

            cleaned = "\n".join(
                lines
            ).strip()

        # --------------------------------------------------------
        # Remove optional "json" prefix
        # --------------------------------------------------------

        if cleaned.lower().startswith("json"):

            cleaned = cleaned[4:].strip()

        # --------------------------------------------------------
        # First JSON parse attempt
        # --------------------------------------------------------

        try:

            data = json.loads(
                cleaned
            )

        except json.JSONDecodeError:

            # ----------------------------------------------------
            # Try extracting JSON object from surrounding text
            # ----------------------------------------------------

            start = cleaned.find("{")
            end = cleaned.rfind("}")

            if start == -1 or end == -1 or end <= start:

                raise RuntimeError(
                    f"Gemini returned invalid JSON: {raw}"
                )

            extracted = cleaned[
                start : end + 1
            ]

            try:

                data = json.loads(
                    extracted
                )

            except json.JSONDecodeError as exc:

                raise RuntimeError(
                    f"Gemini returned invalid JSON: {raw}"
                ) from exc

        # --------------------------------------------------------
        # Ensure object
        # --------------------------------------------------------

        if not isinstance(
            data,
            dict,
        ):

            raise RuntimeError(
                "Gemini response must be a JSON object."
            )

        return data

    # ============================================================
    # NORMALIZE SCORE
    # ============================================================

    @staticmethod
    def _normalize_score(
        value: Any,
        field_name: str,
    ) -> int:
        """
        Convert an AI-generated score into an integer
        between 0 and 100.
        """

        try:

            score = int(
                float(value)
            )

        except (
            TypeError,
            ValueError,
        ) as exc:

            raise RuntimeError(
                f"Invalid score returned for '{field_name}'."
            ) from exc

        return max(
            0,
            min(
                100,
                score,
            ),
        )

    # ============================================================
    # GENERATE INTERVIEW QUESTION
    # ============================================================

    def get_question(
        self,
        interview_type: str,
        role: str,
        difficulty: str,
        asked_topics: list[str],
    ) -> dict:
        """
        Generate one high-quality interview question.
        """

        asked = (
            ", ".join(
                str(topic)
                for topic in asked_topics
                if topic
            )
            if asked_topics
            else "None"
        )

        system = """
You are an expert professional interviewer for an
AI-powered interview platform.

Your task is to generate exactly ONE interview question.

Consider:
- Interview type
- Target job role
- Requested difficulty
- Previously asked topics

The question must:
- Be directly relevant to the selected role.
- Match the requested difficulty.
- Test useful interview knowledge.
- Avoid repeating previously covered topics.
- Be natural for a real interviewer to ask.
- Be concise enough to be spoken aloud.
- Never contain an answer.
- Never contain hints unless specifically required.

Return ONLY this JSON object:

{
    "question": "interview question",
    "text": "interview question",
    "topic": "topic name",
    "difficulty": "Beginner|Intermediate|Advanced|Expert",
    "question_type": "technical|behavioral|hr|mixed"
}

Rules:
- "question" and "text" must contain the same question.
- Do not use markdown.
- Do not include explanations outside JSON.
"""

        user = f"""
Interview Type:
{interview_type}

Target Role:
{role}

Requested Difficulty:
{difficulty}

Previously Asked Topics:
{asked}

Generate the next interview question.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(
            raw
        )

        # --------------------------------------------------------
        # Required fields
        # --------------------------------------------------------

        question = result.get(
            "question",
            result.get(
                "text",
                "",
            ),
        )

        if not question or not str(
            question
        ).strip():

            raise RuntimeError(
                "Gemini returned an empty interview question."
            )

        question = str(
            question
        ).strip()

        topic = result.get(
            "topic",
            "General",
        )

        if not topic:
            topic = "General"

        generated_difficulty = result.get(
            "difficulty",
            difficulty,
        )

        question_type = result.get(
            "question_type",
            interview_type,
        )

        # --------------------------------------------------------
        # Return normalized structure
        # --------------------------------------------------------

        return {
            "question": question,
            "text": question,
            "topic": str(topic),
            "difficulty": str(
                generated_difficulty
            ),
            "question_type": str(
                question_type
            ),
        }

    # ============================================================
    # EVALUATE INTERVIEW ANSWER
    # ============================================================

    def evaluate_answer(
        self,
        question: str,
        answer: str,
    ) -> dict:
        """
        Evaluate a candidate's answer using Gemini.
        """

        if not question or not question.strip():

            raise ValueError(
                "Interview question cannot be empty."
            )

        if not answer or not answer.strip():

            return {
                "score": 0,
                "feedback": (
                    "No answer was provided."
                ),
                "strengths": [],
                "improvements": [
                    "Provide a clear answer to the question."
                ],
                "suggested_answer": "",
            }

        system = """
You are an expert professional interview evaluator.

Evaluate the candidate's answer fairly and objectively.

Consider:
- Correctness
- Technical depth
- Relevance
- Clarity
- Communication
- Examples
- Problem-solving ability
- Answer structure
- Completeness

Important:
- Evaluate ONLY the answer provided.
- Do not invent candidate experience.
- Do not assume skills that were not demonstrated.
- Do not reward irrelevant content.
- Give a score from 0 to 100.
- Be constructive and specific.

Return ONLY this JSON object:

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
- score must be an integer from 0 to 100.
- strengths must be an array.
- improvements must be an array.
- suggested_answer must be a string.
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

        result = self._parse_json(
            raw
        )

        # --------------------------------------------------------
        # Required fields
        # --------------------------------------------------------

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
                    "Gemini evaluation response "
                    f"is missing '{key}'."
                )

        # --------------------------------------------------------
        # Normalize score
        # --------------------------------------------------------

        result["score"] = (
            self._normalize_score(
                result["score"],
                "score",
            )
        )

        # --------------------------------------------------------
        # Normalize text
        # --------------------------------------------------------

        result["feedback"] = str(
            result.get(
                "feedback",
                "",
            )
        ).strip()

        result["suggested_answer"] = str(
            result.get(
                "suggested_answer",
                "",
            )
        ).strip()

        # --------------------------------------------------------
        # Normalize strengths
        # --------------------------------------------------------

        if not isinstance(
            result.get("strengths"),
            list,
        ):
            result["strengths"] = []

        result["strengths"] = [
            str(item).strip()
            for item in result["strengths"]
            if item
        ]

        # --------------------------------------------------------
        # Normalize improvements
        # --------------------------------------------------------

        if not isinstance(
            result.get("improvements"),
            list,
        ):
            result["improvements"] = []

        result["improvements"] = [
            str(item).strip()
            for item in result["improvements"]
            if item
        ]

        return result

    # ============================================================
    # RESUME ANALYSIS
    # ============================================================

    def analyze_resume(
        self,
        resume_text: str,
    ) -> dict:
        """
        Analyze a candidate resume using Gemini.
        """

        if not resume_text or not resume_text.strip():

            raise ValueError(
                "Resume text cannot be empty."
            )

        system = """
You are an expert resume reviewer and ATS specialist.

Analyze ONLY the resume content provided by the candidate.

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

Do not invent:
- Experience
- Skills
- Projects
- Certifications
- Achievements

Return ONLY this JSON object:

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
- Every score must be an integer from 0 to 100.
- Scores must be based ONLY on the supplied resume.
- Do not use markdown.
- Do not include explanations outside JSON.
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

        result = self._parse_json(
            raw
        )

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
                    "Gemini resume response "
                    f"is missing '{key}'."
                )

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

            result[field] = (
                self._normalize_score(
                    result[field],
                    field,
                )
            )

        # --------------------------------------------------------
        # Normalize arrays
        # --------------------------------------------------------

        for field in [
            "extracted_skills",
            "strengths",
            "improvements",
        ]:

            if not isinstance(
                result.get(field),
                list,
            ):
                result[field] = []

            result[field] = [
                str(item).strip()
                for item in result[field]
                if item
            ]

        return result

    # ============================================================
    # JOB ANALYSIS
    # ============================================================

    def analyze_job(
        self,
        job_description: str,
        user_skills: list[str],
    ) -> dict:
        """
        Analyze a job description against candidate skills.
        """

        if (
            not job_description
            or not job_description.strip()
        ):

            raise ValueError(
                "Job description cannot be empty."
            )

        if not isinstance(
            user_skills,
            list,
        ):
            user_skills = []

        skills = (
            ", ".join(
                str(skill)
                for skill in user_skills
                if skill
            )
            if user_skills
            else "None provided"
        )

        system = """
You are an expert job-fit and career analyst.

Compare the supplied job description against the
candidate's supplied skills.

Analyze:
- Job match
- Required experience
- Seniority
- Interview topics
- Preparation strategy
- Missing skills
- Matched skills

Do not invent candidate skills.

Return ONLY this JSON object:

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
JOB DESCRIPTION:

{job_description}

CANDIDATE SKILLS:

{skills}

Analyze the candidate's fit for this job.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(
            raw
        )

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
                    "Gemini job analysis "
                    f"is missing '{key}'."
                )

        result["match_score"] = (
            self._normalize_score(
                result["match_score"],
                "match_score",
            )
        )

        # --------------------------------------------------------
        # Normalize arrays
        # --------------------------------------------------------

        if not isinstance(
            result.get("interview_topics"),
            list,
        ):
            result["interview_topics"] = []

        if not isinstance(
            result.get("missing_skills"),
            list,
        ):
            result["missing_skills"] = []

        # --------------------------------------------------------
        # Normalize individual skills
        # --------------------------------------------------------

        if not isinstance(
            result.get("skills"),
            list,
        ):
            result["skills"] = []

        normalized_skills = []

        for skill in result["skills"]:

            if not isinstance(
                skill,
                dict,
            ):
                continue

            name = skill.get(
                "name",
                "",
            )

            if not name:
                continue

            status_value = skill.get(
                "status",
                "missing",
            )

            if status_value not in (
                "matched",
                "missing",
            ):
                status_value = "missing"

            level = self._normalize_score(
                skill.get(
                    "level",
                    0,
                ),
                f"skill:{name}",
            )

            normalized_skills.append(
                {
                    "name": str(
                        name
                    ),
                    "status": status_value,
                    "level": level,
                }
            )

        result["skills"] = normalized_skills

        return result

    # ============================================================
    # FINAL INTERVIEW SCORES
    # ============================================================

    def generate_final_scores(
        self,
        answers: list[dict],
    ) -> dict:
        """
        Generate final interview scores based on
        actual candidate answers and their evaluations.
        """

        # --------------------------------------------------------
        # No answers
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

        # --------------------------------------------------------
        # Prepare actual interview data
        # --------------------------------------------------------

        answers_summary = []

        for index, answer in enumerate(
            answers,
            start=1,
        ):

            if not isinstance(
                answer,
                dict,
            ):
                continue

            question = answer.get(
                "question",
                "",
            )

            # Your interviews.py stores the evaluation
            # inside answer["evaluation"].
            evaluation = answer.get(
                "evaluation",
                {},
            )

            if not isinstance(
                evaluation,
                dict,
            ):
                evaluation = {}

            score = answer.get(
                "score",
                evaluation.get(
                    "score",
                    "N/A",
                ),
            )

            feedback = evaluation.get(
                "feedback",
                answer.get(
                    "feedback",
                    "",
                ),
            )

            strengths = evaluation.get(
                "strengths",
                [],
            )

            improvements = evaluation.get(
                "improvements",
                [],
            )

            answers_summary.append(
                f"""
Answer {index}:

Question:
{question}

Candidate Answer:
{answer.get("answer", "")}

Individual Score:
{score}

Evaluator Feedback:
{feedback}

Strengths:
{json.dumps(strengths, ensure_ascii=False)}

Improvements:
{json.dumps(improvements, ensure_ascii=False)}
"""
            )

        combined_answers = "\n".join(
            answers_summary
        )

        # --------------------------------------------------------
        # Final scoring prompt
        # --------------------------------------------------------

        system = """
You are an expert final interview evaluator.

Analyze the candidate's ACTUAL interview answers
and the individual AI evaluations.

Generate a final performance assessment.

Evaluate:
- Technical knowledge
- Communication
- Confidence demonstrated in answers
- Clarity
- Problem solving
- Behavioral performance

Important:
- Base scores ONLY on the provided interview data.
- Do not generate random scores.
- Do not assume abilities not demonstrated.
- Do not invent information.
- Scores must reflect the actual evidence.
- Overall score should represent the complete interview.

Return ONLY this JSON:

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
- Every score must be an integer from 0 to 100.
- Do not include markdown.
- Do not include explanations outside JSON.
"""

        user = f"""
CANDIDATE INTERVIEW RESULTS:

{combined_answers}

Generate the final interview scores.
"""

        raw = self.chat(
            system=system,
            user=user,
            json_mode=True,
        )

        result = self._parse_json(
            raw
        )

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
                    "Final score response "
                    f"is missing '{field}'."
                )

            result[field] = (
                self._normalize_score(
                    result[field],
                    field,
                )
            )

        return result


# =====================
# PROVIDER FACTORY
# =====================

def get_provider() -> GeminiProvider:
    """
    Return the real Google Gemini provider.

    There is intentionally:
    - No Demo Mode
    - No Mock Provider
    - No Fake AI fallback
    """

    return GeminiProvider()