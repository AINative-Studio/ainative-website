import { authHandlers } from './auth.handlers';
import { userHandlers } from './user.handlers';
import { creditHandlers } from './credit.handlers';

export const handlers = [...authHandlers, ...userHandlers, ...creditHandlers];
export { authHandlers, userHandlers, creditHandlers };
