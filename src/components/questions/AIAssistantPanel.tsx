import React from 'react';
import { Sparkles, RefreshCw, CheckCircle, AlertCircle, Tag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AISuggestion {
  improvements: string[];
  tags: TagSuggestion[];
  quality_score: number;
  missing_elements: string[];
}

interface TagSuggestion {
  name: string;
  confidence: number;
  usage_count: number;
}

interface AIAssistantPanelProps {
  isAnalyzing: boolean;
  suggestions: AISuggestion | null;
  error: string | null;
  onRefresh: () => void;
  onApplyTag: (tag: string) => void;
}

export default function AIAssistantPanel({
  isAnalyzing,
  suggestions,
  error,
  onRefresh,
  onApplyTag
}: AIAssistantPanelProps) {
  const renderLoadingState = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
        <span>Analyzing your question...</span>
      </div>
      
      {/* Loading skeleton */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
      </div>
      
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertCircle className="w-4 h-4" />
        <span>{error || 'Unable to generate suggestions'}</span>
      </div>
      <Button
        onClick={onRefresh}
        variant="outline"
        size="sm"
        className="w-full"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );

  const renderSuggestions = () => {
    if (!suggestions) return null;

    return (
      <div className="space-y-4">
        {/* Quality Score */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Question Quality</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {suggestions.quality_score}/100
          </div>
        </div>

        {/* Improvements */}
        {suggestions.improvements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Improve your question:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {suggestions.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Tags */}
        {suggestions.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-500" />
              Suggested tags:
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => onApplyTag(tag.name)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs border border-gray-200 transition-colors"
                  title={`Used ${tag.usage_count.toLocaleString()} times (${Math.round(tag.confidence * 100)}% confidence)`}
                >
                  {tag.name}
                  <span className="text-gray-400">
                    {Math.round(tag.confidence * 100)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Missing Elements */}
        {suggestions.missing_elements.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 text-sm mb-2">
              Consider adding:
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.missing_elements.map((element) => (
                <span
                  key={element}
                  className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs"
                >
                  {element.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="w-full mt-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Re-analyze Question
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
      <div className="flex items-start gap-2 mb-4">
        <div className="w-5 h-5 bg-orange-500 text-white rounded text-xs flex items-center justify-center font-bold mt-0.5">
          AI
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 flex items-center gap-1">
            Question assistant suggestions
            <Sparkles className="w-3 h-3 text-orange-500" />
          </h3>
        </div>
      </div>

      {/* Content based on state */}
      {isAnalyzing && renderLoadingState()}
      {error && !isAnalyzing && renderErrorState()}
      {!isAnalyzing && !error && suggestions && renderSuggestions()}
      {!isAnalyzing && !error && !suggestions && (
        <p className="text-sm text-gray-600">
          Complete the title and description fields, then click on the tags input to get AI suggestions.
        </p>
      )}
    </div>
  );
}
