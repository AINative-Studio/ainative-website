'use client';

/**
 * Lazy-loaded framer-motion components
 * Uses LazyMotion to reduce bundle size by loading features on demand
 */

import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * LazyMotionProvider - Wrap your app with this to enable lazy loading of framer-motion features
 * This can reduce the framer-motion bundle size by up to 50%
 */
export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

/**
 * Export the lightweight 'm' component instead of 'motion'
 * Use this for simple animations when wrapped in LazyMotionProvider
 */
export { m };

/**
 * For components that need full motion features,
 * use dynamic import
 */
export { motion } from 'framer-motion';
