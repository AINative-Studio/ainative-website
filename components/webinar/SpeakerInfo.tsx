/**
 * SpeakerInfo Component
 * Display speaker information with bio and social links
 */

import { User, Linkedin, Twitter, Github, Globe } from 'lucide-react';
import { WebinarSpeaker } from '@/lib/webinarAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SpeakerInfoProps {
  speaker: WebinarSpeaker;
  coSpeakers?: WebinarSpeaker[];
  showBio?: boolean;
  compact?: boolean;
}

interface SpeakerCardProps {
  spk: WebinarSpeaker;
  main: boolean;
  showBio: boolean;
  compact: boolean;
}

function getAvatarUrl(spk: WebinarSpeaker): string | undefined {
  if (!spk.avatar) return undefined;
  if (typeof spk.avatar === 'string') return spk.avatar;
  return spk.avatar.formats?.thumbnail?.url || spk.avatar.url;
}

function SpeakerCard({ spk, main, showBio, compact }: SpeakerCardProps) {
  return (
    <div className={`flex items-start gap-4 ${!compact && 'p-4'}`}>
      <Avatar className={main ? 'w-16 h-16' : 'w-12 h-12'}>
        <AvatarImage src={getAvatarUrl(spk)} alt={spk.name} />
        <AvatarFallback>
          <User className="w-6 h-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className={`font-semibold ${main ? 'text-lg' : 'text-base'}`}>{spk.name}</h3>
        {spk.title && <p className="text-sm text-gray-600">{spk.title}</p>}
        {showBio && spk.bio && (
          <p className="text-sm text-gray-700 mt-2">{spk.bio}</p>
        )}
        {spk.social_links && (
          <div className="flex gap-2 mt-3">
            {spk.social_links.linkedin && (
              <Button variant="outline" size="sm" asChild>
                <a href={spk.social_links.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
            )}
            {spk.social_links.twitter && (
              <Button variant="outline" size="sm" asChild>
                <a href={spk.social_links.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
            )}
            {spk.social_links.github && (
              <Button variant="outline" size="sm" asChild>
                <a href={spk.social_links.github} target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            )}
            {spk.social_links.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={spk.social_links.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function SpeakerInfo({ speaker, coSpeakers = [], showBio = true, compact = false }: SpeakerInfoProps) {
  if (compact) {
    return <SpeakerCard spk={speaker} main={true} showBio={showBio} compact={compact} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Speaker{coSpeakers.length > 0 && 's'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SpeakerCard spk={speaker} main={true} showBio={showBio} compact={compact} />
        {coSpeakers.map((coSpeaker) => (
          <div key={coSpeaker.id} className="pt-6 border-t">
            <SpeakerCard spk={coSpeaker} main={false} showBio={showBio} compact={compact} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
