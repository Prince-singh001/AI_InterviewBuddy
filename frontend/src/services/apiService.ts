/*
 * ======================
 * Interviewer Buddy AI
 * =======================
 */


/* ====================
 * API BASE URL
 * ====================
 */

const PRODUCTION_API_URL =
  "https://ai-interviewbuddy.onrender.com/api";

const LOCAL_API_URL =
  "http://127.0.0.1:8000/api";

const ENV_API_URL =
  import.meta.env.VITE_API_URL?.trim();

const BASE = (
  ENV_API_URL ||
  (import.meta.env.PROD
    ? PRODUCTION_API_URL
    : LOCAL_API_URL)
).replace(/\/+$/, "");


/* ============================================================
 * DEBUG API URL
 * ============================================================
 */

if (import.meta.env.DEV) {
  console.log("API Base URL:", BASE);
}


/* ============================================================
 * AUTH STORAGE
 * ============================================================
 */

function getAuthState(): any | null {
  try {
    const raw = localStorage.getItem("ib-auth");

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}


/* ============================================================
 * ACCESS TOKEN
 * ============================================================
 */

function getToken(): string | null {
  const auth = getAuthState();

  return auth?.state?.token ?? null;
}


/* ============================================================
 * REFRESH TOKEN
 * ============================================================
 */

function getRefreshToken(): string | null {
  const auth = getAuthState();

  return (
    auth?.state?.refreshToken ??
    auth?.state?.refresh_token ??
    null
  );
}


/* ============================================================
 * SAVE NEW TOKENS
 * ============================================================
 */

function saveTokens(
  accessToken: string,
  refreshToken: string,
): void {
  try {
    const raw = localStorage.getItem("ib-auth");

    if (!raw) {
      return;
    }

    const auth = JSON.parse(raw);

    if (!auth.state) {
      auth.state = {};
    }

    auth.state.token = accessToken;
    auth.state.refreshToken = refreshToken;

    // Backward compatibility
    auth.state.refresh_token = refreshToken;

    localStorage.setItem(
      "ib-auth",
      JSON.stringify(auth),
    );
  } catch (error) {
    console.error(
      "Failed to save refreshed tokens:",
      error,
    );
  }
}


/* ============================================================
 * CLEAR AUTH
 * ============================================================
 */

function clearAuth(): void {
  try {
    localStorage.removeItem("ib-auth");
  } catch {
    // Ignore storage errors
  }
}


/* ============================================================
 * AUTH HEADERS
 * ============================================================
 */

function authHeaders(): Record<string, string> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}


/* ============================================================
 * REFRESH STATE
 * ============================================================
 *
 * Prevent multiple simultaneous refresh requests.
 * ============================================================
 */

let refreshPromise: Promise<string | null> | null = null;


