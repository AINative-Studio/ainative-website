import apiClient, { shouldLogError } from '../../utils/apiClient';

export interface StreamingTopic {
  id: string;
  name: string;
  partition_count: number;
  replication_factor: number;
  retention_ms: number;
  message_count: number;
  bytes_in_rate: number;
  bytes_out_rate: number;
  created_at: string;
  config?: Record<string, any>;
  status: string;
}

export interface TopicCreateRequest {
  name: string;
  partition_count?: number;
  replication_factor?: number;
  retention_ms?: number;
  config?: Record<string, any>;
}

export interface PublishMessageRequest {
  topic_name: string;
  messages: Array<{
    key?: string;
    value: any;
    headers?: Record<string, string>;
    partition?: number;
  }>;
}

export interface PublishMessageResponse {
  published_count: number;
  failed_count: number;
  operation_time_ms: number;
  message_ids: string[];
}

export interface ConsumeMessageRequest {
  topic_name: string;
  consumer_group?: string;
  max_messages?: number;
  timeout_ms?: number;
  auto_commit?: boolean;
}

export interface StreamingMessage {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  key?: string;
  value: any;
  headers?: Record<string, string>;
  timestamp: string;
  producer_id?: string;
}

export interface ConsumeMessageResponse {
  messages: StreamingMessage[];
  next_offset: number;
  has_more: boolean;
  operation_time_ms: number;
}

export interface EventLog {
  id: string;
  event_type: string;
  source: string;
  data: Record<string, any>;
  timestamp: string;
  correlation_id?: string;
  user_id?: string;
  metadata?: Record<string, any>;
  processed_at?: string;
  status: string;
}

export interface EventCreateRequest {
  event_type: string;
  source: string;
  data: Record<string, any>;
  correlation_id?: string;
  metadata?: Record<string, any>;
}

export interface ConsumerGroup {
  id: string;
  name: string;
  topic_name: string;
  members: number;
  lag: number;
  state: 'stable' | 'rebalancing' | 'dead';
  created_at: string;
  updated_at: string;
}

export interface TopicMetrics {
  topic_name: string;
  message_count: number;
  bytes_size: number;
  partitions: Array<{
    partition_id: number;
    message_count: number;
    bytes_size: number;
    high_water_mark: number;
    lag: number;
  }>;
  consumers: Array<{
    consumer_group: string;
    lag: number;
    members: number;
  }>;
  throughput: {
    messages_per_second: number;
    bytes_per_second: number;
  };
}

export class StreamingService {
  private static readonly BASE_PATH = '/v1/public/zerodb/streaming';
  private static readonly EVENTS_PATH = '/v1/public/zerodb/events';

