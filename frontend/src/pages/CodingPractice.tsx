import CodingProblemCard from '@/components/practice/coding/CodingProblemCard';
import LanguageSelector from '@/components/practice/coding/LanguageSelector';
import PracticeNavigation from '@/components/practice/PracticeNavigation';
import { codingProblems } from '@/data/coding/problems';
import { SupportedLanguage } from '@/types/coding';
import { motion } from 'framer-motion';
import {
  Award,
  CheckCircle2,
  Code2,
  Filter,
  Flame,
  HelpCircle,
  Search,
  Terminal,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

const TOPIC_OPTIONS = [
  'All Topics',
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Two Pointers',
  'Stack',
  'Linked List',
  'Sorting',
  'Sliding Window',
];

export default function CodingPractice() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');

  // Solved problems stored in localStorage
  const solvedProblemIds = useMemo(() => {
    try {
      const stored = localStorage.getItem('ib_solved_coding_problems');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const filteredProblems = useMemo(() => {
    return codingProblems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.number.toString().includes(searchQuery) ||
        problem.topics.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesDifficulty =
        selectedDifficulty === 'all' ||
        problem.difficulty === selectedDifficulty;

      const matchesTopic =
        selectedTopic === 'All Topics' ||
        problem.topics.includes(selectedTopic);

      const isSolved = solvedProblemIds.includes(problem.id);
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'solved' && isSolved) ||
        (selectedStatus === 'unsolved' && !isSolved);

      return (
        matchesSearch && matchesDifficulty && matchesTopic && matchesStatus
      );
    });
  }, [
    searchQuery,
    selectedDifficulty,
    selectedTopic,
    selectedStatus,
    solvedProblemIds,
  ]);

  return (
    <div className="practice-subpage max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <PracticeNavigation
        title="Coding Practice"
        subtitle="Sharpen your problem-solving skills with hands-on coding challenges."
        badge="ALGORITHM CHALLENGES"
        actions={
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onSelectLanguage={setSelectedLanguage}
          />
        }
      />

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs text-center transition-all duration-200 hover:shadow-md hover:border-[#2196F3]/50">
          <div className="text-xl sm:text-2xl font-black text-[#0D47A1]">
            {codingProblems.length}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            Total Problems
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs text-center transition-all duration-200 hover:shadow-md hover:border-emerald-500/50">
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {solvedProblemIds.length}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            Solved Problems
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs text-center transition-all duration-200 hover:shadow-md hover:border-[#2196F3]/50">
          <div className="text-xl sm:text-2xl font-black text-[#2196F3]">
            7
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            Languages (C, C++, Java, Py...)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#90CAF9]/40 shadow-xs text-center transition-all duration-200 hover:shadow-md hover:border-[#2196F3]/50">
          <div className="text-xl sm:text-2xl font-black text-[#0D47A1]">
            5
          </div>
          <div className="text-xs text-slate-500 font-medium mt-0.5">
            Company Tags
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2196F3] pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by name or topic..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#90CAF9]/40 shadow-xs transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Difficulty */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#90CAF9]/40 cursor-pointer shadow-xs transition-all"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Solved Status */}
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as 'all' | 'solved' | 'unsolved')
            }
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#90CAF9] text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-[#2196F3] focus:ring-2 focus:ring-[#90CAF9]/40 cursor-pointer shadow-xs transition-all"
          >
            <option value="all">All Status</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="overflow-x-auto no-scrollbar py-1 mb-6">
        <div className="flex items-center gap-2 min-w-max">
          {TOPIC_OPTIONS.map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setSelectedTopic(topic)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2196F3] text-white shadow-xs shadow-[#2196F3]/30 font-bold'
                    : 'bg-white text-slate-600 hover:text-[#0D47A1] hover:bg-[#E3F2FD] border border-slate-200 hover:border-[#90CAF9]'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Problem Listing Table */}
      <div className="bg-white rounded-3xl border border-[#90CAF9]/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#90CAF9]/30 bg-[#F8FCFF] text-xs font-bold text-[#0D47A1] uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">Status</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Topics</th>
                <th className="py-3.5 px-4 hidden sm:table-cell">Acceptance</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem) => (
                  <CodingProblemCard
                    key={problem.id}
                    problem={problem}
                    isSolved={solvedProblemIds.includes(problem.id)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-500">
                    <HelpCircle size={32} className="mx-auto mb-2 text-[#2196F3]" />
                    <p className="font-bold text-sm text-[#0D47A1]">
                      No problems match your filters.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Try clearing your search query or selecting a different topic.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
