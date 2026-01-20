import { http, HttpResponse } from 'msw';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
export const webinarHandlers = [
  http.get(`${BASE_URL}/api/v1/webinars`, () => {
    return HttpResponse.json({ success: true, data: { webinars: [] } });
  }),
];
