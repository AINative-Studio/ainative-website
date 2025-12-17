'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Phone, MapPin, Clock, Building2, LucideIcon, Send, CheckCircle } from 'lucide-react';
import { appConfig } from '@/lib/config/app';
import Link from 'next/link';

interface ContactCardProps {
  icon: LucideIcon;
  title: string;
  content: ReactNode;
  link?: string;
}

const ContactCard = ({ icon: Icon, title, content, link = '' }: ContactCardProps) => (
  <Card className="border border-primary/20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:border-primary/40 transition-colors">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          {link ? (
            <a
              href={link}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
            >
              {content}
            </a>
          ) : (
            <CardDescription>{content}</CardDescription>
          )}
        </div>
      </div>
    </CardHeader>
  </Card>
);

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function ContactClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset after showing success
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        inquiryType: '',
        subject: '',
        message: '',
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We&apos;re here to help with any questions about our products, services, or enterprise
              solutions.
            </p>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Contact Information */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Contact Information
              </h2>
              <div className="grid gap-6">
                <ContactCard
                  icon={Mail}
                  title="Email Us"
                  content={appConfig.company.email}
                  link={`mailto:${appConfig.company.email}`}
                />
                <ContactCard
                  icon={Phone}
                  title="Call Us"
                  content={appConfig.company.phone}
                  link="tel:+18312951482"
                />
                <ContactCard
                  icon={MapPin}
                  title="Visit Us"
                  content={appConfig.company.address}
                />
                <ContactCard
                  icon={Clock}
                  title="Business Hours"
                  content={appConfig.company.businessHours}
                />
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <motion.div
                      className="flex flex-col items-center justify-center py-12 text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Message Sent!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        We&apos;ll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="inquiry-type">Inquiry Type</Label>
                        <Select
                          value={formData.inquiryType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, inquiryType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select inquiry type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="support">Technical Support</SelectItem>
                            <SelectItem value="sales">Sales Inquiry</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="enterprise">Enterprise Sales</SelectItem>
                            <SelectItem value="billing">Billing Question</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          placeholder="Brief description of your inquiry"
                          value={formData.subject}
                          onChange={(e) =>
                            setFormData({ ...formData, subject: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Please provide details about your inquiry"
                          className="min-h-[150px]"
                          value={formData.message}
                          onChange={(e) =>
                            setFormData({ ...formData, message: e.target.value })
                          }
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Enterprise Support Section */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">Enterprise Support</CardTitle>
                </div>
                <CardDescription className="text-lg">
                  Looking for enterprise-grade support? Our dedicated enterprise team is ready to
                  help with custom solutions, deployment options, and premium support packages.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <Link href={appConfig.links.calendly} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Contact Enterprise Sales
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline">
                    View Enterprise Plans
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Help Section */}
          <motion.div
            className="mt-16 text-center"
            {...fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
              Need Immediate Help?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Check out our documentation and community resources for quick answers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/docs">
                <Button variant="outline">Documentation</Button>
              </Link>
              <Link href={appConfig.links.discord} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Join Discord</Button>
              </Link>
              <Link href={appConfig.links.github} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">GitHub</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
