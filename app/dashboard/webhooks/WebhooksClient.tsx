'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Settings,
  Activity,
  Globe,
} from 'lucide-react';
import { webhookService, Webhook, CreateWebhookInput } from '@/lib/webhook-service';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Available webhook event types
const WEBHOOK_EVENTS = [
  { id: 'api_key.created', label: 'API Key Created', description: 'Triggered when a new API key is created' },
  { id: 'api_key.deleted', label: 'API Key Deleted', description: 'Triggered when an API key is deleted' },
  { id: 'vector.upserted', label: 'Vector Upserted', description: 'Triggered when a vector is created or updated' },
  { id: 'vector.deleted', label: 'Vector Deleted', description: 'Triggered when a vector is deleted' },
  { id: 'table.created', label: 'Table Created', description: 'Triggered when a table is created' },
  { id: 'table.deleted', label: 'Table Deleted', description: 'Triggered when a table is deleted' },
  { id: 'file.uploaded', label: 'File Uploaded', description: 'Triggered when a file is uploaded' },
  { id: 'file.deleted', label: 'File Deleted', description: 'Triggered when a file is deleted' },
];

export default function WebhooksClient() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [formData, setFormData] = useState<CreateWebhookInput>({
    url: '',
    events: [],
    secret: '',
  });

  // Fetch webhooks
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: webhookService.listWebhooks,
  });

  // Fetch delivery history for selected webhook
  const { data: deliveries } = useQuery({
    queryKey: ['webhook-deliveries', selectedWebhook?.id],
    queryFn: () => webhookService.getWebhookDeliveries(selectedWebhook!.id),
    enabled: !!selectedWebhook,
  });

  // Create webhook mutation
  const createMutation = useMutation({
    mutationFn: webhookService.createWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setCreateDialogOpen(false);
      setFormData({ url: '', events: [], secret: '' });
    },
  });

  // Delete webhook mutation
  const deleteMutation = useMutation({
    mutationFn: webhookService.deleteWebhook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  // Toggle webhook mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      webhookService.toggleWebhook(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  // Test webhook mutation
  const testMutation = useMutation({
    mutationFn: webhookService.testWebhook,
  });

  const handleCreateWebhook = () => {
    if (!formData.url || formData.events.length === 0) {
      return;
    }
    createMutation.mutate(formData);
  };

  const handleToggleEvent = (eventId: string) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(eventId)
        ? prev.events.filter((e) => e !== eventId)
        : [...prev.events, eventId],
    }));
  };

  const handleViewDeliveries = (webhook: Webhook) => {
    setSelectedWebhook(webhook);
    setDeliveryDialogOpen(true);
  };

  const handleTestWebhook = async (webhookId: string) => {
    await testMutation.mutateAsync(webhookId);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <motion.div initial="hidden" animate="visible" variants={stagger}>
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <WebhookIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Webhook Management</h1>
                <p className="text-muted-foreground">
                  Configure webhooks to receive real-time event notifications
                </p>
              </div>
            </div>
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Webhook</DialogTitle>
                  <DialogDescription>
                    Configure a webhook to receive event notifications
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Webhook URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com/webhook"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret">Secret (optional)</Label>
                    <Input
                      id="secret"
                      type="password"
                      placeholder="webhook-secret-key"
                      value={formData.secret}
                      onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Used to verify webhook authenticity
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Events to Subscribe</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto p-4 border rounded-md">
                      {WEBHOOK_EVENTS.map((event) => (
                        <label
                          key={event.id}
                          className="flex items-start gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={formData.events.includes(event.id)}
                            onChange={() => handleToggleEvent(event.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">{event.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {event.description}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateWebhook}
                      disabled={!formData.url || formData.events.length === 0}
                    >
                      {createMutation.isPending && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Create Webhook
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Webhooks List */}
        <motion.div variants={fadeUp}>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : webhooks && webhooks.length > 0 ? (
            <div className="grid gap-4">
              <AnimatePresence>
                {webhooks.map((webhook) => (
                  <motion.div
                    key={webhook.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-muted rounded">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-lg font-medium">
                                {webhook.url}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={webhook.active ? 'default' : 'secondary'}
                                >
                                  {webhook.active ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  ID: {webhook.id}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={webhook.active}
                              onCheckedChange={(checked) =>
                                toggleMutation.mutate({ id: webhook.id, active: checked })
                              }
                              disabled={toggleMutation.isPending}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDeliveries(webhook)}
                            >
                              <Activity className="w-4 h-4 mr-2" />
                              Deliveries
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTestWebhook(webhook.id)}
                              disabled={testMutation.isPending}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Test
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(webhook.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground">
                            Subscribed Events:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <WebhookIcon className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first webhook to start receiving event notifications
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Webhook
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Delivery History Dialog */}
        <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Delivery History</DialogTitle>
              <DialogDescription>
                Recent webhook delivery attempts for {selectedWebhook?.url}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {deliveries && deliveries.length > 0 ? (
                <div className="space-y-2">
                  {deliveries.map((delivery) => (
                    <Card key={delivery.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {delivery.success ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                            )}
                            <div className="space-y-1">
                              <div className="font-medium">{delivery.event_type}</div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(delivery.created_at).toLocaleString()}
                                </span>
                                <span>Status: {delivery.status_code}</span>
                                <span>Time: {delivery.response_time_ms}ms</span>
                              </div>
                              {delivery.error && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                  <AlertCircle className="w-4 h-4" />
                                  {delivery.error}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant={delivery.success ? 'default' : 'destructive'}>
                            {delivery.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    No delivery history available
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}
