'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ReactNode } from 'react';
import {
  Shield,
  Users,
  Database,
  Mail,
  Globe,
  Download,
  Pencil,
  Trash2,
  Bell,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

interface RightCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
}

const RightCard = ({ icon, title, description, color = 'primary' }: RightCardProps) => (
  <motion.div
    variants={fadeInUp}
    className={`p-6 rounded-xl border-l-4 border-${color} bg-gradient-to-r from-gray-900/50 to-gray-800/10 hover:to-gray-800/30 transition-all duration-300 hover:shadow-lg`}
    whileHover={{ y: -5, scale: 1.01 }}
  >
    <div className="flex items-start space-x-4">
      <div className={`p-3 rounded-lg bg-${color}/10`}>{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  </motion.div>
);

export default function PrivacyClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1A] to-[#0F172A] text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="bg-gray-900/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800/50 shadow-2xl"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Your Privacy Matters
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FF8A3D] to-[#FF6B6B] inline-block">
              Privacy Policy
            </h1>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg">
              Last updated: <span className="text-primary">January 1, 2025</span> - Version 2.2.1
            </p>
          </motion.div>

          <motion.div variants={stagger} className="space-y-12 max-w-5xl mx-auto">
            {/* Information We Collect */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-primary/10 rounded-xl mr-4">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-[#FF8A3D] bg-clip-text text-transparent">
                  Information We Collect
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  We collect various types of information to provide and improve our services,
                  personalize your experience, and ensure the security of our platform.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <RightCard
                    icon={<Mail className="w-6 h-6 text-primary" />}
                    title="Information You Provide"
                    description="Account details, profile information, and communications you share with us."
                  />
                  <RightCard
                    icon={<Globe className="w-6 h-6 text-blue-400" />}
                    title="Automated Collection"
                    color="blue-400"
                    description="Device info, usage data, and cookies to enhance your experience."
                  />
                  <RightCard
                    icon={<Users className="w-6 h-6 text-purple-400" />}
                    title="Third-Party Sources"
                    color="purple-400"
                    description="Data from social platforms and partners to improve our services."
                  />
                </div>

                <div className="mt-8 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="font-semibold text-lg mb-4 text-white">
                    Our Data Collection Principles
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      </div>
                      <div>
                        <h4 className="font-medium">Minimal & Relevant</h4>
                        <p className="text-sm text-gray-400">
                          We only collect what&apos;s necessary to provide our services.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                      </div>
                      <div>
                        <h4 className="font-medium">Transparent</h4>
                        <p className="text-sm text-gray-400">
                          Clear communication about what we collect and why.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* How We Use Your Information */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl mr-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  How We Use Your Information
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  We use your information to deliver, improve, and protect our services while being
                  transparent about our practices.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 hover:bg-gray-800/30 rounded-xl transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Service Delivery</h3>
                        <p className="text-gray-400 text-sm">To provide and maintain our services</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 hover:bg-gray-800/30 rounded-xl transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Improvement</h3>
                        <p className="text-gray-400 text-sm">To enhance and optimize our platform</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 hover:bg-gray-800/30 rounded-xl transition-colors">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">Security</h3>
                        <p className="text-gray-400 text-sm">To protect our platform and users</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700/50">
                    <h3 className="font-semibold text-lg mb-4 text-white">
                      Legal Basis for Processing
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      We process your information based on one or more of the following legal
                      grounds:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <span className="text-blue-400">-</span>
                        <span className="text-gray-400">
                          Your <span className="text-white">consent</span> (when you agree to our
                          terms)
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-blue-400">-</span>
                        <span className="text-gray-400">
                          To fulfill our <span className="text-white">contractual obligations</span>
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-blue-400">-</span>
                        <span className="text-gray-400">
                          For <span className="text-white">legal compliance</span> with regulations
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="text-blue-400">-</span>
                        <span className="text-gray-400">
                          For <span className="text-white">legitimate business interests</span>
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Information Sharing */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 p-6 rounded-xl border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6 text-primary flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-3">
                  <Users className="w-5 h-5" />
                </span>
                Information Sharing and Disclosure
              </h2>
              <div className="space-y-4">
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service providers who perform services on our behalf</li>
                  <li>Business partners with whom we offer joint services</li>
                  <li>Law enforcement or government authorities when required by law</li>
                  <li>Other parties in connection with a business transaction</li>
                </ul>

                <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
                  <h3 className="font-semibold text-purple-300 mb-2">International Data Transfers</h3>
                  <p className="text-sm text-gray-300">
                    Your information may be transferred to and processed in countries other than your
                    own. We implement appropriate safeguards to ensure your data remains protected.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Data Security */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 p-6 rounded-xl border border-gray-800"
            >
              <h2 className="text-2xl font-bold mb-6 text-primary flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-3">
                  <Shield className="w-5 h-5" />
                </span>
                Data Security
              </h2>
              <div className="space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your
                  personal information against unauthorized access, alteration, disclosure, or
                  destruction.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and testing</li>
                  <li>Access controls and authentication</li>
                  <li>Incident response procedures</li>
                </ul>
                <p className="text-sm text-gray-400 mt-4">
                  While we strive to protect your personal information, no method of transmission over
                  the internet or electronic storage is 100% secure. We cannot guarantee absolute
                  security.
                </p>
              </div>
            </motion.section>

            {/* Your Privacy Rights */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-green-500/10 rounded-xl mr-4">
                  <Pencil className="w-6 h-6 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Your Privacy Rights
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  You have control over your personal information. Here are your rights and how to
                  exercise them:
                </p>

                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  {[
                    {
                      icon: <Download className="w-5 h-5 text-green-400" />,
                      title: 'Access & Portability',
                      description: 'Request a copy of your data in a machine-readable format',
                    },
                    {
                      icon: <Pencil className="w-5 h-5 text-blue-400" />,
                      title: 'Correction',
                      description: 'Update or correct your information',
                    },
                    {
                      icon: <Trash2 className="w-5 h-5 text-red-400" />,
                      title: 'Deletion',
                      description: 'Request deletion of your personal data',
                    },
                    {
                      icon: <Bell className="w-5 h-5 text-yellow-400" />,
                      title: 'Opt-Out',
                      description: 'Opt-out of marketing communications',
                    },
                  ].map((right, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-green-400/30 transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="p-2 rounded-lg bg-gray-700/50">{right.icon}</div>
                        <div>
                          <h3 className="font-semibold text-white">{right.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">{right.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 bg-gradient-to-r from-gray-800/30 to-gray-900/30 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="font-semibold text-lg mb-3 text-white">How to Exercise Your Rights</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    To exercise any of these rights, please contact us at{' '}
                    <span className="text-green-400">privacy@ainative.com</span>. We&apos;ll respond to
                    your request within 30 days as required by applicable law.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <span className="px-3 py-1 text-xs rounded-full bg-green-500/10 text-green-400">
                      GDPR Compliant
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-blue-500/10 text-blue-400">
                      CCPA Ready
                    </span>
                    <span className="px-3 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400">
                      PIPEDA Aligned
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Policy Updates & Contact */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.section
                variants={fadeInUp}
                className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-yellow-500/10 rounded-xl mr-4">
                    <Bell className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Policy Updates</h2>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-300">
                    We may update this Privacy Policy to reflect changes in our practices or for other
                    operational, legal, or regulatory reasons.
                  </p>
                  <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-800/50">
                    <h3 className="font-medium text-yellow-300 mb-2">How We&apos;ll Notify You</h3>
                    <ul className="space-y-2 text-sm text-yellow-100/80">
                      <li className="flex items-start space-x-2">
                        <span>-</span>
                        <span>Email notification for significant changes</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>-</span>
                        <span>In-app notification for minor updates</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>-</span>
                        <span>Updated &quot;Last Updated&quot; date on this page</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.section>

              <motion.section
                variants={fadeInUp}
                className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-indigo-500/10 rounded-xl mr-4">
                    <Mail className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Contact Our Privacy Team</h2>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-300">
                    Have questions or concerns about your privacy? Our dedicated team is here to help.
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                      <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <Mail className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">Email Us</h3>
                        <p className="text-indigo-300 text-sm">privacy@ainative.com</p>
                      </div>
                    </div>

                    <div className="p-4 bg-indigo-900/10 rounded-lg border border-indigo-900/30">
                      <h4 className="font-medium text-indigo-200 text-sm mb-2">Mailing Address</h4>
                      <p className="text-indigo-100 text-sm">
                        1101 Pacific Avenue
                        <br />
                        Santa Cruz, CA 95060
                        <br />
                        United States
                      </p>
                    </div>

                    <p className="text-xs text-gray-500 mt-4">
                      We typically respond to privacy inquiries within 1-2 business days.
                    </p>
                  </div>
                </div>
              </motion.section>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-16 text-center border-t border-gray-800/50 pt-12"
          >
            <div className="max-w-2xl mx-auto">
              <p className="text-gray-400 mb-6">
                We&apos;re committed to protecting your personal information and being transparent
                about our data practices.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/terms"
                  className="px-6 py-2.5 text-sm font-medium rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
              <p className="text-xs text-gray-600 mt-8">
                &copy; {new Date().getFullYear()} AINative, Inc. All rights reserved.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF8A3D]/5 rounded-full filter blur-3xl -ml-48 -mb-48"></div>
      </div>
    </div>
  );
}
