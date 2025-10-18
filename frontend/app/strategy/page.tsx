'use client';

import { useState, useEffect } from 'react';
import { strategyApi, dataApi } from '@/lib/api';
import { SelfEvaluationCard } from '@/components/SelfEvaluationCard';
import { RichTextEditor } from '@/components/RichTextEditor';
import { ContentGallery } from '@/components/ContentGallery';
import { Loader2, ArrowLeft, Sparkles, ChevronDown, Brain, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatStrategyToHTML } from '@/lib/strategyFormatter';
import type { StrategyContent, SelfEvaluation } from '@/lib/types';

interface Source {
  title: string;
  url: string;
  snippet?: string;
}

interface Student {
  id: string;
  name: string;
  grade: string;
  subject: string;
  learning_style: string;
}

interface Tutor {
  id: string;
  name: string;
  teaching_style: string;
  education_system: string;
}

export default function StrategyPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [strategy, setStrategy] = useState<StrategyContent | null>(null);
  const [evaluation, setEvaluation] = useState<SelfEvaluation | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [strategyId, setStrategyId] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [pastStrategies, setPastStrategies] = useState<any[]>([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    tutor_id: '',
    subject: 'Physics',
    weeks: 4,
  });

  // Load students and tutors on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentsRes, tutorsRes] = await Promise.all([
          dataApi.getStudents(),
          dataApi.getTutors(),
        ]);
        setStudents(studentsRes.students || []);
        setTutors(tutorsRes.tutors || []);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Load past strategies when student is selected
  useEffect(() => {
    const loadStrategies = async () => {
      if (!formData.student_id) {
        setPastStrategies([]);
        return;
      }
      
      setLoadingStrategies(true);
      try {
        const response = await dataApi.getStrategies(formData.student_id);
        setPastStrategies(response.strategies || []);
      } catch (error) {
        console.error('Failed to load past strategies:', error);
      } finally {
        setLoadingStrategies(false);
      }
    };
    loadStrategies();
  }, [formData.student_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStrategy(null);
    setEvaluation(null);

    try {
      const response = await strategyApi.create(formData);
      setStrategy(response.content);
      setEvaluation(response.evaluation);
      setSources(response.sources || []);
      setStrategyId(response.strategy_id);
    } catch (error) {
      console.error('Failed to create strategy:', error);
      alert('Failed to create strategy. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === formData.student_id);
  const selectedTutor = tutors.find((t) => t.id === formData.tutor_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-8 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-xl shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Strategy Planner</h1>
                  <p className="text-xs text-gray-500">Generate personalized learning strategies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student & Tutor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Student
                </label>
                <div className="relative">
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    disabled={loadingData}
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Choose a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} - Grade {student.grade}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {selectedStudent && (
                  <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-900">
                      <span className="font-semibold">Learning Style:</span> {selectedStudent.learning_style}
                    </p>
                    <p className="text-xs text-red-900 mt-1">
                      <span className="font-semibold">Subject:</span> {selectedStudent.subject}
                    </p>
                  </div>
                )}
              </div>

              {/* Tutor Dropdown */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Tutor
                </label>
                <div className="relative">
                  <select
                    value={formData.tutor_id}
                    onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
                    disabled={loadingData}
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Choose a tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name} - {tutor.education_system}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
                {selectedTutor && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-900">
                      <span className="font-semibold">Teaching Style:</span> {selectedTutor.teaching_style}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Subject & Weeks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Mathematics">Mathematics</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Weeks
                </label>
                <input
                  type="number"
                  value={formData.weeks}
                  onChange={(e) => setFormData({ ...formData, weeks: parseInt(e.target.value) })}
                  min="1"
                  max="12"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loadingData}
              className="w-full px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Strategy (~40-50 sec)...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate 4-Week Strategy
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading Animation */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Generating Your Strategy...
            </h3>
            <div className="space-y-3 text-sm text-gray-600 max-w-md mx-auto">
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Retrieving 150+ sources from Perplexity
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-200" />
                Generating pedagogical strategy with LearnLM
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-400" />
                Running self-evaluation
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {strategy && !loading && (
          <>
            {/* Topics Overview */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{strategy.weeks}-Week Strategy Overview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategy.topics && strategy.topics.map((topic: string, index: number) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{topic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources from Perplexity */}
            {sources && sources.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Knowledge Sources</h2>
                    <p className="text-sm text-gray-500">
                      {sources.length} credible sources from Perplexity
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sources.slice(0, 12).map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ExternalLink className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {source.title || `Source ${index + 1}`}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{source.url}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Collaborative Canvas with Rich Text Editor */}
            {strategy && strategyId && formData.tutor_id && (
              <RichTextEditor
                initialContent={formatStrategyToHTML(strategy.content)}
                onSave={async (content) => {
                  setSaving(true);
                  try {
                    await strategyApi.saveVersion({
                      content_type: 'strategy',
                      content_id: strategyId,
                      content: { content, format: 'html' },
                      changes_summary: 'Tutor edited strategy',
                      edit_notes: editNotes,
                      tutor_id: formData.tutor_id,
                    });
                    alert('✅ Saved successfully! Your edits will help the AI improve future generations.');
                    setEditNotes('');
                  } catch (error) {
                    alert('Failed to save. Please try again.');
                  } finally {
                    setSaving(false);
                  }
                }}
                editNotes={editNotes}
                onEditNotesChange={setEditNotes}
                saving={saving}
              />
            )}

            {/* Self-Evaluation */}
            {evaluation && <SelfEvaluationCard evaluation={evaluation} agentName="Strategy Planner" />}
          </>
        )}

        {/* Past Strategies Gallery */}
        {formData.student_id && (
          <ContentGallery
            title="Past Strategies"
            items={pastStrategies}
            type="strategy"
            loading={loadingStrategies}
            onItemClick={(item) => {
              setStrategy(item.content);
              setStrategyId(item.id);
              setEvaluation(item.self_evaluation || null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            emptyMessage="No strategies yet. Generate your first one above!"
          />
        )}
      </div>
    </div>
  );
}
