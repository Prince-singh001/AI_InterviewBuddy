import AssessmentCard from '@/components/practice/assessment/AssessmentCard';
import CompanyCodingCard from '@/components/practice/company/CompanyCodingCard';
import CompanyHeader from '@/components/practice/company/CompanyHeader';
import CompanyQuestionCard from '@/components/practice/company/CompanyQuestionCard';
import CompanyTabs, {
  CompanyTabKey,
} from '@/components/practice/company/CompanyTabs';
import CompanyTimeline from '@/components/practice/company/CompanyTimeline';
import PracticeNavigation from '@/components/practice/PracticeNavigation';
import StickyBackButton from '@/components/practice/StickyBackButton';
import { getAssessmentsByCompany } from '@/data/assessments';
import { getCodingProblemsByCompany } from '@/data/coding/problems';
import {
  defaultCompanyRounds,
  getCompanyBySlug,
  getQuestionsByCompany,
} from '@/data/company/companies';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  FileCheck,
  HelpCircle,
  Search,
  Target,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

export default function CompanyPracticeDetails() {
  const { company: companySlug } = useParams<{ company: string }>();
  const [activeTab, setActiveTab] = useState<CompanyTabKey>('overview');

  const company = getCompanyBySlug(companySlug || 'google');

  // Search & filters for Previous Questions
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('all');
  const [questionTopic, setQuestionTopic] = useState('all');

  // Data queries
  const companyQuestions = useMemo(() => {
    return getQuestionsByCompany(companySlug || 'google');
  }, [companySlug]);

  const companyCodingProblems = useMemo(() => {
    return getCodingProblemsByCompany(company?.name || 'Google');
  }, [company?.name]);

  const companyAssessments = useMemo(() => {
    return getAssessmentsByCompany(companySlug || 'google');
  }, [companySlug]);

  if (!company) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="p-8 rounded-3xl bg-white border border-[#90CAF9]/40 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#E3F2FD] text-[#2196F3] border border-[#90CAF9] flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-[#0D47A1] mb-2">
            Company Profile Not Found
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            The requested company profile does not exist or has been updated.
          </p>
          <Link
            to="/practice/company"
            className="px-5 py-2.5 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-semibold text-sm transition-all shadow-xs"
          >
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  // Filtered Questions
  const filteredQuestions = companyQuestions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesDiff =
      questionDifficulty === 'all' || q.difficulty === questionDifficulty;
    const matchesTopic =
      questionTopic === 'all' || q.topic.includes(questionTopic);
    return matchesSearch && matchesDiff && matchesTopic;
  });

  return (
    <div className="practice-subpage max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Sticky Back Button */}
      <StickyBackButton
        label="Back to Company Practice"
        to="/practice/company"
      />

      {/* Company Header Banner */}
      <CompanyHeader company={company} />

      {/* Navigation Tabs */}
      <CompanyTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        questionCount={company.questionCount}
        codingCount={company.codingCount}
        assessmentCount={company.assessmentCount}
      />

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setActiveTab('questions')}
              className="p-5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[#2196F3] mb-2">
                <HelpCircle size={18} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/50">
                  Reported
                </span>
              </div>
              <div className="text-2xl font-black text-[#0D47A1]">
                {company.questionCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Previous Questions
              </div>
            </div>

            <div
              onClick={() => setActiveTab('coding')}
              className="p-5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[#2196F3] mb-2">
                <Code2 size={18} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/50">
                  Hands-on
                </span>
              </div>
              <div className="text-2xl font-black text-[#0D47A1]">
                {company.codingCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Coding Problems
              </div>
            </div>

            <div
              onClick={() => setActiveTab('assessment')}
              className="p-5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[#2196F3] mb-2">
                <ClipboardCheck size={18} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/50">
                  Timed
                </span>
              </div>
              <div className="text-2xl font-black text-[#0D47A1]">
                {company.assessmentCount}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Online Assessments
              </div>
            </div>

            <div
              onClick={() => setActiveTab('rounds')}
              className="p-5 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs hover:border-[#2196F3] hover:shadow-md cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[#2196F3] mb-2">
                <Award size={18} />
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/50">
                  Roadmap
                </span>
              </div>
              <div className="text-2xl font-black text-[#0D47A1]">
                5 Stages
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Interview Rounds
              </div>
            </div>
          </div>

          {/* Deep Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Difficulty Distribution & Popular Topics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Preparation Progress */}
              <div className="p-6 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-[#0D47A1]">
                    Overall Preparation Progress
                  </h3>
                  <span className="text-sm font-extrabold text-[#2196F3]">
                    {company.prepProgress}% Completed
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#E3F2FD] rounded-full overflow-hidden mb-3 border border-[#90CAF9]/30">
                  <div
                    className="h-full bg-[#2196F3] rounded-full transition-all duration-500"
                    style={{ width: `${company.prepProgress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Complete coding challenges and assessments to elevate your readiness for {company.name}.
                </p>
              </div>

              {/* Difficulty Distribution */}
              <div className="p-6 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs">
                <h3 className="font-bold text-sm text-[#0D47A1] mb-4">
                  Question Difficulty Distribution
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-emerald-700">
                        Easy
                      </span>
                      <span className="font-mono text-slate-500">
                        {company.difficultyDistribution.easy}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${company.difficultyDistribution.easy}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-amber-700">
                        Medium
                      </span>
                      <span className="font-mono text-slate-500">
                        {company.difficultyDistribution.medium}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${company.difficultyDistribution.medium}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-rose-700">
                        Hard
                      </span>
                      <span className="font-mono text-slate-500">
                        {company.difficultyDistribution.hard}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{
                          width: `${company.difficultyDistribution.hard}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Popular Topics & Recommended Practice */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs">
                <h3 className="font-bold text-sm text-[#0D47A1] mb-3">
                  High-Frequency Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {company.popularTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#E3F2FD] text-[#0D47A1] border border-[#90CAF9]/40"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#E3F2FD] to-white border border-[#90CAF9] text-[#0D47A1] shadow-xs">
                <Zap size={20} className="mb-2 text-[#2196F3]" />
                <h3 className="font-extrabold text-base mb-1">
                  Ready to test your skills?
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Take the {company.name} Online Assessment simulation to get instant AI scoring and time analysis.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('assessment')}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2196F3] hover:bg-[#0D47A1] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Start {company.shortName} Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Previous Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2196F3] pointer-events-none"
              />
              <input
                type="text"
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                placeholder="Search reported questions..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#2196F3]/20 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={questionDifficulty}
                onChange={(e) => setQuestionDifficulty(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-[#90CAF9] text-xs font-semibold text-slate-700 focus:border-[#2196F3] cursor-pointer shadow-xs"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {filteredQuestions.length > 0 ? (
            <div className="space-y-3">
              {filteredQuestions.map((q) => (
                <CompanyQuestionCard key={q.id} question={q} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#90CAF9]/40 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E3F2FD] text-[#2196F3] border border-[#90CAF9] flex items-center justify-center mx-auto mb-3">
                <HelpCircle size={26} />
              </div>
              <h3 className="font-bold text-sm text-[#0D47A1]">
                No questions added yet.
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Company-specific practice content will appear here once available.
              </p>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs flex items-center justify-between text-xs text-slate-500">
            <span>Showing 1 to {filteredQuestions.length} of {company.questionCount} questions</span>
            <div className="flex items-center gap-1">
              <button disabled className="px-3 py-1 rounded-lg border border-slate-200 opacity-40">Previous</button>
              <button className="px-3 py-1 rounded-lg bg-[#2196F3] text-white font-bold">1</button>
              <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-[#E3F2FD] text-slate-700">2</button>
              <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-[#E3F2FD] text-slate-700">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Coding */}
      {activeTab === 'coding' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#0D47A1]">
                {company.name} Coding Challenges
              </h3>
              <p className="text-xs text-slate-500">
                Problems frequently asked in {company.name} technical and online assessment rounds
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyCodingProblems.map((prob) => (
              <CompanyCodingCard key={prob.id} problem={prob} />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Assessment */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-base text-[#0D47A1]">
              {company.name} Mock Assessments
            </h3>
            <p className="text-xs text-slate-500">
              Timed simulation tests mirroring standard OA hiring benchmarks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companyAssessments.map((ass) => (
              <AssessmentCard key={ass.id} assessment={ass} />
            ))}
          </div>
        </div>
      )}

      {/* Tab: Interview Rounds Timeline */}
      {activeTab === 'rounds' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-base text-[#0D47A1]">
              Typical Hiring Process for {company.name}
            </h3>
            <p className="text-xs text-slate-500">
              Stage-by-stage hiring roadmap with key focus areas and preparation recommendations
            </p>
          </div>

          <CompanyTimeline
            rounds={defaultCompanyRounds}
            companyName={company.name}
          />
        </div>
      )}
    </div>
  );
}
