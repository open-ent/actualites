import { http, HttpResponse } from 'msw';
// @ts-ignore - Backend translation files only use for mock server
import actualitesTranslations from '../../../../backend/src/main/resources/i18n/fr.json';
// @ts-ignore - Backend translation files only use for mock server
// Résolu par l'alias @portal-i18n (cf. vite.config.ts) : entcore est hors de ce
// dépôt et son emplacement varie selon l'agencement ; repli sur un stub vide.
import portalTranslations from '@portal-i18n';

export const i18nHandlers = [
  http.get('/i18n', () => {
    return HttpResponse.json(portalTranslations);
  }),

  http.get('/actualites/i18n', () => {
    return HttpResponse.json(actualitesTranslations);
  }),
];
