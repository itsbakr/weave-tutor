'use client';

import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface SelfEvaluationProps {
  evaluation: {
    overall_score: number;
    criteria: {
      [key: string]: {
        score: number;
        reasoning: string;
      };
    };
    weaknesses?: string[];
    improvements?: string[];
  };
  agentName?: string;
}

export function SelfEvaluationCard({ evaluation, agentName = "AI Agent" }: SelfEvaluationProps) {
  // Force hot reload - agentName is properly defined
  if (!evaluation) return null;

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';  // Fixed: was 'text-yellow-500'
    return 'bg-red-500';
  };

  return (
    <div className="mt-8 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-600 p-3 rounded-xl">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
        <h2 className="text-2xl font-bold text-gray-900">{agentName} Self-Evaluation</h2>
        <p className="text-sm text-gray-500">AI agent's self-assessment</p>
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-gray-700">Overall Score</span>
          <span className={`text-4xl font-black ${getScoreColor(evaluation.overall_score)}`}>
            {evaluation.overall_score.toFixed(1)}/10
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${getScoreBarColor(evaluation.overall_score)} transition-all duration-500`}
            style={{ width: `${(evaluation.overall_score / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="space-y-4 mb-8">
        <h3 className="text-lg font-bold text-gray-900">Criteria Breakdown</h3>
        {Object.entries(evaluation.criteria).map(([key, value]) => {
          // Handle both object format {score, reasoning} and direct number format
          const score = typeof value === 'object' && value !== null && 'score' in value ? value.score : (typeof value === 'number' ? value : 0);
          const reasoning = typeof value === 'object' && value !== null && 'reasoning' in value ? value.reasoning : '';
          const scoreNum = typeof score === 'number' ? score : parseFloat(score) || 0;
          
          return (
            <div key={key} className="bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className={`text-2xl font-bold ${getScoreColor(scoreNum)}`}>
                  {scoreNum.toFixed(1)}/10
                </span>
              </div>
              {reasoning && <p className="text-sm text-gray-600 mb-3">{reasoning}</p>}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getScoreBarColor(scoreNum)} transition-all duration-500`}
                  style={{ width: `${(scoreNum / 10) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weaknesses */}
      {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-bold text-gray-900">Identified Weaknesses</h3>
          </div>
          <div className="space-y-3">
            {evaluation.weaknesses.map((weakness, index) => (
              <div key={index} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl">
                <p className="text-sm text-gray-800">{weakness}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {evaluation.improvements && evaluation.improvements.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Improvement Suggestions</h3>
          </div>
          <div className="space-y-3">
            {evaluation.improvements.map((improvement, index) => (
              <div key={index} className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl">
                <p className="text-sm text-gray-800">{improvement}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