/* ============================================================
 * REFRESH ACCESS TOKEN
 * ============================================================
 */

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        return null;
      }

      const response = await fetch(
        `${BASE}/auth/refresh?refresh_token=${encodeURIComponent(
          refreshToken,
        )}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        clearAuth();
        return null;
      }

      const data = await response.json();

      if (
        !data?.access_token ||
        !data?.refresh_token
      ) {
        clearAuth();
        return null;
      }

      saveTokens(
        data.access_token,
        data.refresh_token,
      );

      return data.access_token;
    } catch (error) {
      console.error(
        "Token refresh failed:",
        error,
      );

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}


/* ============================================================
 * JWT EXPIRATION
 * ============================================================
 */

function getTokenExpiration(
  token: string | null,
): number | null {
  if (!token) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const paddedBase64 =
      base64 +
      "=".repeat(
        (4 - (base64.length % 4)) % 4,
      );

    const payload = JSON.parse(
      atob(paddedBase64),
    );

    if (!payload.exp) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}


/* ============================================================
 * ENSURE VALID ACCESS TOKEN
 * ============================================================
 *
 * Refresh the access token approximately two minutes
 * before expiration.
 * ============================================================
 */

async function ensureValidToken(): Promise<string | null> {
  const token = getToken();

  if (!token) {
    return null;
  }

  const expiration =
    getTokenExpiration(token);

  /*
   * If the token cannot be decoded,
   * keep using the existing token.
   */
  if (!expiration) {
    return token;
  }

  const now = Date.now();

  const refreshBefore =
    2 * 60 * 1000;

  if (
    expiration - now <=
    refreshBefore
  ) {
    const newToken =
      await refreshAccessToken();

    return newToken ?? token;
  }

  return token;
}


/* ============================================================
 * GENERIC REQUEST
 * ============================================================
 */

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true,
): Promise<T> {

  /*
   * Make sure the access token is valid
   * before making the request.
   */
  await ensureValidToken();


  /* ----------------------------------------------------------
   * FIRST REQUEST
   * ----------------------------------------------------------
   */

  let res: Response;

  try {
    res = await fetch(
      `${BASE}${path}`,
      {
        method,
        headers: authHeaders(),
        body:
          body !== undefined
            ? JSON.stringify(body)
            : undefined,
      },
    );
  } catch (error) {
    console.error(
      "API request failed:",
      {
        url: `${BASE}${path}`,
        error,
      },
    );

    throw new Error(
      "Unable to connect to the server. Please check your internet connection or try again.",
    );
  }


  /* ==========================================================
   * TOKEN EXPIRED
   *
   * 401 → REFRESH → RETRY
   * ==========================================================
   */

  if (
    res.status === 401 &&
    retry
  ) {
    const newToken =
      await refreshAccessToken();

    if (newToken) {
      try {
        res = await fetch(
          `${BASE}${path}`,
          {
            method,
            headers: authHeaders(),
            body:
              body !== undefined
                ? JSON.stringify(body)
                : undefined,
          },
        );
      } catch (error) {
        console.error(
          "Retry request failed:",
          error,
        );

        throw new Error(
          "Unable to connect to the server. Please try again.",
        );
      }
    } else {
      clearAuth();

      throw new Error(
        "Session expired. Please login again.",
      );
    }
  }


  /* ==========================================================
   * OTHER HTTP ERRORS
   * ==========================================================
   */

  if (!res.ok) {
    let message =
      `HTTP ${res.status}`;

    try {
      const data = await res.json();

      if (
        typeof data?.detail === "string"
      ) {
        message = data.detail;
      } else if (
        Array.isArray(data?.detail)
      ) {
        message = data.detail
          .map(
            (item: any) =>
              item?.msg ??
              "Validation error",
          )
          .join(", ");
      }
    } catch {
      // Ignore JSON parsing errors
    }

    throw new Error(message);
  }


  /* ==========================================================
   * EMPTY RESPONSE
   * ==========================================================
   */

  if (res.status === 204) {
    return undefined as T;
  }


  /* ==========================================================
   * JSON RESPONSE
   * ==========================================================
   */

  return res.json() as Promise<T>;
}


/* ============================================================
 * AUTH TYPES
 * ============================================================
 */

export interface UserResponse {
  id: string;
  email: string;
  name: string;

  college?: string;
  target_role?: string;
  experience?: string;

  skills: string[];

  github?: string;
  linkedin?: string;
  portfolio?: string;

  profile_complete: boolean;
}


/* ============================================================
 * OTP RESPONSE
 * ============================================================
 */

export interface OTPResponse {
  message: string;
  email: string;
}


/* ============================================================
 * TOKEN RESPONSE
 * ============================================================
 */

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserResponse;
}


/* ============================================================
 * AUTH API
 * ============================================================
 */

export const authApi = {

  /* ----------------------------------------------------------
   * SIGNUP
   * ----------------------------------------------------------
   */

  register: (
    name: string,
    email: string,
    password: string,
  ) =>
    request<OTPResponse>(
      "POST",
      "/auth/register",
      {
        name,
        email,
        password,
      },
    ),


  /* ----------------------------------------------------------
   * VERIFY SIGNUP OTP
   * ----------------------------------------------------------
   */

  verifySignupOTP: (
    email: string,
    otp: string,
  ) =>
    request<TokenResponse>(
      "POST",
      "/auth/verify-signup-otp",
      {
        email,
        otp,
      },
    ),


  /* ----------------------------------------------------------
   * RESEND SIGNUP OTP
   * ----------------------------------------------------------
   */

  resendSignupOTP: (
    email: string,
  ) =>
    request<OTPResponse>(
      "POST",
      "/auth/resend-signup-otp",
      {
        email,
      },
    ),


  /* ----------------------------------------------------------
   * OLD COMPONENT COMPATIBILITY
   * ----------------------------------------------------------
   */

  resendOTP: (
    email: string,
  ) =>
    request<OTPResponse>(
      "POST",
      "/auth/resend-signup-otp",
      {
        email,
      },
    ),


  /* ----------------------------------------------------------
   * LOGIN
   * ----------------------------------------------------------
   */

  login: (
    email: string,
    password: string,
  ) =>
    request<TokenResponse>(
      "POST",
      "/auth/login",
      {
        email,
        password,
      },
    ),


  /* ----------------------------------------------------------
   * CURRENT USER
   * ----------------------------------------------------------
   */

  me: () =>
    request<UserResponse>(
      "GET",
      "/auth/me",
    ),


  /* ----------------------------------------------------------
   * UPDATE PROFILE
   * ----------------------------------------------------------
   */

  updateProfile: (
    data: Partial<UserResponse>,
  ) =>
    request<UserResponse>(
      "PUT",
      "/auth/profile",
      data,
    ),
};


/* ============================================================
 * DASHBOARD
 * ============================================================
 */

export interface DashboardStats {
  overall_score: number;
  interviews_completed: number;
  average_score: number;
  best_score: number;

  current_streak: number;
  questions_answered: number;
  practice_hours: number;

  recent_interviews: RecentInterview[];
  weekly_performance: WeeklyPerf[];
}


export interface RecentInterview {
  id: string;
  role: string;
  type: string;
  difficulty: string;
  status: string;

  score: number | null;

  duration: string;
  date: string | null;
}


export interface WeeklyPerf {
  week: string;
  score: number;
  interviews: number;
}


export const dashboardApi = {

  get: () =>
    request<DashboardStats>(
      "GET",
      "/dashboard",
    ),
};


/* ============================================================
 * INTERVIEWS
 * ============================================================
 */

export interface InterviewListItem {
  id: string;
  role: string;
  type: string;
  status: string;

  score: number | null;

  created_at: string;
}


export interface CreateInterviewResponse {
  id: string;

  interview_type: string;
  role: string;
  difficulty: string;

  duration_minutes: number;
  total_questions: number;

  status: string;
}


export interface InterviewQuestionResponse {
  question_id: string;

  question: string;
  question_type: string;
  difficulty: string;

  topic: string | null;

  question_number: number;
  total_questions: number;

  is_last: boolean;
}


export interface AnswerEvaluation {
  score: number;

  feedback: string;

  strengths: string[];

  improvements: string[];

  suggested_answer: string;
}


export interface SubmitAnswerResponse {
  question_id: string;

  score: number;

  evaluation: AnswerEvaluation;

  question_number: number;
  total_questions: number;

  is_last: boolean;
}


export interface CommunicationMetrics {
  speaking_speed: number;
  filler_words: number;
  avg_pause: number;

  clarity: number;
  vocabulary: number;
  answer_structure: number;
}


export interface StarScores {
  overall: number;

  situation: number;
  task: number;
  action: number;
  result: number;
}


export interface FinalInterviewReport {
  overall: number;

  technical: number;
  communication: number;
  confidence: number;
  clarity: number;
  problem_solving: number;
  behavioral: number;

  strengths: string[];
  improvements: string[];
  recommendations: string[];

  communication_metrics: CommunicationMetrics;

  star_scores: StarScores;
}


export interface CompleteInterviewResponse {
  id: string;

  status: string;

  total_questions: number;
  answered_questions: number;

  report: FinalInterviewReport | null;
}


export const interviewsApi = {

  /* ----------------------------------------------------------
   * LIST INTERVIEWS
   * ----------------------------------------------------------
   */

  list: () =>
    request<InterviewListItem[]>(
      "GET",
      "/interviews",
    ),


  /* ----------------------------------------------------------
   * CREATE INTERVIEW
   * ----------------------------------------------------------
   */

  create: (data: {
    role: string;
    interview_type: string;
    difficulty: string;
    duration_minutes: number;
    mode: string;
    personality: string;
  }) =>
    request<CreateInterviewResponse>(
      "POST",
      "/interviews",
      data,
    ),


  /* ----------------------------------------------------------
   * START INTERVIEW
   * ----------------------------------------------------------
   */

  start: (id: string) =>
    request<InterviewQuestionResponse>(
      "POST",
      `/interviews/${id}/start`,
    ),


  /* ----------------------------------------------------------
   * SUBMIT ANSWER
   * ----------------------------------------------------------
   */

  answer: (
    id: string,
    question_id: string,
    answer_text: string,
    duration_seconds?: number,
  ) =>
    request<SubmitAnswerResponse>(
      "POST",
      `/interviews/${id}/answer`,
      {
        question_id,
        answer_text,
        duration_seconds,
      },
    ),


  /* ----------------------------------------------------------
   * NEXT QUESTION
   * ----------------------------------------------------------
   */

  nextQuestion: (id: string) =>
    request<InterviewQuestionResponse>(
      "POST",
      `/interviews/${id}/next-question`,
    ),


  /* ----------------------------------------------------------
   * COMPLETE INTERVIEW
   * ----------------------------------------------------------
   */

  complete: (id: string) =>
    request<CompleteInterviewResponse>(
      "POST",
      `/interviews/${id}/complete`,
    ),


  /* ----------------------------------------------------------
   * INTERVIEW REPORT
   * ----------------------------------------------------------
   */

  report: (id: string) =>
    request<CompleteInterviewResponse>(
      "GET",
      `/interviews/${id}/report`,
    ),
};


/* ============================================================
 * RESUME
 * ============================================================
 */

export interface ResumeItem {
  id: string;

  filename: string;

  overall_score: number | null;
  ats_score: number | null;
  skills_score: number | null;
  experience_score: number | null;
  projects_score: number | null;
  keywords_score: number | null;
  formatting_score: number | null;

  extracted_skills: string[];

  strengths: string[];

  improvements: string[];

  analyzed_at: string | null;
}


export interface ResumeAnalysisResponse {
  id: string;

  overall_score: number;
  ats_score: number;
  skills_score: number;
  experience_score: number;
  projects_score: number;
  keywords_score: number;
  formatting_score: number;

  extracted_skills: string[];

  strengths: string[];

  improvements: string[];
}


export const resumeApi = {

  /* ----------------------------------------------------------
   * LIST RESUMES
   * ----------------------------------------------------------
   */

  list: () =>
    request<ResumeItem[]>(
      "GET",
      "/resume",
    ),


  /* ----------------------------------------------------------
   * UPLOAD RESUME
   * ----------------------------------------------------------
   */

  upload: async (file: File) => {

    await ensureValidToken();

    let token = getToken();

    const formData = new FormData();

    formData.append(
      "file",
      file,
    );


    /* --------------------------------------------------------
     * FIRST UPLOAD REQUEST
     * --------------------------------------------------------
     */

    let res: Response;

    try {
      res = await fetch(
        `${BASE}/resume/upload`,
        {
          method: "POST",

          headers: token
            ? {
              Authorization: `Bearer ${token}`,
            }
            : {},

          body: formData,
        },
      );
    } catch (error) {
      console.error(
        "Resume upload failed:",
        error,
      );

      throw new Error(
        "Unable to connect to the server.",
      );
    }


    /* --------------------------------------------------------
     * RETRY AFTER TOKEN REFRESH
     * --------------------------------------------------------
     */

    if (res.status === 401) {

      const newToken =
        await refreshAccessToken();

      if (newToken) {

        token = newToken;

        try {
          res = await fetch(
            `${BASE}/resume/upload`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${newToken}`,
              },

              body: formData,
            },
          );
        } catch (error) {
          console.error(
            "Resume retry failed:",
            error,
          );

          throw new Error(
            "Unable to connect to the server.",
          );
        }

      } else {

        clearAuth();

        throw new Error(
          "Session expired. Please login again.",
        );
      }
    }


    /* --------------------------------------------------------
     * UPLOAD ERROR
     * --------------------------------------------------------
     */

    if (!res.ok) {

      let message =
        `HTTP ${res.status}`;

      try {
        const data = await res.json();

        if (
          typeof data?.detail === "string"
        ) {
          message = data.detail;

        } else if (
          Array.isArray(data?.detail)
        ) {
          message = data.detail
            .map(
              (item: any) =>
                item?.msg ??
                "Validation error",
            )
            .join(", ");
        }
      } catch {
        // Ignore JSON parsing errors
      }

      throw new Error(message);
    }


    /* --------------------------------------------------------
     * SUCCESS
     * --------------------------------------------------------
     */

    return res.json() as Promise<{
      id: string;
      filename: string;
      status: string;
    }>;
  },


  /* ----------------------------------------------------------
   * ANALYZE RESUME
   * ----------------------------------------------------------
   */

  analyze: (
    resumeId: string,
  ) =>
    request<ResumeAnalysisResponse>(
      "POST",
      `/resume/analyze/${resumeId}`,
    ),
};


