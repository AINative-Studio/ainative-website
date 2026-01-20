import { http, HttpResponse } from 'msw';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
export const billingHandlers = [
  http.get(`${BASE_URL}/api/v1/billing`, () => {
    return HttpResponse.json({ success: true, data: {} });
  }),
];
