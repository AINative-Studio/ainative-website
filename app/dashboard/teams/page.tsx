import { Metadata } from 'next';
import TeamsClient from './TeamsClient';

export const metadata: Metadata = {
  title: 'Teams - AI Native Studio',
  description: 'Manage your teams and team members',
};

export default function TeamsPage() {
  return <TeamsClient />;
}
