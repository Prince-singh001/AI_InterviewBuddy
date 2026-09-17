"""
INTERVIEWER BUDDY AI BACKEND
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, close_db

# ============================================================================
# ROUTERS
# ============================================================================

from app.routes.auth import router as auth_router
from app.routes.interviews import router as interview_router
from app.routes.resume import router as resume_router
from app.routes.jobs import router as jobs_router
from app.routes.dashboard import router as dashboard_router
from app.routes.practice import router as practice_router
from app.routes.rag import router as rag_router


# ============================================================================
# APPLICATION LIFESPAN
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifecycle.
    """

    print("\n" + "=" * 60)
    print("Starting AI Interview Buddy backend...")
    print("=" * 60)

    # ------------------------------------------------------------------------
    # Database
    # ------------------------------------------------------------------------

    try:
        await init_db()
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Database initialization warning: {e}")

    # ------------------------------------------------------------------------
    # Upload directory
    # ------------------------------------------------------------------------

    try:
        upload_path = Path(settings.UPLOAD_DIR)
        upload_path.mkdir(parents=True, exist_ok=True)

        print(
            f"Upload directory: {upload_path.resolve()}"
        )

    except Exception as e:
        print(f"Upload directory warning: {e}")

    # ------------------------------------------------------------------------
    # Startup information
    # ------------------------------------------------------------------------

    print(f"Demo Mode: {settings.DEMO_MODE}")
    print("AI Provider: Gemini")
    print("Backend started successfully.")
    print("=" * 60 + "\n")

    yield

    # ------------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------------

    print("\nShutting down Interviewer Buddy AI backend...")

    try:
        await close_db()
        print("Database connection closed.")
    except Exception as e:
        print(f"Database shutdown warning: {e}")

    print("Backend stopped.")


# ============================================================================
# FASTAPI APPLICATION
# ============================================================================

app = FastAPI(
    title="Interviewer Buddy AI API",
    description=(
        "AI-powered interview preparation platform with "
        "Agentic AI, RAG, adaptive interviewing and analytics."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)


# ============================================================================
# CORS
# ============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,

        # Vite
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Alternative frontend ports
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# STATIC FILES
# ============================================================================

upload_directory = Path(settings.UPLOAD_DIR)
upload_directory.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(
        directory=str(upload_directory)
    ),
    name="uploads",
)


# ============================================================================
# API ROUTERS
#
# IMPORTANT:
# Do NOT add prefixes here because your route files already define
# their own /api/... paths.
# ============================================================================

app.include_router(auth_router)
app.include_router(interview_router)
app.include_router(resume_router)
app.include_router(jobs_router)
app.include_router(dashboard_router)
app.include_router(practice_router)
app.include_router(rag_router)


# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get(
    "/",
    tags=["System"],
)
async def root():
    """
    Root endpoint.
    """

    return {
        "service": "Interviewer Buddy AI",
        "status": "running",
        "version": "1.0.0",
        "docs": "/api/docs",
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get(
    "/api/health",
    tags=["System"],
)
async def health():
    """
    Health check endpoint.
    """

    return {
        "status": "ok",
        "service": "Interviewer Buddy AI",
        "demo_mode": settings.DEMO_MODE,
        "ai_provider": "Gemini",
    }


# ============================================================================
# WEBSOCKET CONNECTION MANAGER
# ============================================================================

class ConnectionManager:
    """
    Manages active WebSocket interview connections.
    """

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(
        self,
        interview_id: str,
        websocket: WebSocket,
    ):
        """
        Accept and register a WebSocket connection.
        """

        await websocket.accept()

        self.active_connections[
            interview_id
        ] = websocket

    def disconnect(
        self,
        interview_id: str,
    ):
        """
        Remove a WebSocket connection.
        """

        self.active_connections.pop(
            interview_id,
            None,
        )

    async def send(
        self,
        interview_id: str,
        data: dict,
    ):
        """
        Send JSON data to a connected interview.
        """

        websocket = self.active_connections.get(
            interview_id
        )

        if websocket:
            await websocket.send_json(data)


manager = ConnectionManager()


# ============================================================================
# WEBSOCKET — LIVE INTERVIEW
# ============================================================================

@app.websocket(
    "/ws/interview/{interview_id}"
)
async def interview_websocket(
    websocket: WebSocket,
    interview_id: str,
):
    """
    WebSocket endpoint for live interviews.

    Flow:

        User Answer
             ↓
        AI Evaluation
             ↓
        Next Question
             ↓
        Interview Complete
    """

    await manager.connect(
        interview_id,
        websocket,
    )

    try:

        # Import agents only when WebSocket connection starts
        from app.agents.interview_manager import (
            InterviewManagerAgent,
            EvaluationAgent,
        )

        interview_manager = InterviewManagerAgent()
        evaluator = EvaluationAgent()

        question_count = 0
        asked_topics: list[str] = []

        # --------------------------------------------------------------------
        # Connection message
        # --------------------------------------------------------------------

        await websocket.send_json(
            {
                "type": "connected",
                "message": (
                    "Interview session started. "
                    "Ready for your first question."
                ),
                "interview_id": interview_id,
            }
        )

        # --------------------------------------------------------------------
        # WebSocket loop
        # --------------------------------------------------------------------

        while True:

            data = await websocket.receive_json()

            msg_type = data.get("type")

            # =================================================================
            # PING
            # =================================================================

            if msg_type == "ping":

                await websocket.send_json(
                    {
                        "type": "pong",
                    }
                )

                continue

            # =================================================================
            # ANSWER
            # =================================================================

            if msg_type == "answer":

                answer_text = (
                    data.get("answer", "")
                    .strip()
                )

                question_text = (
                    data.get("question", "")
                    .strip()
                )

                # -------------------------------------------------------------
                # Empty answer
                # -------------------------------------------------------------

                if not answer_text:

                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Answer cannot be empty."
                            ),
                        }
                    )

                    continue

                # -------------------------------------------------------------
                # AI thinking state
                # -------------------------------------------------------------

                await websocket.send_json(
                    {
                        "type": "ai_state",
                        "state": "thinking",
                    }
                )

                # -------------------------------------------------------------
                # Evaluate answer
                # -------------------------------------------------------------

                try:

                    eval_result = evaluator.evaluate_answer(
                        question_text,
                        answer_text,
                    )

                    # Support async implementations
                    if hasattr(
                        eval_result,
                        "__await__",
                    ):
                        eval_result = await eval_result

                except Exception as e:

                    eval_result = {
                        "score": 0,
                        "feedback": (
                            f"Evaluation failed: {str(e)}"
                        ),
                    }

                # -------------------------------------------------------------
                # Ensure dictionary
                # -------------------------------------------------------------

                if not isinstance(
                    eval_result,
                    dict,
                ):

                    eval_result = {
                        "score": 0,
                        "feedback": str(
                            eval_result
                        ),
                    }

                # -------------------------------------------------------------
                # Send evaluation
                # -------------------------------------------------------------

                await websocket.send_json(
                    {
                        "type": "evaluation",
                        "result": eval_result,
                    }
                )

                # -------------------------------------------------------------
                # Increase question count
                # -------------------------------------------------------------

                question_count += 1

                max_questions = getattr(
                    interview_manager,
                    "max_questions",
                    10,
                )

                # =============================================================
                # INTERVIEW COMPLETE
                # =============================================================

                if (
                    question_count
                    >= max_questions
                ):

                    await websocket.send_json(
                        {
                            "type": "interview_complete",
                            "message": (
                                "Interview complete!"
                            ),
                            "total_questions": (
                                question_count
                            ),
                        }
                    )

                    break

                # =============================================================
                # GENERATE NEXT QUESTION
                # =============================================================

                try:

                    next_question = (
                        interview_manager.get_next_question(
                            data.get(
                                "interview_type",
                                "Technical",
                            ),
                            data.get(
                                "role",
                                "Software Engineer",
                            ),
                            data.get(
                                "difficulty",
                                "Intermediate",
                            ),
                            asked_topics,
                            eval_result.get(
                                "score"
                            ),
                            question_count + 1,
                        )
                    )

                    # Support async implementation
                    if hasattr(
                        next_question,
                        "__await__",
                    ):
                        next_question = (
                            await next_question
                        )

                except Exception as e:

                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": (
                                "Unable to generate "
                                f"next question: {str(e)}"
                            ),
                        }
                    )

                    continue

                # -------------------------------------------------------------
                # Validate next question
                # -------------------------------------------------------------

                if not isinstance(
                    next_question,
                    dict,
                ):

                    next_question = {
                        "question": str(
                            next_question
                        )
                    }

                # -------------------------------------------------------------
                # Track topic
                # -------------------------------------------------------------

                topic = next_question.get(
                    "topic"
                )

                if (
                    topic
                    and topic not in asked_topics
                ):
                    asked_topics.append(topic)

                # -------------------------------------------------------------
                # AI speaking state
                # -------------------------------------------------------------

                await websocket.send_json(
                    {
                        "type": "ai_state",
                        "state": "speaking",
                    }
                )

                # -------------------------------------------------------------
                # Send next question
                # -------------------------------------------------------------

                await websocket.send_json(
                    {
                        "type": "next_question",
                        "question": next_question,
                    }
                )

                continue

            # =================================================================
            # UNKNOWN MESSAGE
            # =================================================================

            await websocket.send_json(
                {
                    "type": "error",
                    "message": (
                        f"Unknown message type: {msg_type}"
                    ),
                }
            )

    # =========================================================================
    # DISCONNECT
    # =========================================================================

    except WebSocketDisconnect:

        manager.disconnect(
            interview_id
        )

    # =========================================================================
    # OTHER ERROR
    # =========================================================================

    except Exception as e:

        manager.disconnect(
            interview_id
        )

        try:

            await websocket.send_json(
                {
                    "type": "error",
                    "message": str(e),
                }
            )

        except Exception:
            pass


# ============================================================================
# END OF MAIN.PY
# ============================================================================