import { Metadata } from 'next';
import OrganizationDetailClient from './OrganizationDetailClient';

export const metadata: Metadata = {
  title: 'Organization Details - AI Native Studio',
  description: 'Manage organization settings and members',
};

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  return <OrganizationDetailClient organizationId={params.id} />;
}
