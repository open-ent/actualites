import { InfoBase, InfoExtendedStatus, InfoStatus } from '~/models/info';

/**
 * Statuts dérivés d'une info. Fonction pure (aucun hook) : utilisable hors composant, par exemple dans un
 * gestionnaire d'événement, où appeler `useInfoStatus` violerait les règles des hooks.
 */
export function getInfoStatus(info?: InfoBase) {
  if (!info) {
    return {
      isIncoming: false,
      isExpired: false,
      extendedStatus: undefined,
      isPending: false,
      isDraft: false,
      isPublished: false,
      canShowComments: false,
    };
  }
  const isPending = info.status === InfoStatus.PENDING;
  const isIncoming =
    info.status === InfoStatus.PUBLISHED &&
    !!info.publicationDate &&
    new Date(info.publicationDate) > new Date();
  const isExpired =
    info.status === InfoStatus.PUBLISHED &&
    !!info.expirationDate &&
    new Date(info.expirationDate) < new Date();

  let extendedStatus: InfoExtendedStatus | undefined;
  if (isIncoming) {
    extendedStatus = InfoExtendedStatus.INCOMING;
  } else if (isExpired) {
    extendedStatus = InfoExtendedStatus.EXPIRED;
  } else {
    extendedStatus = undefined;
  }

  return {
    isIncoming,
    isExpired,
    extendedStatus,
    isPending,
    isDraft: info.status === InfoStatus.DRAFT,
    isPublished: info.status === InfoStatus.PUBLISHED,
    canShowComments:
      (info.status === InfoStatus.PUBLISHED && !isIncoming) ||
      (info.status === InfoStatus.DRAFT && info.numberOfComments > 0),
  };
}

/** Même résultat que `getInfoStatus`, pour les composants (conserve le nom historique). */
export function useInfoStatus(info?: InfoBase) {
  return getInfoStatus(info);
}
