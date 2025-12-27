import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { AlertCircle, Plus, Trash2, Send, Radio } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'sonner';

import { 
  StreamingService,
  type StreamingTopic,
  type TopicCreateRequest,
  type EventLog
} from '../../../services/zerodb';

interface StreamingEventsProps {
  className?: string;
}

export const StreamingEvents: React.FC<StreamingEventsProps> = ({ className }) => {
  const [selectedTab, setSelectedTab] = useState('topics');
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const { data: topics = [], isLoading: isLoadingTopics } = useQuery({
    queryKey: ['streaming-topics'],
    queryFn: () => StreamingService.getTopics(),
  });

  const { data: events = { events: [], total: 0 }, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: () => StreamingService.getEvents({ limit: 20 }),
  });

  const { data: consumerGroups = [] } = useQuery({
    queryKey: ['consumer-groups'],
    queryFn: () => StreamingService.getConsumerGroups(),
  });

  // Mutations
  const createTopicMutation = useMutation({
    mutationFn: StreamingService.createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streaming-topics'] });
      setIsTopicDialogOpen(false);
      toast.success('Topic created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create topic: ${error.message}`);
    },
  });

  const publishMutation = useMutation({
    mutationFn: StreamingService.publishMessages,
    onSuccess: (data) => {
      setIsPublishDialogOpen(false);
      toast.success(`Published ${data.published_count} messages`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to publish messages: ${error.message}`);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: StreamingService.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setIsEventDialogOpen(false);
      toast.success('Event created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const handleCreateTopic = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createTopicMutation.mutate({
      name: formData.get('name') as string,
      partition_count: parseInt(formData.get('partition_count') as string) || 1,
      replication_factor: parseInt(formData.get('replication_factor') as string) || 1,
      retention_ms: parseInt(formData.get('retention_hours') as string) * 3600000 || 604800000,
    });
  };

  const handlePublishMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const messageData = formData.get('message_data') as string;
    let parsedData;
    try {
      parsedData = JSON.parse(messageData);
    } catch {
      parsedData = messageData;
    }

    publishMutation.mutate({
      topic_name: formData.get('topic_name') as string,
      messages: [{
        key: formData.get('message_key') as string || undefined,
        value: parsedData,
      }],
    });
  };

  const handleCreateEvent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const eventData = formData.get('event_data') as string;
    let parsedData;
    try {
      parsedData = JSON.parse(eventData);
    } catch (error) {
      toast.error('Invalid JSON data format');
      return;
    }

    createEventMutation.mutate({
      event_type: formData.get('event_type') as string,
      source: formData.get('source') as string,
      data: parsedData,
      correlation_id: formData.get('correlation_id') as string || undefined,
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="consumers">Consumers</TabsTrigger>
        </TabsList>

        {/* Topics */}
        <TabsContent value="topics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Streaming Topics</h3>
            <div className="flex gap-2">
              <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Send className="w-4 h-4 mr-2" />
                    Publish Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Publish Message</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePublishMessage} className="space-y-4">
                    <div>
                      <Label>Topic *</Label>
                      <select name="topic_name" className="w-full p-2 border rounded" required>
                        <option value="">Select topic</option>
                        {topics.map((topic: StreamingTopic) => (
                          <option key={topic.id} value={topic.name}>{topic.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="message_key">Message Key (optional)</Label>
                      <Input id="message_key" name="message_key" />
                    </div>
                    <div>
                      <Label htmlFor="message_data">Message Data (JSON or text) *</Label>
                      <Textarea id="message_data" name="message_data" required rows={4} />
                    </div>
                    <Button type="submit" disabled={publishMutation.isPending}>
                      {publishMutation.isPending ? 'Publishing...' : 'Publish Message'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isTopicDialogOpen} onOpenChange={setIsTopicDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Topic
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Streaming Topic</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <div>
                      <Label htmlFor="topic_name">Name *</Label>
                      <Input id="topic_name" name="name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="partition_count">Partitions</Label>
                        <Input id="partition_count" name="partition_count" type="number" defaultValue={1} min={1} />
                      </div>
                      <div>
                        <Label htmlFor="replication_factor">Replication</Label>
                        <Input id="replication_factor" name="replication_factor" type="number" defaultValue={1} min={1} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="retention_hours">Retention (hours)</Label>
                      <Input id="retention_hours" name="retention_hours" type="number" defaultValue={168} min={1} />
                    </div>
                    <Button type="submit" disabled={createTopicMutation.isPending}>
                      {createTopicMutation.isPending ? 'Creating...' : 'Create Topic'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4">
            {isLoadingTopics ? (
              <div>Loading topics...</div>
            ) : topics.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No streaming topics found. Create your first topic to start streaming data.
                </AlertDescription>
              </Alert>
            ) : (
              topics.map((topic: StreamingTopic) => (
                <Card key={topic.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{topic.name}</CardTitle>
                        <CardDescription>
                          {topic.partition_count} partitions | {topic.message_count} messages
                        </CardDescription>
                      </div>
                      <Badge variant={topic.status === 'active' ? 'default' : 'secondary'}>
                        {topic.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Replication</p>
                        <p className="font-medium">{topic.replication_factor}x</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Retention</p>
                        <p className="font-medium">{Math.round(topic.retention_ms / 3600000)}h</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bytes In/s</p>
                        <p className="font-medium">{topic.bytes_in_rate}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bytes Out/s</p>
                        <p className="font-medium">{topic.bytes_out_rate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Event Logs</h3>
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="event_type">Event Type *</Label>
                    <Input id="event_type" name="event_type" required placeholder="user.login" />
                  </div>
                  <div>
                    <Label htmlFor="source">Source *</Label>
                    <Input id="source" name="source" required placeholder="web-app" />
                  </div>
                  <div>
                    <Label htmlFor="event_data">Event Data (JSON) *</Label>
                    <Textarea id="event_data" name="event_data" required rows={4} placeholder='{"user_id": 123, "action": "login"}' />
                  </div>
                  <div>
                    <Label htmlFor="correlation_id">Correlation ID (optional)</Label>
                    <Input id="correlation_id" name="correlation_id" />
                  </div>
                  <Button type="submit" disabled={createEventMutation.isPending}>
                    {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {isLoadingEvents ? (
              <div>Loading events...</div>
            ) : events.events.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No events found. Create your first event to start tracking application activity.
                </AlertDescription>
              </Alert>
            ) : (
              events.events.map((event: EventLog) => (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{event.event_type}</h4>
                        <p className="text-sm text-gray-600">Source: {event.source}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={event.status === 'processed' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {event.correlation_id && (
                      <p className="text-sm text-gray-600 mb-2">Correlation: {event.correlation_id}</p>
                    )}
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium text-sm">Event Data</summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Consumer Groups */}
        <TabsContent value="consumers" className="space-y-4">
          <h3 className="text-lg font-semibold">Consumer Groups</h3>
          <div className="grid gap-4">
            {consumerGroups.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No consumer groups found. Consumer groups will appear here when you start consuming messages.
                </AlertDescription>
              </Alert>
            ) : (
              consumerGroups.map((group: any) => (
                <Card key={group.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{group.name}</h4>
                        <p className="text-sm text-gray-600">Topic: {group.topic_name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={group.state === 'stable' ? 'default' : 'secondary'}>
                          {group.state}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{group.members} members</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Lag</p>
                        <p className="font-medium">{group.lag}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-medium">{new Date(group.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};