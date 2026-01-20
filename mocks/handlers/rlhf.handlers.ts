/**
 * RLHF MSW Handlers
 */
import { http, HttpResponse } from 'msw';
import { RLHFFactory } from '../factories';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const rlhfHandlers = [
  http.post(`${BASE_URL}/v1/public/:projectId/database/rlhf/interactions`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 'feedback_' + Date.now(),
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(`${BASE_URL}/v1/public/:projectId/database/rlhf/stats`, ({ request }) => {
    return HttpResponse.json({
      total: 100,
      positive: 80,
      negative: 20,
      positivePercentage: 80,
    });
  }),

  http.get(`${BASE_URL}/v1/public/:projectId/database/rlhf/workflow/:workflowId`, () => {
    return HttpResponse.json({
      feedback: [RLHFFactory.createFeedback(), RLHFFactory.createPositiveFeedback()],
    });
  }),
];
