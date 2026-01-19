/**
 * SpeakerBio Component
 * Display speaker information with avatar and bio
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Link as LinkIcon } from 'lucide-react';

export interface Speaker {
  name: string;
  title?: string;
  bio?: string;
  avatar?: { url: string } | string;
  company?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  expertise?: string[];
}

export interface SpeakerBioProps {
  speaker: Speaker;
  showExpertise?: boolean;
  compact?: boolean;
}

export function SpeakerBio({ speaker, showExpertise = true, compact = false }: SpeakerBioProps) {
  const getAvatarUrl = () => {
    if (!speaker.avatar) return undefined;
    if (typeof speaker.avatar === 'string') return speaker.avatar;
    return speaker.avatar.url;
  };

  const getInitials = () => {
    return speaker.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (compact) {
    return (
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={getAvatarUrl()} alt={speaker.name} />
          <AvatarFallback className="bg-[#4B6FED] text-white">{getInitials()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-white">{speaker.name}</p>
          {speaker.title && <p className="text-sm text-gray-400">{speaker.title}</p>}
          {speaker.company && <p className="text-xs text-gray-500">{speaker.company}</p>}
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-[#161B22] border-[#2D333B]">
      <CardHeader>
        <CardTitle className="text-white">About the Speaker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={getAvatarUrl()} alt={speaker.name} />
            <AvatarFallback className="text-xl bg-[#4B6FED] text-white">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">{speaker.name}</h3>
            {speaker.title && (
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <User className="w-4 h-4" />
                <span>{speaker.title}</span>
              </div>
            )}
            {speaker.company && (
              <p className="text-sm text-gray-500">{speaker.company}</p>
            )}
            {speaker.location && (
              <div className="flex items-center gap-2 text-gray-400 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{speaker.location}</span>
              </div>
            )}
          </div>
        </div>

        {speaker.bio && (
          <div className="text-gray-400 leading-relaxed">
            <p>{speaker.bio}</p>
          </div>
        )}

        {showExpertise && speaker.expertise && speaker.expertise.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Areas of Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {speaker.expertise.map((area, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-[#4B6FED]/10 text-[#8AB4FF] border-[#4B6FED]/30"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {speaker.socialLinks && (
          <div className="flex gap-2 pt-2 border-t border-[#2D333B]">
            {speaker.socialLinks.linkedin && (
              <a
                href={speaker.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#4B6FED] transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            )}
            {speaker.socialLinks.twitter && (
              <a
                href={speaker.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#4B6FED] transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
            )}
            {speaker.socialLinks.website && (
              <a
                href={speaker.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#4B6FED] transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="sr-only">Website</span>
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
