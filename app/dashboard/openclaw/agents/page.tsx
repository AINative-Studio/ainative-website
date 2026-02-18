import { Metadata } from 'next';
import OpenClawAgentsClient from './OpenClawAgentsClient';

export const metadata: Metadata = {
  title: 'Agents - OpenClaw - AINative Studio',
  description: 'View, search, and manage your AI agents',
};

export default function OpenClawAgentsPage() {
  return <OpenClawAgentsClient />;
}
