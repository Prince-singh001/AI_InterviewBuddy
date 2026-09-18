import { interviewsApi } from "@/services/apiService";
import { useInterviewStore } from "@/store/interviewStore";
import { motion } from "framer-motion";
import { Check, ChevronRight, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ROLES = [
  "Software Engineer",
  "Python Developer",
  "Backend Developer",
  "Full Stack Developer",
  "AIML Engineer",
  "Machine Learning Engineer",
  "Data Scientist",
  "Data Analyst",
  "GenAI Engineer",
  "Custom Role",
];

const TYPES = [
  {
    id: "technical",
    label: "Technical",
    icon: "💻",
    desc: "Coding & tech concepts",
  },
  {
    id: "hr",
    label: "HR",
    icon: "👥",
    desc: "Common HR questions",
  },
  {
    id: "behavioral",
    label: "Behavioral",
    icon: "🎯",
    desc: "STAR-based scenarios",
  },
  {
    id: "ml",
    label: "Machine Learning",
    icon: "🤖",
    desc: "ML/AI fundamentals",
  },
  {
    id: "system-design",
    label: "System Design",
    icon: "🏗️",
    desc: "Architecture & scale",
  },
  {
    id: "genai",
    label: "Generative AI",
    icon: "✨",
    desc: "LLMs, RAG, Agents",
  },
  {
    id: "coding",
    label: "Coding (DSA)",
    icon: "🧮",
    desc: "Data structures & algorithms",
  },
  {
    id: "mixed",
    label: "Mixed",
    icon: "🔀",
    desc: "All types combined",
  },
];

const DIFFICULTIES = [
  {
    id: "beginner",
    label: "Beginner",
    color: "var(--green)",
    desc: "Foundational concepts",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    color: "var(--blue)",
    desc: "Real-world scenarios",
  },
  {
    id: "advanced",
    label: "Advanced",
    color: "var(--orange)",
    desc: "Deep technical depth",
  },
  {
    id: "expert",
    label: "Expert",
    color: "var(--red)",
    desc: "FAANG-level challenge",
  },
];

const DURATIONS = [10, 20, 30, 45];

const QUESTION_COUNTS: Record<number, number> = {
  10: 6,
  20: 10,
  30: 15,
  45: 18,
};

const MODES = [
  {
    id: "text",
    label: "Text",
    icon: "⌨️",
    desc: "Type your answers",
  },
  {
    id: "voice",
    label: "Voice",
    icon: "🎤",
    desc: "Speak your answers",
  },
  {
    id: "video",
    label: "Video",
    icon: "📹",
    desc: "Full video interview",
  },
];

const PERSONALITIES = [
  "Friendly",
  "Professional",
  "Strict",
  "Technical Expert",
  "HR Manager",
  "FAANG Style",
  "Startup Interviewer",
];

type InterviewMode = "text" | "voice" | "video";

interface InterviewConfig {
  role: string;
  type: string;
  difficulty: string;
  duration: number;
  mode: InterviewMode;
  personality: string;
}

interface CreateInterviewResponse {
  id?: unknown;
  _id?: unknown;
  interview_id?: unknown;
}

function getInterviewId(response: unknown): string {
  if (!response || typeof response !== "object") {
    throw new Error("Invalid response received from the interview service.");
  }

  const data = response as CreateInterviewResponse;

  /*
   * Support the normal backend response:
   * { id: "..." }
   *
   * Also support:
   * { _id: "..." }
   * { interview_id: "..." }
   *
   * This is defensive and does not create a fake ID.
   */
  const candidates = [data.id, data._id, data.interview_id];

  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const value = candidate.trim();

      if (value.length > 0) {
        return value;
      }
    }

    /*
     * Some serializers can return an object for Mongo/Pydantic IDs.
     */
    if (candidate && typeof candidate === "object") {
      const possibleId = candidate as {
        $oid?: unknown;
        oid?: unknown;
      };

      const value = possibleId.$oid ?? possibleId.oid;

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }

  console.error("Interview creation returned no usable ID:", response);

  throw new Error(
    "Interview was created, but the backend did not return a valid interview ID.",
  );
}

