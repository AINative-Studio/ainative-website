'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  BellOff,
  CheckCheck,
  X,
  Settings,
  Trash2,
  Mail,
  Smartphone,
  Globe,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Shield,
  CreditCard,
  Cpu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import notificationService, { Notification, NotificationPreferences } from '@/lib/notification-service';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const notificationTypeIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  update: Sparkles,
  promotion: TrendingUp,
};

const notificationTypeColors = {
  info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
  success: 'from-green-500/20 to-green-600/20 border-green-500/30',
  warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  error: 'from-red-500/20 to-red-600/20 border-red-500/30',
  update: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  promotion: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
};

const categoryIcons = {
  system: Cpu,
  billing: CreditCard,
  security: Shield,
  feature: Sparkles,
  marketing: TrendingUp,
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = notificationTypeIcons[notification.type];
  const CategoryIcon = categoryIcons[notification.category];
  const colorClass = notificationTypeColors[notification.type];

  return (
    <motion.div
      variants={fadeUp}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-4 rounded-xl border bg-gradient-to-br ${colorClass} backdrop-blur-sm ${
        !notification.read ? 'ring-2 ring-blue-500/30' : ''
      }`}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-white">{notification.title}</h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              <CategoryIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">{formatTimeAgo(notification.createdAt)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-3">{notification.message}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {notification.actionUrl && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs bg-white/10 hover:bg-white/20 text-white"
                onClick={() => window.location.href = notification.actionUrl!}
              >
                {notification.actionLabel || 'View'}
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs hover:bg-white/10 text-gray-400 hover:text-white"
              onClick={() => notification.read ? onMarkAsUnread(notification.id) : onMarkAsRead(notification.id)}
            >
              {notification.read ? (
                <>
                  <BellOff className="w-3 h-3 mr-1" />
                  Mark Unread
                </>
              ) : (
                <>
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Mark Read
                </>
              )}
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs hover:bg-red-500/20 text-gray-400 hover:text-red-400"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PreferencesPanel({ preferences, onUpdate }: { preferences: NotificationPreferences; onUpdate: (prefs: NotificationPreferences) => void }) {
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleToggle = (channel: 'email' | 'inApp' | 'push', category: 'enabled' | 'system' | 'billing' | 'security' | 'feature' | 'marketing') => {
    const updated = {
      ...localPrefs,
      [channel]: {
        ...localPrefs[channel],
        [category]: !localPrefs[channel][category],
      },
    };
    setLocalPrefs(updated);
    onUpdate(updated);
  };

  return (
    <motion.div
      variants={fadeUp}
      className="space-y-6"
    >
      {/* Email Preferences */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Email Notifications</h3>
            <p className="text-sm text-gray-400">Receive notifications via email</p>
          </div>
          <Switch
            checked={localPrefs.email.enabled}
            onCheckedChange={() => handleToggle('email', 'enabled')}
            className="ml-auto"
          />
        </div>

        {localPrefs.email.enabled && (
          <div className="space-y-3 pl-13 border-l-2 border-white/10 ml-5">
            {['system', 'billing', 'security', 'feature', 'marketing'].map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{cat}</span>
                <Switch
                  checked={localPrefs.email[cat as keyof typeof localPrefs.email] as boolean}
                  onCheckedChange={() => handleToggle('email', cat as any)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* In-App Preferences */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">In-App Notifications</h3>
            <p className="text-sm text-gray-400">Show notifications in the app</p>
          </div>
          <Switch
            checked={localPrefs.inApp.enabled}
            onCheckedChange={() => handleToggle('inApp', 'enabled')}
            className="ml-auto"
          />
        </div>

        {localPrefs.inApp.enabled && (
          <div className="space-y-3 pl-13 border-l-2 border-white/10 ml-5">
            {['system', 'billing', 'security', 'feature', 'marketing'].map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{cat}</span>
                <Switch
                  checked={localPrefs.inApp[cat as keyof typeof localPrefs.inApp] as boolean}
                  onCheckedChange={() => handleToggle('inApp', cat as any)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Push Preferences */}
      <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Push Notifications</h3>
            <p className="text-sm text-gray-400">Receive push notifications on your device</p>
          </div>
          <Switch
            checked={localPrefs.push.enabled}
            onCheckedChange={() => handleToggle('push', 'enabled')}
            className="ml-auto"
          />
        </div>

        {localPrefs.push.enabled && (
          <div className="space-y-3 pl-13 border-l-2 border-white/10 ml-5">
            {['system', 'billing', 'security', 'feature', 'marketing'].map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-gray-300 capitalize">{cat}</span>
                <Switch
                  checked={localPrefs.push[cat as keyof typeof localPrefs.push] as boolean}
                  onCheckedChange={() => handleToggle('push', cat as any)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function NotificationsClient() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => notificationService.getNotifications(filter),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Fetch preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: () => notificationService.getPreferences(),
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => notificationService.getStats(),
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });

  // Mark as unread mutation
  const markAsUnreadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: NotificationPreferences) => notificationService.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
  });

  return (
    <div className="relative flex flex-col min-h-screen bg-vite-bg text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D1117] via-[#0D1117] to-[#1A1B2E]" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(75, 111, 237, 0.25) 0%, transparent 30%), radial-gradient(circle at 80% 70%, rgba(138, 99, 244, 0.25) 0%, transparent 30%)',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="container max-w-6xl mx-auto px-4 pt-24 pb-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">
              Notifications
            </h1>
            <p className="text-gray-400">
              Stay updated with the latest news and updates
            </p>
          </div>

          <Button
            variant="ghost"
            className="gap-2 bg-white/5 hover:bg-white/10"
            onClick={() => setShowPreferences(!showPreferences)}
          >
            <Settings className="w-4 h-4" />
            {showPreferences ? 'Hide' : 'Show'} Settings
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                  <p className="text-sm text-gray-300">Total Notifications</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
              <div className="flex items-center gap-3">
                <BellOff className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.unread}</p>
                  <p className="text-sm text-gray-300">Unread</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
              <div className="flex items-center gap-3">
                <CheckCheck className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{stats.total - stats.unread}</p>
                  <p className="text-sm text-gray-300">Read</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 pb-24">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            {/* Filter Tabs */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-white/10'}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'unread' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('unread')}
                  className={filter === 'unread' ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-white/10'}
                >
                  Unread
                </Button>
                <Button
                  variant={filter === 'read' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter('read')}
                  className={filter === 'read' ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-white/10'}
                >
                  Read
                </Button>
              </div>

              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  className="gap-2 hover:bg-white/10"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark All as Read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-4 text-gray-400">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="text-center py-12"
              >
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
                <p className="text-gray-400">You are all caught up!</p>
              </motion.div>
            ) : (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                      onMarkAsUnread={(id) => markAsUnreadMutation.mutate(id)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            {preferences && (
              <PreferencesPanel
                preferences={preferences}
                onUpdate={(prefs) => updatePreferencesMutation.mutate(prefs)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
