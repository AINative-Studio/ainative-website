'use client';

import { motion } from 'framer-motion';

// Define company logos with placeholder descriptions
// Replace with actual SVG logos or images as they become available
const companyCategories = {
  'Backed By': [
    { name: 'Y Combinator', logo: '/logos/yc.svg' },
    { name: 'TechStars', logo: '/logos/techstars.svg' },
    { name: 'AWS Activate', logo: '/logos/aws.svg' },
  ],
  'Featured In': [
    { name: 'TechCrunch', logo: '/logos/techcrunch.svg' },
    { name: 'Product Hunt', logo: '/logos/producthunt.svg' },
    { name: 'Hacker News', logo: '/logos/hackernews.svg' },
  ],
  'Trusted By Teams At': [
    { name: 'Fortune 500 Companies', logo: null },
    { name: 'Leading Startups', logo: null },
    { name: 'Top Universities', logo: null },
  ],
};

interface CompanyLogosProps {
  category?: keyof typeof companyCategories | 'all';
  showTitle?: boolean;
  className?: string;
  animated?: boolean;
}

export default function CompanyLogos({
  category = 'all',
  showTitle = true,
  className = '',
  animated = true,
}: CompanyLogosProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const categories: [string, { name: string; logo: string | null }[]][] =
    category === 'all'
      ? Object.entries(companyCategories) as [string, { name: string; logo: string | null }[]][]
      : [[category, companyCategories[category]]];

  const Wrapper = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categories.map(([title, companies]) => (
          <div key={title as string} className="mb-8 last:mb-0">
            {showTitle && (
              <p className="text-center text-gray-500 text-sm uppercase tracking-wider mb-6">
                {title}
              </p>
            )}
            <Wrapper
              {...(animated && {
                variants: containerVariants,
                initial: 'hidden',
                whileInView: 'visible',
                viewport: { once: true },
              })}
              className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
            >
              {companies.map((company, index) => (
                <Item
                  key={index}
                  {...(animated && { variants: itemVariants })}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-8 md:h-10 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-sm md:text-base font-medium">{company.name}</span>
                  )}
                </Item>
              ))}
            </Wrapper>
          </div>
        ))}
      </div>
    </section>
  );
}

// Scrolling logo bar for continuous animation effect
export function ScrollingLogoBar({
  logos = ['Y Combinator', 'TechStars', 'AWS', 'Google Cloud', 'Microsoft', 'GitHub'],
  speed = 30,
  className = '',
}: {
  logos?: string[];
  speed?: number;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden py-8 ${className}`}>
      <div className="relative">
        <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-gray-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-gray-950 to-transparent z-10" />
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="flex gap-16 whitespace-nowrap"
        >
          {[...logos, ...logos].map((logo, index) => (
            <div
              key={index}
              className="text-gray-500 text-lg font-medium flex-shrink-0"
            >
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Simple inline logo strip
export function InlineLogoStrip({
  title = 'Trusted by developers at',
  logos = ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
  className = '',
}: {
  title?: string;
  logos?: string[];
  className?: string;
}) {
  return (
    <div className={`text-center py-6 ${className}`}>
      <p className="text-gray-500 text-sm mb-4">{title}</p>
      <div className="flex flex-wrap justify-center gap-6 text-gray-400">
        {logos.map((logo, index) => (
          <span key={index} className="font-medium hover:text-gray-300 transition-colors">
            {logo}
          </span>
        ))}
      </div>
    </div>
  );
}
