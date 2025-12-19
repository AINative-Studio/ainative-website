import { Metadata } from 'next';
import MCPHostingClient from './MCPHostingClient';

export const metadata: Metadata = {
  title: 'MCP Servers | AINative Dashboard',
  description: 'Deploy and manage Model Context Protocol (MCP) servers. Access a catalog of pre-built MCP servers or deploy custom instances.',
};

export default function MCPHostingPage() {
  return <MCPHostingClient />;
}
