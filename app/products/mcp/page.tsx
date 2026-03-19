import React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MCP Server Hosting - Deploy Model Context Protocol Servers | AI Native Studio',
  description: 'Deploy and manage MCP servers in minutes. Host AI agent tools with monitoring, auto-scaling, and credit-based billing.',
  keywords: [
    'MCP server hosting', 'Model Context Protocol', 'OpenClaw strategy',
    'AI agent tools', 'MCP deployment', 'NemoClaw', 'agentic AI',
    'ADE agent deployment expert', 'deploy MCP server', 'AI agent platform',
  ],
  openGraph: {
    title: 'MCP Server Hosting | AI Native Studio',
    description: 'Deploy and manage MCP servers in minutes with auto-scaling and credit-based billing.',
    type: 'website',
    url: 'https://www.ainative.studio/products/mcp',
  },
  alternates: { canonical: 'https://www.ainative.studio/products/mcp' },
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MCP Server Hosting',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Cloud',
  description: 'Deploy and manage Model Context Protocol servers. Host AI agent tools with monitoring, auto-scaling, and credit-based billing.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Credit-based billing starting at 1 credit/hour' },
  author: { '@type': 'Organization', name: 'AI Native Studio', url: 'https://www.ainative.studio' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ainative.studio' },
    { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.ainative.studio/products' },
    { '@type': 'ListItem', position: 3, name: 'MCP Server Hosting', item: 'https://www.ainative.studio/products/mcp' },
  ],
};

export default function MCPPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen bg-[#0D1117] text-white">
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
              <span className="text-sm text-emerald-400">Model Context Protocol Hosting</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">MCP Server Hosting</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Deploy AI agent tools in minutes. 14+ pre-built MCP servers with auto-scaling, health monitoring, and credit-based billing.
            </p>
            <blockquote className="text-lg text-gray-400 italic mb-8 max-w-2xl mx-auto">
              &ldquo;Every company needs an OpenClaw strategy&rdquo; — Jensen Huang, NVIDIA GTC 2026
            </blockquote>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/dashboard/mcp-hosting" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90">Deploy Your First MCP Server →</a>
              <a href="/pricing" className="px-8 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-emerald-500/50">View Pricing</a>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">14+</div><div className="text-sm text-gray-500">MCP Servers</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">&lt;60s</div><div className="text-sm text-gray-500">Deploy Time</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-emerald-400">99.9%</div><div className="text-sm text-gray-500">Uptime</div></div>
            </div>
          </div>
        </section>
        <section className="py-20 px-6 bg-[#0A0D14]">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Available MCP Servers</h2>
            <p className="text-gray-400 mb-12">GitHub, PostgreSQL, Memory, Slack, Gmail, Filesystem, Brave Search, SQLite, and more.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['GitHub','PostgreSQL','Memory','Slack','Gmail','Filesystem','Brave Search','Puppeteer','SQLite','Fetch','EverArt','Sentry','AWS KB','Shadcn UI'].map(s => (
                <div key={s} className="bg-[#1C2128] rounded-xl p-4 border border-white/10 hover:border-emerald-500/40 transition-colors">
                  <span className="text-sm font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[['01','Choose a Server','Browse 14+ production-ready MCP servers'],['02','Configure','Enter API keys securely — encrypted with AES-256'],['03','Deploy','Get an MCP endpoint URL in seconds']].map(([n,t,d]) => (
                <div key={n} className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-xl font-bold mb-4">{n}</div>
                  <h3 className="text-lg font-bold mb-2">{t}</h3>
                  <p className="text-gray-400 text-sm">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 px-6 bg-[#0A0D14]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Start Your OpenClaw Strategy</h2>
            <p className="text-gray-400 text-lg mb-8">Give your AI agents the tools they need. Deploy MCP servers free and scale as you grow.</p>
            <a href="/dashboard/mcp-hosting" className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90">Get Started Free →</a>
          </div>
        </section>
      </div>
    </>
  );
}
