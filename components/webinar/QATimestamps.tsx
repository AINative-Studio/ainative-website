/**
 * QATimestamps Component
 * Display Q&A questions with clickable timestamps that navigate to video positions
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MessageSquare, ThumbsUp, User } from 'lucide-react';

export interface QATimestamp {
  id: string;
  question: string;
  answer?: string;
  askedBy: string;
  timestamp: number; // in seconds
  upvotes?: number;
  isAnswered?: boolean;
}

interface QATimestampsProps {
  questions: QATimestamp[];
  onTimestampClick?: (timestamp: number) => void;
  showUpvotes?: boolean;
  className?: string;
}

export function QATimestamps({
  questions,
  onTimestampClick,
  showUpvotes = true,
  className = '',
}: QATimestampsProps) {
  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimestampClick = (timestamp: number) => {
    if (onTimestampClick) {
      onTimestampClick(timestamp);
    }
  };

  if (questions.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-500">No questions with timestamps yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {questions.map((qa) => (
        <div
          key={qa.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-[#4B6FED] transition-colors bg-white"
        >
          <div className="flex items-start gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTimestampClick(qa.timestamp)}
              className="flex-shrink-0 font-mono text-xs border-[#4B6FED] text-[#4B6FED] hover:bg-[#4B6FED] hover:text-white"
              disabled={!onTimestampClick}
            >
              <Clock className="w-3 h-3 mr-1" />
              {formatTimestamp(qa.timestamp)}
            </Button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <User className="w-3 h-3" />
                  <span className="font-medium">{qa.askedBy}</span>
                </div>
                {qa.isAnswered && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Answered
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 mb-2 leading-snug">
                {qa.question}
              </h4>

              {qa.answer && (
                <div className="mt-2 bg-blue-50 border-l-4 border-[#4B6FED] p-3 rounded">
                  <p className="text-sm text-gray-700 leading-relaxed">{qa.answer}</p>
                </div>
              )}
            </div>

            {showUpvotes && qa.upvotes !== undefined && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <ThumbsUp
                  className={`w-4 h-4 ${
                    qa.upvotes > 0 ? 'text-[#4B6FED] fill-[#4B6FED]' : 'text-gray-400'
                  }`}
                />
                <span className="text-xs font-medium text-gray-600">{qa.upvotes}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function QATimestampsList({
  title = 'Q&A Timeline',
  sortBy = 'timestamp',
  onSortChange,
  ...props
}: QATimestampsProps & {
  title?: string;
  sortBy?: 'timestamp' | 'upvotes';
  onSortChange?: (sortBy: 'timestamp' | 'upvotes') => void;
}) {
  const sortedQuestions = [...props.questions].sort((a, b) => {
    if (sortBy === 'upvotes') {
      return (b.upvotes ?? 0) - (a.upvotes ?? 0);
    }
    return a.timestamp - b.timestamp;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {onSortChange && (
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'timestamp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('timestamp')}
              className={sortBy === 'timestamp' ? 'bg-[#4B6FED]' : ''}
            >
              <Clock className="w-4 h-4 mr-1" />
              Timeline
            </Button>
            <Button
              variant={sortBy === 'upvotes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onSortChange('upvotes')}
              className={sortBy === 'upvotes' ? 'bg-[#4B6FED]' : ''}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Popular
            </Button>
          </div>
        )}
      </div>
      <QATimestamps {...props} questions={sortedQuestions} />
    </div>
  );
}
