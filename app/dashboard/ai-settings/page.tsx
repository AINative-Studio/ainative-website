import { Metadata } from 'next';
import AISettingsClient from './AISettingsClient';

export const metadata: Metadata = {
  title: 'AI Model Settings - AI Native Studio',
  description: 'Manage your AI model registry and configure default models',
};

export default function AISettingsPage() {
  return <AISettingsClient />;
}
