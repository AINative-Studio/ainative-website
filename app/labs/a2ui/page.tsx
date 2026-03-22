import React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'A2UI Protocol - Agent-to-User Interface | AINative Moonshot Labs',
  description: 'A2UI lets AI agents generate rich, interactive UIs via safe declarative JSON. Framework-agnostic protocol with React, Next.js, Vue, and Svelte renderers.',
  keywords: [
    'A2UI protocol', 'agent to user interface', 'AI generated UI',
    'declarative UI JSON', 'agent UI protocol', 'Google A2UI',
    'dynamic UI generation', 'LLM UI rendering', 'framework agnostic UI',
    'React AI components', 'AI agent interface',
  ],
  openGraph: {
    title: 'A2UI Protocol | AINative Moonshot Labs',
    description: 'Let AI agents generate rich, interactive UIs via safe JSON. No executable code, no XSS.',
    type: 'website',
    url: 'https://www.ainative.studio/labs/a2ui',
  },
  alternates: { canonical: 'https://www.ainative.studio/labs/a2ui' },
};

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'A2UI Protocol - AINative Implementation',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  description: 'Agent-to-User Interface protocol enabling AI agents to dynamically generate rich, interactive UIs using declarative JSON.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Open source, free to use' },
  author: { '@type': 'Organization', name: 'AI Native Studio', url: 'https://www.ainative.studio' },
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ainative.studio' },
    { '@type': 'ListItem', position: 2, name: 'Moonshot Labs', item: 'https://www.ainative.studio/labs' },
    { '@type': 'ListItem', position: 3, name: 'A2UI Protocol', item: 'https://www.ainative.studio/labs/a2ui' },
  ],
};

