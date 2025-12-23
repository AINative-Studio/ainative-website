import { Metadata } from 'next';
import SessionsClient from './SessionsClient';

export const metadata: Metadata = {
  title: 'Session & Memory Management | AINative Studio',
  description: 'Manage AI sessions and memory context for your applications',
};

export default function SessionsPage() {
  return <SessionsClient />;
}
