/**
 * Camada de autenticação sobre `aws-amplify/auth` (Amazon Cognito).
 *
 * O Amplify gerencia sessão e tokens (PKCE/state automáticos). Esta é a única
 * fonte de verdade sobre quem está autenticado e qual é o seu papel.
 *
 * Papel (RBAC): vem dos GRUPOS do Cognito (claim `cognito:groups` do access
 * token, assinada pelo Cognito) — nunca de um atributo editável pelo usuário.
 *   grupo "administrador" (ou "admin")  -> administrador
 *   grupo "profissional"                -> profissional
 *   sem grupo / grupo "cliente"         -> cliente
 */
import {
  signInWithRedirect,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  signOut,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import type { UserRole } from '../types';

export interface AuthUserInfo {
  /** sub do Cognito */
  sub: string;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  tipo: UserRole;
  groups: string[];
  avatar?: string;
}

/** Redireciona para a Hosted UI do Cognito (login e cadastro ficam lá). */
export async function signInWithCognito(): Promise<void> {
  try {
    await signInWithRedirect();
  } catch (e) {
    // Ex.: já existe usuário logado, ou Cognito não configurado (variáveis VITE_COGNITO_* ausentes no build).
    console.error('[auth] signInWithRedirect falhou:', e);
  }
}

export function roleFromGroups(groups: string[]): UserRole {
  const g = groups.map((x) => x.toLowerCase());
  if (g.includes('administrador') || g.includes('admin')) return 'administrador';
  if (g.includes('profissional')) return 'profissional';
  return 'cliente';
}

/** Lê a sessão atual. Devolve null se não houver usuário autenticado. */
export async function getCurrentAuthUser(): Promise<AuthUserInfo | null> {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens?.accessToken) return null;
    const { userId, username } = await getCurrentUser();
    const attrs = (await fetchUserAttributes()) as Record<string, string | undefined>;
    const raw = session.tokens.accessToken.payload['cognito:groups'];
    const groups = Array.isArray(raw) ? raw.map(String) : [];
    return {
      sub: userId,
      username,
      email: attrs.email ?? '',
      name: attrs.name || [attrs.given_name, attrs.family_name].filter(Boolean).join(' '),
      phone_number: attrs.phone_number ?? '',
      tipo: roleFromGroups(groups),
      groups,
      avatar: attrs.picture || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Encerra a sessão. Com OAuth configurado, o `signOut` do Amplify já limpa os
 * tokens locais e redireciona ao logout da Hosted UI (redirectSignOut).
 */
export async function cognitoSignOut(): Promise<void> {
  try {
    await signOut();
  } catch (e) {
    console.error('[auth] signOut falhou:', e);
  }
}

/** Ouve eventos do Amplify (retorno do login, logout, refresh que falhou). */
export function subscribeAuthEvents(handlers: {
  onSignedIn: () => void;
  onSignedOut: () => void;
}): () => void {
  return Hub.listen('auth', ({ payload }) => {
    switch (payload.event) {
      case 'signInWithRedirect':
      case 'signedIn':
        handlers.onSignedIn();
        break;
      case 'signedOut':
      case 'tokenRefresh_failure':
      case 'signInWithRedirect_failure':
        handlers.onSignedOut();
        break;
    }
  });
}
