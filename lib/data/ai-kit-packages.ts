import {
  Cpu,
  Lock,
  Code2,
  Globe,
  Palette,
  Database,
  Terminal,
  TestTube2,
  Eye,
  Shield,
  Workflow,
  Box,
  type LucideIcon,
} from "lucide-react";

export interface AIKitPackage {
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  gradient: string;
  features: string[];
}

export const aiKitPackages: AIKitPackage[] = [
  {
    name: "@ainative-studio/aikit-core",
    description: "Core utilities and shared types for AI Kit ecosystem",
    icon: Cpu,
    category: "Core",
    gradient: "from-blue-500 to-cyan-500",
    features: ["Type safety", "Base utilities", "Common interfaces"],
  },
  {
    name: "@ainative/ai-kit-auth",
    description: "Authentication and authorization utilities for AI applications",
    icon: Lock,
    category: "Security",
    gradient: "from-purple-500 to-pink-500",
    features: ["JWT handling", "OAuth flows", "Session management"],
  },
  {
    name: "@ainative/ai-kit",
    description: "React hooks and components for AI-powered applications",
    icon: Code2,
    category: "Framework",
    gradient: "from-cyan-500 to-blue-500",
    features: ["Custom hooks", "AI components", "State management"],
  },
  {
    name: "@ainative/ai-kit-vue",
    description: "Vue composables and components for AI integration",
    icon: Code2,
    category: "Framework",
    gradient: "from-green-500 to-emerald-500",
    features: ["Composables", "Vue 3 support", "Reactive AI"],
  },
  {
    name: "@ainative/ai-kit-svelte",
    description: "Svelte stores and components for AI applications",
    icon: Code2,
    category: "Framework",
    gradient: "from-orange-500 to-red-500",
    features: ["Svelte stores", "Components", "Reactive patterns"],
  },
  {
    name: "@ainative/ai-kit-nextjs",
    description: "Next.js utilities and middleware for AI integration",
    icon: Globe,
    category: "Framework",
    gradient: "from-slate-700 to-slate-900",
    features: ["Server actions", "API routes", "Edge runtime"],
  },
  {
    name: "@ainative/ai-kit-design-system",
    description: "Pre-built UI components and design tokens for AI interfaces",
    icon: Palette,
    category: "UI/UX",
    gradient: "from-pink-500 to-rose-500",
    features: ["Design tokens", "Components", "Themes"],
  },
  {
    name: "@ainative/ai-kit-zerodb",
    description: "ZeroDB client SDK for vector search and AI-native storage",
    icon: Database,
    category: "Data",
    gradient: "from-violet-500 to-purple-500",
    features: ["Vector search", "AI storage", "Real-time sync"],
  },
  {
    name: "@ainative/ai-kit-cli",
    description: "Command-line tools for AI Kit development and deployment",
    icon: Terminal,
    category: "DevTools",
    gradient: "from-gray-600 to-gray-800",
    features: ["Project scaffolding", "Deploy tools", "Code generation"],
  },
  {
    name: "@ainative/ai-kit-testing",
    description: "Testing utilities and mocks for AI applications",
    icon: TestTube2,
    category: "DevTools",
    gradient: "from-yellow-500 to-amber-500",
    features: ["AI mocks", "Test helpers", "Fixtures"],
  },
  {
    name: "@ainative/ai-kit-observability",
    description: "Monitoring, logging, and observability tools for AI systems",
    icon: Eye,
    category: "DevTools",
    gradient: "from-indigo-500 to-blue-500",
    features: ["Metrics", "Tracing", "Logging"],
  },
  {
    name: "@ainative/ai-kit-safety",
    description: "Safety guardrails and content moderation utilities",
    icon: Shield,
    category: "Security",
    gradient: "from-emerald-500 to-teal-500",
    features: ["Content filtering", "Rate limiting", "Guardrails"],
  },
  {
    name: "@ainative/ai-kit-rlhf",
    description: "Reinforcement Learning from Human Feedback utilities",
    icon: Workflow,
    category: "ML",
    gradient: "from-fuchsia-500 to-purple-500",
    features: ["Feedback collection", "Model training", "A/B testing"],
  },
  {
    name: "@ainative/ai-kit-tools",
    description: "Function calling and tool integration utilities",
    icon: Box,
    category: "Core",
    gradient: "from-sky-500 to-blue-500",
    features: ["Function schemas", "Tool execution", "Type validation"],
  },
];

export const codeExamples = {
  react: `import { useAIChat, useAICompletion } from '@ainative/ai-kit';

function ChatComponent() {
  const { messages, sendMessage, isLoading } = useAIChat({
    model: 'gpt-4',
    systemPrompt: 'You are a helpful assistant'
  });

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>
        Send
      </button>
    </div>
  );
}`,
  vue: `<script setup>
import { useAIChat } from '@ainative/ai-kit-vue';

const { messages, sendMessage, isLoading } = useAIChat({
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant'
});
</script>

<template>
  <div>
    <div v-for="msg in messages" :key="msg.id">
      {{ msg.content }}
    </div>
    <button @click="sendMessage('Hello!')">
      Send
    </button>
  </div>
</template>`,
  cli: `# Install AI Kit CLI globally
npm install -g @ainative/ai-kit-cli

# Create new AI Kit project
ai-kit create my-app --template react

# Add AI capabilities to existing project
ai-kit add chat --framework react

# Deploy to production
ai-kit deploy --env production`,
};

export const features = [
  {
    title: "Production Ready",
    description: "Battle-tested packages used in production by thousands of developers",
  },
  {
    title: "Type Safe",
    description: "Full TypeScript support with comprehensive type definitions",
  },
  {
    title: "Framework Agnostic",
    description: "Works with React, Vue, Svelte, Next.js, and vanilla JavaScript",
  },
  {
    title: "AI Native",
    description: "Purpose-built for modern AI application development",
  },
  {
    title: "Vector Storage",
    description: "Integrated with ZeroDB for seamless vector search",
  },
  {
    title: "Observable",
    description: "Built-in monitoring, logging, and debugging tools",
  },
];