export default function A2UIPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div className="min-h-screen bg-[#0D1117] text-white">
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
              <span className="text-sm text-amber-400">AINative Moonshot Labs</span>
              <span className="text-xs text-amber-500/60 ml-1">Experimental</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">A2UI</span>
              <br />
              <span className="text-3xl md:text-4xl text-gray-300">Agent-to-User Interface</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Let AI agents generate rich, interactive UIs through safe declarative JSON.
              No executable code. No XSS. Just components your app already trusts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/AINative-Studio/ai-kit-a2ui" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90">
                View on GitHub
              </a>
              <a href="https://www.npmjs.com/package/@ainative/ai-kit-a2ui-core" target="_blank" rel="noopener noreferrer" className="px-8 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-amber-500/50">
                NPM Package
              </a>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-16 max-w-lg mx-auto">
              <div className="text-center"><div className="text-3xl font-bold text-amber-400">17</div><div className="text-sm text-gray-500">Components</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-amber-400">96%</div><div className="text-sm text-gray-500">Test Coverage</div></div>
              <div className="text-center"><div className="text-3xl font-bold text-amber-400">0</div><div className="text-sm text-gray-500">Dependencies</div></div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-6 bg-[#0A0D14]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">How A2UI Works</h2>
            <p className="text-gray-400 mb-12 text-center max-w-2xl mx-auto">
              Your agent describes the UI it wants in JSON. Your app renders it using pre-approved components from its own catalog. The agent never touches the DOM.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Agent sends JSON */}
              <div className="bg-[#1C2128] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <span className="text-sm text-gray-400">Agent output (JSON)</span>
                </div>
                <div className="p-5 font-mono text-sm">
                  <div className="text-gray-500">{'// Agent generates safe JSON'}</div>
                  <div className="text-amber-300/80 mt-2">{`{`}</div>
                  <div className="text-amber-300/80 pl-4">{`"type": "Container",`}</div>
                  <div className="text-amber-300/80 pl-4">{`"children": [`}</div>
                  <div className="text-amber-300/80 pl-8">{`{ "type": "Heading", "text": "Hello!" },`}</div>
                  <div className="text-amber-300/80 pl-8">{`{ "type": "Button", "label": "Get Started",`}</div>
                  <div className="text-amber-300/80 pl-10">{`"action": "navigate:/signup" }`}</div>
                  <div className="text-amber-300/80 pl-4">{`]`}</div>
                  <div className="text-amber-300/80">{`}`}</div>
                </div>
              </div>

              {/* App renders UI */}
              <div className="bg-[#1C2128] rounded-xl border border-white/10 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-400">Your app renders</span>
                </div>
                <div className="p-5 font-mono text-sm">
                  <div className="text-gray-500">{'// Rendered using your own components'}</div>
                  <div className="text-green-400 mt-2">{`import { A2UIRenderer } from`}</div>
                  <div className="text-green-400">{`  '@ainative/ai-kit-a2ui';`}</div>
                  <div className="mt-3 text-green-400">{`<A2UIRenderer`}</div>
                  <div className="text-green-400 pl-4">{`spec={agentOutput}`}</div>
                  <div className="text-green-400 pl-4">{`registry={componentCatalog}`}</div>
                  <div className="text-green-400">{`/>`}</div>
                  <div className="mt-3 text-gray-500">{'// Renders: Heading + Button'}</div>
                  <div className="text-gray-500">{'// using YOUR shadcn/ui components'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why A2UI */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Why A2UI?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Security First',
                  desc: 'Agents generate JSON, not code. No eval(), no innerHTML, no XSS vectors. Your component catalog is the security boundary.',
                  icon: '🛡️',
                },
                {
                  title: 'Framework Agnostic',
                  desc: 'Same A2UI JSON renders on React, Vue, Svelte, Flutter, iOS, or Android. Write once, render anywhere.',
                  icon: '🔌',
                },
                {
                  title: 'LLM Friendly',
                  desc: 'Simple JSON structure that LLMs generate reliably. Supports progressive/streaming rendering for real-time agent UIs.',
                  icon: '🤖',
                },
              ].map(({ title, desc, icon }) => (
                <div key={title} className="bg-[#1C2128] rounded-xl p-6 border border-white/10">
                  <div className="text-3xl mb-4">{icon}</div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Component Catalog */}
        <section className="py-20 px-6 bg-[#0A0D14]">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">17 Standard Components</h2>
            <p className="text-gray-400 mb-12">Every component maps to your existing UI library. Built-in support for shadcn/ui and Radix UI.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { name: 'Text', status: 'done' },
                { name: 'Heading', status: 'done' },
                { name: 'Button', status: 'done' },
                { name: 'Container', status: 'done' },
                { name: 'TextField', status: 'done' },
                { name: 'CheckBox', status: 'done' },
                { name: 'Slider', status: 'done' },
                { name: 'Tabs', status: 'done' },
                { name: 'List', status: 'done' },
                { name: 'ChoicePicker', status: 'done' },
                { name: 'Divider', status: 'done' },
                { name: 'Icon', status: 'planned' },
                { name: 'Image', status: 'planned' },
                { name: 'Video', status: 'planned' },
                { name: 'AudioPlayer', status: 'planned' },
                { name: 'Modal', status: 'planned' },
                { name: 'DateInput', status: 'planned' },
              ].map(({ name, status }) => (
                <div key={name} className={`rounded-xl p-3 border transition-colors ${status === 'done' ? 'bg-[#1C2128] border-amber-500/30 hover:border-amber-500/60' : 'bg-[#1C2128]/50 border-white/5'}`}>
                  <span className="text-sm font-medium">{name}</span>
                  <div className={`text-xs mt-1 ${status === 'done' ? 'text-amber-400' : 'text-gray-600'}`}>
                    {status === 'done' ? 'Implemented' : 'Planned'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">AINative A2UI Packages</h2>
            <div className="space-y-6">
              {[
                {
                  name: '@ainative/ai-kit-a2ui-core',
                  desc: 'Framework-agnostic core library. Protocol types, JSON Pointer (RFC 6901), WebSocket transport, component registry. Zero dependencies.',
                  cmd: 'npm i @ainative/ai-kit-a2ui-core',
                  status: 'Alpha',
                  tests: '429 tests, 96% coverage',
                },
                {
                  name: '@ainative/ai-kit-a2ui',
                  desc: 'React renderer with shadcn/ui component mappings. 11 of 17 components implemented.',
                  cmd: 'npm i @ainative/ai-kit-a2ui',
                  status: 'Alpha',
                  tests: '70 tests passing',
                },
                {
                  name: '@ainative/ai-kit-nextjs-a2ui',
                  desc: 'Next.js renderer with Server Components, Server Actions, and Streaming SSR support.',
                  cmd: '',
                  status: 'Planned',
                  tests: '',
                },
              ].map(({ name, desc, cmd, status, tests }) => (
                <div key={name} className="bg-[#1C2128] rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold font-mono text-white">{name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${status === 'Alpha' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{desc}</p>
                  {cmd && (
                    <div className="bg-[#0D1117] rounded-lg px-4 py-2 font-mono text-sm text-gray-300 border border-gray-800/50 inline-block mb-2">
                      <span className="text-gray-500">$ </span>{cmd}
                    </div>
                  )}
                  {tests && (
                    <div className="text-xs text-gray-500 mt-2">{tests}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 bg-[#0A0D14]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Build Agent UIs That Users Trust</h2>
            <p className="text-gray-400 text-lg mb-8">A2UI is open source and built on Google&apos;s A2UI v0.8 protocol. Contribute, extend, or just use it.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://github.com/AINative-Studio/ai-kit-a2ui-core" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90">
                Star on GitHub
              </a>
              <a href="https://github.com/google/a2ui" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3 border border-gray-700 text-gray-300 rounded-lg font-medium hover:border-amber-500/50">
                Google A2UI Spec
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
