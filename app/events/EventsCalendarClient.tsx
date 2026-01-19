'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Users, Video, MapPin, AlertCircle, Sparkles } from 'lucide-react';
import { getAllEvents, type LumaEvent } from '@/services/luma';
import ReactMarkdown from 'react-markdown';

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm text-muted-foreground ${className}`}>{children}</div>
);

const EventSkeleton = () => (
  <Card className="h-full bg-[#161B22] border-[#2D333B]">
    <Skeleton className="w-full h-48 bg-[#21262D]" />
    <CardHeader>
      <div className="flex gap-2 mb-2">
        <Skeleton className="h-5 w-20 bg-[#21262D]" />
        <Skeleton className="h-5 w-16 bg-[#21262D]" />
      </div>
      <Skeleton className="h-6 w-full mb-2 bg-[#21262D]" />
      <Skeleton className="h-20 w-full bg-[#21262D]" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mb-2 bg-[#21262D]" />
      <Skeleton className="h-4 w-3/4 mb-4 bg-[#21262D]" />
      <Skeleton className="h-10 w-full bg-[#21262D]" />
    </CardContent>
  </Card>
);

export default function EventsCalendarClient() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState<LumaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const lumaEvents = await getAllEvents();
        setEvents(lumaEvents || []);
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
  const upcomingEvents = events.filter(e => new Date(e.event.start_at) >= now);
  const pastEvents = events.filter(e => new Date(e.event.start_at) < now);

  const renderEvent = (lumaEvent: LumaEvent) => {
    const eventData = lumaEvent.event;
    const startDate = new Date(eventData.start_at);
    const endDate = new Date(eventData.end_at);
    const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    const isPast = startDate < now;

    return (
      <motion.div
        key={lumaEvent.api_id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden bg-[#161B22] border-[#2D333B]">
          {eventData.cover_url && (
            <div className="w-full h-48 overflow-hidden">
              <img
                src={eventData.cover_url}
                alt={eventData.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between mb-3 gap-2">
              {eventData.meeting_url || eventData.zoom_meeting_url ? (
                <Badge className="bg-blue-900/30 text-blue-400">
                  Online
                </Badge>
              ) : eventData.geo_address_json?.full_address ? (
                <Badge className="bg-purple-900/30 text-purple-400">
                  In-Person
                </Badge>
              ) : null}
              {lumaEvent.tags && lumaEvent.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {lumaEvent.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs border-[#2D333B] text-gray-400">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <CardTitle className="mb-2 line-clamp-2 text-white">{eventData.name}</CardTitle>
            <CardDescription>
              {(eventData.description_md || eventData.description) ? (
                <div className="line-clamp-3 prose prose-sm prose-invert max-w-none text-gray-400">
                  <ReactMarkdown>
                    {eventData.description_md || eventData.description || ''}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="line-clamp-3 text-gray-400">No description available</p>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-[#4B6FED]" />
                <span>
                  {startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-[#4B6FED]" />
                <span>
                  {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {durationMinutes > 0 && ` (${durationMinutes} min)`}
                </span>
              </div>
              {eventData.geo_address_json?.full_address && (
                <div className="flex items-start text-sm text-gray-400">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5 text-[#4B6FED]" />
                  <span className="line-clamp-2">{eventData.geo_address_json.full_address}</span>
                </div>
              )}
              {(eventData.meeting_url || eventData.zoom_meeting_url) && (
                <div className="flex items-center text-sm text-gray-400">
                  <Video className="h-4 w-4 mr-2 flex-shrink-0 text-[#4B6FED]" />
                  <span>Online Event</span>
                </div>
              )}
              <div className="pt-3">
                <Button className="w-full bg-[#4B6FED] hover:bg-[#3A56D3] text-white" asChild>
                  <a href={eventData.url} target="_blank" rel="noopener noreferrer">
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
    <div className="min-h-screen bg-vite-bg">
      <main className="container-custom py-20 mt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#4B6FED]/10 text-[#8AB4FF] text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Events & Workshops
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
            Events & Workshops
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join us for webinars, workshops, and office hours
          </p>
        </motion.div>

        {/* VibeCoding Workshops Promotion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-6xl mx-auto mb-12"
        >
          <Card className="border-2 border-[#4B6FED]/20 bg-gradient-to-br from-[#4B6FED]/5 via-[#8A63F4]/5 to-[#4B6FED]/5">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] text-white">
                  February 2026 Workshops
                </Badge>
                <Badge variant="outline" className="text-green-400 border-green-500">
                  Now Open for Registration
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]">
                Master the World&apos;s First AI-Native Database
              </CardTitle>
              <CardDescription className="text-lg text-gray-400">
                From ZeroDB Basics to AI Native Mastery - Choose your learning path with hands-on, project-based training.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Free Workshop */}
                <div className="relative p-6 rounded-lg border-2 border-dashed border-[#4B6FED]/30 bg-[#161B22] hover:border-[#4B6FED] transition-all">
                  <Badge className="absolute -top-3 -right-3 bg-green-600">FREE</Badge>
                  <h3 className="font-bold text-lg mb-2 text-white">ZeroDB Fundamentals</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    1-hour intro session. Store your first embedding, understand the 9 unified APIs, and get your API key.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-[#4B6FED]" />
                      <span>Feb 7, 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4 text-[#4B6FED]" />
                      <span>10 AM PST (1 Hour)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4 text-[#4B6FED]" />
                      <span>Beginners Welcome</span>
                    </div>
                  </div>
                </div>

                {/* Most Popular */}
                <div className="relative p-6 rounded-lg border-2 border-[#4B6FED] bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10">
                  <Badge className="absolute -top-3 -right-3 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] text-white">
                    MOST POPULAR
                  </Badge>
                  <h3 className="font-bold text-lg mb-2 text-white">Multi-Tenant SaaS</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    8-hour intensive. Build production-ready SaaS with ZeroDB, React, Node.js. Master all 9 APIs.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-[#4B6FED]" />
                      <span>Feb 14, 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4 text-[#4B6FED]" />
                      <span>9 AM - 5 PM PST</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4 text-[#4B6FED]" />
                      <span className="font-semibold text-[#4B6FED]">$497</span>
                    </div>
                  </div>
                  <div className="bg-vite-bg/60 rounded p-3 text-xs text-gray-400">
                    <strong className="text-white">ROI:</strong> 80% cost reduction, 60s deploy time, 9 APIs unified
                  </div>
                </div>

                {/* Certification */}
                <div className="relative p-6 rounded-lg border-2 border-dashed border-[#8A63F4]/50 bg-[#161B22] hover:border-[#8A63F4] transition-all">
                  <Badge className="absolute -top-3 -right-3 bg-[#8A63F4]">CERTIFICATION</Badge>
                  <h3 className="font-bold text-lg mb-2 text-white">ZeroDB Expert</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    2-day certification program. Advanced patterns, quantum boost, enterprise deployment + official certification.
                  </p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="h-4 w-4 text-[#8A63F4]" />
                      <span>Feb 21-22, 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="h-4 w-4 text-[#8A63F4]" />
                      <span>2 Days (16 hours)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Users className="h-4 w-4 text-[#8A63F4]" />
                      <span className="font-semibold text-[#8A63F4]">$249</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto mb-8 p-6 bg-red-900/20 border border-red-800 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-100 mb-1">Failed to load events</h3>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            </div>
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
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-[#161B22] border border-[#2D333B]">
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400">
                Upcoming ({upcomingEvents.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="data-[state=active]:bg-[#4B6FED] data-[state=active]:text-white text-gray-400">
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-white">No upcoming events</h3>
                    <p className="text-gray-400">Check back soon for new events</p>
                  </motion.div>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium text-white">No past events yet</h3>
                    <p className="text-gray-400">Past events will appear here</p>
                  </motion.div>
                )
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
