/**
 * MSW Browser Initialization Script
 * 
 * Import this conditionally in your app to enable API mocking in development
 * or during E2E tests.
 * 
 * Usage in app/layout.tsx or pages/_app.tsx:
 * 
 * ```tsx
 * if (process.env.NEXT_PUBLIC_ENABLE_MSW === 'true') {
 *   if (typeof window !== 'undefined') {
 *     import('../mocks/init-browser').then(({ initMockServiceWorker }) => {
 *       initMockServiceWorker();
 *     });
 *   }
 * }
 * ```
 */

export async function initMockServiceWorker() {
  if (typeof window === 'undefined') {
    return;
  }

  const { worker } = await import('./browser');

  try {
    await worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });

    console.log('[MSW] Mock Service Worker initialized');
    
    // Set global flag for E2E tests
    (window as any).__MSW_READY__ = true;
    (window as any).__MSW_WORKER__ = worker;
  } catch (error) {
    console.error('[MSW] Failed to initialize Mock Service Worker:', error);
    (window as any).__MSW_READY__ = false;
  }
}

// Auto-initialize if MSW is enabled via environment variable
if (typeof window !== 'undefined' && (window as any).__MSW_ENABLED__) {
  initMockServiceWorker();
}
