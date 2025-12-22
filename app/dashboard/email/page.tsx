import { Metadata } from 'next';
import EmailManagementClient from './EmailManagementClient';

export const metadata: Metadata = {
  title: 'Email System Management | AINative Dashboard',
  description: 'Manage email templates, configure settings, and monitor email activity and analytics.',
};

export default function EmailManagementPage() {
  return <EmailManagementClient />;
}
