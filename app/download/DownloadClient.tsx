'use client';

import {
  Apple,
  AppWindow as Windows,
  Link as Linux,
  Code,
  Terminal,
  Search,
  Zap,
  Download,
  Github,
  Star,
  GitFork,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { motion } from 'framer-motion';
import { appConfig } from '@/lib/config/app';

export default function DownloadClient() {
  const platforms = [
    {
      icon: Apple,
      name: 'macOS Silicon',
      subtitle: 'M1-M4 Supported',
      button: 'Download for Mac Silicon',
      available: true,
      disabled: false,
      downloadUrl: 'https://github.com/AINative-Studio/AINativeStudio-IDE/releases/download/v1.1.0/AINativeStudio-v1.1.0-macOS-arm64.dmg',
    },
    {
      icon: Apple,
      name: 'macOS Intel',
      subtitle: 'Intel Processors',
      button: 'Download for Mac Intel',
      available: true,
      disabled: false,
      downloadUrl: 'https://github.com/AINative-Studio/AINativeStudio-IDE/releases/download/v1.1.0/AINativeStudio-v1.1.0-macOS-x64.dmg',
    },
    {
      icon: Windows,
      name: 'Windows',
      subtitle: 'Windows 10/11 64-bit',
      button: 'Download for Windows',
      available: true,
      disabled: false,
      downloadUrl: 'https://github.com/AINative-Studio/AINativeStudio-IDE/releases/download/v1.1.0/AINativeStudio-v1.1.0-Windows-x64.zip',
    },
    {
      icon: Linux,
      name: 'Linux Debian',
      subtitle: 'x64 DEB Package',
      button: 'Download Debian x64',
      available: true,
      disabled: false,
      downloadUrl: 'https://github.com/AINative-Studio/AINativeStudio-IDE/releases/download/v1.1.0/AINativeStudio-v1.1.0-Linux-x64.deb',
    },
    {
      icon: Linux,
      name: 'Linux RPM',
      subtitle: 'x64 RPM Package',
      button: 'Download RPM x64',
      available: true,
      disabled: false,
      downloadUrl: 'https://github.com/AINative-Studio/AINativeStudio-IDE/releases/download/v1.1.0/AINativeStudio-v1.1.0-Linux-x64.rpm',
    },
    {
      icon: Linux,
      name: 'Linux AppImage',
      subtitle: 'x64 AppImage',
      button: 'Download AppImage x64',
      available: true,
      disabled: false,
      downloadUrl: 'https://github.com/AINative-Studio/AINativeStudio-IDE/releases/download/v1.1.0/AINativeStudio-v1.1.0-Linux-x64.AppImage',
    },
  ];

  const features = [
    { icon: Code, title: 'Tab Autocomplete', desc: 'Press Tab to apply autocomplete suggestions instantly' },
    { icon: Zap, title: 'Quick Edit', desc: 'Edit your selection inline with smart suggestions' },
    { icon: Terminal, title: 'Chat Agent Mode', desc: 'Agent, Gather, and normal chat modes for different workflows' },
    { icon: Search, title: 'Checkpoints', desc: 'Save and restore LLM conversation checkpoints' },
    { icon: Code, title: 'Lint Error Detection', desc: 'Real-time error detection and fixing suggestions' },
    { icon: Zap, title: 'Native Tool Use', desc: 'Direct integration with development tools and APIs' },
    { icon: Terminal, title: 'Fast Apply', desc: 'Apply changes instantly, even on 1000+ line files' },
    { icon: Code, title: 'Agent Mode & MCP', desc: 'Use any model in Agent mode, even without native tool support' },
    { icon: Search, title: 'Full File Management', desc: 'Agent can search, create, edit, and delete files & folders' },
    { icon: Zap, title: 'Gather Mode', desc: 'Restricted mode for safe read-only exploration' },
    { icon: Terminal, title: 'Private LLMs', desc: 'Ollama, DeepSeek, Llama, Gemini, Qwen, Mistral, vLLM support' },
    { icon: Code, title: 'Frontier Models', desc: 'Claude 3.7, GPT-4, Gemini 2.5, Grok 3, and more' },
  ];

  return (
    <div className="bg-[#0D1117] text-white py-32 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-36">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <Download className="h-12 w-12 mx-auto text-[#4B6FED] mb-6 animate-bounce" />
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-[#4B6FED] via-white to-[#4B6FED] bg-clip-text text-transparent">
            Download AI Native Studio
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed">
            Your powerful AI-native development environment—built for scale, speed, and simplicity.
          </p>
        </motion.div>

        {/* Platform Downloads */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Card
                className={`rounded-2xl transition-transform duration-300 transform hover:scale-[1.03]
                ${platform.available
                    ? 'bg-[#1C2128]/80 border border-white/10 hover:shadow-[0_0_30px_#4B6FED33]'
                    : 'bg-[#1C2128]/40 border border-white/5 cursor-not-allowed'}
              `}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <platform.icon className="h-6 w-6 text-[#4B6FED]" />
                    <CardTitle className={`text-lg font-semibold ${!platform.available && 'text-gray-500'}`}>
                      {platform.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-sm">{platform.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <Button
                    size="lg"
                    className="w-full"
                    variant={platform.available ? 'default' : 'outline'}
                    disabled={platform.disabled}
                    onClick={() => {
                      if (platform.downloadUrl && platform.downloadUrl !== '#') {
                        window.open(platform.downloadUrl, '_blank');
                      }
                    }}
                  >
                    {platform.button}
                  </Button>
                  <p className="text-sm text-center text-gray-400 mt-3">
                    {platform.available ? 'Version 1.1.0 (Latest)' : 'In development'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* GitHub Repository Section */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-[#161B22]/50 backdrop-blur-sm rounded-3xl p-8 border border-[#30363D]/50"
        >
          <div className="text-center mb-8">
            <Github className="h-12 w-12 mx-auto text-[#4B6FED] mb-4" />
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#4B6FED] to-[#8A63F4] bg-clip-text text-transparent">
              Open Source & Community
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
              AI Native Studio IDE is open source and community-driven. Contribute, report issues, or explore the codebase on GitHub.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <a
              href={appConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                className="w-full group bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] hover:border-[#4B6FED]/40 text-white transition-all duration-300"
              >
                <Github className="mr-2 h-5 w-5" />
                <span>View Repository</span>
                <ExternalLink className="ml-2 h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            </a>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>Star us on GitHub</span>
              </div>
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>Fork & Contribute</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-[#0D1117]/50 rounded-lg p-4 border border-[#21262D]">
              <Code className="h-6 w-6 mx-auto text-[#4B6FED] mb-2" />
              <h4 className="text-sm font-semibold text-white mb-1">IDE Source</h4>
              <p className="text-xs text-gray-400">Main IDE application code</p>
            </div>
            <div className="bg-[#0D1117]/50 rounded-lg p-4 border border-[#21262D]">
              <Terminal className="h-6 w-6 mx-auto text-[#8A63F4] mb-2" />
              <h4 className="text-sm font-semibold text-white mb-1">Extensions</h4>
              <p className="text-xs text-gray-400">Plugin ecosystem</p>
            </div>
            <div className="bg-[#0D1117]/50 rounded-lg p-4 border border-[#21262D]">
              <Zap className="h-6 w-6 mx-auto text-[#D04BF4] mb-2" />
              <h4 className="text-sm font-semibold text-white mb-1">Documentation</h4>
              <p className="text-xs text-gray-400">Guides and API docs</p>
            </div>
          </div>
        </motion.section>

        {/* Plugin Availability */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-[#4B6FED] via-[#6B8FFF] to-[#4B6FED] bg-clip-text text-transparent">
              IDE Plugins
            </h2>
            <p className="text-2xl md:text-3xl font-bold text-white mb-4">
              Coming Soon
            </p>
            <p className="text-lg text-gray-400 mb-8">
              Native extensions for your favorite development environments
            </p>
            <div className="flex justify-center">
              <ul className="text-base text-gray-300 space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-[#4B6FED]">-</span> VS Code Extension
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4B6FED]">-</span> JetBrains IDEs
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4B6FED]">-</span> Vim/NeoVim
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#4B6FED]">-</span> Sublime Text
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feature Cards - "What's Inside" */}
        <section className="space-y-12">
          <h2 className="text-3xl font-bold text-center">What&apos;s Inside</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="bg-[#1C2128] border border-white/10 hover:border-[#4B6FED] hover:shadow-[0_0_20px_#4B6FED33] rounded-xl p-6 flex flex-col items-start h-full justify-between transition-all">
                  <CardHeader className="p-0 space-y-4">
                    <feature.icon className="h-6 w-6 text-[#4B6FED]" />
                    <div>
                      <CardTitle className="text-white text-lg mb-1">{feature.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-400 leading-relaxed">
                        {feature.desc}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LLM Provider Support */}
        <section className="space-y-12">
          <h2 className="text-3xl font-bold text-center">LLM Provider Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-[#1C2128]/90 border border-white/10 rounded-2xl p-6 hover:shadow-[0_0_25px_#4B6FED33] transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">Private LLMs</CardTitle>
                <CardDescription className="text-gray-400">
                  Never run out of API credits again. Host any open source model locally.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-3">Supported providers:</p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>- Ollama - DeepSeek, Llama, Gemma, Qwen, Mistral</li>
                  <li>- vLLM - High-performance inference</li>
                  <li>- OpenAI-compatible endpoints</li>
                  <li>- Custom local model hosting</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-[#1C2128]/90 border border-white/10 rounded-2xl p-6 hover:shadow-[0_0_25px_#4B6FED33] transition-all">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">Frontier LLMs</CardTitle>
                <CardDescription className="text-gray-400">
                  Direct connection to cutting-edge AI providers and models.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-3">Available models:</p>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li>- Claude 3.7 Sonnet & Opus</li>
                  <li>- GPT-4 & o4-mini</li>
                  <li>- Gemini 2.5 Pro & Flash</li>
                  <li>- Grok 3 & Qwen 3</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
