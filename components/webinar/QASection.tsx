/**
 * QASection Component
 * Display Q&A with timestamp navigation
 */

import React, { useState } from 'react';
import { WebinarQuestion } from '@/lib/webinarAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, Clock, Search, User } from 'lucide-react';

interface QASectionProps {
  questions: WebinarQuestion[];
  onTimestampClick?: (timestamp: number) => void;
  allowUpvote?: boolean;
}

export function QASection({ questions, onTimestampClick, allowUpvote = false }: QASectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'upvotes'>('timestamp');

  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredAndSortedQuestions = questions
    .filter((q) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        q.question.toLowerCase().includes(search) ||
        q.answer?.toLowerCase().includes(search) ||
        q.asker.toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'upvotes') {
        return (b.upvotes ?? 0) - (a.upvotes ?? 0);
      }
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return aTime - bTime;
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Questions & Answers ({questions.length})</CardTitle>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant={sortBy === 'timestamp' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('timestamp')}
            >
              <Clock className="w-4 h-4 mr-1" />
              Timeline
            </Button>
            <Button
              variant={sortBy === 'upvotes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('upvotes')}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Top Voted
            </Button>
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {filteredAndSortedQuestions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {searchTerm ? 'No questions match your search' : 'No questions yet'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedQuestions.map((question, index) => (
              <div key={question.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {onTimestampClick && question.timestamp && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onTimestampClick(new Date(question.timestamp!).getTime())}
                          className="font-mono text-xs"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTimestamp(new Date(question.timestamp).getTime())}
                        </Button>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <User className="w-3 h-3" />
                        <span>{question.asker}</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{question.question}</h4>
                    {question.answer && (
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-2 rounded">
                        <p className="text-sm text-gray-700">{question.answer}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!allowUpvote}
                      className="flex flex-col items-center p-2 h-auto"
                    >
                      <ThumbsUp className={`w-4 h-4 ${(question.upvotes ?? 0) > 0 ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-xs font-medium">{question.upvotes ?? 0}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
