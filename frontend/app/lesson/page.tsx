'use client';

import { useState, useEffect } from 'react';
import { lessonApi, dataApi } from '@/lib/api';
import { SelfEvaluationCard } from '@/components/SelfEvaluationCard';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Loader2, FileText, ArrowLeft, Sparkles, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { formatLessonToHTML } from '@/lib/lessonFormatter';
import type { LessonContent, SelfEvaluation, LessonPhase } from '@/lib/types';

interface Student {
  id: string;
  name: string;
  grade: string;
}

interface Tutor {
  id: string;
  name: string;
}

interface Strategy {
  id: string;
  title: string;
  content: {
    topics?: string[];
    weeks?: number;
  };
}

export default function LessonPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [evaluation, setEvaluation] = useState<SelfEvaluation | null>(null);
  const [lessonId, setLessonId] = useState<string>('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    tutor_id: '',
    topic: '',
    duration: 60,
    strategy_id: '',
    strategy_week_number: 1,
    use_strategy: false,
  });

  // Load initial data
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

  // Load strategies when student selected
  useEffect(() => {
    if (formData.student_id) {
      const loadStrategies = async () => {
        try {
          const response = await dataApi.getStrategies(formData.student_id);
          setStrategies(response.strategies || []);
        } catch (error) {
          console.error('Failed to load strategies:', error);
        }
      };
      loadStrategies();
    } else {
      setStrategies([]);
    }
  }, [formData.student_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLesson(null);
    setEvaluation(null);

    try {
      const requestData = {
        student_id: formData.student_id,
        tutor_id: formData.tutor_id,
        duration: formData.duration,
        ...(formData.use_strategy && formData.strategy_id
          ? {
              strategy_id: formData.strategy_id,
              strategy_week_number: formData.strategy_week_number,
            }
          : { topic: formData.topic }),
      };

      const response = await lessonApi.create(requestData);
      setLesson(response.content);
      setEvaluation(response.evaluation);
      setLessonId(response.lesson_id);
    } catch (error) {
      console.error('Failed to create lesson:', error);
      alert('Failed to create lesson. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === formData.student_id);
  const selectedStrategy = strategies.find((s) => s.id === formData.strategy_id);
  const weekTopics = selectedStrategy?.content?.topics || [];
  const maxWeeks = selectedStrategy?.content?.weeks || weekTopics.length || 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Lesson Creator</h1>
                  <p className="text-xs text-gray-500">Create active learning lesson plans</p>
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Student
                </label>
                <div className="relative">
                  <select
                    value={formData.student_id}
                    onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    disabled={loadingData}
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer disabled:bg-gray-50"
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Tutor
                </label>
                <div className="relative">
                  <select
                    value={formData.tutor_id}
                    onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
                    disabled={loadingData}
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer disabled:bg-gray-50"
                    required
                  >
                    <option value="">Choose a tutor...</option>
                    {tutors.map((tutor) => (
                      <option key={tutor.id} value={tutor.id}>
                        {tutor.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                min="20"
                max="120"
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium transition-colors"
              />
            </div>

            {/* Agent Handoff Section */}
            <div className="border-t-2 border-gray-100 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="use_strategy"
                  checked={formData.use_strategy}
                  onChange={(e) => setFormData({ ...formData, use_strategy: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="use_strategy" className="text-base font-bold text-gray-900 cursor-pointer">
                  🔗 Create from Strategy Week (Agent Handoff)
                </label>
              </div>

              {formData.use_strategy ? (
                <div className="space-y-4 bg-blue-50 p-6 rounded-2xl border-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Strategy
                    </label>
                    <div className="relative">
                      <select
                        value={formData.strategy_id}
                        onChange={(e) => setFormData({ ...formData, strategy_id: e.target.value })}
                        className="w-full px-4 py-3.5 pr-10 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer"
                        required={formData.use_strategy}
                        disabled={!formData.student_id || strategies.length === 0}
                      >
                        <option value="">
                          {!formData.student_id
                            ? 'Select a student first...'
                            : strategies.length === 0
                            ? 'No strategies found for this student'
                            : 'Choose a strategy...'}
                        </option>
                        {strategies.map((strategy) => (
                          <option key={strategy.id} value={strategy.id}>
                            {strategy.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {selectedStrategy && weekTopics.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Week
                      </label>
                      <div className="relative">
                        <select
                          value={formData.strategy_week_number}
                          onChange={(e) =>
                            setFormData({ ...formData, strategy_week_number: parseInt(e.target.value) })
                          }
                          className="w-full px-4 py-3.5 pr-10 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer"
                        >
                          {weekTopics.map((topic, index) => (
                            <option key={index} value={index + 1}>
                              Week {index + 1}: {topic}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        ✨ Topic will auto-load from this week
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic (Standalone Lesson)
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Newton's Laws of Motion"
                    className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-gray-900 font-medium transition-colors"
                    required={!formData.use_strategy}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loadingData}
              className="w-full px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Lesson (~15-20 sec)...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Craft Active Learning Lesson Plan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Generating Your Lesson...
            </h3>
            <div className="space-y-3 text-sm text-gray-600 max-w-md mx-auto">
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Retrieving knowledge from Perplexity
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-200" />
                Creating active lesson structure with LearnLM
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse animation-delay-400" />
                Running self-evaluation
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {lesson && !loading && (
          <>
            {/* Collaborative Canvas with Rich Text Editor */}
            {lesson && lessonId && formData.tutor_id && (
              <RichTextEditor
                initialContent={formatLessonToHTML(lesson)}
                onSave={async (content) => {
                  setSaving(true);
                  try {
                    await lessonApi.saveVersion({
                      content_type: 'lesson',
                      content_id: lessonId,
                      content: { content, format: 'html' },
                      changes_summary: 'Tutor edited lesson',
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
            {evaluation && <SelfEvaluationCard evaluation={evaluation} agentName="Lesson Creator" />}
          </>
        )}
      </div>
    </div>
  );
}
