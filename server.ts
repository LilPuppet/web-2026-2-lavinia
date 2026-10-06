/**
 * CliniFlow — Backend de autenticação (AWS Cognito · OpenID Connect)
 *
 * Este servidor Express implementa o fluxo Authorization Code + PKCE contra um
 * User Pool do Amazon Cognito usando a biblioteca `openid-client` (v6).
 *
 * Rotas expostas (todas sob /auth):
 *   GET /auth/login     → redireciona para a hosted UI do Cognito
 *   GET /auth/callback  → troca o código por tokens e guarda a sessão
 *   GET /auth/user      → devolve os dados do usuário autenticado (ou authenticated:false)
 *   GET /auth/logout    → encerra a sessão e redireciona para o logout do Cognito
 *
 * Em produção (quando a pasta dist/ existe) o servidor também serve o SPA
 * construído pelo Vite, mantendo API e front-end na mesma origem — o que evita
 * problemas de CORS/cookies e torna o `redirect_uri` coerente com o Cognito.
 *
 * Variáveis de ambiente (ver .env.example):
 *   COGNITO_ISSUER, COGNITO_CLIENT_ID, COGNITO_CLIENT_SECRET,
 *   COGNITO_REDIRECT_URI, COGNITO_LOGOUT_URI, COGNITO_SCOPE,
 *   SESSION_SECRET, AUTH_PORT, NODE_ENV
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import * as oidc from 'openid-client';

// ── Tipagem extra da sessão ───────────────────────────────────────────────────
declare module 'express-session' {
  interface SessionData {
    pkce?: { verifier: string; state: string };
    cognito?: {
      claims?: Record<string, unknown>;
      userinfo?: Record<string, unknown>;
      id_token?: string;
    };
  }
}

// ── Configuração via variáveis de ambiente ────────────────────────────────────
const COGNITO_ISSUER = process.env.COGNITO_ISSUER ?? '';
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? '';
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET ?? '';
const COGNITO_REDIRECT_URI =
  process.env.COGNITO_REDIRECT_URI ?? 'http://localhost:3000/auth/callback';
const COGNITO_LOGOUT_URI =
  process.env.COGNITO_LOGOUT_URI ?? 'http://localhost:3000';
const COGNITO_SCOPE =
  process.env.COGNITO_SCOPE ?? 'openid email profile phone';
// Nome do identity provider do Google conforme cadastrado no User Pool
// (default "Google"). Usado para deep-link direto ao login do Google.
const COGNITO_GOOGLE_IDP_NAME =
  process.env.COGNITO_GOOGLE_IDP_NAME ?? 'Google';
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? 'cliniflow-dev-secret-change-me';
const PORT = Number(process.env.AUTH_PORT ?? 3001);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');

// ── Descoberta OIDC (done uma vez na inicialização) ───────────────────────────
let config: oidc.Configuration | null = null;

async function initOidc(): Promise<void> {
  if (!COGNITO_ISSUER || !COGNITO_CLIENT_ID) {
    console.warn(
      '[cognito] COGNITO_ISSUER/COGNITO_CLIENT_ID ausentes — login por Cognito desativado.',
    );
    return;
  }
  try {
    // 3º arg = client_secret (atalho para ClientMetadata); a auth default é
    // ClientSecretPost, que o Cognito aceita para app clients confidenciais.
    config = await oidc.discovery(
      new URL(COGNITO_ISSUER),
      COGNITO_CLIENT_ID,
      COGNITO_CLIENT_SECRET,
    );
    console.info('[cognito] OIDC discovery OK:', COGNITO_ISSUER);
  } catch (err) {
    console.error('[cognito] OIDC discovery falhou:', err);
  }
}

// Garante que o cliente OIDC está pronto antes de usar as rotas de auth.
const requireConfig = (
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!config) {
    res.status(503).json({ error: 'cognito_not_configured' });
    return;
  }
  next();
};

const saveSession = (req: Request) =>
  new Promise<void>((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });

/**
 * Inicia um fluxo Authorization Code + PKCE contra o Cognito e redireciona
 * o navegador. State + code_verifier são guardados na sessão para a callback.
 *
 * @param signup        true → leva direto à página de cadastro da hosted UI
 *                      (troca o path /oauth2/authorize por /signup).
 * @param idpIdentifier nome do identity provider (ex.: "Google") para login
 *                      social direto, pulando a página do Cognito.
 */
async function startAuthFlow(
  req: Request,
  res: Response,
  opts: { signup?: boolean; idpIdentifier?: string } = {},
): Promise<void> {
  if (!config) {
    res.redirect('/?auth_error=config');
    return;
  }
  try {
    const verifier = oidc.randomPKCECodeVerifier();
    const challenge = await oidc.calculatePKCECodeChallenge(verifier);
    const state = oidc.randomState();

    req.session.pkce = { verifier, state };
    await saveSession(req);

    const params: Record<string, string> = {
      redirect_uri: COGNITO_REDIRECT_URI,
      scope: COGNITO_SCOPE,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state,
    };
    if (opts.idpIdentifier) params.identity_provider = opts.idpIdentifier;

    let redirectTo = oidc.buildAuthorizationUrl(config, params);
    if (opts.signup) {
      // A hosted UI do Cognito expõe o cadastro em /signup com os mesmos
      // parâmetros OAuth; após o cadastro ela redireciona para a callback.
      redirectTo = new URL(redirectTo.href);
      redirectTo.pathname = '/signup';
    }
    res.redirect(redirectTo.href);
  } catch (err) {
    console.error('[cognito] startAuthFlow erro:', err);
    res.redirect('/?auth_error=login');
  }
}

