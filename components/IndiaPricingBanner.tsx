'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * India Pricing Banner Component
 *
 * Displays a prominent banner for Indian users promoting 80% discount pricing.
 * Features:
 * - Geo-detection based (only shows for India users)
 * - Dismissible (stores preference in localStorage)
 * - GA4 event tracking
 * - Responsive design
 */

interface IndiaPricingBannerProps {
  /** Optional CSS class name */
  className?: string;
  /** Position: top (fixed at top) or inline (within page flow) */
  position?: 'top' | 'inline';
}

export default function IndiaPricingBanner({
  className = '',
  position = 'inline',
}: IndiaPricingBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkVisibility() {
      console.log('[India Banner] Component mounted, checking visibility...');

      // Debug mode: Check for URL parameter to force-show banner
      const urlParams = new URLSearchParams(window.location.search);
      const forceShow = urlParams.get('show_india_banner') === 'true';

      if (forceShow) {
        console.log('[India Banner] DEBUG MODE: Force showing banner via URL parameter');
        setIsVisible(true);
        setIsLoading(false);
        return;
      }

      // Check if banner was dismissed
      const dismissed = localStorage.getItem('india_pricing_banner_dismissed');
      console.log('[India Banner] Dismissed status:', dismissed);

      if (dismissed === 'true') {
        console.log('[India Banner] Banner was previously dismissed, not showing');
        setIsLoading(false);
        return;
      }

      // Check user location
      try {
        console.log('[India Banner] Fetching location from ipapi.co...');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        console.log('[India Banner] Location data:', data);
        console.log('[India Banner] Country code:', data.country_code);

        if (data.country_code === 'IN') {
          console.log('[India Banner] User is from India - showing banner!');
          setIsVisible(true);
          setIsLoading(false);

          // Track banner impression
          if (typeof window !== 'undefined') {
            const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
            if (gtag) {
              gtag('event', 'india_pricing_banner_viewed', {
                page_path: window.location.pathname,
                country_code: 'IN',
              });
              console.log('[India Banner] GA4 event tracked: india_pricing_banner_viewed');
            }
          }
        } else {
          console.log('[India Banner] User is NOT from India (country:', data.country_code, '), not showing banner');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[India Banner] Failed to detect location:', error);
        setIsLoading(false);
      }
    }

    checkVisibility();
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('india_pricing_banner_dismissed', 'true');
    setIsVisible(false);

    // Track dismissal
    if (typeof window !== 'undefined') {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        gtag('event', 'india_pricing_banner_dismissed', {
          page_path: window.location.pathname,
        });
      }
    }
  };

  const handleClick = () => {
    // Track CTA click
    if (typeof window !== 'undefined') {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
      if (gtag) {
        gtag('event', 'india_pricing_banner_clicked', {
          page_path: window.location.pathname,
          country_code: 'IN',
          cta_text: 'View India Pricing',
        });
      }
    }

    router.push('/pricing');
  };

  if (isLoading || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'top' ? -100 : -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: position === 'top' ? -100 : -20 }}
        transition={{ duration: 0.3 }}
        className={`
          ${position === 'top' ? 'fixed top-0 left-0 right-0 z-50' : 'relative pt-20'}
          ${className}
        `}
      >
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm sm:text-base">
                  <span className="font-bold">Special Pricing for India!</span>
                  <span className="ml-2 hidden sm:inline">
                    Get <span className="font-bold underline">80% OFF</span> all plans
                  </span>
                  <span className="ml-2 sm:hidden block mt-1">
                    <span className="font-bold">80% OFF</span> all plans - Starting at &#x20B9;249/month
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleClick}
                  className="
                    bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold
                    hover:bg-purple-50 transition-colors duration-200
                    text-sm whitespace-nowrap flex-shrink-0
                    shadow-md hover:shadow-lg
                  "
                >
                  View India Pricing &rarr;
                </button>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
