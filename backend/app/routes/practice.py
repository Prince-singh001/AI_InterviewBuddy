import random
import re
from typing import Optional, List, Union

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database import get_db
from app.models.user import User
from app.routes.auth import get_user_from_token
from app.agents.interview_manager import EvaluationAgent
from app.data import ALL_PRACTICE_QUESTIONS, QUESTIONS_BY_ID, SUBJECT_MAP


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/api/practice",
    tags=["practice"],
)


# ============================================================
# EVALUATION AGENT
# ============================================================

evaluator = EvaluationAgent()


# ============================================================
# SUPPORTED DIFFICULTIES
# ============================================================

SUPPORTED_DIFFICULTIES = {
    "beginner",
    "intermediate",
    "advanced",
}


# ============================================================
# PRACTICE QUESTIONS
# ============================================================


PRACTICE_QUESTIONS = {

    # --------------------------------------------------------
    # DSA
    # --------------------------------------------------------

    "dsa": [
        "What is the difference between an array and a linked list?",
        "Explain the time complexity of binary search and when it can be used.",
        "What is a stack? Give two real-world applications of a stack.",
        "What is a queue and how is it different from a stack?",
        "Explain the difference between BFS and DFS.",
        "What is the difference between a hash table and a binary search tree?",
        "Explain the two-pointer technique with an example.",
        "What is the sliding window technique and when would you use it?",
    ],


    # --------------------------------------------------------
    # PYTHON
    # --------------------------------------------------------

    "python": [
        "Explain Python decorators and give a practical example.",
        "What are generators and how do they differ from regular functions?",
        "Explain async/await in Python with an example.",
        "What is the GIL in Python and how does it affect concurrency?",
        "Explain the difference between a list, tuple, set, and dictionary in Python.",
        "What is the difference between shallow copy and deep copy?",
        "Explain Python exception handling using try, except, else, and finally.",
        "What are lambda functions in Python and when would you use them?",
    ],


    # --------------------------------------------------------
    # MACHINE LEARNING
    # --------------------------------------------------------

    "ml": [
        "Explain gradient descent and its variants such as SGD, Adam, and RMSprop.",
        "What is the bias-variance tradeoff?",
        "Explain cross-validation and why it is important.",
        "What is regularization and why is it used?",
        "What is overfitting and how can you reduce it?",
        "Explain the difference between supervised and unsupervised learning.",
        "What is the difference between classification and regression?",
        "Explain precision, recall, F1-score, and accuracy.",
    ],


    # --------------------------------------------------------
    # DEEP LEARNING
    # --------------------------------------------------------

    "dl": [
        "What is a neural network and how does it learn?",
        "Explain the architecture of a Convolutional Neural Network.",
        "What is backpropagation?",
        "What is the vanishing gradient problem?",
        "Explain the difference between CNNs, RNNs, and Transformers.",
        "What is dropout and why is it used in deep learning?",
        "What is batch normalization?",
        "Explain the role of activation functions in neural networks.",
    ],


    # --------------------------------------------------------
    # GENERATIVE AI
    # --------------------------------------------------------

    "genai": [
        "What is Generative AI and how is it different from traditional machine learning?",
        "What is a Large Language Model?",
        "Explain how transformer models work at a high level.",
        "What is prompt engineering?",
        "What is temperature in a language model?",
        "What is hallucination in Generative AI and how can it be reduced?",
        "What are embeddings and why are they useful in Generative AI?",
        "Explain the difference between fine-tuning and prompt engineering.",
    ],


    # --------------------------------------------------------
    # NLP
    # --------------------------------------------------------

    "nlp": [
        "What is Natural Language Processing?",
        "What is tokenization in NLP?",
        "Explain stemming and lemmatization.",
        "What is TF-IDF and how does it work?",
        "What are word embeddings?",
        "Explain the difference between Word2Vec and contextual embeddings.",
        "What is named entity recognition?",
        "What is sentiment analysis?",
    ],


    # --------------------------------------------------------
    # COMPUTER VISION
    # --------------------------------------------------------

    "cv": [
        "What is Computer Vision?",
        "Explain image classification and object detection.",
        "What is a convolution operation in image processing?",
        "Explain the architecture of a CNN for image classification.",
        "What is image segmentation?",
        "What is the difference between YOLO and traditional object detection methods?",
        "What is OpenCV and where is it commonly used?",
        "Explain data augmentation for image datasets.",
    ],


    # --------------------------------------------------------
    # SQL
    # --------------------------------------------------------

    "sql": [
        "What is the difference between WHERE and HAVING in SQL?",
        "Explain INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL JOIN.",
        "What is database normalization?",
        "What is the difference between DELETE, DROP, and TRUNCATE?",
        "What are primary keys and foreign keys?",
        "What is an index in SQL and why is it useful?",
        "Explain GROUP BY with an example.",
        "What is the difference between UNION and UNION ALL?",
    ],


    # --------------------------------------------------------
    # SYSTEM DESIGN
    # --------------------------------------------------------

    "system-design": [
        "What is horizontal scaling and how is it different from vertical scaling?",
        "What is load balancing and why is it important?",
        "Explain caching and where it can be used in a system.",
        "What is database sharding?",
        "What is a message queue and why would you use one?",
        "Explain the difference between SQL and NoSQL databases from a system design perspective.",
        "How would you design a URL shortening service?",
        "How would you design a scalable file upload system?",
    ],


    # --------------------------------------------------------
    # BEHAVIORAL
    # --------------------------------------------------------

    "behavioral": [
        "Tell me about a time you had to learn something quickly.",
        "Describe a challenging project you worked on.",
        "How do you handle disagreements with teammates?",
        "Tell me about a time you made a mistake and what you learned from it.",
        "Describe a situation where you had to work under pressure.",
        "Tell me about a time you took initiative on a project.",
        "How do you prioritize multiple tasks?",
        "Tell me about a time you received difficult feedback.",
    ],


    # --------------------------------------------------------
    # HR
    # --------------------------------------------------------

    "hr": [
        "Tell me about yourself.",
        "Why are you interested in this role?",
        "Why should we hire you?",
        "What are your strengths?",
        "What is one area you are currently working to improve?",
        "Where do you see yourself in the next few years?",
        "Why do you want to work for our company?",
        "What are your career goals?",
    ],


    # --------------------------------------------------------
    # RAG & LANGCHAIN
    # --------------------------------------------------------

    "rag": [
        "What is Retrieval-Augmented Generation?",
        "Why is RAG useful for Large Language Model applications?",
        "Explain the difference between a vector database and a traditional database.",
        "What are embeddings in a RAG pipeline?",
        "Explain the typical architecture of a RAG system.",
        "What is chunking and why is it important in RAG?",
        "What is LangChain and how can it be used with LLM applications?",
        "How can you reduce hallucinations in a RAG system?",
    ],


    # --------------------------------------------------------
    # AGENTIC AI
    # --------------------------------------------------------

    "agentic": [
        "What is Agentic AI?",
        "How is an AI agent different from a traditional chatbot?",
        "What are tools in an AI agent system?",
        "What is the role of memory in an AI agent?",
        "Explain the planning and execution loop of an AI agent.",
        "What is tool calling in modern LLM systems?",
        "How can multiple AI agents collaborate on a task?",
        "What are some challenges when building autonomous AI agents?",
    ],


    # --------------------------------------------------------
    # COMMUNICATION
    # --------------------------------------------------------

    "communication": [
        "How would you explain a complex technical concept to a non-technical person?",
        "How do you structure your answer during an interview?",
        "How do you handle a question when you do not know the answer?",
        "How do you communicate technical problems to your team?",
        "How do you make sure your communication is clear and concise?",
        "Describe a situation where effective communication helped solve a problem.",
        "How do you handle misunderstandings in a team?",
        "How do you present a technical project to an interviewer?",
    ],
}


