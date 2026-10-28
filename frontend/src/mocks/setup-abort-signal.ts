/**
 * jsdom fournit son propre AbortSignal, que le `Request` de Node (undici) refuse :
 * « Expected signal to be an instance of AbortSignal ». react-router construit une `Request`
 * avec un signal à chaque navigation (ex. `setSearchParams`) : sans ce correctif la navigation échoue
 * silencieusement dans les tests et l'adresse ne change jamais.
 * Le signal est retiré à la construction ; les tests n'annulent aucune navigation.
 */
const NodeRequest = globalThis.Request;

class RequestSansSignal extends NodeRequest {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    super(input, init?.signal ? { ...init, signal: undefined } : init);
  }
}

globalThis.Request = RequestSansSignal as typeof Request;
