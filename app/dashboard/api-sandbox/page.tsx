import { Metadata } from 'next';
import APISandboxClient from './APISandboxClient';

export const metadata: Metadata = {
  title: 'API Sandbox | AINative Dashboard',
  description: 'Test and experiment with AI Native APIs in a secure sandbox environment. Execute code, test endpoints, and view results in real-time.',
};

export default function APISandboxPage() {
  return <APISandboxClient />;
}
