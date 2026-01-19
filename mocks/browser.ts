import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export const startMockServiceWorker = async () => {
  if (typeof window === 'undefined') {
    console.warn('MSW browser worker can only be started in a browser environment');
    return;
  }

  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
    console.log('[MSW] Mock Service Worker started successfully');
  } catch (error) {
    console.error('[MSW] Failed to start Mock Service Worker:', error);
  }
};
