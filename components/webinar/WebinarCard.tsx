/**
 * WebinarCard Component
 * Display webinar in grid or list view
 */

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, User, Users, Video } from 'lucide-react';
import { Webinar } from '@/lib/webinarAPI';
import { formatWebinarDate } from '@/lib/calendarGenerator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WebinarCardProps {
  webinar: Webinar;
  viewMode?: 'grid' | 'list';
}

export function WebinarCard({ webinar, viewMode = 'grid' }: WebinarCardProps) {
  const getThumbnailUrl = (): string | undefined => {
    if (!webinar.thumbnail) return undefined;
    if (typeof webinar.thumbnail === 'string') return webinar.thumbnail;
    if (webinar.thumbnail.formats?.medium?.url) {
      return webinar.thumbnail.formats.medium.url;
    }
    return webinar.thumbnail.url || undefined;
  };

  const thumbnailUrl = getThumbnailUrl();

  const getStatusBadge = () => {
    switch (webinar.status) {
      case 'live':
        return <Badge className="bg-red-500 animate-pulse">LIVE</Badge>;
      case 'upcoming':
        return <Badge className="bg-green-500">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">On-Demand</Badge>;
      default:
        return null;
    }
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/webinars/${webinar.slug}`}>
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex flex-col sm:flex-row">
            <div className="relative sm:w-64 aspect-video sm:aspect-auto bg-gray-900">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={webinar.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Video className="w-12 h-12 text-gray-600" />
                </div>
              )}
              <div className="absolute top-2 right-2">{getStatusBadge()}</div>
            </div>
            <div className="flex-1 p-6">
              <h3 className="text-xl font-bold mb-2 hover:text-blue-600">{webinar.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{webinar.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatWebinarDate(new Date(webinar.date))}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{webinar.duration} min</span>
                </div>
                {webinar.speaker && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{webinar.speaker.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/webinars/${webinar.slug}`} className="block group">
      <Card className="h-full hover:shadow-lg transition-shadow">
        <div className="relative aspect-video bg-gray-900">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={webinar.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="w-16 h-16 text-gray-600" />
            </div>
          )}
          <div className="absolute top-2 right-2">{getStatusBadge()}</div>
        </div>
        <CardHeader>
          <CardTitle className="line-clamp-2 group-hover:text-blue-600">{webinar.title}</CardTitle>
          <CardDescription className="line-clamp-2">{webinar.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatWebinarDate(new Date(webinar.date))}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{webinar.duration} minutes</span>
            </div>
            {webinar.speaker && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{webinar.speaker.name}</span>
              </div>
            )}
            {webinar.registration_required && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{webinar.current_attendees} registered</span>
              </div>
            )}
          </div>
          {webinar.tags && webinar.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3" onClick={(e) => e.preventDefault()}>
              {webinar.tags.slice(0, 3).map((tag, index) => (
                <Link
                  key={typeof tag === 'string' ? tag : index}
                  href={`/webinars?topic=${encodeURIComponent(typeof tag === 'string' ? tag : tag)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="transition-transform hover:scale-105"
                >
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-primary/20">
                    {typeof tag === 'string' ? tag : tag}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
