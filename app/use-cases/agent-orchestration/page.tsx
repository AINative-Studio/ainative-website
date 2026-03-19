import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Agent Orchestration with Agent Swarm | AI Native Studio',
  description: 'Deploy multi-agent AI systems with Agent Swarm. Build your OpenClaw strategy with autonomous agents that take real-world actions.',
  keywords: ['AI agent orchestration', 'multi-agent system', 'agentic AI', 'OpenClaw strategy', 'agent swarm', 'NemoClaw', 'ADE agent deployment expert', 'enterprise AI agents'],
  alternates: { canonical: 'https://www.ainative.studio/use-cases/agent-orchestration' },
};

export default function AgentOrchestrationPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white pt-32 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/use-cases" className="text-gray-500 hover:text-white text-sm mb-6 block">← All Use Cases</Link>
        <h1 className="text-4xl md:text-5xl font-bold mb-6">AI Agent Orchestration</h1>
        <p className="text-xl text-gray-400 mb-4">Deploy multi-agent systems that take real-world actions. Your OpenClaw strategy starts here.</p>
        <blockquote className="text-lg text-gray-500 italic mb-8 border-l-4 border-blue-500 pl-4">&ldquo;Every company needs an OpenClaw strategy, an agentic system strategy. This is as big as Linux.&rdquo; — Jensen Huang, NVIDIA GTC 2026</blockquote>
        <div className="space-y-8">
          <section><h2 className="text-2xl font-bold mb-3">What is Agent Orchestration?</h2><p className="text-gray-300">Instead of one AI model doing everything, agent orchestration coordinates specialized AI agents. Each agent has a role — researcher, coder, reviewer, deployer — and they collaborate autonomously to complete complex tasks.</p></section>
          <section><h2 className="text-2xl font-bold mb-3">Agent Swarm Features</h2>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Multi-agent workflows with specialized roles</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> MCP tool integration (GitHub, databases, search)</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Persistent agent memory via ZeroDB</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Real-time monitoring and health checks</li>
              <li className="flex items-start gap-2"><span className="text-green-400">✓</span> ADE (Agent Deployment Expert) support</li>
            </ul>
          </section>
        </div>
        <div className="mt-12 text-center">
          <a href="/agent-swarm" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mr-4">Explore Agent Swarm →</a>
          <a href="/products/mcp" className="inline-block px-8 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-blue-500/50">MCP Server Hosting →</a>
        </div>
      </div>
    </div>
  );
}
