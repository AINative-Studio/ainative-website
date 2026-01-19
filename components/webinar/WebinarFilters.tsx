/**
 * WebinarFilters Component
 * Filter controls for webinar listing page
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, Video } from 'lucide-react';

export interface WebinarFiltersProps {
  selectedTopic: string;
  dateFilter: 'all' | 'upcoming' | 'past';
  topics: string[];
  onTopicChange: (topic: string) => void;
  onDateFilterChange: (filter: 'all' | 'upcoming' | 'past') => void;
  upcomingCount?: number;
  pastCount?: number;
  disabled?: boolean;
}

export function WebinarFilters({
  selectedTopic,
  dateFilter,
  topics,
  onTopicChange,
  onDateFilterChange,
  upcomingCount = 0,
  pastCount = 0,
  disabled = false,
}: WebinarFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium mr-2 flex items-center text-gray-300">
          <Calendar className="h-4 w-4 mr-1" />
          When:
        </span>
        <Button
          variant={dateFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDateFilterChange('all')}
          disabled={disabled}
          className={
            dateFilter === 'all'
              ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
              : 'border-[#2D333B] text-gray-300 hover:border-[#4B6FED]'
          }
        >
          All Webinars
        </Button>
        <Button
          variant={dateFilter === 'upcoming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDateFilterChange('upcoming')}
          disabled={disabled}
          className={
            dateFilter === 'upcoming'
              ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
              : 'border-[#2D333B] text-gray-300 hover:border-[#4B6FED]'
          }
        >
          <Calendar className="w-4 h-4 mr-1" />
          Upcoming ({upcomingCount})
        </Button>
        <Button
          variant={dateFilter === 'past' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onDateFilterChange('past')}
          disabled={disabled}
          className={
            dateFilter === 'past'
              ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
              : 'border-[#2D333B] text-gray-300 hover:border-[#4B6FED]'
          }
        >
          <Video className="w-4 h-4 mr-1" />
          Recordings ({pastCount})
        </Button>
      </div>

      {/* Topic Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium mr-2 flex items-center text-gray-300">
          <Filter className="h-4 w-4 mr-1" />
          Topics:
        </span>
        <Button
          variant={selectedTopic === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTopicChange('all')}
          disabled={disabled}
          className={
            selectedTopic === 'all'
              ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
              : 'border-[#2D333B] text-gray-300 hover:border-[#4B6FED]'
          }
        >
          All Topics
        </Button>
        {topics.map((topic) => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTopicChange(topic)}
            disabled={disabled}
            className={
              selectedTopic === topic
                ? 'bg-[#4B6FED] hover:bg-[#3A56D3] text-white'
                : 'border-[#2D333B] text-gray-300 hover:border-[#4B6FED]'
            }
          >
            {topic}
          </Button>
        ))}
      </div>

      {/* Active Filter Display */}
      {(selectedTopic !== 'all' || dateFilter !== 'all') && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Active filters:</span>
          {dateFilter !== 'all' && (
            <Badge variant="secondary" className="bg-[#4B6FED]/10 text-[#8AB4FF] border-[#4B6FED]/30">
              {dateFilter === 'upcoming' ? 'Upcoming' : 'Past'}
            </Badge>
          )}
          {selectedTopic !== 'all' && (
            <Badge variant="secondary" className="bg-[#4B6FED]/10 text-[#8AB4FF] border-[#4B6FED]/30">
              {selectedTopic}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onTopicChange('all');
              onDateFilterChange('all');
            }}
            className="text-gray-400 hover:text-[#4B6FED]"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
