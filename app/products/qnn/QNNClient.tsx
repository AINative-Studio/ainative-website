'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Cpu,
  Network,
  Scale,
  Zap,
  BarChart2,
  Search,
  Code,
  ArrowRight,
  Atom,
  GitMerge,
  Workflow,
  Binary,
  Infinity,
  Waves
} from 'lucide-react';
import Link from 'next/link';
import { appConfig } from '@/lib/config/app';

export default function QNNClient() {
  const calendlyUrl = appConfig.links.calendly;

  return (
    <div className="full-width-section bg-[#0D1117] text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex p-4 rounded-full bg-[#4B6FED]/10 mb-6">
              <Atom className="h-8 w-8 text-[#4B6FED] animate-spin-slow" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] mb-6">
              Quantum Neural Networks — Unlock Next-Level AI Performance
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Empower your AI with quantum-enhanced capabilities for unmatched speed and precision
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pricing">
                <Button size="lg" className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:opacity-90 text-white">
                  Get Started
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-[#2D333B] text-white hover:bg-[#1C2128]">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border border-[#2D333B] bg-[#161B22] backdrop-blur-sm hover:border-[#4B6FED]/40 transition-all">
              <CardHeader>
                <div className="p-3 rounded-full bg-[#4B6FED]/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <CardTitle className="text-white">Quantum-Enhanced Speed</CardTitle>
                <CardDescription className="text-gray-400">
                  Quantum acceleration via QPUs with up to 15% performance boost
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-[#2D333B] bg-[#161B22] backdrop-blur-sm hover:border-[#4B6FED]/40 transition-all">
              <CardHeader>
                <div className="p-3 rounded-full bg-[#4B6FED]/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Scale className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <CardTitle className="text-white">Precision and Accuracy</CardTitle>
                <CardDescription className="text-gray-400">
                  Superior semantic understanding and minimized coding errors
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border border-[#2D333B] bg-[#161B22] backdrop-blur-sm hover:border-[#4B6FED]/40 transition-all">
              <CardHeader>
                <div className="p-3 rounded-full bg-[#4B6FED]/10 w-12 h-12 flex items-center justify-center mb-4">
                  <Code className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <CardTitle className="text-white">Seamless Integration</CardTitle>
                <CardDescription className="text-gray-400">
                  API-first architecture designed to fit naturally into developer workflows
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Platform Features */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Platform Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Planning", icon: Workflow },
                { name: "Test Generation", icon: Binary },
                { name: "Code Modernization", icon: GitMerge },
                { name: "Refactoring", icon: Code },
                { name: "Debugging", icon: Search },
                { name: "Code Review", icon: Scale },
                { name: "Semantic Code Search", icon: Brain },
                { name: "Agent Reasoning", icon: Network }
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-[#161B22] rounded-lg p-6 text-center border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all group"
                >
                  <feature.icon className="h-6 w-6 mx-auto mb-3 text-[#4B6FED] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-white">{feature.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Industry Applications */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-white mb-8">
              Industry Applications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="border border-[#2D333B] bg-[#161B22] hover:border-[#4B6FED]/40 transition-all">
                <CardHeader>
                  <BarChart2 className="h-8 w-8 text-[#4B6FED] mb-4" />
                  <CardTitle className="text-white">Financial Services</CardTitle>
                  <CardDescription className="text-gray-400">
                    Accelerated fraud detection and risk modeling
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border border-[#2D333B] bg-[#161B22] hover:border-[#4B6FED]/40 transition-all">
                <CardHeader>
                  <Brain className="h-8 w-8 text-[#4B6FED] mb-4" />
                  <CardTitle className="text-white">Healthcare</CardTitle>
                  <CardDescription className="text-gray-400">
                    Improved diagnostic accuracy and predictive analytics
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border border-[#2D333B] bg-[#161B22] hover:border-[#4B6FED]/40 transition-all">
                <CardHeader>
                  <Code className="h-8 w-8 text-[#4B6FED] mb-4" />
                  <CardTitle className="text-white">Software Development</CardTitle>
                  <CardDescription className="text-gray-400">
                    Quantum-enhanced code generation and optimization
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border border-[#2D333B] bg-[#161B22] hover:border-[#4B6FED]/40 transition-all">
                <CardHeader>
                  <Network className="h-8 w-8 text-[#4B6FED] mb-4" />
                  <CardTitle className="text-white">Marketing Analytics</CardTitle>
                  <CardDescription className="text-gray-400">
                    Predictive accuracy and deeper customer insights
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* How QNN Works */}
          <div id="how-it-works" className="mb-16">
            <Card className="border border-[#2D333B] bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10 overflow-hidden">
              <CardHeader className="text-center">
                <div className="inline-flex p-3 rounded-full bg-[#4B6FED]/10 mb-4">
                  <Infinity className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <CardTitle className="text-2xl mb-4 text-white">How QNN Works</CardTitle>
                <CardDescription className="text-lg text-gray-400">
                  Combines quantum mechanics and neural networks for exponential computational performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#1C2128] rounded-xl p-6 text-center">
                    <Atom className="h-8 w-8 text-[#4B6FED] mx-auto mb-4" />
                    <h4 className="font-semibold mb-2 text-white">Superposition</h4>
                    <p className="text-sm text-gray-400">
                      Evaluates many possibilities simultaneously
                    </p>
                  </div>
                  <div className="bg-[#1C2128] rounded-xl p-6 text-center">
                    <GitMerge className="h-8 w-8 text-[#8A63F4] mx-auto mb-4" />
                    <h4 className="font-semibold mb-2 text-white">Entanglement</h4>
                    <p className="text-sm text-gray-400">
                      Qubit correlation improves knowledge sharing
                    </p>
                  </div>
                  <div className="bg-[#1C2128] rounded-xl p-6 text-center">
                    <Waves className="h-8 w-8 text-[#8AB4FF] mx-auto mb-4" />
                    <h4 className="font-semibold mb-2 text-white">Interference</h4>
                    <p className="text-sm text-gray-400">
                      Optimizes results and cancels errors during computation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Infrastructure Statement */}
          <div className="text-center">
            <Card className="border border-[#2D333B] bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10">
              <CardHeader>
                <div className="inline-flex p-3 rounded-full bg-[#4B6FED]/10 mb-4">
                  <Cpu className="h-6 w-6 text-[#4B6FED]" />
                </div>
                <CardTitle className="text-2xl mb-4 text-white">Infrastructure</CardTitle>
                <CardDescription className="text-lg text-gray-400">
                  AINative Studio&apos;s Quantum Neural Network (QNN) redefines enterprise ML ops through orchestration, context-aware intelligence, and quantum-powered developer performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:opacity-90 text-white">
                    Schedule a Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