# ============================================================
# CATEGORY ALIASES
# ============================================================
# the same category.
# ============================================================

CATEGORY_ALIASES = {

    "c": "C",
    "c_programming": "C",
    "c-programming": "C",
    "c programming": "C",

    "cpp": "C++",
    "c++": "C++",
    "cplusplus": "C++",
    "c_plus_plus": "C++",
    "c-plus-plus": "C++",

    "python": "Python",
    "py": "Python",

    "java": "Java",

    "aptitude": "Aptitude",
    "apt": "Aptitude",
    "quant": "Aptitude",
    "quantitative": "Aptitude",
    "quantitative_aptitude": "Aptitude",
    "quantitative-aptitude": "Aptitude",
    "quantitative aptitude": "Aptitude",
    "logical_reasoning": "Aptitude",
    "logical reasoning": "Aptitude",

    "machine_learning": "ml",
    "machine-learning": "ml",
    "machine learning": "ml",

    "deep_learning": "dl",
    "deep-learning": "dl",
    "deep learning": "dl",

    "generative_ai": "genai",
    "generative-ai": "genai",
    "generative ai": "genai",

    "computer_vision": "cv",
    "computer-vision": "cv",
    "computer vision": "cv",

    "system_design": "system-design",
    "system design": "system-design",

    "hr_questions": "hr",
    "hr-questions": "hr",
    "hr questions": "hr",

    "rag_langchain": "rag",
    "rag-langchain": "rag",
    "rag & langchain": "rag",
    "rag and langchain": "rag",

    "agentic_ai": "agentic",
    "agentic-ai": "agentic",
    "agentic ai": "agentic",
}