// ── App Express ───────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', true);

app.use(
  session({
    name: 'cliniflow.sid',
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24h
    },
  }),
);

// GET /auth/login → redireciona para a hosted UI do Cognito (sign-in)
app.get('/auth/login', requireConfig, async (req, res) => {
  await startAuthFlow(req, res);
});

// GET /auth/register → leva direto à página de cadastro da hosted UI do Cognito
app.get('/auth/register', requireConfig, async (req, res) => {
  await startAuthFlow(req, res, { signup: true });
});

// GET /auth/google → login social via Google (identity_provider=Google no Cognito)
app.get('/auth/google', requireConfig, async (req, res) => {
  await startAuthFlow(req, res, { idpIdentifier: COGNITO_GOOGLE_IDP_NAME });
});

// GET /auth/callback → valida state/PKCE, troca o código por tokens, guarda sessão
app.get('/auth/callback', requireConfig, async (req: Request, res: Response) => {
  if (!config) return res.redirect('/?auth_error=config');
  const pkce = req.session.pkce;
  try {
    if (!pkce) {
      return res.redirect('/?auth_error=state');
    }

    // Constrói a URL de callback preservando a query recebida, mas usando a
    // origem/path exatos do redirect_uri registrado no Cognito (evita mismatch).
    const incoming = new URL(
      req.originalUrl,
      `${req.protocol}://${req.get('host')}`,
    );
    const callbackUrl = new URL(COGNITO_REDIRECT_URI);
    callbackUrl.search = incoming.search;

    const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: pkce.verifier,
      expectedState: pkce.state,
    });

    const claims = (tokens.claims() ?? {}) as Record<string, unknown>;
    let userinfo: Record<string, unknown> = {};
    try {
      const sub =
        typeof claims.sub === 'string' ? claims.sub : oidc.skipSubjectCheck;
      userinfo = (await oidc.fetchUserInfo(
        config,
        tokens.access_token,
        sub,
      )) as Record<string, unknown>;
    } catch (e) {
      // Se o userinfo falhar, seguiremos apenas com as claims do ID Token.
      console.warn('[cognito] userinfo indisponível, usando claims do ID Token:', e);
    }

    req.session.cognito = { claims, userinfo, id_token: tokens.id_token };
    req.session.pkce = undefined;
    await saveSession(req);

    res.redirect('/');
  } catch (err) {
    console.error('[cognito] /auth/callback erro:', err);
    req.session.pkce = undefined;
    await saveSession(req).catch(() => {});
    res.redirect('/?auth_error=callback');
  }
});

// GET /auth/user → retorna o usuário autenticado (ou authenticated:false)
app.get('/auth/user', (req: Request, res: Response) => {
  const s = req.session.cognito;
  if (!s) return res.json({ authenticated: false });

  const claims = (s.claims ?? {}) as Record<string, unknown>;
  const userinfo = (s.userinfo ?? {}) as Record<string, unknown>;
  const merged: Record<string, unknown> = { ...claims, ...userinfo };

  const name =
    (typeof merged.name === 'string' && merged.name) ||
    [merged.given_name, merged.family_name]
      .filter((v): v is string => typeof v === 'string')
      .join(' ') ||
    '';

  res.json({
    authenticated: true,
    sub: claims.sub,
    email: merged.email ?? '',
    name,
    phone_number: merged.phone_number ?? merged['custom:telefone'] ?? '',
    // Atributo customizado do Cognito `custom:tipo` define o papel no app.
    // Default: 'cliente' quando não definido.
    tipo: merged['custom:tipo'] ?? 'cliente',
  });
});

// GET /auth/logout → encerra a sessão local e redireciona para o logout do Cognito
app.get('/auth/logout', (req: Request, res: Response) => {
  const idToken = req.session.cognito?.id_token;

  req.session.destroy(() => {
    res.clearCookie('cliniflow.sid');

    if (config) {
      try {
        const redirectTo = oidc.buildEndSessionUrl(config, {
          post_logout_redirect_uri: COGNITO_LOGOUT_URI,
          ...(idToken ? { id_token_hint: idToken } : {}),
        });
        return res.redirect(redirectTo.href);
      } catch {
        // Alguns IdPs não expõem end_session_endpoint — cai no fallback abaixo.
      }
    }
    res.redirect(COGNITO_LOGOUT_URI);
  });
});

// ── Servir o SPA construído (produção) ─────────────────────────────────────────
if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  app.use(express.static(DIST_DIR));
  // Fallback para SPA routing (qualquer rota não-API devolve o index.html)
  app.use((_req: Request, res: Response) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// ── Start ──────────────────────────────────────────────────────────────────────
initOidc().finally(() => {
  app.listen(PORT, () => {
    console.info(`[cognito] servidor de autenticação em http://localhost:${PORT}`);
    console.info(`[cognito] redirect_uri cadastrado no Cognito deve ser: ${COGNITO_REDIRECT_URI}`);
  });
});
