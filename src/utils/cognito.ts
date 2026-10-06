/**
 * Helpers do front-end para o fluxo de login via AWS Cognito.
 *
 * No desenvolvimento o Vite faz proxy de /auth → http://localhost:3001 (server.ts),
 * então AUTH_BASE é vazio (mesma origem). Em produção, se o backend e o SPA forem
 * servidos na mesma origem (ex.: server.ts servindo dist/), mantenha vazio.
 */
const AUTH_BASE = (import.meta.env.VITE_AUTH_BASE as string | undefined) ?? '';

/** Resposta normalizada de /auth/user. */
export interface CognitoUserInfo {
  authenticated: boolean;
  sub?: string;
  email?: string;
  name?: string;
  phone_number?: string;
  /** papel no app: 'cliente' | 'profissional' | 'administrador' (default 'cliente') */
  tipo?: string;
}

/**
 * Consulta /auth/user para saber se há sessão Cognito ativa.
 * Retorna null se a sessão não existir ou a requisição falhar.
 */
export async function fetchCognitoUser(): Promise<CognitoUserInfo | null> {
  try {
    const res = await fetch(`${AUTH_BASE}/auth/user`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as CognitoUserInfo;
    return data;
  } catch {
    return null;
  }
}

/** Redireciona o navegador para o início do fluxo de login do Cognito. */
export function loginWithCognito(): void {
  window.location.assign(`${AUTH_BASE}/auth/login`);
}

/** Redireciona para a página de cadastro da hosted UI do Cognito (/signup). */
export function registerWithCognito(): void {
  window.location.assign(`${AUTH_BASE}/auth/register`);
}

/** Redireciona para o login social do Google via Cognito (identity_provider=Google). */
export function loginWithGoogle(): void {
  window.location.assign(`${AUTH_BASE}/auth/google`);
}

/** Encerra a sessão (local + Cognito) redirecionando para /auth/logout. */
export function logoutCognito(): void {
  window.location.assign(`${AUTH_BASE}/auth/logout`);
}