export default function InterviewSetup() {
  const navigate = useNavigate();
  const { startInterview } = useInterviewStore();

  const [loading, setLoading] = useState(false);

  const [config, setConfig] = useState<InterviewConfig>({
    role: "AIML Engineer",
    type: "mixed",
    difficulty: "intermediate",
    duration: 30,
    mode: "text",
    personality: "Professional",
  });

  const set = (key: keyof InterviewConfig) => (value: string | number) => {
    setConfig((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const selectedQuestionCount = QUESTION_COUNTS[config.duration] ?? 6;

  const handleStart = async () => {
    if (loading) {
      return;
    }

    setLoading(true);

    const typeName =
      TYPES.find((item) => item.id === config.type)?.label ?? config.type;

    try {
      /*
       * -------------------------------------------------------
       * CREATE INTERVIEW
       * -------------------------------------------------------
       *
       * The backend creates the interview and returns the
       * database ID.
       */
      const response = await interviewsApi.create({
        role: config.role,
        interview_type: config.type,
        difficulty: config.difficulty,
        duration_minutes: config.duration,
        mode: config.mode,
        personality: config.personality,
      });

      /*
       * -------------------------------------------------------
       * GET REAL BACKEND ID
       * -------------------------------------------------------
       */
      const interviewId = getInterviewId(response);

      console.log("[InterviewSetup] Created interview:", interviewId);

      /*
       * -------------------------------------------------------
       * STORE ACTIVE INTERVIEW ID
       * -------------------------------------------------------
       *
       * InterviewRoom can recover this if router state is lost.
       */
      try {
        sessionStorage.setItem("active_interview_id", interviewId);
      } catch (storageError) {
        console.warn(
          "[InterviewSetup] sessionStorage unavailable:",
          storageError,
        );
      }

      /*
       * -------------------------------------------------------
       * STORE INTERVIEW CONFIG
       * -------------------------------------------------------
       */
      startInterview({
        role: config.role,
        type: typeName,
        difficulty: config.difficulty,
        duration: config.duration,
        mode: config.mode,
        personality: config.personality,
      });

      /*
       * -------------------------------------------------------
       * NAVIGATE
       * -------------------------------------------------------
       *
       * encodeURIComponent prevents special characters from
       * corrupting the URL.
       */
      const roomPath = `/interview/room/${encodeURIComponent(interviewId)}`;

      console.log("[InterviewSetup] Navigating to:", roomPath);

      toast.success("Interview created successfully. Starting interview... 🎯");

      navigate(roomPath, {
        state: {
          interviewId,
          duration: config.duration,
          role: config.role,
          type: typeName,
          difficulty: config.difficulty,
          mode: config.mode,
          personality: config.personality,
        },
      });
    } catch (error) {
      console.error("[InterviewSetup] Failed to start interview:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create interview. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        style={{
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "var(--radius-md)",
              background: "rgba(99,102,241,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap
              size={22}
              style={{
                color: "var(--blue-light)",
              }}
            />
          </div>

          <div>
            <h1
              style={{
                fontSize: "1.625rem",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Setup Your Interview
            </h1>

            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              Customize your AI-powered interview experience
            </p>
          </div>
        </div>
      </motion.div>

      {/* Role */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card"
        style={{
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          1. Select Role
        </h2>

        <select
          value={config.role}
          onChange={(event) => set("role")(event.target.value)}
          className="input"
          style={{
            width: "100%",
          }}
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Interview Type */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
        }}
        className="card"
        style={{
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          2. Interview Type
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {TYPES.map((item) => {
            const selected = config.type === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => set("type")(item.id)}
                style={{
                  textAlign: "left",
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: selected
                    ? "1px solid var(--blue)"
                    : "1px solid var(--border)",
                  background: selected
                    ? "rgba(99,102,241,0.10)"
                    : "var(--bg-elevated)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.25rem",
                    }}
                  >
                    {item.icon}
                  </span>

                  {selected && (
                    <Check
                      size={16}
                      style={{
                        color: "var(--blue-light)",
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.875rem",
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="card"
        style={{
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          3. Difficulty
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {DIFFICULTIES.map((item) => {
            const selected = config.difficulty === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => set("difficulty")(item.id)}
                style={{
                  textAlign: "left",
                  padding: "0.875rem 1rem",
                  borderRadius: "var(--radius-md)",
                  border: selected
                    ? `1px solid ${item.color}`
                    : "1px solid var(--border)",
                  background: selected ? "var(--bg-elevated)" : "transparent",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {item.label}
                  </span>

                  {selected && (
                    <Check
                      size={16}
                      style={{
                        color: item.color,
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Duration */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.15,
        }}
        className="card"
        style={{
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          4. Interview Duration
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {DURATIONS.map((duration) => {
            const selected = config.duration === duration;

            const questions = QUESTION_COUNTS[duration];

            return (
              <button
                key={duration}
                type="button"
                onClick={() => set("duration")(duration)}
                style={{
                  padding: "1rem",
                  borderRadius: "var(--radius-md)",
                  border: selected
                    ? "1px solid var(--blue)"
                    : "1px solid var(--border)",
                  background: selected
                    ? "rgba(99,102,241,0.10)"
                    : "var(--bg-elevated)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 800,
                  }}
                >
                  {duration} min
                </div>

                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {questions} questions
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Mode */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
        className="card"
        style={{
          marginBottom: "1.25rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          5. Interview Mode
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {MODES.map((item) => {
            const selected = config.mode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => set("mode")(item.id as InterviewMode)}
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  borderRadius: "var(--radius-md)",
                  border: selected
                    ? "1px solid var(--blue)"
                    : "1px solid var(--border)",
                  background: selected
                    ? "rgba(99,102,241,0.10)"
                    : "var(--bg-elevated)",
                  cursor: "pointer",
                  color: "var(--text-primary)",
                }}
              >
                <div
                  style={{
                    fontSize: "1.25rem",
                  }}
                >
                  {item.icon}
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    marginTop: "0.5rem",
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: "0.75rem",
                    marginTop: "0.25rem",
                  }}
                >
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Personality */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.25,
        }}
        className="card"
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          6. Interviewer Personality
        </h2>

        <select
          value={config.personality}
          onChange={(event) => set("personality")(event.target.value)}
          className="input"
          style={{
            width: "100%",
          }}
        >
          {PERSONALITIES.map((personality) => (
            <option key={personality} value={personality}>
              {personality}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.3,
        }}
        className="card"
        style={{
          marginBottom: "1.5rem",
          background: "rgba(99,102,241,0.05)",
          borderColor: "rgba(99,102,241,0.15)",
        }}
      >
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Interview Summary
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
              }}
            >
              Role
            </div>

            <div
              style={{
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {config.role}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
              }}
            >
              Type
            </div>

            <div
              style={{
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {typeName(config.type)}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
              }}
            >
              Difficulty
            </div>

            <div
              style={{
                fontWeight: 700,
                marginTop: "0.25rem",
                textTransform: "capitalize",
              }}
            >
              {config.difficulty}
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
              }}
            >
              Duration
            </div>

            <div
              style={{
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {config.duration} minutes
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
              }}
            >
              Questions
            </div>

            <div
              style={{
                fontWeight: 700,
                marginTop: "0.25rem",
              }}
            >
              {selectedQuestionCount}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Start */}
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.35,
        }}
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="btn btn-primary btn-lg"
          style={{
            gap: "0.5rem",
            minWidth: 190,
            justifyContent: "center",
          }}
        >
          {loading ? (
            <>
              <Loader2
                size={18}
                style={{
                  animation: "spin 1s linear infinite",
                }}
              />
              Creating...
            </>
          ) : (
            <>
              Start Interview
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </motion.div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function typeName(type: string) {
  return TYPES.find((item) => item.id === type)?.label ?? type;
}
