import { http, HttpResponse } from 'msw';
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';
export const videoHandlers = [
  http.post(`${BASE_URL}/api/v1/videos/upload`, () => {
    return HttpResponse.json({ success: true, data: { videoId: 'video_123' } });
  }),
];
