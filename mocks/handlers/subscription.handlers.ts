/**
 * Subscription MSW Handlers
 */
import { http, HttpResponse } from 'msw';
import { SubscriptionFactory } from '../factories';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.ainative.studio';

export const subscriptionHandlers = [
  http.get(`${BASE_URL}/api/v1/subscription`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Subscription retrieved',
      data: { subscription: SubscriptionFactory.createSubscription() },
    });
  }),

  http.get(`${BASE_URL}/api/v1/subscription/plans`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Plans retrieved',
      data: { plans: SubscriptionFactory.createPlanList() },
    });
  }),

  http.post(`${BASE_URL}/api/v1/subscription/subscribe`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      message: 'Subscribed successfully',
      data: { subscription: SubscriptionFactory.createSubscription() },
    });
  }),

  http.post(`${BASE_URL}/api/v1/subscription/cancel`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Subscription canceled',
      data: { subscription: SubscriptionFactory.createCanceledSubscription() },
    });
  }),

  http.get(`${BASE_URL}/api/v1/subscription/invoices`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Invoices retrieved',
      data: { invoices: [SubscriptionFactory.createInvoice()] },
    });
  }),

  http.get(`${BASE_URL}/api/v1/subscription/payment-methods`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Payment methods retrieved',
      data: { payment_methods: [SubscriptionFactory.createPaymentMethod()] },
    });
  }),
];
