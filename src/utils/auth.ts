/**
 * Camada de autenticação sobre `aws-amplify/auth` (Amazon Cognito).
 *
 * A sessão e os tokens são gerenciados pelo Amplify (PKCE/state automáticos,
 * sem decodificar JWT manualmente, sem armazenar tokens à mão). Esta é a única
 * fonte de verdade sobre quem está autenticado.
 *
 * Fluxo: App → signInWithRedirect → Cognito Managed Login → (Google, se for o
 * caso) → Cognito emite code → volta à app → o Amplify troca o code por tokens
 * (client público, sem secret no navegador) → lemos getCurrentUser/fetchUserAttributes.
 */
import {
  signInWithRedirect,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  signOut,
} from 'aws-amplify/auth';

const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN ?? '';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID ?? '';

/** Dados do usuário autenticado, a partir de claims confiáveis do Cognito. */
export interface AuthUserInfo {
  /** sub do Cognito (userId) */
  sub: string;
  username: string;
  email: string;
  name: string;
  phone_number: string;
  /** papel no app — do atributo custom:tipo, default 'cliente' */
  tipo: string;
  avatar?: string;
}

/** Inicia o login no Cognito Managed Login (hosted UI), com Google habilitado. */
export async function signInWithCognito(): Promise<void> {
  await signInWithRedirect();
}

/** Cadastro — leva à hosted UI (que tem a aba de cadastro). */
export async function registerWithCognito(): Promise<void> {
  await signInWithRedirect();
}

/** Login social Google — mediado pelo Cognito (identity_provider=Google). */
export async function signInWithGoogle(): Promise<void> {
  await signInWithRedirect({ provider: 'Google' });
}

/**
 * Lê a sessão atual do Amplify. Se houver um `code` na URL (retorno do Cognito),
 * o `fetchAuthSession` completa a troca por tokens. Devolve os dados do usuário
 * a partir dos claims do Cognito, ou null se não houver sessão.
 */
export async function getCurrentAuthUser(): Promise<AuthUserInfo | null> {
  try {
    // Completa o fluxo OAuth caso estejamos voltando do Cognito com ?code=...
    await fetchAuthSession();
    const { userId, username } = await getCurrentUser();
    const attrs = (await fetchUserAttributes()) as Record<string, string | undefined>;
    const get = (k: string) => attrs[k] ?? '';
    return {
      sub: userId,
      username,
      email: get('email'),
      name:
        get('name') ||
        [get('given_name'), get('family_name')].filter(Boolean).join(' '),
      phone_number: get('phone_number') || get('custom:telefone'),
      tipo: get('custom:tipo') || 'cliente',
      avatar: get('picture') || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Encerra a sessão: limpa o estado local do Amplify e redireciona para o logout
 * do Cognito (para encerrar também a sessão da hosted UI), voltando à origem.
 */
export async function cognitoSignOut(): Promise<void> {
  try {
    await signOut({ global: false });
  } catch {
    // segue para o redirect mesmo se falhar a limpeza local
  }
  if (COGNITO_DOMAIN && COGNITO_CLIENT_ID) {
    const params = new URLSearchParams({
      client_id: COGNITO_CLIENT_ID,
      logout_uri: window.location.origin,
    });
    window.location.assign(`https://${COGNITO_DOMAIN}/logout?${params}`);
  } else {
    window.location.assign(window.location.origin);
  }
}
