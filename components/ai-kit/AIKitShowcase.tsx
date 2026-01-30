'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  Download,
  Star,
  Github,
  BookOpen,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ButtonDemo,
  TextFieldDemo,
  SliderDemo,
  CheckBoxDemo,
  ChoicePickerDemo,
  DividerDemo,
} from './ComponentDemo';

interface PackageStats {
  downloads: string;
  components: number;
  stars: string;
  version: string;
}

const packageStats: PackageStats = {
  downloads: '10K+',
  components: 50,
  stars: '500+',
  version: '1.2.0',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AIKitShowcase() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, componentName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(componentName);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={fadeUp}
        className="text-center"
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-[#4B6FED]/10 border border-[#4B6FED]/30 text-[#8AB4FF] text-sm font-medium mb-6">
          <Package className="w-4 h-4 mr-2" />
          <span>Component Library Showcase</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8AB4FF] via-[#4B6FED] to-[#8A63F4]">
            Interactive Component Demos
          </span>
        </h2>

        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Explore AI Kit's comprehensive component library with live, interactive examples
          and ready-to-use code snippets.
        </p>

        {/* Package Stats */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1C2128] rounded-lg border border-[#2D333B]">
            <Download className="w-4 h-4 text-[#4B6FED]" />
            <span className="text-sm text-gray-300">
              {packageStats.downloads} <span className="text-gray-500">downloads</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1C2128] rounded-lg border border-[#2D333B]">
            <Package className="w-4 h-4 text-[#8A63F4]" />
            <span className="text-sm text-gray-300">
              {packageStats.components} <span className="text-gray-500">components</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1C2128] rounded-lg border border-[#2D333B]">
            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            <span className="text-sm text-gray-300">
              {packageStats.stars} <span className="text-gray-500">stars</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1C2128] rounded-lg border border-[#2D333B]">
            <Sparkles className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">
              v{packageStats.version}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/AINative-Studio/ai-kit-design-system"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] hover:from-[#3A56D3] hover:to-[#7A4FEB]"
            >
              <Github className="mr-2 h-5 w-5" />
              View on GitHub
            </Button>
          </a>
          <Link href="/resources">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-[#2D3748] hover:border-[#4B6FED]/40"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Full Documentation
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Component Demos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AIKitButton Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AIKitButton</CardTitle>
                <Badge variant="secondary">Interactive</Badge>
              </div>
              <CardDescription>
                Versatile button component with multiple variants and states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ButtonDemo />
            </CardContent>
          </Card>
        </motion.div>

        {/* AIKitTextField Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AIKitTextField</CardTitle>
                <Badge variant="secondary">Interactive</Badge>
              </div>
              <CardDescription>
                Text input with validation, character count, and various styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TextFieldDemo />
            </CardContent>
          </Card>
        </motion.div>

        {/* AIKitSlider Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AIKitSlider</CardTitle>
                <Badge variant="secondary">Interactive</Badge>
              </div>
              <CardDescription>
                Range slider with customizable min, max, and step values
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SliderDemo />
            </CardContent>
          </Card>
        </motion.div>

        {/* AIKitCheckBox Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AIKitCheckBox</CardTitle>
                <Badge variant="secondary">Interactive</Badge>
              </div>
              <CardDescription>
                Checkbox component with indeterminate state support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CheckBoxDemo />
            </CardContent>
          </Card>
        </motion.div>

        {/* AIKitChoicePicker Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AIKitChoicePicker</CardTitle>
                <Badge variant="secondary">Interactive</Badge>
              </div>
              <CardDescription>
                Radio group for single-choice selections with custom styling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ChoicePickerDemo />
            </CardContent>
          </Card>
        </motion.div>

        {/* AIKitDivider Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-[#161B22] border-[#2D333B]/50 hover:border-[#4B6FED]/40 transition-all">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">AIKitDivider</CardTitle>
                <Badge variant="secondary">Static</Badge>
              </div>
              <CardDescription>
                Horizontal and vertical dividers for content separation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DividerDemo />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Installation Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="bg-gradient-to-r from-[#4B6FED]/10 to-[#8A63F4]/10 border-[#4B6FED]/30">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Package className="mr-2 h-5 w-5 text-[#4B6FED]" />
              Installation
            </CardTitle>
            <CardDescription>
              Get started with AI Kit Design System in your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-vite-bg rounded-lg p-4 overflow-x-auto border border-[#2D333B]">
                <code className="text-sm text-gray-300 font-mono">
                  npm install @ainative/ai-kit-design-system
                </code>
              </pre>
              <button
                onClick={() => copyToClipboard('npm install @ainative/ai-kit-design-system', 'install')}
                className="absolute right-2 top-2 p-2 rounded-md bg-[#1C2128] border border-[#2D333B] hover:border-[#4B6FED]/40 transition-all"
                aria-label="Copy installation command"
              >
                {copiedCode === 'install' ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="sr-only">Copied</span>
                  </>
                ) : (
                  <Copy className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>

            {copiedCode === 'install' && (
              <p className="mt-2 text-sm text-green-400">Copied to clipboard!</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
