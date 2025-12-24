'use client';

import { motion } from 'framer-motion';

// Stats data - can be updated as actual numbers grow
const stats = [
  { label: 'Active Developers', value: '10K+', description: 'using AI Native Studio' },
  { label: 'Code Completions', value: '1M+', description: 'per month' },
  { label: 'NPM Downloads', value: '50K+', description: 'AI Kit packages' },
  { label: 'GitHub Stars', value: '2.5K+', description: 'across repositories' },
];

// Company logos - represented as text for now, can be replaced with actual logos
const trustedBy = [
  'Y Combinator',
  'TechStars',
  'AWS Startups',
  'Microsoft for Startups',
  'Google Cloud',
];

// Trust badges/features
const trustBadges = [
  { icon: '🔒', label: 'SOC2 Compliant' },
  { icon: '🛡️', label: 'Enterprise Ready' },
  { icon: '⚡', label: '99.9% Uptime' },
  { icon: '🌐', label: 'Global CDN' },
];

interface TrustSignalsProps {
  variant?: 'full' | 'compact' | 'stats-only' | 'logos-only';
  className?: string;
}

export default function TrustSignals({ variant = 'full', className = '' }: TrustSignalsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  // Stats Section
  const StatsSection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-4 gap-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
            {stat.value}
          </div>
          <div className="text-white font-semibold mt-2">{stat.label}</div>
          <div className="text-gray-400 text-sm">{stat.description}</div>
        </motion.div>
      ))}
    </motion.div>
  );

  // Trusted By Section
  const TrustedBySection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center"
    >
      <motion.p variants={itemVariants} className="text-gray-400 text-sm uppercase tracking-wider mb-6">
        Backed by & Featured in
      </motion.p>
      <motion.div
        variants={containerVariants}
        className="flex flex-wrap justify-center items-center gap-8 md:gap-12"
      >
        {trustedBy.map((company, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg font-medium"
          >
            {company}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  // Trust Badges Section
  const TrustBadgesSection = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-wrap justify-center gap-4 md:gap-8"
    >
      {trustBadges.map((badge, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="flex items-center gap-2 bg-gray-800/50 rounded-full px-4 py-2 border border-gray-700"
        >
          <span className="text-xl">{badge.icon}</span>
          <span className="text-gray-300 text-sm font-medium">{badge.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );

  if (variant === 'stats-only') {
    return (
      <div className={`py-12 ${className}`}>
        <StatsSection />
      </div>
    );
  }

  if (variant === 'logos-only') {
    return (
      <div className={`py-12 ${className}`}>
        <TrustedBySection />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`py-8 ${className}`}>
        <div className="flex flex-wrap justify-center gap-6 text-gray-400 text-sm">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-white font-bold">{stat.value}</span>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <section className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Stats */}
        <StatsSection />

        {/* Divider */}
        <div className="border-t border-gray-800" />

        {/* Trusted By */}
        <TrustedBySection />

        {/* Trust Badges */}
        <TrustBadgesSection />
      </div>
    </section>
  );
}

// Animated counter component for more dynamic stats
export function AnimatedStat({
  value,
  label,
  suffix = '',
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
      >
        {value.toLocaleString()}{suffix}
      </motion.div>
      <div className="text-gray-400 mt-2">{label}</div>
    </motion.div>
  );
}

// Social proof testimonial component
export function SocialProof({
  quote,
  author,
  role,
  company,
  avatar,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800/30 rounded-xl p-6 border border-gray-700"
    >
      <p className="text-gray-300 italic mb-4">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="text-white font-medium">{author}</div>
          <div className="text-gray-400 text-sm">
            {role} at {company}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Rating display component
export function RatingBadge({
  rating,
  reviewCount,
  platform,
}: {
  rating: number;
  reviewCount: number;
  platform: string;
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="inline-flex items-center gap-2 bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700"
    >
      <div className="flex">
        {stars.map((filled, i) => (
          <span key={i} className={filled ? 'text-yellow-400' : 'text-gray-600'}>
            ★
          </span>
        ))}
      </div>
      <span className="text-white font-bold">{rating.toFixed(1)}</span>
      <span className="text-gray-400 text-sm">
        ({reviewCount.toLocaleString()} reviews on {platform})
      </span>
    </motion.div>
  );
}
