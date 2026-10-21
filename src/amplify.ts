/**
 * Configuração do AWS Amplify Auth (Amazon Cognito).
 *
 * Único provedor de identidade: Cognito (Managed Login), com Google habilitado
 * como identity provider do User Pool. O frontend não fala com o Google direto.
 *
 * Variáveis de ambiente (Vite, prefixo VITE_):
 *   VITE_COGNITO_USER_POOL_ID  ex.: us-east-1_2plLvJx5Q
 *   VITE_COGNITO_CLIENT_ID     ID de um app client PÚBLICO (sem client secret)
 *   VITE_COGNITO_DOMAIN        domínio da hosted UI/Managed Login (sem https://)
 *   VITE_COGNITO_REGION        ex.: us-east-1
 *   VITE_COGNITO_REDIRECT_URI  (opcional) default = origem atual + "/"
 *   VITE_COGNITO_LOGOUT_URI    (opcional) default = origem atual + "/"
 *
 * As URLs de redirect/logout são derivadas em runtime da origem atual, então
 * o mesmo build serve para localhost e para produção — basta cadastrar as
 * origens no app client do Cognito. Nunca há segredo aqui.
 */
import { Amplify } from 'aws-amplify';

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const region = import.meta.env.VITE_COGNITO_REGION;

const origin = typeof window !== 'undefined' ? window.location.origin : '';
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_URI || `${origin}/`;
const redirectSignOut = import.meta.env.VITE_COGNITO_LOGOUT_URI || `${origin}/`;

export const cognitoReady = Boolean(userPoolId && userPoolClientId);

if (cognitoReady) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          oauth: domain
            ? {
                domain,
                scopes: ['openid', 'email', 'profile', 'phone'],
                redirectSignIn: [redirectSignIn],
                redirectSignOut: [redirectSignOut],
                responseType: 'code',
              }
            : undefined,
        },
      },
    },
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] VITE_COGNITO_USER_POOL_ID e/ou VITE_COGNITO_CLIENT_ID ausentes — login por Cognito desativado.',
  );
}

export { region };
