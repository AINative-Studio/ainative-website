'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { Rocket, Shield, Users, Code, Lightbulb, Cloud, Cpu, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation variants
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

const values = [
  {
    icon: Rocket,
    title: 'Innovation',
    description: "Pushing boundaries of what's possible with AI infrastructure",
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Enterprise-grade security for your AI workloads',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Building with and for the developer community',
  },
  {
    icon: Code,
    title: 'Simplicity',
    description: 'Making complex AI simple and accessible',
  },
];

const techStack = [
  {
    icon: Code,
    title: 'Languages & SDKs',
    color: 'blue',
    items: [
      'Python 3.11+ with async/await support',
      'TypeScript 5.x with full type safety',
      'Go 1.21+ with native concurrency',
      'JavaScript (ES6+) for browsers',
    ],
  },
  {
    icon: Layers,
    title: 'Frameworks',
    color: 'purple',
    items: [
      'React 18 with TypeScript',
      'FastAPI for high-performance APIs',
      'Next.js for blazing-fast builds',
      'Tailwind CSS for modern UI',
    ],
  },
  {
    icon: Cloud,
    title: 'Infrastructure',
    color: 'green',
    items: [
      'Railway for seamless deployments',
      'Vercel for frontend hosting',
      'PostgreSQL 15 with ZeroDB',
      'Redis for caching & real-time',
    ],
  },
  {
    icon: Cpu,
    title: 'AI/ML Stack',
    color: 'orange',
    items: [
      'OpenAI GPT-4, GPT-3.5 Turbo',
      'Claude 3 (Opus, Sonnet, Haiku)',
      'Anthropic & Cohere models',
      'LangChain & Agent Swarm',
    ],
  },
];

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#4B6FED]/10 to-transparent -z-10" />
        <div className="container mx-auto px-4 py-28 max-w-6xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D]">
              Building the Future of AI Infrastructure
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              At AINative, we&apos;re on a mission to democratize AI development
              by creating powerful, accessible tools that empower developers
              worldwide.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                className="bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] text-white hover:opacity-90"
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-gray-700 hover:bg-gray-800/50"
              >
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] mx-auto mb-8" />
          <p className="text-xl text-gray-300">
            We&apos;re building the most intuitive and powerful AI
            infrastructure to help developers create the next generation of
            intelligent applications without the complexity of managing
            underlying systems.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              custom={index}
              className="bg-gray-900/50 p-6 rounded-xl hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <value.icon className="w-8 h-8 text-[#4B6FED]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-400">{value.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Our Story */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="space-y-6 text-gray-300">
            <p>
              Founded in 2023, AINative was born out of the frustration with the
              complexity of deploying and managing AI models in production. Our
              team of AI researchers, engineers, and product builders came
              together with a shared vision: to make AI development as simple as
              traditional software development.
            </p>
            <p>
              Since our launch, we&apos;ve achieved significant milestones:
              released three production-ready SDKs (Python, TypeScript, and Go),
              built a comprehensive API platform with 1,330+ endpoints, and
              introduced innovative features like ZeroDB for seamless database
              integration and Agent Swarm for multi-agent orchestration. Our
              enhanced API documentation now serves as the industry standard for
              developer-first AI platforms.
            </p>
            <p>
              Today, we serve thousands of developers and companies worldwide,
              from ambitious startups to Fortune 500 enterprises, all leveraging
              our platform to build and deploy AI applications at scale. With
              our open-source commitment and active community, we&apos;re
              continuously pushing the boundaries of what&apos;s possible in AI
              infrastructure.
            </p>
          </div>
        </div>

        {/* Technologies Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Our Technology Stack
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                custom={index}
                whileHover={{ y: -5 }}
                className="bg-gray-900/50 p-6 rounded-xl border border-gray-800 hover:border-[#4B6FED]/30 transition-colors"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`p-2 bg-${tech.color}-500/10 rounded-lg mr-4`}
                  >
                    <tech.icon
                      className={`w-6 h-6 text-${tech.color}-400`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold">{tech.title}</h3>
                </div>
                <div className="space-y-2 text-gray-400">
                  {tech.items.map((item) => (
                    <p key={item} className="flex items-center gap-2">
                      <span className="text-green-400">•</span>
                      {item}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Join Community Section */}
        <div className="mb-20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-8 rounded-2xl border border-gray-800">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Connect with thousands of developers, researchers, and AI
              enthusiasts in our community.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://github.com/AINative-Studio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.146 20.115 22 16.379 22 11.984 22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                GitHub
              </a>
              <a
                href="https://discord.gg/paipalooza"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.1 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.8 8.18 1.8 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.1c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord
              </a>
              <a
                href="https://twitter.com/ainativestudio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
                Twitter
              </a>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="bg-gradient-to-r from-[#4B6FED]/10 to-[#FF8A3D]/10 p-8 rounded-2xl text-center border border-[#4B6FED]/20"
        >
          <Lightbulb className="w-12 h-12 text-[#4B6FED] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of developers who are already building the future
            with AINative.
          </p>
          <Button
            asChild
            className="bg-gradient-to-r from-[#4B6FED] to-[#FF8A3D] text-white hover:opacity-90"
          >
            <Link href="/signup">Start Building for Free</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
