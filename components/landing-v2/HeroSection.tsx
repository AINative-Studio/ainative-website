'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const WORDS = ['Founders', 'Developers', 'Builders', 'Data Scientists', 'Vibe Coders'];
const CYCLE_INTERVAL = 2500;
const INITIAL_DELAY = 2000;

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setWordIndex((prev) => (prev + 1) % WORDS.length);
      }, CYCLE_INTERVAL);
      return () => clearInterval(interval);
    }, INITIAL_DELAY);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative z-10 text-center pt-[140px]">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="font-extrabold text-[82px] leading-[1.05] text-white tracking-[-1px]"
      >
        The{' '}
        <span className="relative inline-block text-v2-highlight">
          AI Native
          <span className="absolute left-0 bottom-[2px] w-full h-1 bg-brand-primary rounded-sm shadow-[0_0_8px_rgba(88,103,239,0.8),0_0_20px_rgba(88,103,239,0.5),0_0_40px_rgba(88,103,239,0.3)]" />
        </span>
        <br />
        Studio For
        <br />
        <AnimatePresence mode="wait">
          <motion.span
            key={WORDS[wordIndex]}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block text-v2-highlight"
          >
            {WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-[17px] leading-[1.536] text-v2-highlight text-center max-w-[402px] mx-auto mt-4"
      >
        Empower your team with memory-powered agents, blazing-fast infrastructure, and a quantum-accelerated IDE experience.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex gap-4 justify-center mt-7"
      >
        <Link
          href="/download"
          className="inline-flex items-center justify-center w-[216px] h-[53px] bg-brand-primary rounded-lg text-white font-bold text-sm transition-all hover:bg-v2-btn-hover hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(88,103,239,0.45)]"
        >
          Download AI Native IDE
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center gap-2 w-[216px] h-[53px] bg-brand-primary/15 border border-brand-primary/40 rounded-lg text-v2-highlight-hover font-bold text-sm transition-all hover:bg-brand-primary/25 hover:border-brand-primary/60 hover:text-white hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(88,103,239,0.3)]"
        >
          View Docs
          <ChevronIcon />
        </Link>
      </motion.div>
    </section>
  );
}
