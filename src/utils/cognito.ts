/**
 * Autenticação AWS Cognito — fluxo Authorization Code + PKCE executado
 * INTEGRALMENTE NO NAVEGADOR (sem backend, sem client secret).
 *
 * Isto permite rodar o app como SPA estático (ex.: AWS Amplify Hosting),
 * já que o endpoint de token do Cognito aceita chamadas cross-origin com
 * PKCE de um client público. Funciona igual em localhost e em produção.
 *
 * Variáveis de ambiente (Vite — prefixo VITE_):
 *   VITE_COGNITO_DOMAIN     domínio da hosted UI, ex.: xxx.auth.us-east-1.amazoncognito.com
 *   VITE_COGNITO_CLIENT_ID  ID de um app client PÚBLICO (sem client secret)
 */

const COGNITO_DOMAIN =
  (import.meta.env.VITE_COGNITO_DOMAIN as string | undefined) ?? '';
const COGNITO_CLIENT_ID =
  (import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined) ?? '';
const SCOPES = 'openid email profile phone';

const PKCE_KEY = 'cliniflow_pkce'; // { verifier, state, redirectUri }
const CLAIMS_KEY = 'cliniflow_cognito_claims'; // claims decodificadas do ID Token

/** Resposta normalizada lida do ID Token. */
export interface CognitoUserInfo {
  authenticated: boolean;
  sub?: string;
  email?: string;
  name?: string;
  phone_number?: string;
  /** papel no app: 'cliente' | 'profissional' | 'administrador' (default 'cliente') */
  tipo?: string;
}

// ── Primitivas criptográficas (Web Crypto) ────────────────────────────────────

function b64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): string {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function randomString(byteLen = 48): string {
  const arr = new Uint8Array(byteLen);
  crypto.getRandomValues(arr);
  return b64url(arr);
}

async function sha256B64url(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return b64url(new Uint8Array(digest));
}

// ── URL helpers ────────────────────────────────────────────────────────────────

/** redirect_uri = a origem atual (raiz). Cadastra no Cognito exatamente assim. */
function redirectUri(): string {
  return window.location.origin;
}

function cognitoUrl(path: string, params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return `https://${COGNITO_DOMAIN}${path}?${qs}`;
}

// ── Mapeamento de claims → CognitoUserInfo ────────────────────────────────────

function claimsToUserInfo(claims: Record<string, unknown>): CognitoUserInfo {
  const get = (k: string) => (typeof claims[k] === 'string' ? (claims[k] as string) : '');
  const name =
    get('name') ||
    [claims.given_name, claims.family_name]
      .filter((v): v is string => typeof v === 'string')
      .join(' ') ||
    '';
  return {
    authenticated: true,
    sub: get('sub') || undefined,
    email: get('email') || undefined,
    name,
    phone_number: get('phone_number') || get('custom:telefone') || undefined,
    tipo: get('custom:tipo') || 'cliente',
  };
}

// ── Início do fluxo (login / cadastro / google) ───────────────────────────────

/**
 * Gera PKCE + state, guarda na sessão e redireciona para a hosted UI do Cognito.
 * @param signup        true → página de cadastro (/signup)
 * @param idpIdentifier nome do IdP (ex.: "Google") para login social direto
 */
async function beginAuthFlow(opts: { signup?: boolean; idp?: string } = {}): Promise<void> {
  if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) {
    console.error(
      '[cognito] configure VITE_COGNITO_DOMAIN e VITE_COGNITO_CLIENT_ID (.env).',
    );
    return;
  }
  const verifier = randomString(48);
  const challenge = await sha256B64url(verifier);
  const state = randomString(24);
  sessionStorage.setItem(
    PKCE_KEY,
    JSON.stringify({ verifier, state, redirectUri: redirectUri() }),
  );

  const params: Record<string, string> = {
    response_type: 'code',
    client_id: COGNITO_CLIENT_ID,
    redirect_uri: redirectUri(),
    scope: SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  };
  if (opts.idp) params.identity_provider = opts.idp;

  const path = opts.signup ? '/signup' : '/oauth2/authorize';
  window.location.assign(cognitoUrl(path, params));
}

/** Login (sign-in) na hosted UI do Cognito. */
export function loginWithCognito(): void {
  void beginAuthFlow();
}

/** Cadastro direto na página /signup da hosted UI do Cognito. */
export function registerWithCognito(): void {
  void beginAuthFlow({ signup: true });
}

/** Login social via Google (identity_provider=Google no Cognito). */
export function loginWithGoogle(): void {
  void beginAuthFlow({ idp: 'Google' });
}

// ── Tratamento do retorno (callback com code) ─────────────────────────────────

function decodeIdToken(idToken: string): Record<string, unknown> {
  try {
    const payload = idToken.split('.')[1];
    return JSON.parse(b64urlDecode(payload));
  } catch {
    return {};
  }
}

/**
 * Se a URL atual contiver ?code=...&state=... (retorno do Cognito), troca o
 * código por tokens usando PKCE (client público, sem secret), decodifica o ID
 * Token e guarda as claims. Retorna as claims se o login ocorreu, ou null.
 */
export async function handleCognitoCallback(): Promise<CognitoUserInfo | null> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code) return null;

  const storedRaw = sessionStorage.getItem(PKCE_KEY);
  sessionStorage.removeItem(PKCE_KEY);
  if (!storedRaw) return null;

  let verifier: string;
  let expectedState: string;
  let usedRedirectUri: string;
  try {
    const stored = JSON.parse(storedRaw) as {
      verifier: string;
      state: string;
      redirectUri: string;
    };
    verifier = stored.verifier;
    expectedState = stored.state;
    usedRedirectUri = stored.redirectUri;
  } catch {
    return null;
  }

  if (state !== expectedState) {
    console.error('[cognito] state mismatch — possível CSRF. Login abortado.');
    return null;
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: COGNITO_CLIENT_ID,
    code,
    redirect_uri: usedRedirectUri,
    code_verifier: verifier,
  });

  try {
    const res = await fetch(`https://${COGNITO_DOMAIN}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      console.error('[cognito] token exchange falhou:', res.status, await res.text());
      return null;
    }
    const tokens = (await res.json()) as { id_token?: string };
    if (!tokens.id_token) return null;
    const claims = decodeIdToken(tokens.id_token);
    const info = claimsToUserInfo(claims);
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
    return info;
  } catch (err) {
    console.error('[cognito] erro na troca do código:', err);
    return null;
  }
}

// ── Leitura do usuário autenticado ─────────────────────────────────────────────

/** Retorna o usuário autenticado a partir das claims guardadas, ou null. */
export function fetchCognitoUser(): CognitoUserInfo | null {
  const raw = localStorage.getItem(CLAIMS_KEY);
  if (!raw) return null;
  try {
    const claims = JSON.parse(raw) as Record<string, unknown>;
    return claimsToUserInfo(claims);
  } catch {
    return null;
  }
}

// ── Logout ────────────────────────────────────────────────────────────────────

/** Limpa as claims locais e redireciona para o logout do Cognito. */
export function logoutCognito(): void {
  localStorage.removeItem(CLAIMS_KEY);
  if (!COGNITO_DOMAIN || !COGNITO_CLIENT_ID) {
    window.location.assign(window.location.origin);
    return;
  }
  window.location.assign(
    cognitoUrl('/logout', {
      client_id: COGNITO_CLIENT_ID,
      logout_uri: window.location.origin,
    }),
  );
}
