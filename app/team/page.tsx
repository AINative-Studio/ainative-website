import { Metadata } from 'next';
import TeamSettingsClient from './TeamSettingsClient';

export const metadata: Metadata = {
  title: 'Team Settings | AINative Studio',
  description: 'Manage your team members, roles, and permissions. Invite new members and configure team settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeamSettingsPage() {
  return <TeamSettingsClient />;
}
