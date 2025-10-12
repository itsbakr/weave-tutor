'use client';

import { useState, useEffect } from 'react';
import { activityApi, dataApi } from '@/lib/api';
import { SelfEvaluationCard } from '@/components/SelfEvaluationCard';
import { SandboxPreview } from '@/components/SandboxPreview';
import { ActivityChat } from '@/components/ActivityChat';
import { Loader2, Activity, ArrowLeft, Sparkles, ChevronDown, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import type { ActivityResponse, SelfEvaluation } from '@/lib/types';

interface Student {
  id: string;
  name: string;
  grade: string;
}

interface Tutor {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  content: {
    phases?: Array<{ name: string }>;
  };
}

export default function ActivityPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activity, setActivity] = useState<ActivityResponse | null>(null);
  const [evaluation, setEvaluation] = useState<SelfEvaluation | null>(null);
  const [code, setCode] = useState('');
  const [sandboxUrl, setSandboxUrl] = useState('');
  const [lastRequestData, setLastRequestData] = useState<any>(null); // Store last request for retry
  const [formData, setFormData] = useState({
    student_id: '',
    tutor_id: '',
    topic: '',
    activity_description: '',
    duration: 20,
    lesson_id: '',
    lesson_phase: '',
    use_lesson: false,
    max_attempts: 1,  // Changed to 1 to skip auto-fix loop for now
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

  // Load lessons when student selected
  useEffect(() => {
    if (formData.student_id) {
      const loadLessons = async () => {
        try {
          const response = await dataApi.getLessons(formData.student_id);
          setLessons(response.lessons || []);
        } catch (error) {
          console.error('Failed to load lessons:', error);
        }
      };
      loadLessons();
    } else {
      setLessons([]);
    }
  }, [formData.student_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActivity(null);
    setEvaluation(null);
    setCode('');
    setSandboxUrl('');

    try {
      const requestData = {
        student_id: formData.student_id,
        tutor_id: formData.tutor_id,
        duration: formData.duration,
        max_attempts: formData.max_attempts,
        ...(formData.use_lesson && formData.lesson_id
          ? {
              lesson_id: formData.lesson_id,
              lesson_phase: formData.lesson_phase,
            }
          : {
              topic: formData.topic,
              activity_description: formData.activity_description,
            }),
      };

      // Store request data for retry
      setLastRequestData(requestData);

      const response = await activityApi.create(requestData);
      setActivity(response);
      setEvaluation(response.evaluation);
      setCode(response.content?.code || '');
      setSandboxUrl(response.sandbox_url || '');
    } catch (error) {
      console.error('Failed to create activity:', error);
      alert('Failed to create activity. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryDeployment = async () => {
    if (!activity?.activity_id || !formData.student_id) {
      alert('No activity to redeploy.');
      return;
    }

    setLoading(true);

    try {
      // Only redeploy the existing code, don't regenerate with AI
      console.log('♻️ Redeploying activity:', activity.activity_id);
      const response = await activityApi.redeploy({
        activity_id: activity.activity_id,
        student_id: formData.student_id,
      });
      
      // Update only the sandbox URL and deployment status
      setSandboxUrl(response.sandbox_url || '');
      setActivity({
        ...activity,
        deployment: response.deployment,
        sandbox_url: response.sandbox_url,
      });
      
      alert('✅ Redeployment successful! Check the preview below.');
    } catch (error) {
      console.error('Failed to retry deployment:', error);
      alert('❌ Retry failed. Please check the backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeUpdate = (newCode: string, newSandboxUrl: string) => {
    setCode(newCode);
    if (newSandboxUrl) {
      setSandboxUrl(newSandboxUrl);
    }
  };

  const selectedLesson = lessons.find((l) => l.id === formData.lesson_id);
  
  // Handle both old 5E format and new comprehensive format
  const lessonPhases = selectedLesson?.content?.phases || [
    { name: 'Pre-Class Work' },
    { name: 'Class Activities' },
    { name: 'Homework' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
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
                <div className="bg-red-600 p-2 rounded-xl shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Activity Creator</h1>
                  <p className="text-xs text-gray-500">Generate interactive React activities</p>
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
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer disabled:bg-gray-50"
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
                    className="w-full px-4 py-3.5 pr-10 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer disabled:bg-gray-50"
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

            {/* Duration & Max Attempts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  min="5"
                  max="60"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white text-gray-900 font-medium transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Auto-Debug Attempts
                </label>
                <input
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) =>
                    setFormData({ ...formData, max_attempts: parseInt(e.target.value) })
                  }
                  min="1"
                  max="5"
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white text-gray-900 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Agent Handoff Section */}
            <div className="border-t-2 border-gray-100 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="use_lesson"
                  checked={formData.use_lesson}
                  onChange={(e) => setFormData({ ...formData, use_lesson: e.target.checked })}
                  className="w-5 h-5 text-red-600 border-2 border-gray-300 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="use_lesson" className="text-base font-bold text-gray-900 cursor-pointer">
                  🔗 Create from Lesson (Agent Handoff - Reuses Lesson's Research!)
                </label>
              </div>

              {formData.use_lesson ? (
                <div className="space-y-4 bg-red-50 p-6 rounded-2xl border-2 border-red-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Lesson
                    </label>
                    <div className="relative">
                      <select
                        value={formData.lesson_id}
                        onChange={(e) => setFormData({ ...formData, lesson_id: e.target.value })}
                        className="w-full px-4 py-3.5 pr-10 border-2 border-red-300 rounded-xl focus:outline-none focus:border-red-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer"
                        required={formData.use_lesson}
                        disabled={!formData.student_id || lessons.length === 0}
                      >
                        <option value="">
                          {!formData.student_id
                            ? 'Select a student first...'
                            : lessons.length === 0
                            ? 'No lessons found for this student'
                            : 'Choose a lesson...'}
                        </option>
                        {lessons.map((lesson) => (
                          <option key={lesson.id} value={lesson.id}>
                            {lesson.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  {selectedLesson && lessonPhases.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Class Section (Optional)
                      </label>
                      <div className="relative">
                        <select
                          value={formData.lesson_phase}
                          onChange={(e) => setFormData({ ...formData, lesson_phase: e.target.value })}
                          className="w-full px-4 py-3.5 pr-10 border-2 border-red-300 rounded-xl focus:outline-none focus:border-red-500 appearance-none bg-white text-gray-900 font-medium transition-colors cursor-pointer"
                        >
                          <option value="">General activity from lesson...</option>
                          {lessonPhases.map((phase, index) => (
                            <option key={index} value={phase.name}>
                              {phase.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                      <p className="text-xs text-red-700 mt-2">
                        ✨ Select a specific class activity section, or leave empty for general activity
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Topic (Standalone Activity)
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      placeholder="e.g., Chemical Bonding"
                      className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-white text-gray-900 font-medium transition-colors"
                      required={!formData.use_lesson}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-red-600" />
                      Describe Your Activity (Chat-First!)
                    </label>
                    <textarea
                      value={formData.activity_description}
                      onChange={(e) =>
                        setFormData({ ...formData, activity_description: e.target.value })
                      }
                      placeholder="e.g., Build molecules by drag-and-dropping atoms together. Make it game-like with challenges and rewards!"
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-red-500 bg-white text-gray-900 transition-colors resize-none"
                      required={!formData.use_lesson}
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      💬 Describe exactly what you want - the AI will generate it!
                    </p>
                  </div>
                </div>
              )}
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
                  Generating Activity (~3-4 min)...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Interactive Activity
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-red-600 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Generating Your Activity...
            </h3>
            <div className="space-y-3 text-sm text-gray-600 max-w-md mx-auto">
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Retrieving knowledge from Perplexity
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse animation-delay-200" />
                Generating React code with Qwen3 Coder 480B
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-400" />
                Deploying to Daytona sandbox
              </p>
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-600" />
                Auto-fixing errors (up to {formData.max_attempts} attempts)
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {activity && !loading && (
          <>
            <SandboxPreview
              code={code}
              sandboxUrl={sandboxUrl}
              status={activity.deployment?.status}
              attempts={activity.deployment?.attempts}
            />

            {/* Retry Button - Show when deployment failed */}
            {activity.deployment?.status === 'failed' && code && (
              <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl border-2 border-orange-200 p-8 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900">Deployment Failed</h3>
                    <p className="text-sm text-gray-600">
                      The code was generated but failed to deploy to Daytona after {activity.deployment?.attempts || 3} attempts
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 mb-6">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Possible reasons:</strong>
                  </p>
                  <ul className="text-sm text-gray-600 text-left list-disc list-inside space-y-1">
                    <li>Code syntax errors that couldn't be auto-fixed</li>
                    <li>Daytona API rate limits or service issues</li>
                    <li>Network connectivity problems</li>
                    <li>Invalid DAYTONA_API_KEY in backend/.env</li>
                  </ul>
                </div>
                <button
                  onClick={handleRetryDeployment}
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mx-auto transition-all duration-200 hover:scale-105"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Retrying Deployment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Retry Deployment
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  This will regenerate and deploy the activity with the same parameters
                </p>
              </div>
            )}

            {activity.activity_id && code && sandboxUrl && (
              <div className="mt-8">
                <ActivityChat
                  activityId={activity.activity_id}
                  tutorId={formData.tutor_id}
                  studentId={formData.student_id}
                  onCodeUpdate={handleCodeUpdate}
                />
              </div>
            )}

            {evaluation && <SelfEvaluationCard evaluation={evaluation} agentName="Activity Creator" />}
          </>
        )}
      </div>
    </div>
  );
}
