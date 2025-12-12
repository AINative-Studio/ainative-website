'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle,
  AlertTriangle,
  Shield,
  User,
  Code,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';

interface TermCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

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

const TermCard: React.FC<TermCardProps> = ({ icon, title, children }) => (
  <motion.div
    variants={fadeInUp}
    className="p-6 rounded-xl border border-gray-800/50 bg-gray-900/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300"
  >
    <div className="flex items-start space-x-4">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <div className="text-gray-300">{children}</div>
      </div>
    </div>
  </motion.div>
);

export default function TermsClient() {
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
              Legal Information
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-[#FF8A3D] to-[#FF6B6B] inline-block">
              Terms of Service
            </h1>
            <p className="text-gray-400 max-w-3xl mx-auto text-lg">
              Last updated: <span className="text-primary">January 1, 2025</span> - Version 2.0.1
            </p>
          </motion.div>

          <motion.div variants={stagger} className="space-y-12 max-w-5xl mx-auto">
            {/* Acceptance of Terms */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-primary/10 rounded-xl mr-4">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-[#FF8A3D] bg-clip-text text-transparent">
                  Acceptance of Terms
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Welcome to AINative! These Terms of Service govern your use of our platform and
                  services. By accessing or using our services, you agree to be bound by these terms
                  and all applicable laws and regulations.
                </p>

                <div className="p-6 bg-blue-900/10 border border-blue-800/30 rounded-xl">
                  <h3 className="font-semibold text-blue-300 mb-3">Before You Proceed</h3>
                  <p className="text-blue-100 text-sm">
                    Please read these terms carefully. If you do not agree with any part of these
                    terms, you must not use our services. Your continued use of the services
                    constitutes acceptance of these terms.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Use License & Restrictions */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-yellow-500/10 rounded-xl mr-4">
                  <Code className="w-6 h-6 text-yellow-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                  Use License & Restrictions
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  We grant you a limited, non-exclusive, non-transferable license to access and use
                  our services for personal, non-commercial purposes in accordance with these terms.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-white">Permitted Use</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                        </div>
                        <span className="text-gray-300">
                          Access and use for personal, non-commercial purposes
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                        </div>
                        <span className="text-gray-300">Create and manage your account</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-white">Restrictions</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                        </div>
                        <span className="text-gray-300">
                          Modify, copy, or create derivative works
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                        </div>
                        <span className="text-gray-300">
                          Use for any commercial purpose without permission
                        </span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-2 h-2 rounded-full bg-red-400 mt-2"></div>
                        </div>
                        <span className="text-gray-300">
                          Reverse engineer or attempt to extract source code
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-amber-900/10 border border-amber-800/30 rounded-xl">
                <h3 className="font-semibold text-amber-300 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" /> Important Notice
                </h3>
                <p className="text-amber-100 text-sm">
                  Any unauthorized use of our services will result in immediate termination of your
                  license and may lead to legal action. We reserve the right to refuse service to
                  anyone for any reason at any time.
                </p>
              </div>
            </motion.section>

            {/* User Accounts */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-purple-500/10 rounded-xl mr-4">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  User Accounts
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <TermCard icon={<Shield className="w-5 h-5" />} title="Account Security">
                  <p className="mb-3">
                    You are responsible for maintaining the confidentiality of your account
                    credentials and for all activities that occur under your account.
                  </p>
                  <ul className="text-sm space-y-1.5 text-gray-400">
                    <li>- Use a strong, unique password</li>
                    <li>- Enable two-factor authentication</li>
                    <li>- Never share your login details</li>
                  </ul>
                </TermCard>

                <TermCard
                  icon={<AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  title="Account Information"
                >
                  <p>
                    You must provide accurate and complete information when creating your account and
                    keep it updated.
                  </p>
                  <div className="mt-3 p-3 bg-gray-800/30 rounded-lg">
                    <p className="text-xs text-gray-400">
                      We reserve the right to suspend or terminate accounts that provide false
                      information or violate our terms.
                    </p>
                  </div>
                </TermCard>
              </div>
            </motion.section>

            {/* Intellectual Property */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl mr-4">
                  <Code className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Intellectual Property
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  All content, features, and functionality of our services, including but not limited
                  to text, graphics, logos, and software, are the exclusive property of AINative and
                  its licensors.
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-white mb-2">Copyrights</h4>
                    <p className="text-sm text-gray-400">
                      All content is protected by copyright laws.
                    </p>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-white mb-2">Trademarks</h4>
                    <p className="text-sm text-gray-400">Our name and logos are our trademarks.</p>
                  </div>
                  <div className="p-4 bg-gray-800/30 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-white mb-2">License</h4>
                    <p className="text-sm text-gray-400">
                      Limited license for personal, non-commercial use.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-900/10 border border-blue-800/30 rounded-lg">
                  <h4 className="font-semibold text-blue-300 text-sm mb-2">NOTICE</h4>
                  <p className="text-blue-100 text-sm">
                    Unauthorized use of any AINative intellectual property without express written
                    permission is strictly prohibited.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Limitation of Liability */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-red-500/10 rounded-xl mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                  Limitation of Liability
                </h2>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-red-900/10 border border-red-900/30 rounded-xl">
                  <h3 className="font-semibold text-red-300 mb-3">Important Legal Notice</h3>
                  <p className="text-red-100 text-sm">
                    To the maximum extent permitted by applicable law, in no event shall AINative, its
                    directors, employees, or agents be liable for any indirect, incidental, special,
                    consequential, or punitive damages arising from or related to your use of our
                    services.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">What We Don&apos;t Cover</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400">-</span>
                        <span>Loss of data or content</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400">-</span>
                        <span>Business interruption</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="text-red-400">-</span>
                        <span>Consequential or indirect damages</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Your Responsibility</h4>
                    <p className="text-sm text-gray-400">
                      You agree to use our services at your own risk. We provide our services
                      &quot;as is&quot; without any express or implied warranties.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Changes to Terms */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-purple-500/10 rounded-xl mr-4">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent">
                  Changes to Terms
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start p-4 bg-gray-800/30 rounded-lg border-l-4 border-purple-500">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2"></div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-white">We May Update These Terms</h4>
                    <p className="text-gray-300 text-sm mt-1">
                      We reserve the right to modify these terms at any time. We&apos;ll notify you of
                      any changes by updating the &quot;Last Updated&quot; date at the top of this
                      page.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <h4 className="font-semibold text-white mb-3">Your Continued Use</h4>
                    <p className="text-gray-300 text-sm">
                      By continuing to access or use our services after any revisions become
                      effective, you agree to be bound by the updated terms.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-3">Material Changes</h4>
                    <p className="text-gray-300 text-sm">
                      For material changes, we&apos;ll provide at least 30 days&apos; notice before
                      the changes take effect.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-purple-900/10 border border-purple-800/30 rounded-lg mt-4">
                  <p className="text-purple-200 text-sm">
                    <span className="font-medium">Tip:</span> We recommend reviewing these terms
                    periodically for any changes. Your continued use of our services after changes are
                    made constitutes acceptance of those changes.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Contact Us */}
            <motion.section
              variants={fadeInUp}
              className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800/50 backdrop-blur-sm"
            >
              <div className="flex items-center mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl mr-4">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Contact Us
                </h2>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-gray-300 leading-relaxed">
                  Have questions about these Terms of Service? Our team is here to help. Please
                  don&apos;t hesitate to reach out.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50">
                    <h3 className="font-semibold text-white mb-4">Get in Touch</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Email</h4>
                          <p className="text-blue-300 text-sm">legal@ainative.studio</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <MapPin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Mailing Address</h4>
                          <p className="text-blue-300 text-sm">
                            1101 Pacific Avenue
                            <br />
                            Santa Cruz, CA 95060
                            <br />
                            United States
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 bg-blue-900/10 rounded-xl border border-blue-900/30">
                    <h3 className="font-semibold text-white mb-4">Legal Inquiries</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      For legal notices or service of process, please contact our legal department at
                      the address above.
                    </p>
                    <div className="p-4 bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-blue-200 text-sm mb-2">Response Time</h4>
                      <p className="text-blue-100 text-xs">
                        We typically respond to legal inquiries within 3-5 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="mt-16 text-center border-t border-gray-800/50 pt-12"
          >
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">Thank You for Choosing AINative</h3>
              <p className="text-gray-400 mb-6">
                We&apos;re committed to providing transparent and fair terms of service for all our
                users.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/privacy"
                  className="px-6 py-2.5 text-sm font-medium rounded-lg border border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  Privacy Policy
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
