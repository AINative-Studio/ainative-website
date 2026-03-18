import React from "react";

import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const NotificationsClient = dynamic(() => import('./NotificationsClient'), { ssr: false });

export const metadata: Metadata = {
  title: 'Notifications | AI Native Studio',
  description: 'Manage your notifications and preferences',
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
