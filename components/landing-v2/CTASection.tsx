'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const CTA_GRADIENT = 'linear-gradient(-30.6deg, rgba(88,103,239,0.4) 9.9%, rgba(88,103,239,0.05) 77.8%)';

export default function CTASection() {
  return (
    <section className="relative z-10 max-w-[1440px] mx-auto mt-10 px-[166px]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[1108px] py-20 px-10 rounded-[11px] border border-brand-primary/30 flex flex-col items-center justify-center mx-auto"
        style={{ backgroundImage: CTA_GRADIENT }}
      >
        <h2 className="font-semibold text-[48px] leading-none text-white text-center">
          Ready to get started?
        </h2>
        <p className="text-[17px] leading-[1.536] text-v2-body-gray text-center max-w-[402px] mt-[14px]">
          Join developers building the next generation of AI applications
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2.5 w-[216px] h-[53px] bg-brand-primary rounded-lg text-white font-bold text-sm mt-9 transition-all hover:bg-v2-btn-hover hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(88,103,239,0.45)]"
        >
          Sign Up
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </motion.div>
    </section>
  );
}
