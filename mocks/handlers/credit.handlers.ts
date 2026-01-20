/**
 * Credit Management MSW Handlers
 */
import { http, HttpResponse } from 'msw';
import { CreditFactory } from '../factories';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const creditHandlers = [
  http.get(`${BASE_URL}/api/v1/credits/balance`, () => {
    return HttpResponse.json({
      success: true,
      data: { balance: 1000, currency: 'USD' },
    });
  }),

  http.get(`${BASE_URL}/api/v1/credits/transactions`, () => {
    return HttpResponse.json({
      success: true,
      data: { transactions: [] },
    });
  }),

  http.post(`${BASE_URL}/api/v1/credits/purchase`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Credits purchased successfully',
      data: { newBalance: 2000 },
    });
  }),
];
