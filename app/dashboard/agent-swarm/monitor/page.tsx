import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import AgentSwarmMonitorClient from './AgentSwarmMonitorClient';

export const metadata = {
  title: 'Agent Swarm Monitor | AINative Studio',
  description: 'Real-time monitoring dashboard for AI agent swarms',
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-[#4B6FED]" />
      <span className="ml-3 text-lg">Loading Monitor...</span>
    </div>
  );
}

export default function AgentSwarmMonitorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AgentSwarmMonitorClient />
    </Suspense>
  );
}
