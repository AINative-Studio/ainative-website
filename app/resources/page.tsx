import { Metadata } from 'next';
import ResourcesClient from './ResourcesClient';

export const metadata: Metadata = {
  title: 'Developer Resources | AINative Studio',
  description: 'SDKs, MCP servers, templates, code examples, and tools to accelerate your AI development with AINative.',
  openGraph: {
    title: 'AINative Developer Resources',
    description: 'SDKs, MCP servers, templates, and tools for AI development',
    type: 'website',
  },
};

export default function ResourcesPage() {
  return <ResourcesClient />;
}
