import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { defaultHandlers } from './handlers/default-handlers';

// Aligné sur browser.ts : on enregistre aussi les defaultHandlers (shell applicatif :
// applications-list, userinfo, theme...). Sans ça, ces requêtes partaient en réseau réel
// (onUnhandledRequest: 'bypass') et provoquaient des erreurs socket EINVAL non gérées en test.
export const server = setupServer(...handlers, ...defaultHandlers);
