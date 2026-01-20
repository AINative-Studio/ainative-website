/**
 * Usage MSW Handlers
 */
import { http, HttpResponse } from 'msw';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const usageHandlers = [
  http.get(`${BASE_URL}/api/v1/usage`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        used: 1500,
        limit: 10000,
        period: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    });
  }),

  http.get(`${BASE_URL}/api/v1/usage/history`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        history: [
          { date: '2024-01-01', count: 100 },
          { date: '2024-01-02', count: 150 },
        ],
      },
    });
  }),
];
