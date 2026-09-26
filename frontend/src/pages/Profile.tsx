import { getInitials } from "@/lib/utils";
import { authApi } from "@/services/apiService";
import { useAuthStore } from "@/store/authStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Award,
  Briefcase,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Code,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  Languages as LanguagesIcon,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Share2,
  Target,
  Trash2,
  Upload,
  User as UserIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────────
// PROFESSIONAL COLOR PALETTE
// A single cohesive palette used across the whole page instead of
// the previous mix of purple / pink / amber / teal accents. Every
// "tint" background below is a fixed, fully-opaque-enough color pair
// (background + border) so cards never look like they're letting the
// page behind them show through.
// ─────────────────────────────────────────────────────────────────
const PALETTE = {
  primary: "#4338CA", // indigo-700 (main brand accent)
  primaryLight: "#4F46E5", // indigo-600
  primarySoftBg: "#EEF2FF", // indigo-50
  primarySoftBorder: "#C7D2FE", // indigo-200

  secondary: "#0F766E", // teal-700
  secondaryLight: "#0D9488", // teal-600
  secondarySoftBg: "#F0FDFA", // teal-50
  secondarySoftBorder: "#99F6E4", // teal-200

  neutralAccent: "#334155", // slate-700 (replaces pink/magenta accents)
  neutralAccentLight: "#475569", // slate-600
  neutralSoftBg: "#F1F5F9", // slate-100
  neutralSoftBorder: "#CBD5E1", // slate-300

  success: "#047857", // emerald-700
  successSoftBg: "#ECFDF5", // emerald-50
  successSoftBorder: "#A7F3D0", // emerald-200

  warning: "#B45309", // amber-700
  warningSoftBg: "#FFFBEB", // amber-50
  warningSoftBorder: "#FDE68A", // amber-200

  danger: "#B91C1C", // red-700
  dangerSoftBg: "#FEF2F2",
  dangerSoftBorder: "#FECACA",

  linkedin: "#0A66C2",
};

