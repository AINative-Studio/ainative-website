'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Users, Video, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { getEvents } from '@/src/lib/strapi';
import ReactMarkdown from 'react-markdown';

interface Event {
  id: number;
  name: string;
  description: string;
  description_md?: string;
  start_at: string;
  end_at: string;
  url: string;
  cover_url?: string;
  meeting_url?: string;
  geo_address_json?: { full_address?: string };
  tags?: { id: number; name: string }[];
}

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm text-muted-foreground ${className}`}>{children}</div>
);

const EventSkeleton = () => (
  <Card className="h-full">
    <Skeleton className="w-full h-48" />
    <CardHeader>
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-20 w-full" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export default function EventsCalendarClient() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEvents({
          sort: 'start_at:desc',
          pagination: { pageSize: 100 }
        });
        setEvents(response.data || []);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.start_at) >= now);
  const pastEvents = events.filter(e => new Date(e.start_at) < now);

  const renderEvent = (event: Event) => {
    const startDate = new Date(event.start_at);
    const endDate = new Date(event.end_at);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    const isPast = startDate < now;

    return (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
          {event.cover_url && (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={event.cover_url}
                alt={event.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between mb-3 gap-2">
              {event.meeting_url ? (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Online
                </Badge>
              ) : event.geo_address_json?.full_address ? (
                <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  In-Person
                </Badge>
              ) : null}
              {event.tags && event.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {event.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <CardTitle className="mb-2 line-clamp-2">{event.name}</CardTitle>
            <CardDescription>
              {(event.description_md || event.description) ? (
                <div className="line-clamp-3 prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>
                    {event.description_md || event.description || ''}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="line-clamp-3">No description available</p>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {durationMinutes > 0 && ` (${durationMinutes} min)`}
                </span>
              </div>
              {event.geo_address_json?.full_address && (
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{event.geo_address_json.full_address}</span>
                </div>
              )}
              {event.meeting_url && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Video className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Online Event</span>
                </div>
              )}
              <div className="pt-3">
                <Button className="w-full" asChild>
                  <a href={event.url} target="_blank" rel="noopener noreferrer">
                    {isPast ? 'View Details' : 'Register Now'}
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-20 mt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Events & Workshops
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Events & Workshops
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us for webinars, workshops, and office hours
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mb-8">
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-destructive mb-1">Failed to load events</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <EventSkeleton key={index} />
            ))}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past">
                Past Events ({pastEvents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-0">
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(renderEvent)}
                </div>
              ) : (
                !error && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No upcoming events</h3>
                    <p className="text-muted-foreground">Check back soon for new events</p>
                  </div>
                )
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-0">
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(renderEvent)}
                </div>
              ) : (
                !error && (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No past events yet</h3>
                    <p className="text-muted-foreground">Past events will appear here</p>
                  </div>
                )
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
