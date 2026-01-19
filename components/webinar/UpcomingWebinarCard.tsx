/**
 * UpcomingWebinarCard Component
 * Featured card for upcoming webinars with registration CTA
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, ArrowRight, Video } from 'lucide-react';
import { getUnsplashImageUrl } from '@/lib/unsplash';

export interface UpcomingWebinar {
  id: number;
  title: string;
  description: string;
  slug: string;
  date: string;
  duration: number;
  speaker?: {
    name: string;
    title?: string;
    avatar?: { url: string } | string;
  };
  thumbnail?: { url: string } | string;
  current_attendees?: number;
  max_attendees?: number;
  tags?: Array<{ id: number; name: string }>;
  featured?: boolean;
}

export interface UpcomingWebinarCardProps {
  webinar: UpcomingWebinar;
  variant?: 'horizontal' | 'vertical';
  showRegistrationButton?: boolean;
}

export function UpcomingWebinarCard({
  webinar,
  variant = 'horizontal',
  showRegistrationButton = true,
}: UpcomingWebinarCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getThumbnailUrl = () => {
    if (!webinar.thumbnail) return getUnsplashImageUrl(webinar.id, 1200, 675);
    if (typeof webinar.thumbnail === 'string') return webinar.thumbnail;
    return webinar.thumbnail.url || getUnsplashImageUrl(webinar.id, 1200, 675);
  };

  const getAvatarUrl = () => {
    if (!webinar.speaker?.avatar) return undefined;
    if (typeof webinar.speaker.avatar === 'string') return webinar.speaker.avatar;
    return webinar.speaker.avatar.url;
  };

  const isFull = Boolean(
    webinar.max_attendees &&
    webinar.max_attendees > 0 &&
    webinar.current_attendees &&
    webinar.current_attendees >= webinar.max_attendees
  );

  const spotsLeft =
    webinar.max_attendees && webinar.max_attendees > 0 && webinar.current_attendees
      ? webinar.max_attendees - webinar.current_attendees
      : null;

  if (variant === 'vertical') {
    return (
      <Card className="overflow-hidden bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/50 transition-all">
        <div className="relative aspect-video">
          <img src={getThumbnailUrl()} alt={webinar.title} className="w-full h-full object-cover" />
          {webinar.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#4B6FED] text-white">Featured</Badge>
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/30">
              <Calendar className="h-3 w-3 mr-1" />
              Upcoming
            </Badge>
            {isFull && <Badge variant="destructive">Full</Badge>}
            {spotsLeft && spotsLeft <= 10 && !isFull && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                {spotsLeft} spots left
              </Badge>
            )}
          </div>
          <CardTitle className="text-white line-clamp-2">{webinar.title}</CardTitle>
          <CardDescription className="text-gray-400 line-clamp-2">{webinar.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4B6FED]" />
              <span>{formatDate(webinar.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4B6FED]" />
              <span>{webinar.duration} minutes</span>
            </div>
            {webinar.speaker && (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={getAvatarUrl()} alt={webinar.speaker.name} />
                  <AvatarFallback className="text-xs bg-[#4B6FED] text-white">
                    {webinar.speaker.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{webinar.speaker.name}</span>
              </div>
            )}
          </div>

          {showRegistrationButton && (
            <Link href={`/webinars/${webinar.slug || webinar.id}`}>
              <Button className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white" disabled={isFull}>
                {isFull ? 'Webinar Full' : 'Register Now'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    );
  }

  // Horizontal variant
  return (
    <Card className="overflow-hidden bg-[#161B22] border-[#2D333B] hover:border-[#4B6FED]/50 transition-all">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-2/5 aspect-video md:aspect-auto">
          <img src={getThumbnailUrl()} alt={webinar.title} className="w-full h-full object-cover" />
          {webinar.featured && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-[#4B6FED] text-white">Featured</Badge>
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/30">
                <Calendar className="h-3 w-3 mr-1" />
                Upcoming
              </Badge>
              {isFull && <Badge variant="destructive">Full</Badge>}
              {spotsLeft && spotsLeft <= 10 && !isFull && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                  {spotsLeft} spots left
                </Badge>
              )}
            </div>
            <CardTitle className="text-white text-2xl">{webinar.title}</CardTitle>
            <CardDescription className="text-gray-400">{webinar.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <div className="space-y-3 text-sm text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#4B6FED]" />
                <span>{formatDate(webinar.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#4B6FED]" />
                <span>{webinar.duration} minutes</span>
              </div>
              {webinar.speaker && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getAvatarUrl()} alt={webinar.speaker.name} />
                    <AvatarFallback className="bg-[#4B6FED] text-white">
                      {webinar.speaker.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">{webinar.speaker.name}</p>
                    {webinar.speaker.title && <p className="text-xs text-gray-500">{webinar.speaker.title}</p>}
                  </div>
                </div>
              )}
              {webinar.current_attendees !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#4B6FED]" />
                  <span>{webinar.current_attendees} registered</span>
                </div>
              )}
            </div>

            {showRegistrationButton && (
              <div className="flex gap-2">
                <Link href={`/webinars/${webinar.slug || webinar.id}`} className="flex-1">
                  <Button className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white" disabled={isFull}>
                    {isFull ? 'Webinar Full' : 'Register Now'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
