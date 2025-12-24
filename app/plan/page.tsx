import { Metadata } from 'next';
import PlanManagementClient from './PlanManagementClient';

export const metadata: Metadata = {
  title: 'Plan Management - AI Native Studio',
  description: 'Manage your subscription, view your current plan, and explore available options',
};

export default function PlanManagementPage() {
  return <PlanManagementClient />;
}
