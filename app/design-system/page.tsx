import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Design System - AI Native Studio',
  description: 'AI Native Studio Design System - Component library, design tokens, and UI guidelines for building consistent AI-native applications.',
  openGraph: {
    title: 'Design System - AI Native Studio',
    description: 'Component library, design tokens, and UI guidelines for building consistent AI-native applications.',
    type: 'website',
  },
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-vite-bg text-white pt-24 pb-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-6">
            <span>Design System</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            AI Native Design System
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Build beautiful, consistent AI-native applications with our comprehensive design system.
            Components, tokens, and guidelines all in one place.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="bg-[#161B22] rounded-2xl p-12 border border-[#2D333B]/50 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#4B6FED] to-[#8A63F4] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-gray-400 max-w-lg mx-auto">
            Our design system documentation is currently being developed.
            Check back soon for components, design tokens, accessibility guidelines, and more.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <div className="px-4 py-2 rounded-full bg-[#1C2128] border border-[#4B6FED]/30 text-gray-300 text-sm">
              UI Components
            </div>
            <div className="px-4 py-2 rounded-full bg-[#1C2128] border border-[#4B6FED]/30 text-gray-300 text-sm">
              Design Tokens
            </div>
            <div className="px-4 py-2 rounded-full bg-[#1C2128] border border-[#4B6FED]/30 text-gray-300 text-sm">
              Typography
            </div>
            <div className="px-4 py-2 rounded-full bg-[#1C2128] border border-[#4B6FED]/30 text-gray-300 text-sm">
              Color Palette
            </div>
            <div className="px-4 py-2 rounded-full bg-[#1C2128] border border-[#4B6FED]/30 text-gray-300 text-sm">
              Accessibility
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
