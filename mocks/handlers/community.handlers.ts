import { http, HttpResponse } from 'msw';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
export const communityHandlers = [
  http.get(`${BASE_URL}/api/v1/community/search`, () => {
    return HttpResponse.json({ success: true, data: { results: [] } });
  }),
];
