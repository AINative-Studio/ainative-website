'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Settings, Shield, User, Save, Loader2 } from 'lucide-react';
import { userSettingsService } from '@/services/userSettingsService';
import { toast } from 'sonner';

interface NotificationPreference {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  security_alerts: boolean;
}

interface CommunicationSettings {
  preferred_language: string;
  timezone: string;
  email_frequency: 'immediate' | 'daily' | 'weekly';
}

interface UserProfile {
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  company?: string;
  location?: string;
  website?: string;
}

export default function SettingsClient() {
  // Profile state
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [notifications, setNotifications] = useState<NotificationPreference>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    security_alerts: true,
  });
  const [communication, setCommunication] = useState<CommunicationSettings>({
    preferred_language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    email_frequency: 'daily',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);

        // Load profile
        const profileData = await userSettingsService.getUserProfile();
        if (profileData) setProfile(profileData);

        // Load notification preferences
        const notificationPrefs = await userSettingsService.getNotificationPreferences();
        if (notificationPrefs) setNotifications(notificationPrefs);

        // Load communication settings
        const commSettings = await userSettingsService.getCommunicationSettings();
        if (commSettings) setCommunication(commSettings);

      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (key: keyof NotificationPreference, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleCommunicationChange = <K extends keyof CommunicationSettings>(
    key: K,
    value: CommunicationSettings[K]
  ) => {
    setCommunication(prev => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      await userSettingsService.updateUserProfile(profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    try {
      setSaving(true);
      await userSettingsService.updateNotificationPreferences(notifications);
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Failed to update notifications:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const saveCommunication = async () => {
    try {
      setSaving(true);
      await userSettingsService.updateCommunicationSettings(communication);
      toast.success('Communication settings updated');
    } catch (error) {
      console.error('Failed to update communication settings:', error);
      toast.error('Failed to update communication settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#4B6FED]" />
      </div>
    );
  }

  const renderProfileSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Full Name</label>
        <Input
          name="name"
          value={profile.name || ''}
          onChange={handleProfileChange}
          className="bg-[#0D1117] border border-gray-700 focus:ring-2 focus:ring-[#4B6FED]/30 focus:border-[#4B6FED]/70"
          placeholder="Enter your full name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Email</label>
        <Input
          type="email"
          name="email"
          value={profile.email || ''}
          onChange={handleProfileChange}
          className="bg-[#0D1117] border border-gray-700 focus:ring-2 focus:ring-[#4B6FED]/30 focus:border-[#4B6FED]/70"
          placeholder="Enter your email"
        />
      </div>
      <Button
        onClick={saveProfile}
        className="bg-[#4B6FED] hover:bg-[#3A56D3] transition-colors flex items-center gap-2 mt-4"
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Profile
      </Button>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-lg">
        <div>
          <h3 className="font-medium text-white">Email Notifications</h3>
          <p className="text-sm text-gray-400">Receive important updates via email</p>
        </div>
        <Switch
          checked={notifications.email_notifications}
          onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked)}
        />
      </div>
      <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-lg">
        <div>
          <h3 className="font-medium text-white">Push Notifications</h3>
          <p className="text-sm text-gray-400">Get browser notifications</p>
        </div>
        <Switch
          checked={notifications.push_notifications}
          onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked)}
        />
      </div>
      <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-lg">
        <div>
          <h3 className="font-medium text-white">Marketing Emails</h3>
          <p className="text-sm text-gray-400">Receive product updates and offers</p>
        </div>
        <Switch
          checked={notifications.marketing_emails}
          onCheckedChange={(checked) => handleNotificationChange('marketing_emails', checked)}
        />
      </div>
      <div className="flex items-center justify-between p-4 bg-[#0D1117] rounded-lg">
        <div>
          <h3 className="font-medium text-white">Security Alerts</h3>
          <p className="text-sm text-gray-400">Get notified about security events</p>
        </div>
        <Switch
          checked={notifications.security_alerts}
          onCheckedChange={(checked) => handleNotificationChange('security_alerts', checked)}
        />
      </div>
      <Button
        onClick={saveNotifications}
        className="bg-[#4B6FED] hover:bg-[#3A56D3] transition-colors flex items-center gap-2 mt-4"
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Notification Preferences
      </Button>
    </div>
  );

  const renderCommunicationSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">Email Frequency</label>
        <select
          value={communication.email_frequency}
          onChange={(e) => handleCommunicationChange('email_frequency', e.target.value as 'immediate' | 'daily' | 'weekly')}
          className="w-full p-2 bg-[#0D1117] border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-[#4B6FED]/30 focus:border-[#4B6FED]/70"
        >
          <option value="immediate">Immediate</option>
          <option value="daily">Daily Digest</option>
          <option value="weekly">Weekly Digest</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-white mb-2">Timezone</label>
        <Input
          type="text"
          value={communication.timezone}
          onChange={(e) => handleCommunicationChange('timezone', e.target.value)}
          className="bg-[#0D1117] border border-gray-700 focus:ring-2 focus:ring-[#4B6FED]/30 focus:border-[#4B6FED]/70"
          disabled
        />
        <p className="text-xs text-gray-500 mt-1">Timezone is automatically detected from your browser</p>
      </div>
      <Button
        onClick={saveCommunication}
        className="bg-[#4B6FED] hover:bg-[#3A56D3] transition-colors flex items-center gap-2 mt-4"
        disabled={saving}
      >
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        Save Communication Settings
      </Button>
    </div>
  );

  return (
    <motion.div
      className="max-w-3xl mx-auto px-4 md:px-6 pt-4 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-5 w-5 text-[#4B6FED]" />
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </div>
        <p className="text-gray-400">
          Configure your account preferences and settings.
        </p>
      </div>

      {/* Profile Section */}
      <motion.div
        className="mb-6 bg-[#161B22] p-6 rounded-lg border border-gray-800 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="h-4 w-4 text-[#4B6FED]" />
          <h2 className="font-semibold text-lg text-white">Profile Settings</h2>
        </div>
        {renderProfileSection()}
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        className="mb-6 bg-[#161B22] p-6 rounded-lg border border-gray-800 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-[#4B6FED]" />
          <h2 className="font-semibold text-lg text-white">Notification Preferences</h2>
        </div>
        {renderNotificationsSection()}
      </motion.div>

      {/* Communication Section */}
      <motion.div
        className="mb-6 bg-[#161B22] p-6 rounded-lg border border-gray-800 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-[#4B6FED]" />
          <h2 className="font-semibold text-lg text-white">Communication Settings</h2>
        </div>
        {renderCommunicationSection()}
      </motion.div>

      {/* Danger Zone Section */}
      <motion.div
        className="mb-6 bg-[#161B22] p-6 rounded-lg border border-red-500/50 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-red-500" />
          <h2 className="text-red-500 font-semibold text-lg">Danger Zone</h2>
        </div>

        <div className="bg-[#1A0A0A] border border-red-500/20 p-4 rounded-md mb-4">
          <p className="text-gray-300 text-sm">Deleting your account will permanently remove all your data, settings, and access to our services. This action cannot be undone.</p>
        </div>

        <Button
          variant="destructive"
          className="bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2"
          onClick={() => {
            toast.error('Account deletion is currently disabled');
          }}
        >
          Delete your account
        </Button>
      </motion.div>

      <div className="text-center text-xs text-gray-500 mb-8">
        AINative © 2025 - All rights reserved
      </div>
    </motion.div>
  );
}
