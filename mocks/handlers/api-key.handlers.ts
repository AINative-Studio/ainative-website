/**
 * API Key MSW Handlers
 */
import { http, HttpResponse } from 'msw';
import { APIKeyFactory } from '../factories';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const apiKeyHandlers = [
  http.get(`${BASE_URL}/api/v1/api-keys`, () => {
    return HttpResponse.json({
      success: true,
      data: { keys: APIKeyFactory.createAPIKeyList() },
    });
  }),

  http.post(`${BASE_URL}/api/v1/api-keys`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      data: { key: APIKeyFactory.createAPIKey() },
    });
  }),

  http.delete(`${BASE_URL}/api/v1/api-keys/:keyId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'API key deleted',
    });
  }),
];
