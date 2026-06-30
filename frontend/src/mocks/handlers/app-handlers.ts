import { http, HttpResponse } from 'msw';
import { baseUrl } from '~/services';

/**
 * Handlers du shell applicatif (config publique, audience).
 * Mockés pour éviter que ces requêtes ne partent en réseau réel pendant les tests
 * (onUnhandledRequest: 'bypass' -> erreurs socket EINVAL non gérées).
 */
export const appHandlers = [
  // Configuration publique de l'application (PublicConf : tous les champs sont optionnels)
  http.get(`${baseUrl}/conf/public`, () =>
    HttpResponse.json({}, { status: 200 }),
  ),

  // Compteurs de vues (audience) : map resourceId -> nombre de vues, vide en test
  http.get('/audience/views/count/actualites/info', () =>
    HttpResponse.json({}, { status: 200 }),
  ),
];
