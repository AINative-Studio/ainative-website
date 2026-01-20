/**
 * User Management MSW Handlers
 */
import { http, HttpResponse } from 'msw';
import { UserFactory } from '../factories';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const userHandlers = [
  http.get(`${BASE_URL}/v1/public/auth/me`, () => {
    return HttpResponse.json(UserFactory.createUserProfile());
  }),

  http.put(`${BASE_URL}/v1/public/profile`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  }),

  http.get(`${BASE_URL}/v1/public/profile/preferences`, () => {
    return HttpResponse.json(UserFactory.createUserPreferences());
  }),

  http.put(`${BASE_URL}/v1/public/profile/preferences`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  }),

  http.post(`${BASE_URL}/v1/public/profile/picture`, async () => {
    return HttpResponse.json({
      success: true,
      message: 'Profile picture uploaded',
      data: { url: 'https://example.com/avatar.jpg' },
    });
  }),

  http.delete(`${BASE_URL}/v1/public/profile/delete`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  }),
];
