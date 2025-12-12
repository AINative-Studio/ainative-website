'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/lib/config/app';
import {
  HelpCircle,
  MessageCircle,
  Book,
  Mail,
  Github,
  ExternalLink,
  CheckCircle,
  Clock,
  Users,
  FileQuestion,
} from 'lucide-react';

interface SupportChannel {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
}

const supportChannels: SupportChannel[] = [
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: 'Discord Community',
    description: 'Join our Discord for real-time help from the community and our team.',
    action: 'Join Discord',
    href: appConfig.links.discord,
    external: true,
    highlight: true,
  },
  {
    icon: <Book className="h-6 w-6" />,
    title: 'Documentation',
    description: 'Browse comprehensive guides, tutorials, and API references.',
    action: 'View Docs',
    href: '/docs',
  },
  {
    icon: <FileQuestion className="h-6 w-6" />,
    title: 'FAQ',
    description: 'Find answers to commonly asked questions about our products.',
    action: 'Browse FAQ',
    href: '/faq',
  },
  {
    icon: <Github className="h-6 w-6" />,
    title: 'GitHub Issues',
    description: 'Report bugs, request features, or browse existing issues.',
    action: 'Open GitHub',
    href: appConfig.links.github,
    external: true,
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Email Support',
    description: 'Contact our support team directly for account or billing issues.',
    action: 'Send Email',
    href: 'mailto:support@ainative.studio',
    external: true,
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Enterprise Support',
    description: 'Dedicated support with SLAs for enterprise customers.',
    action: 'Contact Sales',
    href: appConfig.links.calendly,
    external: true,
  },
];

const supportStats = [
  { icon: <Clock className="h-5 w-5" />, label: 'Avg Response Time', value: '< 24 hours' },
  { icon: <CheckCircle className="h-5 w-5" />, label: 'Resolution Rate', value: '98%' },
  { icon: <Users className="h-5 w-5" />, label: 'Community Members', value: '5,000+' },
];

export default function SupportClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800/50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
              Support Center
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              How can we help you today? Choose a support channel below or submit a request.
            </p>
          </div>

          {/* Support Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {supportStats.map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <span className="text-primary">{stat.icon}</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="font-semibold text-gray-800 dark:text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Support Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {supportChannels.map((channel, index) => (
              <Card
                key={index}
                className={`overflow-hidden transition-all hover:shadow-lg ${
                  channel.highlight
                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        channel.highlight
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {channel.icon}
                    </div>
                    <CardTitle className="text-lg">{channel.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 min-h-[48px]">
                    {channel.description}
                  </CardDescription>
                  <Button
                    asChild
                    variant={channel.highlight ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {channel.external ? (
                      <a href={channel.href} target="_blank" rel="noopener noreferrer">
                        {channel.action}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    ) : (
                      <Link href={channel.href}>{channel.action}</Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Can&apos;t find what you need? Fill out the form below and we&apos;ll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    Request Submitted!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    We&apos;ve received your support request. Our team will respond within 24 hours.
                  </p>
                  <Button onClick={() => setIsSubmitted(false)} variant="outline">
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your name"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your issue"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please describe your issue in detail"
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Support Request'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
