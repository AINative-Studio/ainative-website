import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

export const setupMockServer = () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock server started for testing');
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
    console.log('[MSW] Mock server stopped');
  });
};

export const resetMockHandlers = () => {
  server.resetHandlers();
};

export const addMockHandlers = (...additionalHandlers: Parameters<typeof server.use>) => {
  server.use(...additionalHandlers);
};
