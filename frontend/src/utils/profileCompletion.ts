/**
 * Profile Completion Calculation Utility
 *
 * Single Source of Truth for profile completeness across the entire application:
 * - Profile Page
 * - Dashboard
 * - Profile Setup
 * - API Synchronization
 *
 * Exactly mirrors backend `calculate_profile_completion`.
 */

export interface ProfileCheck {
  id: string;
  label: string;
  done: boolean;
}

export interface ProfileCompletionResult {
  percentage: number;
  checks: ProfileCheck[];
  isComplete: boolean;
}

export function calculateProfileCompletion(data: any): ProfileCompletionResult {
  if (!data) {
    return {
      percentage: 0,
      checks: [
        { id: "basic", label: "Basic Information", done: false },
        { id: "education", label: "Education", done: false },
        { id: "career", label: "Career Information", done: false },
        { id: "skills", label: "Skills (3+)", done: false },
        { id: "links", label: "Professional Links", done: false },
      ],
      isComplete: false,
    };
  }

  const name = (data.name || "").trim();
  const email = (data.email || "").trim();
  const headline = (data.headline || "").trim();
  const basicDone = Boolean(name && email && headline);

  const college = (data.college || "").trim();
  const degree = (data.degree || "").trim();
  const educations = Array.isArray(data.educations) ? data.educations : [];
  const hasEduEntry = educations.some(
    (e: any) => e && (e.college || "").trim() && (e.degree || "").trim(),
  );
  const educationDone = Boolean(
    hasEduEntry || (college && (degree || educations.length > 0)),
  );

  const targetRole = (data.targetRole || data.target_role || "").trim();
  const experience = (data.experience || "").trim();
  const careerDone = Boolean(targetRole && experience);

  let skills: string[] = [];
  if (Array.isArray(data.skills)) {
    skills = data.skills;
  } else if (typeof data.skills === "string") {
    try {
      const parsed = JSON.parse(data.skills);
      if (Array.isArray(parsed)) skills = parsed;
    } catch {
      skills = data.skills
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }
  const skillsDone = skills.length >= 3;

  const github = (data.github || "").trim();
  const linkedin = (data.linkedin || "").trim();
  const portfolio = (data.portfolio || "").trim();
  const linksDone = Boolean(github || linkedin || portfolio);

  const checks: ProfileCheck[] = [
    {
      id: "basic",
      label: "Basic Information",
      done: basicDone,
    },
    {
      id: "education",
      label: "Education",
      done: educationDone,
    },
    {
      id: "career",
      label: "Career Information",
      done: careerDone,
    },
    {
      id: "skills",
      label: "Skills (3+)",
      done: skillsDone,
    },
    {
      id: "links",
      label: "Professional Links",
      done: linksDone,
    },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const percentage = Math.round((completedCount / checks.length) * 100);
  const isComplete = percentage >= 80;

  return {
    percentage,
    checks,
    isComplete,
  };
}