# ============================================================
# CATEGORY NORMALIZATION
# ============================================================

def normalize_category(category: str | None) -> str:
    """
    Normalize the category coming from the frontend.
    """

    if not category:
        raise HTTPException(
            status_code=400,
            detail="Practice category is required.",
        )

    normalized = (
        str(category)
        .strip()
        .lower()
    )

    # Direct alias lookup
    if normalized in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[normalized]

    # Standardize spaces
    normalized = normalized.replace(" ", "_")

    if normalized in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[normalized]

    # Keep system-design as hyphenated ID
    if normalized == "system_design":
        return "system-design"

    return normalized


# ============================================================
# DIFFICULTY NORMALIZATION
# ============================================================

def normalize_difficulty(
    difficulty: str | None,
) -> str:

    if not difficulty:
        return "Intermediate"

    normalized = (
        str(difficulty)
        .strip()
        .lower()
    )

    difficulty_map = {
        "basic": "Basic",
        "beginner": "Basic",
        "easy": "Basic",

        "intermediate": "Intermediate",
        "medium": "Intermediate",

        "advanced": "Advanced",
        "hard": "Advanced",
        "expert": "Advanced",
    }

    if normalized not in difficulty_map:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid difficulty. "
                "Choose Basic, Intermediate, or Advanced."
            ),
        )

    return difficulty_map[normalized]


# ============================================================
# GET PRACTICE QUESTION
# ============================================================

