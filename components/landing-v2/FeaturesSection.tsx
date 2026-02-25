'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  }),
};

const CARD_GRADIENT = 'linear-gradient(-52.3deg, rgba(88,103,239,0.4) 9.9%, rgba(88,103,239,0.05) 77.8%)';

function ZeroDBIcon() {
  return (
    <svg viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65px] h-[65px]">
      <ellipse cx="32.5" cy="14" rx="22" ry="8" stroke="#5867EF" strokeWidth="4" fill="none" />
      <path d="M10.5 14v12c0 4.418 9.85 8 22 8s22-3.582 22-8V14" stroke="#5867EF" strokeWidth="4" fill="none" />
      <path d="M10.5 26c0 4.418 9.85 8 22 8s22-3.582 22-8" stroke="white" strokeWidth="2" fill="none" />
      <path d="M10.5 26v12c0 4.418 9.85 8 22 8s22-3.582 22-8V26" stroke="#5867EF" strokeWidth="4" fill="none" />
      <path d="M10.5 38c0 4.418 9.85 8 22 8s22-3.582 22-8" stroke="white" strokeWidth="2" fill="none" />
      <path d="M10.5 38v12c0 4.418 9.85 8 22 8s22-3.582 22-8V38" stroke="#5867EF" strokeWidth="4" fill="none" />
    </svg>
  );
}

function CommunityIcon() {
  return (
    <svg viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[65px] h-[65px]">
      <circle cx="22" cy="20" r="8" stroke="#5867EF" strokeWidth="4" fill="none" />
      <circle cx="43" cy="20" r="8" stroke="#5867EF" strokeWidth="4" fill="none" />
      <path d="M6 50c0-8.284 7.163-15 16-15 4.07 0 7.77 1.525 10.58 4.03" stroke="#5867EF" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M59 50c0-8.284-7.163-15-16-15-4.07 0-7.77 1.525-10.58 4.03" stroke="#5867EF" strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="32.5" cy="52" r="3" fill="white" />
      <circle cx="22" cy="52" r="3" fill="white" />
      <circle cx="43" cy="52" r="3" fill="white" />
    </svg>
  );
}

const FEATURE_CARDS = [
  {
    label: 'AI Native IDE',
    icon: <Image src="/landing-v2/icon-command-line.svg" alt="AI Native IDE" width={57} height={49} />,
    href: '/download',
    iconClass: 'w-[57px] h-[49px]',
  },
  {
    label: 'AI Kit',
    icon: <Image src="/landing-v2/icon-ai-driven.svg" alt="AI Kit" width={65} height={65} />,
    href: '/ai-kit',
    iconClass: 'w-[65px]',
  },
  {
    label: 'ZeroDB',
    icon: <ZeroDBIcon />,
    href: 'https://zerodb.ainative.studio',
    external: true,
    iconClass: '',
  },
  {
    label: 'Community',
    icon: <CommunityIcon />,
    href: '/community',
    iconClass: '',
  },
];

export default function FeaturesSection() {
  return (
    <section className="relative z-10 max-w-[1440px] mx-auto -mt-[50px] pt-[60px] px-[169px]">
      <div className="flex gap-[100px] items-start">
        {/* Left column */}
        <motion.div
          className="flex-1 min-w-0"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2 className="font-semibold text-[48px] leading-[1.08] text-white">
            Everything you need to{' '}
            <span className="text-v2-highlight">build AI-powered</span> applications
          </h2>
          <p className="text-[17px] leading-[1.536] text-v2-body-gray max-w-[402px] mt-[18px]">
            Production-ready tools and infrastructure for modern AI development
          </p>

          <div className="flex gap-10 mt-[50px]">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 leading-[1.5]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 2a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5zm0 11c-2.03 0-3.8-1.04-4.84-2.62.02-1.6 3.23-2.48 4.84-2.48 1.6 0 4.82.88 4.84 2.48A5.98 5.98 0 0 1 10 15z" fill="#a3adff" />
                </svg>
              </span>
              <span className="font-medium text-sm leading-[1.536] text-v2-highlight max-w-[205px]">
                Memory-powered agents that learn and adapt to your codebase.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 leading-[1.5]">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 10h2l1.5-4 3 8 2-6 1.5 2H17" stroke="#a3adff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="font-medium text-sm leading-[1.536] text-v2-highlight max-w-[205px]">
                Quantum-accelerated IDE with blazing-fast infrastructure.
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right column - 2x2 card grid */}
        <div className="grid grid-cols-2 gap-6 shrink-0">
          {FEATURE_CARDS.map((card, i) => {
            const cardContent = (
              <>
                <div className="flex items-center justify-center">
                  {card.icon}
                </div>
                <span className="font-bold text-base leading-[1.536] text-v2-nav-gray text-center">
                  {card.label}
                </span>
              </>
            );

            const cardClass =
              'w-[200px] h-[174px] rounded-[11px] border border-brand-primary/30 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all hover:border-brand-primary/60 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(88,103,239,0.2)]';

            return (
              <motion.div
                key={card.label}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
              >
                {card.external ? (
                  <a
                    href={card.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClass}
                    style={{ backgroundImage: CARD_GRADIENT }}
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link
                    href={card.href}
                    className={cardClass}
                    style={{ backgroundImage: CARD_GRADIENT }}
                  >
                    {cardContent}
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
