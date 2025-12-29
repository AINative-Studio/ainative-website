import { Metadata } from 'next';
import DeveloperSettingsClient from './DeveloperSettingsClient';

export const metadata: Metadata = {
  title: 'Developer Settings',
  description: 'Configure API access, webhooks, and integration settings for your AINative applications',
};

export default function DeveloperSettingsPage() {
  return <DeveloperSettingsClient />;
}