@router.post("/question")
async def get_practice_question(
    body: dict,
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Generate or fetch a practice question for the selected category/subject.
    Checks MongoDB 'practice_questions' collection first, with seamless fallback
    to in-memory questions.
    """

    raw_category = body.get("category")
    category = normalize_category(raw_category)

    raw_diff = body.get("difficulty")
    difficulty = normalize_difficulty(raw_diff)

    topic = body.get("topic")
    exclude_ids = body.get("exclude_ids", [])

    # --------------------------------------------------------
    # 1. Query MongoDB practice_questions
    # --------------------------------------------------------
    if db is not None:
        try:
            subject_name = CATEGORY_ALIASES.get(category.lower(), category)
            mongo_query = {
                "subject": {"$regex": f"^{re.escape(subject_name)}$", "$options": "i"}
            }

            if difficulty and difficulty.lower() != "all":
                mongo_query["difficulty"] = {"$regex": f"^{re.escape(difficulty)}$", "$options": "i"}

            if topic and str(topic).strip().lower() not in {"all", "any", ""}:
                mongo_query["topic"] = {"$regex": f"^{re.escape(str(topic).strip())}$", "$options": "i"}

            # Filter out questions already seen in this session if possible
            if exclude_ids and isinstance(exclude_ids, list):
                query_with_exclude = dict(mongo_query)
                query_with_exclude["id"] = {"$nin": exclude_ids}
                cursor = db.practice_questions.find(query_with_exclude)
                matching_docs = await cursor.to_list(length=100)
                if not matching_docs:
                    # If all were excluded, reset and pick from all matching
                    cursor = db.practice_questions.find(mongo_query)
                    matching_docs = await cursor.to_list(length=100)
            else:
                cursor = db.practice_questions.find(mongo_query)
                matching_docs = await cursor.to_list(length=100)

            if matching_docs:
                q = random.choice(matching_docs)
                return {
                    "id": q["id"],
                    "question": q["question"],
                    "subject": q.get("subject", subject_name),
                    "category": q.get("subject", subject_name),
                    "topic": q.get("topic", "General"),
                    "difficulty": q.get("difficulty", difficulty),
                    "type": q.get("type", "mcq"),
                    "code": q.get("code"),
                    "options": q.get("options", []),
                    "time_limit": 120,
                    # Note: correct_answer & explanation are withheld until /submit
                }
        except Exception as exc:
            print(f"[Practice Route] MongoDB query fallback: {exc}")

    # --------------------------------------------------------
    # 2. Check ALL_PRACTICE_QUESTIONS in-memory
    # --------------------------------------------------------
    subject_candidates = [
        q for q in ALL_PRACTICE_QUESTIONS
        if q["subject"].lower() == category.lower()
        or q["subject"].lower() == CATEGORY_ALIASES.get(category.lower(), "").lower()
    ]

    if subject_candidates:
        if difficulty and difficulty.lower() != "all":
            diff_candidates = [
                q for q in subject_candidates
                if q["difficulty"].lower() == difficulty.lower()
            ]
            if diff_candidates:
                subject_candidates = diff_candidates

        if topic and str(topic).strip().lower() not in {"all", "any", ""}:
            top_candidates = [
                q for q in subject_candidates
                if q["topic"].lower() == str(topic).strip().lower()
            ]
            if top_candidates:
                subject_candidates = top_candidates

        if exclude_ids and isinstance(exclude_ids, list):
            non_excluded = [q for q in subject_candidates if q["id"] not in exclude_ids]
            if non_excluded:
                subject_candidates = non_excluded

        q = random.choice(subject_candidates)
        return {
            "id": q["id"],
            "question": q["question"],
            "subject": q["subject"],
            "category": q["subject"],
            "topic": q.get("topic", "General"),
            "difficulty": q.get("difficulty", difficulty),
            "type": q.get("type", "mcq"),
            "code": q.get("code"),
            "options": q.get("options", []),
            "time_limit": 120,
        }

    # --------------------------------------------------------
    # 3. Fallback to legacy PRACTICE_QUESTIONS strings
    # --------------------------------------------------------
    if category in PRACTICE_QUESTIONS:
        questions = PRACTICE_QUESTIONS[category]
        if not questions:
            raise HTTPException(
                status_code=500,
                detail=f"No practice questions available for category '{category}'.",
            )
        question = random.choice(questions)
        return {
            "id": f"{category}-{random.randint(1000, 9999)}",
            "question": question,
            "category": category,
            "difficulty": difficulty,
            "time_limit": 120,
        }

    available_categories = ", ".join(
        sorted(list(PRACTICE_QUESTIONS.keys()) + ["C", "C++", "Python", "Java", "Aptitude"])
    )
    raise HTTPException(
        status_code=400,
        detail=f"Unsupported practice category: {raw_category}. Available: {available_categories}",
    )


# ============================================================
# LIST PRACTICE QUESTIONS (FILTERABLE)
# ============================================================

@router.get("/questions")
async def list_practice_questions(
    subject: Optional[str] = Query(None, description="Subject filter: C, C++, Python, Java, Aptitude"),
    topic: Optional[str] = Query(None, description="Topic filter"),
    difficulty: Optional[str] = Query(None, description="Difficulty filter: Basic, Intermediate, Advanced"),
    type: Optional[str] = Query(None, description="Question type filter"),
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    List and filter questions from the question bank.
    Does not expose correct answers or explanations to prevent cheating.
    """
    query = {}
    if subject and subject.strip().lower() != "all":
        norm_sub = CATEGORY_ALIASES.get(subject.strip().lower(), subject.strip())
        query["subject"] = {"$regex": f"^{re.escape(norm_sub)}$", "$options": "i"}

    if difficulty and difficulty.strip().lower() != "all":
        norm_diff = normalize_difficulty(difficulty)
        query["difficulty"] = {"$regex": f"^{re.escape(norm_diff)}$", "$options": "i"}

    if topic and topic.strip().lower() != "all":
        query["topic"] = {"$regex": f"^{re.escape(topic.strip())}$", "$options": "i"}

    if type and type.strip().lower() != "all":
        query["type"] = {"$regex": f"^{re.escape(type.strip())}$", "$options": "i"}

    questions = []
    total = 0

    if db is not None:
        try:
            cursor = db.practice_questions.find(
                query,
                {
                    "id": 1,
                    "subject": 1,
                    "topic": 1,
                    "difficulty": 1,
                    "type": 1,
                    "question": 1,
                    "code": 1,
                    "options": 1,
                    "_id": 0,
                },
            ).skip(skip).limit(limit)

            questions = await cursor.to_list(length=limit)
            total = await db.practice_questions.count_documents(query)
        except Exception:
            pass

    if not questions:
        # Fallback to in-memory list
        filtered = ALL_PRACTICE_QUESTIONS
        if subject and subject.strip().lower() != "all":
            norm_sub = CATEGORY_ALIASES.get(subject.strip().lower(), subject.strip())
            filtered = [q for q in filtered if q["subject"].lower() == norm_sub.lower()]
        if difficulty and difficulty.strip().lower() != "all":
            norm_diff = normalize_difficulty(difficulty)
            filtered = [q for q in filtered if q["difficulty"].lower() == norm_diff.lower()]
        if topic and topic.strip().lower() != "all":
            filtered = [q for q in filtered if q["topic"].lower() == topic.strip().lower()]
        total = len(filtered)
        questions = [
            {
                "id": q["id"],
                "subject": q["subject"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "type": q["type"],
                "question": q["question"],
                "code": q.get("code"),
                "options": q["options"],
            }
            for q in filtered[skip : skip + limit]
        ]

    return {
        "total": total,
        "count": len(questions),
        "skip": skip,
        "limit": limit,
        "questions": questions,
    }


# ============================================================
# GET SINGLE QUESTION
# ============================================================

@router.get("/questions/{question_id}")
async def get_single_question(
    question_id: str,
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Fetch a single practice question by ID (without correct answer).
    """
    doc = None
    if db is not None:
        doc = await db.practice_questions.find_one(
            {"id": question_id},
            {"_id": 0, "correct_answer": 0, "explanation": 0, "correct_index": 0},
        )
    if not doc:
        q = QUESTIONS_BY_ID.get(question_id)
        if q:
            doc = {k: v for k, v in q.items() if k not in {"correct_answer", "explanation", "correct_index"}}
    if not doc:
        raise HTTPException(status_code=404, detail="Question not found")
    return doc


# ============================================================
# GET TOPICS & COUNTS
# ============================================================

@router.get("/topics")
async def get_practice_topics(
    subject: Optional[str] = Query(None),
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Get available subjects and their topics with question counts.
    """
    match_stage = {}
    if subject and subject.strip().lower() != "all":
        norm_sub = CATEGORY_ALIASES.get(subject.strip().lower(), subject.strip())
        match_stage["subject"] = {"$regex": f"^{re.escape(norm_sub)}$", "$options": "i"}

    formatted = []
    if db is not None:
        try:
            pipeline = [
                {"$match": match_stage} if match_stage else {"$match": {}},
                {
                    "$group": {
                        "_id": {
                            "subject": "$subject",
                            "topic": "$topic",
                        },
                        "count": {"$sum": 1},
                    }
                },
            ]
            cursor = db.practice_questions.aggregate(pipeline)
            raw_results = await cursor.to_list(length=500)

            subjects_dict = {}
            for item in raw_results:
                sub = item["_id"]["subject"]
                top = item["_id"]["topic"]
                cnt = item["count"]
                if sub not in subjects_dict:
                    subjects_dict[sub] = {"subject": sub, "total_questions": 0, "topics": {}}
                subjects_dict[sub]["total_questions"] += cnt
                subjects_dict[sub]["topics"][top] = subjects_dict[sub]["topics"].get(top, 0) + cnt

            for sub, data in subjects_dict.items():
                formatted.append({
                    "subject": sub,
                    "total_questions": data["total_questions"],
                    "topics": [
                        {"name": t, "count": c}
                        for t, c in sorted(data["topics"].items(), key=lambda x: x[0])
                    ],
                })
        except Exception:
            pass

    if not formatted:
        # Fallback to in-memory ALL_PRACTICE_QUESTIONS
        subjects_dict = {}
        for q in ALL_PRACTICE_QUESTIONS:
            sub = q["subject"]
            top = q["topic"]
            if match_stage and sub.lower() != norm_sub.lower():
                continue
            if sub not in subjects_dict:
                subjects_dict[sub] = {"subject": sub, "total_questions": 0, "topics": {}}
            subjects_dict[sub]["total_questions"] += 1
            subjects_dict[sub]["topics"][top] = subjects_dict[sub]["topics"].get(top, 0) + 1

        for sub, data in subjects_dict.items():
            formatted.append({
                "subject": sub,
                "total_questions": data["total_questions"],
                "topics": [
                    {"name": t, "count": c}
                    for t, c in sorted(data["topics"].items(), key=lambda x: x[0])
                ],
            })

    order = {"C": 1, "C++": 2, "Python": 3, "Java": 4, "Aptitude": 5}
    formatted.sort(key=lambda s: (order.get(s["subject"], 99), s["subject"]))
    return {"subjects": formatted}


# ============================================================
# SUBMIT PRACTICE ANSWER
# ============================================================

@router.post("/submit")
async def submit_practice_answer(
    body: dict,
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Submit and validate answer for a practice question.
    Immediately returns correctness, the correct answer, and explanation.
    """
    question_id = body.get("question_id")
    if not question_id:
        raise HTTPException(status_code=400, detail="question_id is required")

    selected_option = body.get("selected_option")
    answer_text = body.get("answer")

    question = None
    if db is not None:
        try:
            question = await db.practice_questions.find_one({"id": question_id})
        except Exception:
            pass

    if not question:
        question = QUESTIONS_BY_ID.get(question_id)

    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # For MCQ questions with options
    if question.get("options"):
        options = question.get("options", [])
        correct_answer = question.get("correct_answer")
        correct_index = question.get("correct_index")

        is_correct = False

        if isinstance(selected_option, int):
            if correct_index is not None and selected_option == correct_index:
                is_correct = True
            elif 0 <= selected_option < len(options):
                is_correct = (
                    options[selected_option].strip().lower()
                    == str(correct_answer).strip().lower()
                )
        elif isinstance(selected_option, str):
            clean_sel = selected_option.strip().lower()
            clean_correct = str(correct_answer).strip().lower()
            if clean_sel == clean_correct:
                is_correct = True
            elif correct_index is not None and 0 <= correct_index < len(options):
                if clean_sel == options[correct_index].strip().lower():
                    is_correct = True
            if clean_sel in {"a", "0", "option a"} and correct_index == 0:
                is_correct = True
            elif clean_sel in {"b", "1", "option b"} and correct_index == 1:
                is_correct = True
            elif clean_sel in {"c", "2", "option c"} and correct_index == 2:
                is_correct = True
            elif clean_sel in {"d", "3", "option d"} and correct_index == 3:
                is_correct = True

        return {
            "question_id": question["id"],
            "is_correct": is_correct,
            "selected_option": selected_option,
            "correct_answer": correct_answer,
            "correct_index": correct_index,
            "explanation": question.get("explanation", ""),
            "subject": question.get("subject"),
            "topic": question.get("topic"),
            "difficulty": question.get("difficulty"),
        }

    # For open-ended questions without options, evaluate with AI
    raw_answer = str(answer_text or selected_option or "").strip()
    if not raw_answer:
        raise HTTPException(status_code=400, detail="Answer is required for evaluation")

    eval_result = evaluator.evaluate_answer(question["question"], raw_answer)
    return {
        "question_id": question["id"],
        "evaluation": eval_result,
        "suggested_answer": question.get("explanation", ""),
    }


# ============================================================
# START PRACTICE SESSION
# ============================================================

@router.post("/session")
async def start_practice_session(
    body: dict,
    current_user: User = Depends(get_user_from_token),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Start a randomized practice session with N questions matching the filters.
    """
    subject = body.get("subject") or body.get("category")
    topic = body.get("topic")
    difficulty = body.get("difficulty")
    limit = int(body.get("limit") or 10)
    limit = max(1, min(limit, 50))

    query = {}
    if subject and subject.strip().lower() != "all":
        norm_sub = CATEGORY_ALIASES.get(subject.strip().lower(), subject.strip())
        query["subject"] = {"$regex": f"^{re.escape(norm_sub)}$", "$options": "i"}

    if difficulty and difficulty.strip().lower() != "all":
        norm_diff = normalize_difficulty(difficulty)
        query["difficulty"] = {"$regex": f"^{re.escape(norm_diff)}$", "$options": "i"}

    if topic and topic.strip().lower() != "all":
        query["topic"] = {"$regex": f"^{re.escape(topic.strip())}$", "$options": "i"}

    all_matching = []
    if db is not None:
        try:
            cursor = db.practice_questions.find(
                query,
                {
                    "id": 1,
                    "subject": 1,
                    "topic": 1,
                    "difficulty": 1,
                    "type": 1,
                    "question": 1,
                    "code": 1,
                    "options": 1,
                    "_id": 0,
                },
            )
            all_matching = await cursor.to_list(length=200)
        except Exception:
            pass

    if not all_matching:
        all_matching = [
            {
                "id": q["id"],
                "subject": q["subject"],
                "topic": q["topic"],
                "difficulty": q["difficulty"],
                "type": q["type"],
                "question": q["question"],
                "code": q.get("code"),
                "options": q["options"],
            }
            for q in ALL_PRACTICE_QUESTIONS
            if (not query.get("subject") or q["subject"].lower() == norm_sub.lower())
        ]

    random.shuffle(all_matching)
    selected_questions = all_matching[:limit]

    return {
        "session_id": f"session-{random.randint(100000, 999999)}",
        "total_questions": len(selected_questions),
        "subject": subject,
        "difficulty": difficulty,
        "topic": topic,
        "questions": selected_questions,
    }


# ============================================================
# EVALUATE PRACTICE ANSWER
# ============================================================

@router.post("/evaluate")
async def evaluate_practice(
    body: dict,
    current_user: User = Depends(get_user_from_token),
):
    """
    Evaluate the candidate's practice answer.

    The frontend sends:
    - question
    - answer
    - category
    - difficulty

    Category and difficulty are accepted here so the frontend
    keeps the complete practice context.
    """

    # --------------------------------------------------------
    # Read question
    # --------------------------------------------------------

    question = (
        body.get("question") or ""
    ).strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question is required.",
        )

    # --------------------------------------------------------
    # Read answer
    # --------------------------------------------------------

    answer = (
        body.get("answer") or ""
    ).strip()

    if not answer:
        raise HTTPException(
            status_code=400,
            detail="Please provide an answer before evaluating.",
        )

    # --------------------------------------------------------
    # Read category
    # --------------------------------------------------------

    raw_category = body.get(
        "category"
    )

    category = None

    if raw_category:
        category = normalize_category(
            raw_category
        )

        # If category was supplied, make sure it exists.
        if category not in PRACTICE_QUESTIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported practice category: "
                    f"{raw_category}"
                ),
            )

    # --------------------------------------------------------
    # Read difficulty
    # --------------------------------------------------------

    difficulty = normalize_difficulty(
        body.get("difficulty")
    )

    # --------------------------------------------------------
    # Evaluate answer
    # --------------------------------------------------------
    #
    # Keep compatibility with your existing
    # EvaluationAgent.evaluate_answer(question, answer)
    # method.
    #
    # --------------------------------------------------------

    result = evaluator.evaluate_answer(
        question,
        answer,
    )

    # --------------------------------------------------------
    # Make sure result is a dictionary
    # --------------------------------------------------------

    if not isinstance(result, dict):
        result = {
            "score": 0,
            "feedback": str(result),
            "strengths": [],
            "improvements": [],
            "suggested_answer": "",
        }

    # --------------------------------------------------------
    # Normalize response fields
    # --------------------------------------------------------

    return {
        "score": float(
            result.get("score", 0)
        ),

        "feedback": result.get(
            "feedback",
            "",
        ),

        "strengths": (
            result.get("strengths", [])
            if isinstance(
                result.get("strengths", []),
                list,
            )
            else []
        ),

        "improvements": (
            result.get("improvements", [])
            if isinstance(
                result.get("improvements", []),
                list,
            )
            else []
        ),

        "suggested_answer": result.get(
            "suggested_answer",
            "",
        ),

        # Keep context in response
        "category": category,

        "difficulty": difficulty,
    }