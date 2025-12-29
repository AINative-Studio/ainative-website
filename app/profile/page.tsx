import { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your AINative account profile and preferences',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
