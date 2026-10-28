/**
 * Configuração do AWS Amplify Auth (Amazon Cognito) — Hosted UI / Managed Login.
 *
 * Fluxo: Authorization Code + PKCE (o Amplify cuida de state/PKCE/tokens).
 * Google é um identity provider do User Pool; o front nunca fala com o Google.
 *
 * Variáveis (Vite):
 *   VITE_COGNITO_USER_POOL_ID  ex.: us-east-1_XXXXXXXXX
 *   VITE_COGNITO_CLIENT_ID     app client PÚBLICO (criado SEM client secret)
 *   VITE_COGNITO_DOMAIN        domínio da Hosted UI, SEM https://
 *   VITE_COGNITO_REDIRECT_URI  (opcional) default = origem atual + "/"
 *   VITE_COGNITO_LOGOUT_URI    (opcional) default = origem atual + "/"
 *
 * Os redirects devem estar cadastrados EXATAMENTE (inclusive a barra final) em
 * "Allowed callback URLs" e "Allowed sign-out URLs" do app client.
 */
import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID as string | undefined;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID as string | undefined;
const domain = import.meta.env.VITE_COGNITO_DOMAIN as string | undefined;

const origin = typeof window !== 'undefined' ? window.location.origin : '';
const redirectSignIn = (import.meta.env.VITE_COGNITO_REDIRECT_URI as string) || `${origin}/`;
const redirectSignOut = (import.meta.env.VITE_COGNITO_LOGOUT_URI as string) || `${origin}/`;

export const cognitoReady = Boolean(userPoolId && userPoolClientId && domain);

if (cognitoReady) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
        loginWith: {
          oauth: {
            domain: domain!.replace(/^https?:\/\//, '').replace(/\/$/, ''),
            // Só scopes habilitados no app client (pedir um não habilitado => invalid_scope).
            scopes: ['openid', 'email', 'profile'],
            redirectSignIn: [redirectSignIn],
            redirectSignOut: [redirectSignOut],
            responseType: 'code',
          },
        },
      },
    },
  });
} else {
  console.warn(
    '[auth] Defina VITE_COGNITO_USER_POOL_ID, VITE_COGNITO_CLIENT_ID e VITE_COGNITO_DOMAIN — login desativado.',
  );
}
