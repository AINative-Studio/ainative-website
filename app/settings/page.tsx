import { Metadata } from 'next';
import SettingsClient from './SettingsClient';

export const metadata: Metadata = {
  title: 'Settings | AINative Studio',
  description: 'Manage your AINative Studio account settings, notification preferences, and communication settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
