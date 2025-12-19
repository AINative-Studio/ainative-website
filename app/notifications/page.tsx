import { Metadata } from 'next';
import NotificationsClient from './NotificationsClient';

export const metadata: Metadata = {
  title: 'Notifications | AI Native Studio',
  description: 'Manage your notifications and preferences',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
