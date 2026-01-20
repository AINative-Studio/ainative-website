import { authHandlers } from './auth.handlers';
import { userHandlers } from './user.handlers';
import { creditHandlers } from './credit.handlers';
import { subscriptionHandlers } from './subscription.handlers';
import { usageHandlers } from './usage.handlers';
import { rlhfHandlers } from './rlhf.handlers';
import { apiKeyHandlers } from './api-key.handlers';
import { invoiceHandlers } from './invoice.handlers';
import { billingHandlers } from './billing.handlers';
import { communityHandlers } from './community.handlers';
import { videoHandlers } from './video.handlers';
import { webinarHandlers } from './webinar.handlers';

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...creditHandlers,
  ...subscriptionHandlers,
  ...usageHandlers,
  ...rlhfHandlers,
  ...apiKeyHandlers,
  ...invoiceHandlers,
  ...billingHandlers,
  ...communityHandlers,
  ...videoHandlers,
  ...webinarHandlers,
];

export {
  authHandlers,
  userHandlers,
  creditHandlers,
  subscriptionHandlers,
  usageHandlers,
  rlhfHandlers,
  apiKeyHandlers,
  invoiceHandlers,
  billingHandlers,
  communityHandlers,
  videoHandlers,
  webinarHandlers,
};
