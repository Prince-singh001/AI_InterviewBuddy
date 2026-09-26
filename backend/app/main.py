"""
AI InterviewBuddy
FastAPI application entry point.
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

        upload_path.mkdir(
            parents=True,
            exist_ok=True,
        )

        print(
            f"Upload directory: {upload_path.resolve()}"
        )

    except Exception as e:
        print(
            f"Upload directory warning: {e}"
        )

    # ------------------------------------------------------------------------
    # Startup information
    # ------------------------------------------------------------------------

    print(
        f"Demo Mode: {settings.DEMO_MODE}"
    )

    print(
        "AI Provider: Gemini"
    )

    print(
        "Backend started successfully."
    )

    print(
        "=" * 60 + "\n"
    )

    yield

    # ------------------------------------------------------------------------
    # Shutdown
    # ------------------------------------------------------------------------

    print(
        "\nShutting down Interviewer Buddy AI backend..."
    )

    try:

        await close_db()

        print(
            "Database connection closed."
        )

    except Exception as e:

        print(
            f"Database shutdown warning: {e}"
        )

    print(
        "Backend stopped."
    )


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

    # Swagger
    docs_url="/api/docs",

    # ReDoc
    redoc_url="/api/redoc",

    # Application lifecycle
    lifespan=lifespan,
)


# ============================================================================
# CORS
# ============================================================================
#
# Local development:
#
#   http://localhost:5173
#   http://127.0.0.1:5173
#   http://localhost:3000
#   http://127.0.0.1:3000
#
# The regex additionally allows any localhost / 127.0.0.1 port.
#
# This prevents errors such as:
#
#   OPTIONS /api/dashboard HTTP/1.1" 400 Bad Request
#
# ============================================================================

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


# ---------------------------------------------------------------------------
# Production frontend
# ---------------------------------------------------------------------------

if settings.FRONTEND_URL:

    frontend_url = (
        settings.FRONTEND_URL
        .strip()
        .rstrip("/")
    )

    if (
        frontend_url
        and frontend_url not in allowed_origins
    ):

        allowed_origins.append(
            frontend_url
        )


# ---------------------------------------------------------------------------
# Display allowed origins
# ---------------------------------------------------------------------------

print(
    "Allowed CORS origins:"
)

for origin in allowed_origins:

    print(
        f"  - {origin}"
    )


# ---------------------------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,

    # Explicitly allowed origins
    allow_origins=allowed_origins,

    # Allow local development on any port.
    #
    # Examples:
    #
    # http://localhost:5173
    # http://localhost:5174
    # http://localhost:5175
    # http://localhost:3000
    #
    # http://127.0.0.1:5173
    # http://127.0.0.1:5174
    #
    allow_origin_regex=(
        r"^https?://"
        r"(localhost|127\.0\.0\.1)"
        r"(:\d+)?$"
    ),

    # Required for authenticated requests.
    allow_credentials=True,

    # Allow all HTTP methods.
    allow_methods=["*"],

    # Allow Authorization, Content-Type, etc.
    allow_headers=["*"],
)


# ============================================================================
# STATIC FILES
# ============================================================================

upload_directory = Path(
    settings.UPLOAD_DIR
)

upload_directory.mkdir(
    parents=True,
    exist_ok=True,
)

app.mount(
    "/uploads",

    StaticFiles(
        directory=str(
            upload_directory
        )
    ),

    name="uploads",
)


# ============================================================================
# API ROUTERS
# ============================================================================
#
# Route files already contain their /api/... prefixes.
#
# Therefore DO NOT add another prefix here.
#
# Example:
#
# router endpoint:
#     /api/auth/login
#
# include_router:
#     app.include_router(auth_router)
#
# Final endpoint:
#     /api/auth/login
#
# ============================================================================

app.include_router(
    auth_router
)

app.include_router(
    interview_router
)

app.include_router(
    resume_router
)

app.include_router(
    jobs_router
)

app.include_router(
    dashboard_router
)

app.include_router(
    practice_router
)

app.include_router(
    rag_router
)


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
        "health": "/api/health",
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

        self.active_connections: dict[
            str,
            WebSocket
        ] = {}

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

        websocket = (
            self.active_connections.get(
                interview_id
            )
        )

        if websocket:

            await websocket.send_json(
                data
            )


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

        # --------------------------------------------------------------------
        # Import agents lazily
        # --------------------------------------------------------------------
        #
        # This prevents AI agent initialization during application startup.
        #
        # --------------------------------------------------------------------

        from app.agents.interview_manager import (
            InterviewManagerAgent,
            EvaluationAgent,
        )

        interview_manager = (
            InterviewManagerAgent()
        )

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

            data = (
                await websocket.receive_json()
            )

            msg_type = data.get(
                "type"
            )

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
                    data.get(
                        "answer",
                        ""
                    )
                    .strip()
                )

                question_text = (
                    data.get(
                        "question",
                        ""
                    )
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

                    eval_result = (
                        evaluator.evaluate_answer(
                            question_text,
                            answer_text,
                        )
                    )

                    # Support async implementations
                    if hasattr(
                        eval_result,
                        "__await__",
                    ):

                        eval_result = (
                            await eval_result
                        )

                except Exception as e:

                    print(
                        f"Answer evaluation error: {e}"
                    )

                    eval_result = {
                        "score": 0,

                        "feedback": (
                            "Evaluation failed: "
                            f"{str(e)}"
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
                            "type": (
                                "interview_complete"
                            ),

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
                        interview_manager
                        .get_next_question(
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

                    # Support async implementations
                    if hasattr(
                        next_question,
                        "__await__",
                    ):

                        next_question = (
                            await next_question
                        )

                except Exception as e:

                    print(
                        "Next question generation "
                        f"error: {e}"
                    )

                    await websocket.send_json(
                        {
                            "type": "error",

                            "message": (
                                "Unable to generate "
                                "next question: "
                                f"{str(e)}"
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

                topic = (
                    next_question.get(
                        "topic"
                    )
                )

                if (
                    topic
                    and topic not in asked_topics
                ):

                    asked_topics.append(
                        topic
                    )

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
                        f"Unknown message type: "
                        f"{msg_type}"
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

        print(
            "WebSocket disconnected: "
            f"{interview_id}"
        )

    # =========================================================================
    # OTHER ERROR
    # =========================================================================

    except Exception as e:

        manager.disconnect(
            interview_id
        )

        print(
            f"WebSocket error "
            f"[{interview_id}]: {e}"
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
