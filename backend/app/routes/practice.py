import random

from fastapi import APIRouter, Depends, HTTPException

from app.models.user import User
from app.routes.auth import get_user_from_token
from app.agents.interview_manager import EvaluationAgent


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
        "beginner": "Beginner",
        "easy": "Beginner",

        "intermediate": "Intermediate",
        "medium": "Intermediate",

        "advanced": "Advanced",
        "hard": "Advanced",
    }

    if normalized not in difficulty_map:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid difficulty. "
                "Choose Beginner, Intermediate, or Advanced."
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
):
    """
    Generate a practice question for the selected category.

    IMPORTANT:
    The selected category is strictly enforced.

    We NEVER fall back to Machine Learning.
    """

    # --------------------------------------------------------
    # Read category
    # --------------------------------------------------------

    raw_category = body.get("category")

    category = normalize_category(
        raw_category
    )

    # --------------------------------------------------------
    # Validate category
    # --------------------------------------------------------

    if category not in PRACTICE_QUESTIONS:

        available_categories = ", ".join(
            PRACTICE_QUESTIONS.keys()
        )

        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported practice category: "
                f"{raw_category}. "
                f"Available categories: "
                f"{available_categories}"
            ),
        )

    # --------------------------------------------------------
    # Read difficulty
    # --------------------------------------------------------

    difficulty = normalize_difficulty(
        body.get("difficulty")
    )

    # --------------------------------------------------------
    # Get category-specific questions
    # --------------------------------------------------------

    questions = PRACTICE_QUESTIONS[category]

    if not questions:
        raise HTTPException(
            status_code=500,
            detail=(
                f"No practice questions available "
                f"for category '{category}'."
            ),
        )

    # --------------------------------------------------------
    # Select random question
    # --------------------------------------------------------

    question = random.choice(
        questions
    )

    # --------------------------------------------------------
    # Return response
    # --------------------------------------------------------

    return {
        "id": (
            f"{category}-"
            f"{random.randint(1000, 9999)}"
        ),

        "question": question,

        "category": category,

        "difficulty": difficulty,

        "time_limit": 120,
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