/* ============================================================
 * JOBS
 * ============================================================
 */

export interface JobSkillMatch {
  name: string;

  status:
  | "matched"
  | "partial"
  | "missing";

  level: number;
}


export interface JobAnalysisResponse {
  match_score: number;

  title: string;

  company?: string;

  skills: JobSkillMatch[];

  required_exp: string;

  seniority: string;

  interview_topics: string[];

  preparation_strategy: string;

  missing_skills: string[];
}


export const jobsApi = {

  /* ----------------------------------------------------------
   * ANALYZE JOB
   * ----------------------------------------------------------
   */

  analyze: (data: {
    job_description: string;

    title?: string;

    company?: string;
  }) =>
    request<JobAnalysisResponse>(
      "POST",
      "/jobs/analyze",
      data,
    ),
};


/* ============================================================
 * PRACTICE
 * ============================================================
 */


/* ------------------------------------------------------------
 * PRACTICE QUESTION
 * ------------------------------------------------------------
 */

export interface PracticeQuestion {
  id: string;

  question: string;

  category: string;

  difficulty: string;
}


/* ------------------------------------------------------------
 * PRACTICE EVALUATION
 * ------------------------------------------------------------
 */

export interface EvalResult {
  score: number;

  feedback: string;

  strengths: string[];

  improvements: string[];

  suggested_answer: string;
}


/* ------------------------------------------------------------
 * PRACTICE API
 * ------------------------------------------------------------
 */

export const practiceApi = {

  // ----------------------------------------------------------
   // GET PRACTICE QUESTION
   //---------------------------------------------------------

  getQuestion: (
    category: string,
    difficulty: string,
  ) =>
    request<PracticeQuestion>(
      "POST",
      "/practice/question",
      {
        category: category.trim(),
        difficulty: difficulty.trim(),
      },
    ),


  //Evaluate the user's answer to a practice question

  evaluate: (
    question: string,
    answer: string,
    category?: string,
    difficulty?: string,
  ) =>
    request<EvalResult>(
      "POST",
      "/practice/evaluate",
      {
        question: question.trim(),
        answer: answer.trim(),
        category: category?.trim(),
        difficulty: difficulty?.trim(),
      },
    ),
};


/* ============================================================
 * OPTIONAL DEBUG EXPORT
 * ============================================================
 */

export const API_BASE_URL = BASE;