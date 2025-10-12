'use client';

import Link from 'next/link';
import { Brain, Zap, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-blue-600 p-2.5 rounded-2xl shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                  TutorPilot
                </h1>
                <p className="text-xs text-gray-500">Self-Improving AI Agents</p>
              </div>
            </div>
            <a
              href="https://wandb.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 hover:shadow-lg transition-all duration-200 text-sm font-medium hover:scale-105"
            >
              View Traces →
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 bg-red-100 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4 mr-2 text-red-600" />
            <span className="text-red-600">
              WaveHacks 2025 - Best Self-Improving Agent
            </span>
          </div>
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="text-red-600">
              AI That Learns
            </span>
            <br />
            <span className="text-gray-900">From Every Edit</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Hierarchical agents that hand off context and improve through tutor feedback
          </p>
        </div>

        {/* Agent Cards - Modern Card Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Strategy Planner */}
          <Link href="/strategy">
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-red-200">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Strategy Planner</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Generate personalized 4-week learning strategies with rich pedagogical depth
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>163+ Perplexity sources</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>7.83/10 self-evaluation</span>
                </div>
              </div>
              <div className="mt-6 text-red-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Start Planning
                <span className="text-xl">→</span>
              </div>
            </div>
          </Link>

          {/* Lesson Creator */}
          <Link href="/lesson">
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-200">
                <span className="text-3xl">📖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Lesson Creator</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Create 5E framework lessons from strategy weeks or standalone topics
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Agent handoff from strategy</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>7.0/10 self-evaluation</span>
                </div>
              </div>
              <div className="mt-6 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Create Lesson
                <span className="text-xl">→</span>
              </div>
            </div>
          </Link>

          {/* Activity Creator */}
          <Link href="/activity">
            <div className="group bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-200">
                <span className="text-3xl">🎮</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Activity Creator</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Generate interactive React activities with auto-debugging and chat refinement
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span>Auto-fix loop (3 attempts)</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Chat-based iteration</span>
                </div>
              </div>
              <div className="mt-6 text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Build Activity
                <span className="text-xl">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Self-Improvement Features - Bento Box Style */}
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <h3 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Why This Wins
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
              {
                icon: '🎯',
                title: 'Self-Evaluation',
                desc: 'Agents critique their own outputs on 5 criteria',
                color: 'text-red-600',
              },
              {
                icon: '🔗',
                title: 'Agent Handoff',
                desc: 'Context flows: Strategy → Lesson → Activity',
                color: 'text-purple-600',
              },
              {
                icon: '📝',
                title: 'Learning from Edits',
                desc: 'Captures why tutors edit to improve future outputs',
                color: 'text-blue-600',
              },
              {
                icon: '🤖',
                title: 'Auto-Debugging',
                desc: 'Fixes its own code errors automatically (3 attempts)',
                color: 'text-green-600',
              },
              {
                icon: '💬',
                title: 'Chat Refinement',
                desc: 'Natural language activity modifications',
                color: 'text-indigo-600',
              },
              {
                icon: '🔍',
                title: 'Full Tracing',
                desc: 'Every AI call traced in Weave for observability',
                color: 'text-orange-600',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-lg transition-all duration-300"
              >
                <div className={`text-4xl mb-3 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
