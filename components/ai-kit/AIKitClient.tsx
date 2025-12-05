"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package,
  Download,
  Star,
  Github,
  BookOpen,
  Code2,
  Terminal,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Database,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  aiKitPackages,
  codeExamples,
  features,
  type AIKitPackage,
} from "@/lib/data/ai-kit-packages";

const featureIcons = [Zap, Shield, Layers, Sparkles, Database, Eye];

export function AIKitHero() {
  return (
    <header className="relative pt-12 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-6">
            <Package className="w-4 h-4 mr-2" />
            <span>14 Production-Ready Packages</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              AI Kit
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8AB4FF] via-[#4B6FED] to-[#8A63F4]">
              Build AI Apps Faster
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            A comprehensive suite of NPM packages for building production-ready
            AI applications. Framework-agnostic, type-safe, and battle-tested.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://github.com/AINative-Studio/ai-kit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Github className="mr-2 h-5 w-5" />
                <span>View on GitHub</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </a>
            <a
              href="https://www.npmjs.com/~ainative-studio"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5 text-white"
              >
                <Download className="mr-2 h-5 w-5" />
                <span>Browse Packages</span>
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link href="/docs">
              <Button
                variant="ghost"
                size="lg"
                className="text-gray-300 hover:text-white hover:bg-white/5"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                <span>Documentation</span>
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center">
              <Package className="w-4 h-4 mr-2 text-[#4B6FED]" />
              <span>14 Packages</span>
            </div>
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-2 text-[#8A63F4]" />
              <span>50K+ Downloads</span>
            </div>
            <div className="flex items-center">
              <Star
                className="w-4 h-4 mr-2 text-yellow-400"
                fill="currentColor"
              />
              <span>1.2K+ Stars</span>
            </div>
            <div className="flex items-center">
              <Github className="w-4 h-4 mr-2 text-gray-400" />
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function FeaturesGrid() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#161B22]/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why Choose AI Kit
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to build AI-powered applications, from
            authentication to deployment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <Card
                key={feature.title}
                className="h-full bg-[#1C2128]/70 backdrop-blur-sm border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#4B6FED]/10"
              >
                <CardHeader>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[#4B6FED]/10 to-[#8A63F4]/10 w-fit mb-4">
                    <Icon className="h-6 w-6 text-[#4B6FED]" />
                  </div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PackageGrid() {
  const [copiedPackage, setCopiedPackage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const copyToClipboard = (text: string, packageName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPackage(packageName);
    setTimeout(() => setCopiedPackage(null), 2000);
  };

  const categories = [
    "All",
    ...Array.from(new Set(aiKitPackages.map((pkg) => pkg.category))),
  ];

  const filteredPackages =
    selectedCategory === "All"
      ? aiKitPackages
      : aiKitPackages.filter((pkg) => pkg.category === selectedCategory);

  return (
    <section className="py-20 px-4" aria-labelledby="packages-heading">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4 mr-2" />
            <span>Complete Toolkit</span>
          </div>
          <h2 id="packages-heading" className="text-3xl md:text-5xl font-bold mb-4">
            Browse All Packages
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            14 specialized packages covering every aspect of AI application
            development
          </p>

          {/* Category Filter */}
          <nav
            aria-label="Package categories"
            className="flex flex-wrap justify-center gap-2 mb-8"
          >
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "bg-gradient-to-r from-[#4B6FED] to-[#8A63F4]"
                    : "border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent"
                }
              >
                {category}
              </Button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.name}
              pkg={pkg}
              copiedPackage={copiedPackage}
              onCopy={copyToClipboard}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({
  pkg,
  copiedPackage,
  onCopy,
}: {
  pkg: AIKitPackage;
  copiedPackage: string | null;
  onCopy: (text: string, name: string) => void;
}) {
  const Icon = pkg.icon;

  return (
    <article
      itemScope
      itemType="https://schema.org/SoftwareSourceCode"
      className="h-full"
    >
      <Card className="h-full bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all duration-300 group hover:shadow-xl hover:shadow-[#4B6FED]/10 overflow-hidden">
        <div className={`h-1 bg-gradient-to-r ${pkg.gradient}`} />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div
              className={`p-2.5 rounded-lg bg-gradient-to-br ${pkg.gradient} bg-opacity-10`}
            >
              <Icon className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <Badge variant="secondary" className="text-xs">
              <span itemProp="applicationCategory">{pkg.category}</span>
            </Badge>
          </div>
          <h3
            className="text-lg text-white group-hover:text-[#8AB4FF] transition-colors font-semibold"
            itemProp="name"
          >
            {pkg.name}
          </h3>
          <p className="text-gray-400 text-sm" itemProp="description">
            {pkg.description}
          </p>
          <meta itemProp="programmingLanguage" content="TypeScript" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Features */}
            <div className="flex flex-wrap gap-1.5">
              {pkg.features.map((feature) => (
                <Badge
                  key={feature}
                  variant="outline"
                  className="text-xs border-[#2D333B] text-gray-400"
                >
                  {feature}
                </Badge>
              ))}
            </div>

            {/* Install Command */}
            <div className="relative group/install">
              <div className="bg-[#0D1117] rounded-lg p-3 pr-12 font-mono text-xs text-gray-300 border border-[#2D333B]">
                npm install {pkg.name}
              </div>
              <button
                onClick={() => onCopy(`npm install ${pkg.name}`, pkg.name)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#1C2128] border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all"
                aria-label={`Copy install command for ${pkg.name}`}
              >
                {copiedPackage === pkg.name ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-gray-400" />
                )}
              </button>
            </div>

            {/* Links */}
            <div className="flex gap-2 pt-2">
              <a
                href={`https://www.npmjs.com/package/${pkg.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#2D3748] hover:border-[#4B6FED]/40 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  NPM
                </Button>
              </a>
              <a
                href={`https://github.com/AINative-Studio/ai-kit/tree/main/packages/${pkg.name.split("/")[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#2D3748] hover:border-[#4B6FED]/40 text-xs"
                >
                  <Github className="h-3 w-3 mr-1" />
                  Docs
                </Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </article>
  );
}

export function QuickStart() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-[#161B22]/30 to-transparent">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-xl text-gray-400">
            Choose your framework and start building
          </p>
        </div>

        <Tabs defaultValue="react" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#1C2128]">
            <TabsTrigger value="react">React</TabsTrigger>
            <TabsTrigger value="vue">Vue</TabsTrigger>
            <TabsTrigger value="cli">CLI</TabsTrigger>
          </TabsList>

          <TabsContent value="react">
            <Card className="bg-[#161B22] border-[#2D333B]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Code2 className="mr-2 h-5 w-5 text-[#4B6FED]" />
                  React Example
                </CardTitle>
                <CardDescription>
                  Build AI chat interfaces with React hooks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#0D1117] rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                  <code className="text-sm text-gray-300 font-mono">
                    {codeExamples.react}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vue">
            <Card className="bg-[#161B22] border-[#2D333B]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Code2 className="mr-2 h-5 w-5 text-[#4B6FED]" />
                  Vue Example
                </CardTitle>
                <CardDescription>
                  Integrate AI with Vue composables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#0D1117] rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                  <code className="text-sm text-gray-300 font-mono">
                    {codeExamples.vue}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cli">
            <Card className="bg-[#161B22] border-[#2D333B]">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Terminal className="mr-2 h-5 w-5 text-[#4B6FED]" />
                  CLI Commands
                </CardTitle>
                <CardDescription>
                  Scaffold and deploy with AI Kit CLI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-[#0D1117] rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                  <code className="text-sm text-gray-300 font-mono">
                    {codeExamples.cli}
                  </code>
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

export function IntegrationsGrid() {
  const techs = [
    "React",
    "Vue",
    "Svelte",
    "Next.js",
    "TypeScript",
    "Tailwind",
    "Vercel",
    "ZeroDB",
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Seamless Integrations
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            AI Kit works perfectly with your existing tech stack
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techs.map((tech) => (
            <div
              key={tech}
              className="bg-[#161B22] border border-[#2D333B] rounded-xl p-6 text-center hover:border-[#4B6FED]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#4B6FED]/10"
            >
              <p className="text-lg font-semibold text-white">{tech}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 rounded-2xl border border-[#4B6FED]/30 p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers using AI Kit to build the next
            generation of AI applications
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/AINative-Studio/ai-kit"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB] text-white"
              >
                <Github className="mr-2 h-5 w-5" />
                Get Started
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            <Link href="/docs">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-[#2D3748] hover:border-[#4B6FED]/40 bg-transparent hover:bg-[#4B6FED]/5"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
