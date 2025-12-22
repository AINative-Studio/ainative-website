import { Metadata } from 'next';
import WebhooksClient from './WebhooksClient';

export const metadata: Metadata = {
  title: 'Webhook Management | AINative Dashboard',
  description: 'Configure and manage webhooks to receive real-time event notifications from AINative services.',
};

export default function WebhooksPage() {
  return <WebhooksClient />;
}
