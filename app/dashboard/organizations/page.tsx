import { Metadata } from 'next';
import OrganizationsClient from './OrganizationsClient';

export const metadata: Metadata = {
  title: 'Organizations - AI Native Studio',
  description: 'Manage your organizations and team members',
};

export default function OrganizationsPage() {
  return <OrganizationsClient />;
}