// ── BRAND ICONS ──────────────────────────────────────────────────
function GithubIcon({
  size = 16,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedinIcon({
  size = 16,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

// ── SKILLS CATEGORIES ───────────────────────────────────────────
const SKILL_CATEGORIES: Record<string, string[]> = {
  Programming: ["Python", "JavaScript", "TypeScript"],
  "AI / ML": [
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "NLP",
    "Computer Vision",
    "RAG",
    "LangChain",
  ],
  "Web / Backend": ["FastAPI", "React"],
  Database: ["SQL"],
  Tools: ["Git", "Docker"],
};

// ── SELECT OPTIONS ──────────────────────────────────────────────
const EXPERIENCE_OPTIONS = [
  "Student",
  "Fresher",
  "Internship",
  "0–1 Years",
  "1–3 Years",
  "3–5 Years",
  "5+ Years",
];

const JOB_TYPE_OPTIONS = ["Full-time", "Internship", "Part-time", "Contract"];
const WORK_LOCATION_OPTIONS = ["Hybrid", "Remote", "On-site"];
const PROFICIENCY_OPTIONS = ["Basic", "Intermediate", "Fluent", "Native"];

// ── DATA INTERFACES ─────────────────────────────────────────────
interface EducationItem {
  id: string;
  college: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: string;
  cgpa?: string;
  level?: string;
}

interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
}

interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

interface LanguageItem {
  language: string;
  proficiency: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // File Input References
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  // Sub-modal inline form states
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddCertification, setShowAddCertification] = useState(false);
  const [showAddLanguage, setShowAddLanguage] = useState(false);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");

  // Local storage persistence key
  const storageKey = `ib_candidate_profile_extra_${user?.id || "default"}`;

  // Load persisted extra fields or fallbacks
  const getSavedExtra = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const savedExtra = getSavedExtra();

  // Form State initialized dynamically from authenticated user
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    headline: savedExtra?.headline || "",
    phone: savedExtra?.phone || "",
    location: savedExtra?.location || "",
    city: savedExtra?.city || "",
    country: savedExtra?.country || "",
    targetRole: user?.targetRole || savedExtra?.targetRole || "",
    experience: user?.experience || savedExtra?.experience || "",
    careerObjective: savedExtra?.careerObjective || "",
    about: savedExtra?.about || "",
    preferredJobType: savedExtra?.preferredJobType || "",
    preferredLocation: savedExtra?.preferredLocation || "",
    college: user?.college || savedExtra?.college || "",
    degree: savedExtra?.degree || "",
    fieldOfStudy: savedExtra?.fieldOfStudy || "",
    graduationYear: savedExtra?.graduationYear || "",
    cgpa: savedExtra?.cgpa || "",
    github: user?.github || savedExtra?.github || "",
    linkedin: user?.linkedin || savedExtra?.linkedin || "",
    portfolio: user?.portfolio || savedExtra?.portfolio || "",
    avatar: user?.avatar || savedExtra?.avatar || "",
    skills:
      user?.skills && user.skills.length > 0
        ? user.skills
        : savedExtra?.skills || [],
    resumeFilename: savedExtra?.resumeFilename || "",
    resumeUploadedAt: savedExtra?.resumeUploadedAt || "",
  });

  // Synchronize with user store if user data changes externally
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        college: user.college || prev.college,
        targetRole: user.targetRole || prev.targetRole,
        experience: user.experience || prev.experience,
        github: user.github || prev.github,
        linkedin: user.linkedin || prev.linkedin,
        portfolio: user.portfolio || prev.portfolio,
        avatar: user.avatar || prev.avatar,
        skills:
          user.skills && user.skills.length > 0 ? user.skills : prev.skills,
      }));
    }
  }, [user]);

  // Education list (defaults to empty unless added by user)
  const [educations, setEducations] = useState<EducationItem[]>(
    savedExtra?.educations || [],
  );

  // Featured Projects list (defaults to empty unless added by user)
  const [projects, setProjects] = useState<ProjectItem[]>(
    savedExtra?.projects || [],
  );

  // Certifications list (defaults to empty unless added by user)
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    savedExtra?.certifications || [],
  );

  // Languages list (defaults to empty unless added by user)
  const [languages, setLanguages] = useState<LanguageItem[]>(
    savedExtra?.languages || [],
  );

  // Inline forms temporary state
  const [newEdu, setNewEdu] = useState<Partial<EducationItem>>({
    college: "",
    degree: "B.Tech",
    fieldOfStudy: "",
    graduationYear: "2025",
    cgpa: "",
  });

  const [newProject, setNewProject] = useState<Partial<ProjectItem>>({
    title: "",
    description: "",
    techStack: [],
    githubUrl: "",
    liveUrl: "",
  });
  const [projectTechInput, setProjectTechInput] = useState("");

  const [newCert, setNewCert] = useState<Partial<CertificationItem>>({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  });

  const [newLang, setNewLang] = useState<Partial<LanguageItem>>({
    language: "",
    proficiency: "Fluent",
  });

  // Dynamic Profile Completeness calculation
  const completionStats = useMemo(() => {
    const checks = [
      {
        id: "basic",
        label: "Basic Information",
        done: Boolean(
          form.name.trim() && form.email.trim() && form.headline.trim(),
        ),
      },
      {
        id: "education",
        label: "Education",
        done: Boolean(
          educations.length > 0 && form.college.trim() && form.degree.trim(),
        ),
      },
      {
        id: "career",
        label: "Career Information",
        done: Boolean(
          form.targetRole.trim() && form.experience.trim() && form.about.trim(),
        ),
      },
      {
        id: "skills",
        label: "Skills (3+)",
        done: form.skills.length >= 3,
      },
      {
        id: "links",
        label: "Professional Links",
        done: Boolean(form.github.trim() || form.linkedin.trim()),
      },
    ];

    const completedCount = checks.filter((c) => c.done).length;
    const percentage = Math.round((completedCount / checks.length) * 100);

    return { percentage, checks, isComplete: percentage >= 80 };
  }, [form, educations]);

  // Real-time Field Validation Rules
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Please enter your full name.";
    if (!form.email.trim() || !form.email.includes("@"))
      errors.email = "Please enter a valid email address.";
    if (
      form.linkedin &&
      !form.linkedin.toLowerCase().includes("linkedin.com")
    ) {
      errors.linkedin = "Enter a valid LinkedIn URL.";
    }
    if (form.github && !form.github.toLowerCase().includes("github.com")) {
      errors.github = "Enter a valid GitHub URL.";
    }
    return errors;
  }, [form]);

  // Toggle skills in edit mode
  const toggleSkill = (skill: string) => {
    setForm((curr) => ({
      ...curr,
      skills: curr.skills.includes(skill)
        ? curr.skills.filter((s) => s !== skill)
        : [...curr.skills, skill],
    }));
  };

  // Add custom skill
  const handleAddCustomSkill = () => {
    const s = customSkillInput.trim();
    if (!s) return;
    if (!form.skills.some((x) => x.toLowerCase() === s.toLowerCase())) {
      setForm((curr) => ({ ...curr, skills: [...curr.skills, s] }));
      toast.success(`Added skill "${s}"`);
    } else {
      toast.info(`"${s}" is already in your skills list`);
    }
    setCustomSkillInput("");
    setShowAddSkill(false);
  };

  // Handle Avatar Image Upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((curr) => ({ ...curr, avatar: result }));
      updateUser({ avatar: result });
      toast.success("Profile photo updated successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Handle Resume File Upload
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const filename = file.name;
    setForm((curr) => ({
      ...curr,
      resumeFilename: filename,
      resumeUploadedAt: "Updated just now",
    }));
    try {
      const extraToSave = {
        ...savedExtra,
        resumeFilename: filename,
        resumeUploadedAt: "Updated just now",
      };
      localStorage.setItem(storageKey, JSON.stringify(extraToSave));
    } catch {
      /* ignore */
    }
    toast.success(`Uploaded "${filename}". ATS parser ready!`);
  };

  // Save profile changes
  const handleSave = async () => {
    if (Object.keys(validationErrors).length > 0) {
      const firstErr = Object.values(validationErrors)[0];
      toast.error(firstErr);
      return;
    }

    try {
      setSaving(true);

      // 1. Update Core User Store (Preserved exactly as required)
      await updateUser({
        name: form.name,
        email: form.email,
        college: form.college,
        targetRole: form.targetRole,
        experience: form.experience,
        github: form.github,
        linkedin: form.linkedin,
        portfolio: form.portfolio,
        skills: form.skills,
        avatar: form.avatar,
      });

      // 2. Persist extended profile data safely in localStorage
      const extraData = {
        headline: form.headline,
        phone: form.phone,
        location: form.location,
        city: form.city,
        country: form.country,
        careerObjective: form.careerObjective,
        about: form.about,
        preferredJobType: form.preferredJobType,
        preferredLocation: form.preferredLocation,
        college: form.college,
        degree: form.degree,
        fieldOfStudy: form.fieldOfStudy,
        graduationYear: form.graduationYear,
        cgpa: form.cgpa,
        github: form.github,
        linkedin: form.linkedin,
        portfolio: form.portfolio,
        skills: form.skills,
        avatar: form.avatar,
        resumeFilename: form.resumeFilename,
        resumeUploadedAt: form.resumeUploadedAt,
        educations,
        projects,
        certifications,
        languages,
      };
      localStorage.setItem(storageKey, JSON.stringify(extraData));

      // 3. Attempt backend update gracefully if connected
      try {
        await authApi.updateProfile({
          name: form.name,
          college: form.college,
          target_role: form.targetRole,
          experience: form.experience,
          skills: form.skills,
          github: form.github,
          linkedin: form.linkedin,
          portfolio: form.portfolio,
          profile_complete: completionStats.percentage >= 80,
        });
      } catch {
        // Backend optional/mock fallback
      }

      setEditing(false);
      toast.success("Candidate profile updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Unable to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit mode and revert to last saved state
  const handleCancel = () => {
    const latestExtra = getSavedExtra();
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      headline: latestExtra?.headline || "",
      phone: latestExtra?.phone || "",
      location: latestExtra?.location || "",
      city: latestExtra?.city || "",
      country: latestExtra?.country || "",
      targetRole: user?.targetRole || latestExtra?.targetRole || "",
      experience: user?.experience || latestExtra?.experience || "",
      careerObjective: latestExtra?.careerObjective || "",
      about: latestExtra?.about || "",
      preferredJobType: latestExtra?.preferredJobType || "",
      preferredLocation: latestExtra?.preferredLocation || "",
      college: user?.college || latestExtra?.college || "",
      degree: latestExtra?.degree || "",
      fieldOfStudy: latestExtra?.fieldOfStudy || "",
      graduationYear: latestExtra?.graduationYear || "",
      cgpa: latestExtra?.cgpa || "",
      github: user?.github || latestExtra?.github || "",
      linkedin: user?.linkedin || latestExtra?.linkedin || "",
      portfolio: user?.portfolio || latestExtra?.portfolio || "",
      avatar: user?.avatar || latestExtra?.avatar || "",
      skills:
        user?.skills && user.skills.length > 0
          ? user.skills
          : latestExtra?.skills || [],
      resumeFilename: latestExtra?.resumeFilename || "",
      resumeUploadedAt: latestExtra?.resumeUploadedAt || "",
    });
    setEditing(false);
    setShowAddEducation(false);
    setShowAddProject(false);
    setShowAddCertification(false);
    setShowAddLanguage(false);
    setShowAddSkill(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        maxWidth: 1360,
        margin: "0 auto",
        width: "100%",
        paddingBottom: "3.5rem",
      }}
    >
      {/* Hidden File Inputs for real media interactions */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        style={{ display: "none" }}
        aria-hidden="true"
      />
      <input
        type="file"
        ref={resumeInputRef}
        onChange={handleResumeFileChange}
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        aria-hidden="true"
      />

      {/* ── 1. TOP HEADER BAR ── */}
      <div
        className="voxa-card"
        style={{
          padding: "1.25rem 1.75rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          borderRadius: "16px",
          backgroundColor: "var(--voxa-card-bg)",
          border: "1px solid var(--voxa-card-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
            >
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "var(--voxa-card-text)",
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                My Profile
              </h1>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "6px",
                  backgroundColor: PALETTE.primarySoftBg,
                  border: `1px solid ${PALETTE.primarySoftBorder}`,
                  color: PALETTE.primary,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                Candidate Dossier
              </span>
            </div>
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                margin: "3px 0 0 0",
              }}
            >
              Build a complete professional profile to get better interview
              preparation and career recommendations.
            </p>
          </div>
        </div>

        {/* Right side Header action buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.65rem",
            flexWrap: "wrap",
          }}
        >
          {/* Recruiter Preview Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPreviewOpen(true)}
            className="navbar-icon-pill"
            style={{
              width: "auto",
              padding: "0.48rem 1rem",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--voxa-card-text)",
              borderRadius: "8px",
              border: "1px solid var(--voxa-card-border)",
              backgroundColor: "var(--voxa-card-bg)",
            }}
            title="Preview how recruiters see your profile"
          >
            <Eye size={15} style={{ color: PALETTE.secondaryLight }} />
            <span>Recruiter Preview</span>
          </motion.button>

          {!editing ? (
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 4px 14px rgba(67, 56, 202, 0.32)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditing(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.45rem",
                padding: "0.48rem 1.25rem",
                borderRadius: "8px",
                border: "none",
                backgroundColor: PALETTE.primary,
                color: "#FFFFFF",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 10px rgba(67, 56, 202, 0.28)",
                transition: "all 0.18s ease",
              }}
            >
              <Edit3 size={15} />
              <span>Edit Profile</span>
            </motion.button>
          ) : (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.48rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid var(--voxa-card-border)",
                  backgroundColor: "var(--voxa-card-bg)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <X size={15} />
                <span>Cancel</span>
              </motion.button>

              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 14px rgba(4, 120, 87, 0.32)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.48rem 1.35rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: PALETTE.success,
                  color: "#FFFFFF",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 10px rgba(4, 120, 87, 0.28)",
                  opacity: saving ? 0.75 : 1,
                  transition: "all 0.18s ease",
                }}
              >
                <Save size={15} />
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* ── 14. REQUIRED INFORMATION BANNER ── */}
      {completionStats.percentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="voxa-card"
          style={{
            padding: "0.9rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            backgroundColor: PALETTE.warningSoftBg,
            border: `1px solid ${PALETTE.warningSoftBorder}`,
            borderRadius: "12px",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                backgroundColor: "#FDE68A",
                color: PALETTE.warning,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <AlertCircle size={17} />
            </div>
            <div>
              <span
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "var(--voxa-card-text)",
                }}
              >
                Complete your required information to unlock better interview
                and career recommendations.
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  display: "block",
                }}
              >
                Required fields are marked with{" "}
                <strong style={{ color: PALETTE.danger }}>*</strong> (Full Name,
                Email, Headline, Target Role, College, Degree, Experience, 3+
                Skills).
              </span>
            </div>
          </div>

          {!editing && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setEditing(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.4rem 0.9rem",
                borderRadius: "8px",
                border: `1px solid ${PALETTE.warningSoftBorder}`,
                backgroundColor: "#FDE68A",
                color: PALETTE.warning,
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <span>Complete Now</span>
              <ChevronRight size={14} />
            </motion.button>
          )}
        </motion.div>
      )}

      {/* ── 2. PROFILE HERO CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="voxa-card"
        style={{
          padding: "1.75rem",
          marginBottom: "1.5rem",
          position: "relative",
          overflow: "hidden",
          borderRadius: "16px",
          backgroundColor: "var(--voxa-card-bg)",
          border: "1px solid var(--voxa-card-border)",
        }}
      >
        {/* Subtle top accent bar instead of a floating radial glow that could bleed into the page */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${PALETTE.primary}, ${PALETTE.secondaryLight})`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
          }}
        >
          {/* Avatar and Candidate Summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar with solid ring and Camera icon */}
            <div
              style={{
                position: "relative",
                width: 96,
                height: 96,
                borderRadius: "50%",
                padding: 3,
                backgroundColor: PALETTE.primary,
                boxShadow: "0 6px 18px rgba(67, 56, 202, 0.25)",
                cursor: "pointer",
                flexShrink: 0,
              }}
              onClick={() => avatarInputRef.current?.click()}
              title="Click to upload profile photo"
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#1E293B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {form.avatar ? (
                  <img
                    src={form.avatar}
                    alt={form.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    {getInitials(form.name || "Candidate")}
                  </span>
                )}

                {/* Camera Overlay on hover — solid dark scrim so it never looks see-through */}
                <div
                  className="avatar-camera-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.78)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
                    gap: 2,
                  }}
                >
                  <Camera size={20} />
                  <span style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                    Upload
                  </span>
                </div>
              </div>
            </div>

            {/* Candidate Identity Details */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  flexWrap: "wrap",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.45rem",
                    fontWeight: 700,
                    color: "var(--voxa-card-text)",
                    letterSpacing: "-0.02em",
                    margin: 0,
                  }}
                >
                  {form.name || "Candidate Name"}
                </h2>

                {completionStats.isComplete ? (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "6px",
                      backgroundColor: PALETTE.successSoftBg,
                      border: `1px solid ${PALETTE.successSoftBorder}`,
                      color: PALETTE.success,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={13} /> Profile Complete
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.2rem 0.65rem",
                      borderRadius: "6px",
                      backgroundColor: PALETTE.warningSoftBg,
                      border: `1px solid ${PALETTE.warningSoftBorder}`,
                      color: PALETTE.warning,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    In Progress ({completionStats.percentage}%)
                  </span>
                )}
              </div>

              {/* Professional Headline */}
              {form.headline ? (
                <p
                  style={{
                    fontSize: "0.925rem",
                    fontWeight: 600,
                    color: PALETTE.primary,
                    margin: "4px 0 8px 0",
                  }}
                >
                  {form.headline}
                </p>
              ) : (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-muted)",
                    margin: "4px 0 8px 0",
                  }}
                >
                  Headline: Not added
                </p>
              )}

              {/* Dynamic Metadata Chips */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                  fontSize: "0.8125rem",
                  color: "var(--text-secondary)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                  }}
                >
                  <Briefcase
                    size={14}
                    style={{ color: PALETTE.secondaryLight }}
                  />
                  {form.targetRole || "Target Role: Not added"}{" "}
                  {form.experience ? `• ${form.experience}` : ""}
                </span>

                {(form.degree || form.college) && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <GraduationCap
                      size={14}
                      style={{ color: PALETTE.primary }}
                    />
                    {form.degree || form.college}{" "}
                    {form.fieldOfStudy ? `in ${form.fieldOfStudy}` : ""}
                  </span>
                )}

                {form.location && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <MapPin
                      size={14}
                      style={{ color: PALETTE.neutralAccentLight }}
                    />
                    {form.location}
                  </span>
                )}

                {form.email && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Mail size={14} style={{ color: PALETTE.warning }} />
                    {form.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Completeness Indicator */}
          <div
            style={{
              minWidth: 210,
              padding: "1.1rem 1.35rem",
              borderRadius: "12px",
              backgroundColor: PALETTE.primarySoftBg,
              border: `1px solid ${PALETTE.primarySoftBorder}`,
              display: "flex",
              flexDirection: "column",
              gap: "0.65rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                }}
              >
                Profile Completion
              </span>
              <span
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color:
                    completionStats.percentage >= 80
                      ? PALETTE.success
                      : PALETTE.warning,
                }}
              >
                {completionStats.percentage}%
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div
              style={{
                height: 8,
                borderRadius: 999,
                backgroundColor: "#E2E8F0",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${completionStats.percentage}%`,
                  borderRadius: 999,
                  backgroundColor:
                    completionStats.percentage >= 80
                      ? PALETTE.success
                      : PALETTE.warning,
                  transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {completionStats.percentage >= 80
                ? "✓ Ready for Mock Interviews"
                : "⚡ Complete required sections"}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── 2-COLUMN RESPONSIVE LAYOUT ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(320px, 1fr)",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="profile-main-grid"
      >
        {/* ====================================================
            LEFT MAIN COLUMN: Core Candidate Profile Data
        ===================================================== */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* ── 4. BASIC INFORMATION CARD ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <SectionHeader
              icon={UserIcon}
              title="Basic Information"
              subtitle="Personal identity and contact details"
              color={PALETTE.primary}
              softBg={PALETTE.primarySoftBg}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
              }}
              className="field-grid"
            >
              {renderField({
                label: "Full Name",
                value: form.name,
                onChange: (v) => setForm((c) => ({ ...c, name: v })),
                icon: UserIcon,
                placeholder: "e.g. Prince Singh",
                required: true,
                error: validationErrors.name,
                editing,
              })}

              {renderField({
                label: "Professional Headline",
                value: form.headline,
                onChange: (v) => setForm((c) => ({ ...c, headline: v })),
                icon: Award,
                placeholder: "e.g. AI/ML Engineer | Python Developer",
                required: true,
                error: validationErrors.headline,
                editing,
              })}

              {renderField({
                label: "Email Address",
                value: form.email,
                onChange: (v) => setForm((c) => ({ ...c, email: v })),
                icon: Mail,
                placeholder: "your@email.com",
                required: true,
                type: "email",
                error: validationErrors.email,
                editing,
              })}

              {renderField({
                label: "Phone Number",
                value: form.phone,
                onChange: (v) => setForm((c) => ({ ...c, phone: v })),
                icon: Phone,
                placeholder: "+91 98765 43210",
                editing,
              })}

              {renderField({
                label: "City & Location",
                value: form.city,
                onChange: (v) =>
                  setForm((c) => ({
                    ...c,
                    city: v,
                    location: `${v}, ${c.country}`,
                  })),
                icon: MapPin,
                placeholder: "e.g. Bengaluru",
                editing,
              })}

              {renderField({
                label: "Country",
                value: form.country,
                onChange: (v) =>
                  setForm((c) => ({
                    ...c,
                    country: v,
                    location: `${c.city}, ${v}`,
                  })),
                icon: Globe,
                placeholder: "e.g. India",
                editing,
              })}
            </div>
          </div>

          {/* ── 5. CAREER & PROFESSIONAL INFORMATION ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <SectionHeader
              icon={Briefcase}
              title="Career & Professional Information"
              subtitle="Target position, experience level and work preferences"
              color={PALETTE.secondary}
              softBg={PALETTE.secondarySoftBg}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1rem",
                marginBottom: "1rem",
              }}
              className="field-grid"
            >
              {renderField({
                label: "Target Role",
                value: form.targetRole,
                onChange: (v) => setForm((c) => ({ ...c, targetRole: v })),
                icon: Target,
                placeholder: "e.g. AI/ML Engineer",
                required: true,
                error: validationErrors.targetRole,
                editing,
              })}

              {/* Experience Level Dropdown */}
              <div>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: "0.45rem",
                  }}
                >
                  Experience Level{" "}
                  <span style={{ color: PALETTE.danger }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <Briefcase
                    size={16}
                    style={{
                      position: "absolute",
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: PALETTE.secondaryLight,
                      zIndex: 1,
                    }}
                  />
                  {editing ? (
                    <select
                      value={form.experience}
                      onChange={(e) =>
                        setForm((c) => ({ ...c, experience: e.target.value }))
                      }
                      className="input"
                      style={{
                        width: "100%",
                        paddingLeft: "2.6rem",
                        borderRadius: 10,
                        minHeight: 46,
                      }}
                    >
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      className="input"
                      style={{
                        width: "100%",
                        paddingLeft: "2.6rem",
                        minHeight: 46,
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 10,
                        fontWeight: 600,
                      }}
                    >
                      {form.experience}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferred Job Type */}
              <div>
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: "0.45rem",
                    display: "block",
                  }}
                >
                  Preferred Job Type
                </label>
                {editing ? (
                  <select
                    value={form.preferredJobType}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        preferredJobType: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ width: "100%", borderRadius: 10, minHeight: 46 }}
                  >
                    {JOB_TYPE_OPTIONS.map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="input"
                    style={{
                      width: "100%",
                      minHeight: 46,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    {form.preferredJobType}
                  </div>
                )}
              </div>

              {/* Preferred Work Location */}
              <div>
                <label
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: "0.45rem",
                    display: "block",
                  }}
                >
                  Preferred Work Location
                </label>
                {editing ? (
                  <select
                    value={form.preferredLocation}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        preferredLocation: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ width: "100%", borderRadius: 10, minHeight: 46 }}
                  >
                    {WORK_LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="input"
                    style={{
                      width: "100%",
                      minHeight: 46,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    {form.preferredLocation}
                  </div>
                )}
              </div>
            </div>

            {/* Career Objective */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: "0.45rem",
                  display: "block",
                }}
              >
                Career Objective
              </label>
              {editing ? (
                <textarea
                  value={form.careerObjective}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, careerObjective: e.target.value }))
                  }
                  placeholder="State your near-term professional goals and what direction you want your career to take..."
                  className="input"
                  style={{
                    width: "100%",
                    minHeight: 75,
                    borderRadius: 10,
                    padding: "0.75rem",
                    lineHeight: 1.6,
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: "0.85rem 1rem",
                    borderRadius: 10,
                    backgroundColor: PALETTE.secondarySoftBg,
                    border: "1px solid var(--voxa-card-border)",
                    fontSize: "0.85rem",
                    lineHeight: 1.6,
                    color: "var(--voxa-card-text)",
                  }}
                >
                  {form.careerObjective}
                </div>
              )}
            </div>

            {/* Professional Summary / About */}
            <div>
              <label
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  marginBottom: "0.45rem",
                  display: "block",
                }}
              >
                Professional Summary / About
              </label>
              {editing ? (
                <textarea
                  value={form.about}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, about: e.target.value }))
                  }
                  placeholder="Summarize your background, core technical focus and what problems you love solving..."
                  className="input"
                  style={{
                    width: "100%",
                    minHeight: 110,
                    borderRadius: 10,
                    padding: "0.85rem",
                    lineHeight: 1.6,
                  }}
                />
              ) : (
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: 10,
                    backgroundColor: PALETTE.primarySoftBg,
                    border: "1px solid var(--voxa-card-border)",
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    color: "var(--voxa-card-text)",
                  }}
                >
                  {form.about}
                </div>
              )}
            </div>
          </div>

          {/* ── 6. EDUCATION SECTION ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.15rem",
              }}
            >
              <SectionHeader
                icon={GraduationCap}
                title="Education"
                subtitle="Academic degree, university and credentials"
                color={PALETTE.primary}
                softBg={PALETTE.primarySoftBg}
              />

              {editing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddEducation(!showAddEducation)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    border: `1px solid ${PALETTE.primarySoftBorder}`,
                    backgroundColor: PALETTE.primarySoftBg,
                    color: PALETTE.primary,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Education
                </motion.button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {educations.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  Not added
                  {editing
                    ? '. Click "Add Education" above to add your degree.'
                    : ""}
                </div>
              ) : (
                educations.map((edu) => (
                  <div
                    key={edu.id}
                    style={{
                      padding: "1.15rem",
                      borderRadius: "12px",
                      backgroundColor: PALETTE.primarySoftBg,
                      border: "1px solid var(--voxa-card-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.85rem",
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "10px",
                          backgroundColor: "#FFFFFF",
                          color: PALETTE.primary,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: `1px solid ${PALETTE.primarySoftBorder}`,
                        }}
                      >
                        <GraduationCap size={20} />
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 700,
                              color: "var(--voxa-card-text)",
                              margin: 0,
                            }}
                          >
                            {edu.degree}{" "}
                            {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                          </h4>
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: "6px",
                              backgroundColor: PALETTE.successSoftBg,
                              color: PALETTE.success,
                            }}
                          >
                            Graduating {edu.graduationYear}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "0.8125rem",
                            fontWeight: 600,
                            color: "var(--text-secondary)",
                            marginTop: "2px",
                          }}
                        >
                          {edu.college}
                        </div>

                        {edu.cgpa && (
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--text-muted)",
                              marginTop: "4px",
                            }}
                          >
                            Performance:{" "}
                            <strong style={{ color: "var(--voxa-card-text)" }}>
                              {edu.cgpa}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {editing && (
                      <button
                        onClick={() =>
                          setEducations((curr) =>
                            curr.filter((e) => e.id !== edu.id),
                          )
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: PALETTE.danger,
                          cursor: "pointer",
                          padding: 4,
                        }}
                        title="Remove Education"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* In-line Add Education Drawer */}
            {showAddEducation && editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  marginTop: "1rem",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  backgroundColor: PALETTE.primarySoftBg,
                  border: `1px dashed ${PALETTE.primarySoftBorder}`,
                }}
              >
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                  }}
                >
                  Add New Education Entry
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.75rem",
                  }}
                  className="field-grid"
                >
                  <input
                    placeholder="College / University *"
                    value={newEdu.college}
                    onChange={(e) =>
                      setNewEdu((c) => ({ ...c, college: e.target.value }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <input
                    placeholder="Degree (e.g. B.Tech) *"
                    value={newEdu.degree}
                    onChange={(e) =>
                      setNewEdu((c) => ({ ...c, degree: e.target.value }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <input
                    placeholder="Field of Study (e.g. Artificial Intelligence & Machine Learning) *"
                    value={newEdu.fieldOfStudy}
                    onChange={(e) =>
                      setNewEdu((c) => ({ ...c, fieldOfStudy: e.target.value }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <input
                    placeholder="Graduation Year (e.g. 2025) *"
                    value={newEdu.graduationYear}
                    onChange={(e) =>
                      setNewEdu((c) => ({
                        ...c,
                        graduationYear: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <input
                    placeholder="CGPA / Percentage (e.g. 8.8 / 10)"
                    value={newEdu.cgpa}
                    onChange={(e) =>
                      setNewEdu((c) => ({ ...c, cgpa: e.target.value }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <button
                    onClick={() => setShowAddEducation(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newEdu.college || !newEdu.degree) {
                        toast.error("College and degree are required");
                        return;
                      }
                      setEducations((curr) => [
                        ...curr,
                        {
                          id: Date.now().toString(),
                          college: newEdu.college || "",
                          degree: newEdu.degree || "B.Tech",
                          fieldOfStudy: newEdu.fieldOfStudy || "",
                          graduationYear: newEdu.graduationYear || "2025",
                          cgpa: newEdu.cgpa || "",
                        },
                      ]);
                      setShowAddEducation(false);
                      setNewEdu({
                        college: "",
                        degree: "B.Tech",
                        fieldOfStudy: "",
                        graduationYear: "2025",
                        cgpa: "",
                      });
                      toast.success("Education added");
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: PALETTE.primary }}
                  >
                    Add Entry
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── 7. TECHNICAL SKILLS SECTION ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <SectionHeader
                icon={Code}
                title="Technical Skills"
                subtitle={
                  editing
                    ? "Toggle skills you actually know. Only selected skills appear on your candidate profile."
                    : `${form.skills.length} verified candidate skills active`
                }
                color={PALETTE.neutralAccent}
                softBg={PALETTE.neutralSoftBg}
              />

              {editing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddSkill(!showAddSkill)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    border: `1px solid ${PALETTE.neutralSoftBorder}`,
                    backgroundColor: PALETTE.neutralSoftBg,
                    color: PALETTE.neutralAccent,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Custom Skill
                </motion.button>
              )}
            </div>

            {/* Custom Skill Input Drawer */}
            {showAddSkill && editing && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                <input
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddCustomSkill();
                  }}
                  placeholder="Type custom skill name (e.g. Next.js, Kubernetes) and press Enter..."
                  className="input"
                  style={{ flex: 1, borderRadius: 8, minHeight: 42 }}
                />
                <button
                  onClick={handleAddCustomSkill}
                  style={{
                    padding: "0 1.25rem",
                    borderRadius: 8,
                    border: "none",
                    backgroundColor: PALETTE.neutralAccent,
                    color: "#FFFFFF",
                    fontWeight: 700,
                    fontSize: "0.8125rem",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
              </div>
            )}

            {/* Categorized Skills Grid */}
            {editing ? (
              // EDIT MODE: Organized into categories with interactive toggle chips
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {Object.entries(SKILL_CATEGORIES).map(([catName, skills]) => (
                  <div key={catName}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        marginBottom: "0.45rem",
                        display: "block",
                      }}
                    >
                      {catName}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.45rem",
                      }}
                    >
                      {skills.map((skill) => {
                        const isSelected = form.skills.includes(skill);
                        return (
                          <motion.button
                            key={skill}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => toggleSkill(skill)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.35rem",
                              padding: "0.38rem 0.85rem",
                              borderRadius: "8px",
                              border: isSelected
                                ? `1px solid ${PALETTE.primary}`
                                : "1px solid var(--voxa-card-border)",
                              backgroundColor: isSelected
                                ? PALETTE.primary
                                : "var(--voxa-card-bg)",
                              color: isSelected
                                ? "#FFFFFF"
                                : "var(--text-secondary)",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              boxShadow: isSelected
                                ? "0 2px 6px rgba(67, 56, 202, 0.28)"
                                : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isSelected && <Check size={13} />}
                            {skill}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // VIEW MODE: Only selected candidate skills displayed prominently
              <div>
                {form.skills.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.55rem",
                    }}
                  >
                    {form.skills.map((skill) => (
                      <span
                        key={skill}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.38rem",
                          padding: "0.4rem 0.9rem",
                          borderRadius: "8px",
                          backgroundColor: PALETTE.primarySoftBg,
                          border: `1px solid ${PALETTE.primarySoftBorder}`,
                          color: PALETTE.primary,
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                        }}
                      >
                        <Check size={13} style={{ color: PALETTE.success }} />
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "1.5rem",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                    }}
                  >
                    No skills selected yet. Click "Edit Profile" to add skills.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── 12. FEATURED PROJECTS ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.15rem",
              }}
            >
              <SectionHeader
                icon={Layers}
                title="Featured Projects"
                subtitle="Hands-on software and AI projects built by you"
                color={PALETTE.secondary}
                softBg={PALETTE.secondarySoftBg}
              />

              {editing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddProject(!showAddProject)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    border: `1px solid ${PALETTE.secondarySoftBorder}`,
                    backgroundColor: PALETTE.secondarySoftBg,
                    color: PALETTE.secondary,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Project
                </motion.button>
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {projects.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  Not added
                  {editing
                    ? '. Click "Add Project" above to add your projects.'
                    : ""}
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: "1.15rem",
                      borderRadius: "12px",
                      backgroundColor: PALETTE.secondarySoftBg,
                      border: "1px solid var(--voxa-card-border)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color: "var(--voxa-card-text)",
                            margin: 0,
                          }}
                        >
                          {proj.title}
                        </h4>
                        <p
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--text-secondary)",
                            lineHeight: 1.5,
                            margin: "6px 0 10px 0",
                          }}
                        >
                          {proj.description}
                        </p>

                        {/* Tech stack chips */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.4rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {proj.techStack.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                fontSize: "0.6875rem",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "6px",
                                backgroundColor: "#FFFFFF",
                                border: `1px solid ${PALETTE.primarySoftBorder}`,
                                color: PALETTE.primary,
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Project Repository / Live Demo links */}
                        <div
                          style={{
                            display: "flex",
                            gap: "0.85rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                color: PALETTE.primary,
                                textDecoration: "none",
                              }}
                            >
                              <GithubIcon size={14} /> Code Repository{" "}
                              <ExternalLink size={11} />
                            </a>
                          )}
                          {proj.liveUrl && (
                            <a
                              href={proj.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.35rem",
                                color: PALETTE.success,
                                textDecoration: "none",
                              }}
                            >
                              <Globe size={14} /> Live Demo{" "}
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {editing && (
                        <button
                          onClick={() =>
                            setProjects((curr) =>
                              curr.filter((p) => p.id !== proj.id),
                            )
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: PALETTE.danger,
                            cursor: "pointer",
                            padding: 4,
                          }}
                          title="Remove Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* In-line Add Project Form */}
            {showAddProject && editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{
                  marginTop: "1rem",
                  padding: "1.25rem",
                  borderRadius: "12px",
                  backgroundColor: PALETTE.secondarySoftBg,
                  border: `1px dashed ${PALETTE.secondarySoftBorder}`,
                }}
              >
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    marginBottom: "0.75rem",
                  }}
                >
                  Add Featured Project
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                  }}
                >
                  <input
                    placeholder="Project Name *"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject((c) => ({ ...c, title: e.target.value }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <textarea
                    placeholder="Project Description *"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject((c) => ({
                        ...c,
                        description: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ borderRadius: 8, minHeight: 70 }}
                  />
                  <input
                    placeholder="Technologies (comma separated, e.g. Python, PyTorch, React)"
                    value={projectTechInput}
                    onChange={(e) => setProjectTechInput(e.target.value)}
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.65rem",
                    }}
                  >
                    <input
                      placeholder="GitHub URL"
                      value={newProject.githubUrl}
                      onChange={(e) =>
                        setNewProject((c) => ({
                          ...c,
                          githubUrl: e.target.value,
                        }))
                      }
                      className="input"
                      style={{ borderRadius: 8 }}
                    />
                    <input
                      placeholder="Live Demo URL"
                      value={newProject.liveUrl}
                      onChange={(e) =>
                        setNewProject((c) => ({
                          ...c,
                          liveUrl: e.target.value,
                        }))
                      }
                      className="input"
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "0.5rem",
                    marginTop: "0.75rem",
                  }}
                >
                  <button
                    onClick={() => setShowAddProject(false)}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!newProject.title) {
                        toast.error("Project title is required");
                        return;
                      }
                      const stack = projectTechInput
                        ? projectTechInput
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        : ["Python"];
                      setProjects((curr) => [
                        ...curr,
                        {
                          id: Date.now().toString(),
                          title: newProject.title || "",
                          description: newProject.description || "",
                          techStack: stack,
                          githubUrl: newProject.githubUrl,
                          liveUrl: newProject.liveUrl,
                        },
                      ]);
                      setShowAddProject(false);
                      setNewProject({
                        title: "",
                        description: "",
                        githubUrl: "",
                        liveUrl: "",
                      });
                      setProjectTechInput("");
                      toast.success("Project added");
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ backgroundColor: PALETTE.secondary }}
                  >
                    Add Project
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* ====================================================
            RIGHT SIDEBAR COLUMN: Completeness, Links, Resume, Certs
        ===================================================== */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* ── 3. PROFILE COMPLETENESS CHECKLIST ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <SectionHeader
              icon={CheckCircle2}
              title="Profile Checklist"
              subtitle="Keep sections verified for top matching"
              color={PALETTE.success}
              softBg={PALETTE.successSoftBg}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
              }}
            >
              {completionStats.checks.map((chk) => (
                <div
                  key={chk.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "10px",
                    backgroundColor: chk.done
                      ? PALETTE.successSoftBg
                      : PALETTE.warningSoftBg,
                    border: chk.done
                      ? `1px solid ${PALETTE.successSoftBorder}`
                      : `1px solid ${PALETTE.warningSoftBorder}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                    }}
                  >
                    {chk.done ? (
                      <CheckCircle2
                        size={16}
                        style={{ color: PALETTE.success }}
                      />
                    ) : (
                      <AlertCircle
                        size={16}
                        style={{ color: PALETTE.warning }}
                      />
                    )}
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: "var(--voxa-card-text)",
                      }}
                    >
                      {chk.label}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      color: chk.done ? PALETTE.success : PALETTE.warning,
                    }}
                  >
                    {chk.done ? "Verified" : "Incomplete"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── 8. PROFESSIONAL LINKS ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <SectionHeader
              icon={Globe}
              title="Professional Links"
              subtitle="Showcase your code, network and portfolio"
              color={PALETTE.primary}
              softBg={PALETTE.primarySoftBg}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
              }}
            >
              {/* GitHub */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  GitHub Profile
                </label>
                <div style={{ display: "flex", gap: "0.45rem" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <GithubIcon
                      size={16}
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: PALETTE.primary,
                      }}
                    />
                    {editing ? (
                      <input
                        value={form.github}
                        onChange={(e) =>
                          setForm((c) => ({ ...c, github: e.target.value }))
                        }
                        placeholder="https://github.com/yourhandle"
                        className="input"
                        style={{
                          width: "100%",
                          paddingLeft: "2.6rem",
                          borderRadius: 10,
                        }}
                      />
                    ) : (
                      <div
                        className="input"
                        style={{
                          width: "100%",
                          paddingLeft: "2.6rem",
                          minHeight: 44,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 10,
                        }}
                      >
                        {form.github || "Not added"}
                      </div>
                    )}
                  </div>
                  {form.github && (
                    <a
                      href={form.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar-icon-pill"
                      title="Open GitHub Profile"
                      style={{ flexShrink: 0, width: 42, height: 42 }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  LinkedIn Profile
                </label>
                <div style={{ display: "flex", gap: "0.45rem" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <LinkedinIcon
                      size={16}
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: PALETTE.linkedin,
                      }}
                    />
                    {editing ? (
                      <input
                        value={form.linkedin}
                        onChange={(e) =>
                          setForm((c) => ({ ...c, linkedin: e.target.value }))
                        }
                        placeholder="https://linkedin.com/in/yourhandle"
                        className="input"
                        style={{
                          width: "100%",
                          paddingLeft: "2.6rem",
                          borderRadius: 10,
                        }}
                      />
                    ) : (
                      <div
                        className="input"
                        style={{
                          width: "100%",
                          paddingLeft: "2.6rem",
                          minHeight: 44,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 10,
                        }}
                      >
                        {form.linkedin || "Not added"}
                      </div>
                    )}
                  </div>
                  {form.linkedin && (
                    <a
                      href={form.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar-icon-pill"
                      title="Open LinkedIn Profile"
                      style={{ flexShrink: 0, width: 42, height: 42 }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>

              {/* Portfolio */}
              <div>
                <label
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--text-muted)",
                    marginBottom: 4,
                    display: "block",
                  }}
                >
                  Portfolio / Personal Website
                </label>
                <div style={{ display: "flex", gap: "0.45rem" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Globe
                      size={16}
                      style={{
                        position: "absolute",
                        left: 14,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: PALETTE.success,
                      }}
                    />
                    {editing ? (
                      <input
                        value={form.portfolio}
                        onChange={(e) =>
                          setForm((c) => ({ ...c, portfolio: e.target.value }))
                        }
                        placeholder="https://yourwebsite.com"
                        className="input"
                        style={{
                          width: "100%",
                          paddingLeft: "2.6rem",
                          borderRadius: 10,
                        }}
                      />
                    ) : (
                      <div
                        className="input"
                        style={{
                          width: "100%",
                          paddingLeft: "2.6rem",
                          minHeight: 44,
                          display: "flex",
                          alignItems: "center",
                          borderRadius: 10,
                        }}
                      >
                        {form.portfolio || "Not added"}
                      </div>
                    )}
                  </div>
                  {form.portfolio && (
                    <a
                      href={form.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navbar-icon-pill"
                      title="Open Portfolio Website"
                      style={{ flexShrink: 0, width: 42, height: 42 }}
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── 9. RESUME & DOCUMENTS CARD ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <SectionHeader
              icon={FileText}
              title="Resume & Documents"
              subtitle="Latest ATS candidate resume file"
              color={PALETTE.warning}
              softBg={PALETTE.warningSoftBg}
            />

            {form.resumeFilename ? (
              <>
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "12px",
                    backgroundColor: PALETTE.warningSoftBg,
                    border: `1px solid ${PALETTE.warningSoftBorder}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "1rem",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "8px",
                      backgroundColor: "#FDE68A",
                      color: PALETTE.warning,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileCheck size={18} />
                  </div>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "var(--voxa-card-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {form.resumeFilename}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6875rem",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      {form.resumeUploadedAt || "Uploaded file"}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Upload/Replace, View, Download */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    style={{
                      padding: "0.45rem",
                      borderRadius: "8px",
                      border: `1px solid ${PALETTE.warningSoftBorder}`,
                      backgroundColor: PALETTE.warningSoftBg,
                      color: PALETTE.warning,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Upload size={13} /> Replace Resume
                  </button>

                  <button
                    onClick={() => navigate("/resume")}
                    style={{
                      padding: "0.45rem",
                      borderRadius: "8px",
                      border: `1px solid ${PALETTE.primarySoftBorder}`,
                      backgroundColor: PALETTE.primarySoftBg,
                      color: PALETTE.primary,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Eye size={13} /> View Analysis
                  </button>
                </div>
              </>
            ) : (
              <div
                style={{
                  padding: "1.5rem 1rem",
                  borderRadius: "12px",
                  backgroundColor: PALETTE.warningSoftBg,
                  border: `1px dashed ${PALETTE.warningSoftBorder}`,
                  textAlign: "center",
                }}
              >
                <FileText
                  size={28}
                  color={PALETTE.warning}
                  style={{ margin: "0 auto 0.5rem", opacity: 0.8 }}
                />
                <div
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "var(--voxa-card-text)",
                  }}
                >
                  No resume uploaded yet
                </div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    margin: "4px 0 1rem 0",
                  }}
                >
                  Upload a resume to get automatic skill extraction and ATS
                  analysis.
                </p>
                <button
                  onClick={() => resumeInputRef.current?.click()}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 6, margin: "0 auto" }}
                >
                  <Upload size={14} /> Upload Resume
                </button>
              </div>
            )}
          </div>

          {/* ── 10. LANGUAGES CARD ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <SectionHeader
                icon={LanguagesIcon}
                title="Languages"
                subtitle="Spoken and interview communication languages"
                color={PALETTE.neutralAccent}
                softBg={PALETTE.neutralSoftBg}
              />

              {editing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddLanguage(!showAddLanguage)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    border: `1px solid ${PALETTE.neutralSoftBorder}`,
                    backgroundColor: PALETTE.neutralSoftBg,
                    color: PALETTE.neutralAccent,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Lang
                </motion.button>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {languages.length === 0 ? (
                <div
                  style={{
                    padding: "1rem 0",
                    color: "var(--text-muted)",
                    fontSize: "0.8125rem",
                  }}
                >
                  Not added
                  {editing ? '. Click "Add Lang" above to add languages.' : ""}
                </div>
              ) : (
                languages.map((lang) => (
                  <div
                    key={lang.language}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "999px",
                      backgroundColor: PALETTE.neutralSoftBg,
                      border: `1px solid ${PALETTE.neutralSoftBorder}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "var(--voxa-card-text)",
                      }}
                    >
                      {lang.language}
                    </span>
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        color: "#FFFFFF",
                        backgroundColor: PALETTE.neutralAccent,
                        padding: "1px 6px",
                        borderRadius: "6px",
                      }}
                    >
                      {lang.proficiency}
                    </span>

                    {editing && (
                      <button
                        onClick={() =>
                          setLanguages((curr) =>
                            curr.filter((l) => l.language !== lang.language),
                          )
                        }
                        style={{
                          background: "transparent",
                          border: "none",
                          color: PALETTE.danger,
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* In-line Add Language Drawer */}
            {showAddLanguage && editing && (
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "0.85rem",
                  borderRadius: "10px",
                  backgroundColor: PALETTE.neutralSoftBg,
                  border: `1px dashed ${PALETTE.neutralSoftBorder}`,
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <input
                  placeholder="Language (e.g. Spanish)"
                  value={newLang.language}
                  onChange={(e) =>
                    setNewLang((c) => ({ ...c, language: e.target.value }))
                  }
                  className="input"
                  style={{ flex: 1, borderRadius: 8 }}
                />
                <select
                  value={newLang.proficiency}
                  onChange={(e) =>
                    setNewLang((c) => ({ ...c, proficiency: e.target.value }))
                  }
                  className="input"
                  style={{ borderRadius: 8, width: 120 }}
                >
                  {PROFICIENCY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!newLang.language?.trim()) return;
                    setLanguages((curr) => [
                      ...curr,
                      {
                        language: newLang.language || "",
                        proficiency: newLang.proficiency || "Fluent",
                      },
                    ]);
                    setNewLang({ language: "", proficiency: "Fluent" });
                    setShowAddLanguage(false);
                    toast.success("Language added");
                  }}
                  className="btn btn-primary btn-sm"
                  style={{
                    backgroundColor: PALETTE.neutralAccent,
                    borderRadius: 8,
                  }}
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* ── 11. CERTIFICATIONS & ACHIEVEMENTS ── */}
          <div
            className="voxa-card"
            style={{
              padding: "1.5rem",
              borderRadius: "16px",
              backgroundColor: "var(--voxa-card-bg)",
              border: "1px solid var(--voxa-card-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <SectionHeader
                icon={Award}
                title="Certifications"
                subtitle="Industry verified credentials"
                color={PALETTE.success}
                softBg={PALETTE.successSoftBg}
              />

              {editing && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAddCertification(!showAddCertification)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.35rem 0.85rem",
                    borderRadius: "8px",
                    border: `1px solid ${PALETTE.successSoftBorder}`,
                    backgroundColor: PALETTE.successSoftBg,
                    color: PALETTE.success,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Plus size={14} /> Add Cert
                </motion.button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {certifications.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1.5rem",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  Not added
                  {editing
                    ? '. Click "Add Cert" above to add your certifications.'
                    : ""}
                </div>
              ) : (
                certifications.map((cert) => (
                  <div
                    key={cert.id}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: "10px",
                      backgroundColor: PALETTE.successSoftBg,
                      border: "1px solid var(--voxa-card-border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.8125rem",
                          fontWeight: 700,
                          color: "var(--voxa-card-text)",
                        }}
                      >
                        {cert.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.6875rem",
                          color: "var(--text-muted)",
                          marginTop: "2px",
                        }}
                      >
                        {cert.issuer} • Issued {cert.issueDate}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: PALETTE.success, display: "flex" }}
                          title="Verify Credential"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {editing && (
                        <button
                          onClick={() =>
                            setCertifications((curr) =>
                              curr.filter((c) => c.id !== cert.id),
                            )
                          }
                          style={{
                            background: "transparent",
                            border: "none",
                            color: PALETTE.danger,
                            cursor: "pointer",
                            padding: 2,
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* In-line Add Certification Drawer */}
            {showAddCertification && editing && (
              <div
                style={{
                  marginTop: "0.85rem",
                  padding: "1rem",
                  borderRadius: "10px",
                  backgroundColor: PALETTE.successSoftBg,
                  border: `1px dashed ${PALETTE.successSoftBorder}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    placeholder="Certification Name *"
                    value={newCert.name}
                    onChange={(e) =>
                      setNewCert((c) => ({ ...c, name: e.target.value }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                    }}
                  >
                    <input
                      placeholder="Issuer (e.g. Google)"
                      value={newCert.issuer}
                      onChange={(e) =>
                        setNewCert((c) => ({ ...c, issuer: e.target.value }))
                      }
                      className="input"
                      style={{ borderRadius: 8 }}
                    />
                    <input
                      placeholder="Year (e.g. 2024)"
                      value={newCert.issueDate}
                      onChange={(e) =>
                        setNewCert((c) => ({ ...c, issueDate: e.target.value }))
                      }
                      className="input"
                      style={{ borderRadius: 8 }}
                    />
                  </div>
                  <input
                    placeholder="Verification URL (optional)"
                    value={newCert.credentialUrl}
                    onChange={(e) =>
                      setNewCert((c) => ({
                        ...c,
                        credentialUrl: e.target.value,
                      }))
                    }
                    className="input"
                    style={{ borderRadius: 8 }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.5rem",
                      marginTop: "0.35rem",
                    }}
                  >
                    <button
                      onClick={() => setShowAddCertification(false)}
                      className="btn btn-ghost btn-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!newCert.name) {
                          toast.error("Certification name is required");
                          return;
                        }
                        setCertifications((curr) => [
                          ...curr,
                          {
                            id: Date.now().toString(),
                            name: newCert.name || "",
                            issuer: newCert.issuer || "Industry Standard",
                            issueDate: newCert.issueDate || "2024",
                            credentialUrl: newCert.credentialUrl,
                          },
                        ]);
                        setShowAddCertification(false);
                        setNewCert({
                          name: "",
                          issuer: "",
                          issueDate: "",
                          credentialUrl: "",
                        });
                        toast.success("Certification added");
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ backgroundColor: PALETTE.success }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          13. RECRUITER PROFILE PREVIEW MODAL
      ===================================================== */}
      <AnimatePresence>
        {previewOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              backgroundColor: "rgba(15, 23, 42, 0.72)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.25rem",
            }}
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="voxa-card"
              style={{
                maxWidth: 820,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "2rem",
                borderRadius: "18px",
                backgroundColor: "var(--voxa-card-bg)",
                border: "1px solid var(--voxa-card-border)",
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.35)",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--voxa-card-border)",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: PALETTE.success,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Recruiter View • Verified Candidate Dossier
                  </span>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      margin: "2px 0 0 0",
                    }}
                  >
                    {form.name} — Candidate Profile
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href);
                      toast.success("Profile link copied to clipboard");
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: 4 }}
                  >
                    <Share2 size={14} /> Share
                  </button>
                  <button
                    onClick={() => setPreviewOpen(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Dossier Body */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                {/* Hero Summary */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      backgroundColor: PALETTE.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#FFFFFF",
                      fontSize: "1.65rem",
                      fontWeight: 700,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt={form.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      getInitials(form.name || "C")
                    )}
                  </div>

                  <div>
                    <h4
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        margin: 0,
                      }}
                    >
                      {form.name}
                    </h4>
                    <p
                      style={{
                        color: PALETTE.primary,
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        margin: "2px 0 4px 0",
                      }}
                    >
                      {form.headline}
                    </p>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        display: "flex",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>📍 {form.location}</span>
                      <span>🎓 {form.college}</span>
                      <span>💼 {form.experience}</span>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h5
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Executive Summary
                  </h5>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      color: "var(--voxa-card-text)",
                      margin: 0,
                    }}
                  >
                    {form.about}
                  </p>
                </div>

                {/* Candidate Skills */}
                <div>
                  <h5
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Verified Technical Capabilities
                  </h5>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.45rem",
                    }}
                  >
                    {form.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          padding: "0.35rem 0.75rem",
                          borderRadius: "8px",
                          backgroundColor: PALETTE.primarySoftBg,
                          border: `1px solid ${PALETTE.primarySoftBorder}`,
                          color: PALETTE.primary,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h5
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Education
                  </h5>
                  {educations.map((e) => (
                    <div
                      key={e.id}
                      style={{ fontSize: "0.85rem", marginBottom: 4 }}
                    >
                      <strong style={{ color: "var(--voxa-card-text)" }}>
                        {e.degree} in {e.fieldOfStudy}
                      </strong>{" "}
                      — {e.college} ({e.graduationYear})
                    </div>
                  ))}
                </div>

                {/* Projects */}
                <div>
                  <h5
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Key Projects
                  </h5>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                    }}
                  >
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: 10,
                          backgroundColor: "var(--voxa-card-bg)",
                          border: "1px solid var(--voxa-card-border)",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>
                          {p.title}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-secondary)",
                            marginTop: 2,
                          }}
                        >
                          {p.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  marginTop: "2rem",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "0.75rem",
                }}
              >
                <button
                  onClick={() => setPreviewOpen(false)}
                  className="btn btn-ghost"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => {
                    toast.success("Simulated recruiter inquiry logged!");
                    setPreviewOpen(false);
                  }}
                  className="btn btn-primary"
                  style={{ backgroundColor: PALETTE.success, border: "none" }}
                >
                  Simulate Recruiter Contact
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .avatar-camera-overlay:hover {
          opacity: 1 !important;
        }

        @media (max-width: 980px) {
          .profile-main-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .field-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

// ── Reusable Section Header Component ──
function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color,
  softBg,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  softBg?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: "10px",
          backgroundColor: softBg || "#F1F5F9",
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={19} />
      </div>
      <div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--voxa-card-text)",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          {subtitle}
        </span>
      </div>
    </div>
  );
}

// ── Helper to render consistent input/view fields with Validation ──
function renderField({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder = "",
  required = false,
  type = "text",
  error,
  editing,
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  icon: LucideIcon;
  placeholder?: string;
  required?: boolean;
  type?: string;
  error?: string;
  editing: boolean;
}) {
  const isValid = required && value.trim() && !error;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.45rem",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "var(--text-muted)",
          }}
        >
          {label}
          {required && <span style={{ color: "#B91C1C" }}>*</span>}
        </label>

        {editing && isValid && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              fontSize: "0.6875rem",
              color: "#047857",
              fontWeight: 700,
            }}
          >
            <Check size={12} /> Valid
          </span>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <Icon
          size={16}
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: error ? "#B91C1C" : "#4338CA",
            zIndex: 1,
          }}
        />

        {editing ? (
          <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            className="input"
            style={{
              width: "100%",
              paddingLeft: "2.6rem",
              borderRadius: 10,
              minHeight: 46,
              borderColor: error ? "#B91C1C" : isValid ? "#A7F3D0" : undefined,
            }}
          />
        ) : (
          <div
            className="input"
            style={{
              width: "100%",
              paddingLeft: "2.6rem",
              minHeight: 46,
              display: "flex",
              alignItems: "center",
              borderRadius: 10,
              color: value ? "var(--voxa-card-text)" : "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            {value || "Not added"}
          </div>
        )}
      </div>

      {editing && error && (
        <span
          style={{
            fontSize: "0.6875rem",
            color: "#B91C1C",
            marginTop: 4,
            display: "block",
            fontWeight: 600,
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
