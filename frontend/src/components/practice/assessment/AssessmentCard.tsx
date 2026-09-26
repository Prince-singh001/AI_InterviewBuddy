import { Assessment } from "@/types/assessment";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

interface AssessmentCardProps {
  assessment: Assessment;
  attempted?: boolean;
  score?: number;
}

export default function AssessmentCard({
  assessment,
  attempted = false,
  score,
}: AssessmentCardProps) {
  const getDifficultyStyles = (difficulty: "Easy" | "Medium" | "Hard") => {
    switch (difficulty) {
      case "Easy":
        return {
          wrapper: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
        };

      case "Medium":
        return {
          wrapper: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
        };

      case "Hard":
        return {
          wrapper: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
        };

      default:
        return {
          wrapper: "bg-[#E3F2FD] text-[#0D47A1] border-[#90CAF9]",
          dot: "bg-[#2196F3]",
        };
    }
  };

  const difficultyStyles = getDifficultyStyles(assessment.difficulty);

  const questionCount =
    assessment.questions?.length && assessment.questions.length > 0
      ? assessment.questions.length
      : null;

  const duration =
    assessment.durationMinutes || assessment.duration
      ? assessment.durationMinutes || assessment.duration
      : null;

  const attempts =
    assessment.attemptsCount !== undefined ? assessment.attemptsCount : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        group
        relative
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-[#90CAF9]/45
        bg-white
        shadow-[0_4px_18px_rgba(13,71,161,0.07)]
        transition-all
        duration-300
        hover:border-[#2196F3]/50
        hover:shadow-[0_14px_38px_rgba(33,150,243,0.14)]
      "
    >
      {/* ------------------------------------------------
          Decorative Background
      ------------------------------------------------ */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-[#E3F2FD]
          opacity-80
          blur-3xl
          transition-transform
          duration-700
          group-hover:scale-125
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          h-24
          w-24
          rounded-full
          bg-[#90CAF9]/10
          blur-2xl
        "
      />

      {/* Top Accent */}
      <div
        aria-hidden="true"
        className="
          absolute
          left-0
          right-0
          top-0
          h-1
          bg-gradient-to-r
          from-[#90CAF9]
          via-[#2196F3]
          to-[#0D47A1]
          opacity-0
          transition-opacity
          duration-300
          group-hover:opacity-100
        "
      />

      {/* ------------------------------------------------
          Card Content
      ------------------------------------------------ */}
      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          {/* Category */}
          <span
            className="
              inline-flex
              max-w-[62%]
              items-center
              truncate
              rounded-full
              border
              border-[#90CAF9]/70
              bg-[#E3F2FD]
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              tracking-wide
              text-[#0D47A1]
              sm:text-xs
            "
            title={assessment.category}
          >
            {assessment.category}
          </span>

          {/* Difficulty */}
          <span
            className={`
              inline-flex
              shrink-0
              items-center
              gap-1.5
              rounded-full
              border
              px-2.5
              py-1
              text-[10px]
              font-bold
              sm:text-xs
              ${difficultyStyles.wrapper}
            `}
          >
            <span
              className={`
                h-1.5
                w-1.5
                rounded-full
                ${difficultyStyles.dot}
              `}
            />

            {assessment.difficulty}
          </span>
        </div>

        {/* Title */}
        <div className="mt-4">
          <h3
            className="
              line-clamp-2
              min-h-[3.25rem]
              text-base
              font-bold
              leading-6
              text-[#0D47A1]
              transition-colors
              duration-200
              group-hover:text-[#2196F3]
              sm:text-lg
              sm:leading-7
            "
          >
            {assessment.title}
          </h3>

          <p
            className="
              mt-2
              line-clamp-3
              min-h-[3.75rem]
              text-xs
              leading-5
              text-slate-500
              sm:text-sm
              sm:leading-5
            "
          >
            {assessment.description ||
              "Test your knowledge and improve your interview preparation with this assessment."}
          </p>
        </div>

        {/* ------------------------------------------------
            Assessment Information
        ------------------------------------------------ */}
        <div
          className="
            mt-5
            grid
            grid-cols-3
            gap-2
            border-y
            border-[#90CAF9]/30
            py-3
            sm:mt-6
            sm:gap-3
            sm:py-4
          "
        >
          {/* Questions */}
          <div
            className="
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-[#90CAF9]/35
              bg-[#E3F2FD]/45
              px-1.5
              py-2.5
              transition-all
              duration-200
              group-hover:bg-[#E3F2FD]/70
              sm:px-2
              sm:py-3
            "
          >
            <HelpCircle size={16} strokeWidth={2} className="text-[#2196F3]" />

            <span
              className="
                mt-1.5
                text-[10px]
                font-bold
                text-[#0D47A1]
                sm:text-xs
              "
            >
              {questionCount !== null ? questionCount : "—"}
            </span>

            <span
              className="
                mt-0.5
                text-[9px]
                font-medium
                text-slate-500
                sm:text-[10px]
              "
            >
              Questions
            </span>
          </div>

          {/* Duration */}
          <div
            className="
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-[#90CAF9]/35
              bg-[#E3F2FD]/45
              px-1.5
              py-2.5
              transition-all
              duration-200
              group-hover:bg-[#E3F2FD]/70
              sm:px-2
              sm:py-3
            "
          >
            <Clock3 size={16} strokeWidth={2} className="text-[#2196F3]" />

            <span
              className="
                mt-1.5
                text-[10px]
                font-bold
                text-[#0D47A1]
                sm:text-xs
              "
            >
              {duration !== null ? duration : "—"}
            </span>

            <span
              className="
                mt-0.5
                text-[9px]
                font-medium
                text-slate-500
                sm:text-[10px]
              "
            >
              Minutes
            </span>
          </div>

          {/* Attempts */}
          <div
            className="
              flex
              min-w-0
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-[#90CAF9]/35
              bg-[#E3F2FD]/45
              px-1.5
              py-2.5
              transition-all
              duration-200
              group-hover:bg-[#E3F2FD]/70
              sm:px-2
              sm:py-3
            "
          >
            <Users size={16} strokeWidth={2} className="text-[#2196F3]" />

            <span
              className="
                mt-1.5
                max-w-full
                truncate
                text-[10px]
                font-bold
                text-[#0D47A1]
                sm:text-xs
              "
            >
              {attempts !== null ? attempts : "—"}
            </span>

            <span
              className="
                mt-0.5
                text-[9px]
                font-medium
                text-slate-500
                sm:text-[10px]
              "
            >
              Attempts
            </span>
          </div>
        </div>

        {/* ------------------------------------------------
            Attempted / Score
        ------------------------------------------------ */}
        {attempted && (
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              gap-3
              rounded-xl
              border
              border-[#90CAF9]/45
              bg-gradient-to-r
              from-[#E3F2FD]
              to-white
              px-3
              py-2.5
              sm:px-4
              sm:py-3
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#2196F3]/10
                "
              >
                <CheckCircle2 size={15} className="text-[#2196F3]" />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[10px]
                    font-bold
                    text-[#0D47A1]
                    sm:text-xs
                  "
                >
                  Assessment Attempted
                </p>

                <p
                  className="
                    text-[9px]
                    text-slate-500
                    sm:text-[10px]
                  "
                >
                  You can retake this assessment
                </p>
              </div>
            </div>

            {score !== undefined && (
              <div className="shrink-0 text-right">
                <p className="text-[9px] font-medium text-slate-500">Score</p>

                <p
                  className="
                    text-base
                    font-extrabold
                    text-[#0D47A1]
                    sm:text-lg
                  "
                >
                  {score}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------
            Action
        ------------------------------------------------ */}
        <div className="mt-auto pt-5 sm:pt-6">
          <Link
            to={`/practice/assessment/${assessment.id}`}
            aria-label={
              attempted
                ? `Retake ${assessment.title}`
                : `Start ${assessment.title}`
            }
            className="
              group/button
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-[#2196F3]
              px-4
              py-3
              text-xs
              font-bold
              text-white
              shadow-[0_5px_15px_rgba(33,150,243,0.18)]
              transition-all
              duration-200
              hover:bg-[#0D47A1]
              hover:shadow-[0_8px_22px_rgba(13,71,161,0.22)]
              focus:outline-none
              focus:ring-2
              focus:ring-[#2196F3]/40
              focus:ring-offset-2
              active:scale-[0.98]
              sm:py-3.5
              sm:text-sm
            "
          >
            <span>{attempted ? "Retake Assessment" : "Start Assessment"}</span>

            <ArrowRight
              size={16}
              strokeWidth={2.5}
              className="
                transition-transform
                duration-200
                group-hover/button:translate-x-1
              "
            />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