  // Topic Management
  static async getTopics(): Promise<StreamingTopic[]> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/topics`);
      return response.data as StreamingTopic[];
    } catch (error: any) {
      throw new Error(`Failed to fetch streaming topics: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createTopic(request: TopicCreateRequest): Promise<StreamingTopic> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/topics`, request);
      return response.data as StreamingTopic;
    } catch (error: any) {
      throw new Error(`Failed to create streaming topic: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getTopic(topicName: string): Promise<StreamingTopic> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/topics/${topicName}`);
      return response.data as StreamingTopic;
    } catch (error: any) {
      throw new Error(`Failed to fetch streaming topic: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateTopic(topicName: string, updates: Partial<TopicCreateRequest>): Promise<StreamingTopic> {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/topics/${topicName}`, updates);
      return response.data as StreamingTopic;
    } catch (error: any) {
      throw new Error(`Failed to update streaming topic: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteTopic(topicName: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/topics/${topicName}`);
    } catch (error: any) {
      throw new Error(`Failed to delete streaming topic: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Message Publishing
  static async publishMessages(request: PublishMessageRequest): Promise<PublishMessageResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/publish`, request);
      return response.data as PublishMessageResponse;
    } catch (error: any) {
      throw new Error(`Failed to publish messages: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Message Consumption
  static async consumeMessages(request: ConsumeMessageRequest): Promise<ConsumeMessageResponse> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/consume`, request);
      return response.data as ConsumeMessageResponse;
    } catch (error: any) {
      throw new Error(`Failed to consume messages: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Consumer Groups
  static async getConsumerGroups(topicName?: string): Promise<ConsumerGroup[]> {
    try {
      const params = topicName ? { topic_name: topicName } : {};
      const response = await apiClient.get(`${this.BASE_PATH}/consumer-groups`, { params } as any);
      return response.data as ConsumerGroup[];
    } catch (error: any) {
      throw new Error(`Failed to fetch consumer groups: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createConsumerGroup(topicName: string, groupName: string): Promise<ConsumerGroup> {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/consumer-groups`, {
        topic_name: topicName,
        group_name: groupName
      });
      return response.data as ConsumerGroup;
    } catch (error: any) {
      throw new Error(`Failed to create consumer group: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteConsumerGroup(groupName: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/consumer-groups/${groupName}`);
    } catch (error: any) {
      throw new Error(`Failed to delete consumer group: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Topic Metrics
  static async getTopicMetrics(topicName: string): Promise<TopicMetrics> {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/topics/${topicName}/metrics`);
      return response.data as TopicMetrics;
    } catch (error: any) {
      throw new Error(`Failed to fetch topic metrics: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Event Management
  static async getEvents(params?: {
    event_type?: string;
    source?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
    from_date?: string;
    to_date?: string;
  }): Promise<{ events: EventLog[]; total: number; page: number; limit: number }> {
    try {
      const response = await apiClient.get(`${this.EVENTS_PATH}`, { params } as any);
      return response.data as { events: EventLog[]; total: number; page: number; limit: number };
    } catch (error: any) {
      throw new Error(`Failed to fetch events: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async createEvent(request: EventCreateRequest): Promise<EventLog> {
    try {
      const response = await apiClient.post(`${this.EVENTS_PATH}`, request);
      return response.data as EventLog;
    } catch (error: any) {
      throw new Error(`Failed to create event: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async getEvent(eventId: string): Promise<EventLog> {
    try {
      const response = await apiClient.get(`${this.EVENTS_PATH}/${eventId}`);
      return response.data as EventLog;
    } catch (error: any) {
      throw new Error(`Failed to fetch event: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async updateEvent(eventId: string, updates: Partial<EventCreateRequest>): Promise<EventLog> {
    try {
      const response = await apiClient.put(`${this.EVENTS_PATH}/${eventId}`, updates);
      return response.data as EventLog;
    } catch (error: any) {
      throw new Error(`Failed to update event: ${error.response?.data?.detail || error.message}`);
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      await apiClient.delete(`${this.EVENTS_PATH}/${eventId}`);
    } catch (error: any) {
      throw new Error(`Failed to delete event: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Bulk Event Processing
  static async createEvents(requests: EventCreateRequest[]): Promise<{ created: number; failed: number; event_ids: string[] }> {
    try {
      const response = await apiClient.post(`${this.EVENTS_PATH}/bulk`, { events: requests });
      return response.data as { created: number; failed: number; event_ids: string[] };
    } catch (error: any) {
      throw new Error(`Failed to create bulk events: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Event Stream Subscriptions (WebSocket-like functionality)
  static async subscribeToEvents(
    eventTypes: string[],
    callback: (event: EventLog) => void,
    errorCallback?: (error: Error) => void
  ): Promise<{ unsubscribe: () => void }> {
    try {
      // This would typically use WebSocket or Server-Sent Events
      // For now, we'll implement polling-based subscription
      let isSubscribed = true;
      let lastEventId: string | null = null;

      const poll = async () => {
        if (!isSubscribed) return;

        try {
          const params: any = { event_types: eventTypes.join(','), limit: 10 };
          if (lastEventId) {
            params.after_id = lastEventId;
          }

          const response = await this.getEvents(params);
          const newEvents = response.events;

          for (const event of newEvents) {
            if (event.id !== lastEventId) {
              callback(event);
              lastEventId = event.id;
            }
          }
        } catch (error) {
          if (errorCallback) {
            errorCallback(error as Error);
          }
        }

        if (isSubscribed) {
          setTimeout(poll, 1000); // Poll every second
        }
      };

      poll();

      return {
        unsubscribe: () => {
          isSubscribed = false;
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to subscribe to events: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Real-time Message Stream (for high-throughput scenarios)
  static async streamMessages(
    topicName: string,
    callback: (message: StreamingMessage) => void,
    options: {
      consumer_group?: string;
      partition?: number;
      offset?: number;
    } = {}
  ): Promise<{ stop: () => void }> {
    try {
      let isStreaming = true;

      const stream = async () => {
        if (!isStreaming) return;

        try {
          const request: ConsumeMessageRequest = {
            topic_name: topicName,
            consumer_group: options.consumer_group,
            max_messages: 10,
            timeout_ms: 1000
          };

          const response = await this.consumeMessages(request);
          
          for (const message of response.messages) {
            if (isStreaming) {
              callback(message);
            }
          }
        } catch (error) {
          if (shouldLogError(error)) {
            console.error('Stream error:', error);
          }
        }

        if (isStreaming) {
          setTimeout(stream, 100); // Stream with minimal delay
        }
      };

      stream();

      return {
        stop: () => {
          isStreaming = false;
        }
      };
    } catch (error: any) {
      throw new Error(`Failed to stream messages: ${error.response?.data?.detail || error.message}`);
    }
  }
}